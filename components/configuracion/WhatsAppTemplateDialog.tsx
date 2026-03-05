"use client";

import { useState, useEffect } from "react";
import type { WhatsAppTemplate, WhatsAppTriggerType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WhatsAppTemplate | null;
  onSave: (data: {
    name: string;
    body: string;
    triggerType: WhatsAppTriggerType;
  }) => Promise<void>;
};

export function WhatsAppTemplateDialog({ open, onOpenChange, template, onSave }: Props) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [triggerType, setTriggerType] = useState<WhatsAppTriggerType>("delivery");
  const [saving, setSaving] = useState(false);

  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setBody(template.body);
      setTriggerType(template.triggerType);
    } else {
      setName("");
      setBody("");
      setTriggerType("delivery");
    }
  }, [template, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, body, triggerType });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Template" : "New Template"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Service Completed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-body">Message Body</Label>
            <Textarea
              id="template-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {{customer_name}}, your {{vehicle_model}} is ready..."
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Use placeholders: {"{{customer_name}}"}, {"{{vehicle_model}}"}, {"{{service_name}}"}, {"{{date}}"}, {"{{time}}"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger-type">Trigger Type</Label>
            <Select value={triggerType} onValueChange={(v) => setTriggerType(v as WhatsAppTriggerType)}>
              <SelectTrigger id="trigger-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">Delivery (on order completion)</SelectItem>
                <SelectItem value="scheduled">Scheduled (delayed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name || !body}>
              {saving ? "Saving..." : isEditing ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
