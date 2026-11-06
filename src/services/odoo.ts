import { createServerFn } from "@tanstack/react-start";
import {
  authenticateOdoo,
  callOdoo,
  getOdooConfig,
} from "@/server/odoo";

export interface OdooStatus {
  configured: boolean;
  connected: boolean;
  message: string;
  partnerCount: number | null;
  modules: Record<string, boolean>;
}

export interface OdooTestWriteResult {
  ok: boolean;
  partnerId: number | null;
  partnerName: string | null;
  message: string;
}

export interface OdooCustomerLookupResult {
  ok: boolean;
  partnerId: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
}

export interface OdooLeadResult {
  ok: boolean;
  partnerId: number | null;
  leadId: number | null;
  createdPartner: boolean;
  message: string;
}

export const getOdooStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<OdooStatus> => {
    const config = getOdooConfig();
    if (!config) {
      return {
        configured: false,
        connected: false,
        message: "Odoo connection variables are not configured",
        partnerCount: null,
        modules: {},
      };
    }

    try {
      const uid = await authenticateOdoo(config);
      const partnerCount = await callOdoo(
        config,
        uid,
        "res.partner",
        "search_count",
        [[]],
        {},
      );
      const moduleNames = ["contacts", "crm", "sale_management", "loyalty"];
      const modules: Record<string, boolean> = {};

      await Promise.all(moduleNames.map(async (name) => {
        const count = await callOdoo(
          config,
          uid,
          "ir.module.module",
          "search_count",
          [[["name", "=", name], ["state", "=", "installed"]]],
          {},
        );
        modules[name] = typeof count === "number" && count > 0;
      }));

      return {
        configured: true,
        connected: true,
        message: `${partnerCount} contacts available`,
        partnerCount: typeof partnerCount === "number" ? partnerCount : null,
        modules,
      };
    } catch (error) {
      return {
        configured: true,
        connected: false,
        message: error instanceof Error ? error.message : "Odoo connection failed",
        partnerCount: null,
        modules: {},
      };
    }
  },
);

export const createOdooTestCustomer = createServerFn({ method: "POST" }).handler(
  async (): Promise<OdooTestWriteResult> => {
    const config = getOdooConfig();
    if (!config) {
      return {
        ok: false,
        partnerId: null,
        partnerName: null,
        message: "Odoo connection variables are not configured",
      };
    }

    try {
      const uid = await authenticateOdoo(config);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const partnerName = `PARMESUN TEST ${stamp}`;
      const created = await callOdoo(
        config,
        uid,
        "res.partner",
        "create",
        [{
          name: partnerName,
          email: `parmesun-test-${stamp.toLowerCase()}@example.invalid`,
          comment: "Created by PARMESUN ONE integration test. Safe test record; no real customer data.",
        }],
        {},
      );

      if (typeof created !== "number" || created <= 0) {
        throw new Error("Odoo did not return a customer ID");
      }

      return {
        ok: true,
        partnerId: created,
        partnerName,
        message: `Test customer created in Contacts with ID ${created}`,
      };
    } catch (error) {
      return {
        ok: false,
        partnerId: null,
        partnerName: null,
        message: error instanceof Error ? error.message : "Odoo write test failed",
      };
    }
  },
);

export const findOdooCustomer = createServerFn({ method: "POST" }).handler(
  async (input: { value: string }): Promise<OdooCustomerLookupResult> => {
    const value = input?.value?.trim();
    const config = getOdooConfig();
    if (!value || !config) {
      return {
        ok: false,
        partnerId: null,
        name: null,
        email: null,
        phone: null,
        message: value ? "Odoo connection variables are not configured" : "Введите телефон или email",
      };
    }

    try {
      const uid = await authenticateOdoo(config);
      const normalized = value.toLowerCase();
      const domain = [
        "|",
        ["phone", "=", value],
        ["email", "=", normalized],
      ];
      const ids = await callOdoo(config, uid, "res.partner", "search", [domain], { limit: 1 });
      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          ok: false,
          partnerId: null,
          name: null,
          email: null,
          phone: null,
          message: "Клиент не найден в Odoo",
        };
      }

      const rows = await callOdoo(config, uid, "res.partner", "read", [[ids[0]], ["name", "email", "phone"]], {});
      const row = Array.isArray(rows) && typeof rows[0] === "object" ? rows[0] as Record<string, unknown> : null;
      if (!row) {
        throw new Error("Odoo returned an empty customer record");
      }

      return {
        ok: true,
        partnerId: typeof ids[0] === "number" ? ids[0] : null,
        name: typeof row.name === "string" ? row.name : null,
        email: typeof row.email === "string" ? row.email : null,
        phone: typeof row.phone === "string" ? row.phone : null,
        message: "Клиент найден в Odoo",
      };
    } catch (error) {
      return {
        ok: false,
        partnerId: null,
        name: null,
        email: null,
        phone: null,
        message: error instanceof Error ? error.message : "Odoo customer lookup failed",
      };
    }
  },
);

export const submitOdooLead = createServerFn({ method: "POST" }).handler(
  async ({ data }: {
    data: {
      name: string;
      contact: string;
      comment?: string;
      topic: string;
      direction?: string;
    };
  }): Promise<OdooLeadResult> => {
    const input = data;
    const config = getOdooConfig();
    const name = input?.name?.trim();
    const contact = input?.contact?.trim();
    const topic = input?.topic?.trim() || "Заявка с сайта";
    const comment = input?.comment?.trim();
    const direction = input?.direction?.trim();

    if (!config) {
      return {
        ok: false,
        partnerId: null,
        leadId: null,
        createdPartner: false,
        message: "Odoo connection variables are not configured",
      };
    }
    if (!name || !contact) {
      return {
        ok: false,
        partnerId: null,
        leadId: null,
        createdPartner: false,
        message: "Укажите имя и телефон или email",
      };
    }

    try {
      const uid = await authenticateOdoo(config);
      const isEmail = contact.includes("@");
      const normalizedContact = isEmail ? contact.toLowerCase() : contact;
      const domain = [
        "|",
        ["phone", "=", normalizedContact],
        ["email", "=", normalizedContact],
      ];
      const existingIds = await callOdoo(config, uid, "res.partner", "search", [domain], { limit: 1 });
      let partnerId: number | null = Array.isArray(existingIds) && typeof existingIds[0] === "number"
        ? existingIds[0]
        : null;
      let createdPartner = false;

      if (!partnerId) {
        const partnerValues: Record<string, string> = { name };
        if (isEmail) partnerValues.email = normalizedContact;
        else partnerValues.phone = normalizedContact;
        partnerId = await callOdoo(config, uid, "res.partner", "create", [partnerValues], {}) as number;
        createdPartner = true;
      } else {
        const partnerValues: Record<string, string> = {};
        if (isEmail) partnerValues.email = normalizedContact;
        else partnerValues.phone = normalizedContact;
        await callOdoo(config, uid, "res.partner", "write", [[partnerId], partnerValues], {});
      }

      const descriptionParts = [
        "Заявка создана через PARMESUN ONE.",
        direction ? `Направление: ${direction}` : null,
        comment ? `Комментарий: ${comment}` : null,
      ].filter(Boolean);
      const leadValues: Record<string, unknown> = {
        name: topic,
        partner_id: partnerId,
        contact_name: name,
        description: descriptionParts.join("\n"),
      };
      if (isEmail) leadValues.email_from = normalizedContact;
      else leadValues.phone = normalizedContact;

      const leadId = await callOdoo(config, uid, "crm.lead", "create", [leadValues], {});
      if (typeof leadId !== "number" || leadId <= 0) {
        throw new Error("Odoo did not return a CRM lead ID");
      }

      return {
        ok: true,
        partnerId,
        leadId,
        createdPartner,
        message: createdPartner
          ? `Созданы клиент и CRM-заявка ${leadId}`
          : `CRM-заявка ${leadId} привязана к существующему клиенту`,
      };
    } catch (error) {
      return {
        ok: false,
        partnerId: null,
        leadId: null,
        createdPartner: false,
        message: error instanceof Error ? error.message : "Odoo CRM request failed",
      };
    }
  },
);
