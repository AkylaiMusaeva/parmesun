import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitOdooLead } from "@/services/odoo";

interface Props {
  topic: string;
  trigger: React.ReactNode;
  direction?: string;
}

/** Sends a website request to the existing Odoo contact and CRM lead records. */
export function RequestDialog({ topic, trigger, direction }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = name.trim().length >= 2 && contact.trim().length >= 5;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const result = await submitOdooLead({
        data: {
          name: name.trim(),
          contact: contact.trim(),
          comment: comment.trim(),
          topic,
          direction,
        },
      });
      if (!result.ok) {
        toast.error("Не удалось отправить заявку в Odoo", { description: result.message });
        return;
      }
      toast.success("Заявка отправлена в Odoo", {
        description: `${result.message}. ${result.createdPartner ? "Новая карточка клиента создана." : "Клиент найден и заявка привязана."}`,
      });
      setOpen(false);
      setName("");
      setContact("");
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-background sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-medium">{topic}</DialogTitle>
            <DialogDescription>
              Оставьте контакт. Заявка будет привязана к клиенту в Odoo CRM.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="req-name">Имя</Label>
            <Input id="req-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-contact">Телефон или e-mail</Label>
            <Input
              id="req-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-comment">Пожелания</Label>
            <Textarea
              id="req-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Дата, число гостей, формат…"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!valid} className="w-full sm:w-auto">
              {submitting ? "Отправка..." : "Отправить заявку"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
