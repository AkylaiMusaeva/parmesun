import { describe, expect, it } from "vitest";
import { getOdooConfig } from "@/server/odoo";

describe("Odoo configuration", () => {
  it("returns null when credentials are incomplete", () => {
    const previous = {
      ODOO_URL: process.env.ODOO_URL,
      ODOO_DATABASE: process.env.ODOO_DATABASE,
      ODOO_USERNAME: process.env.ODOO_USERNAME,
      ODOO_API_KEY: process.env.ODOO_API_KEY,
    };

    delete process.env.ODOO_URL;
    delete process.env.ODOO_DATABASE;
    delete process.env.ODOO_USERNAME;
    delete process.env.ODOO_API_KEY;

    expect(getOdooConfig()).toBeNull();

    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  });
});
