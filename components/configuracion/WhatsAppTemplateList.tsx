"use client";

import { CheckCircle2, Pencil, Send } from "lucide-react";
import type { WhatsAppTemplate } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type Props = {
  templates: WhatsAppTemplate[];
  onToggleActive: (id: string) => Promise<void>;
  onEdit: (template: WhatsAppTemplate) => void;
  onAdd: () => void;
};

export function WhatsAppTemplateList({ templates, onToggleActive, onEdit, onAdd }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Message Templates</h3>
        <Button onClick={onAdd} size="sm">
          + New Template
        </Button>
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No templates yet. Create your first message template.
          </CardContent>
        </Card>
      )}

      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.isActive && (
                  <CheckCircle2 className="size-4 text-green-500" />
                )}
              </div>
              <Switch
                checked={template.isActive}
                onCheckedChange={() => onToggleActive(template.id)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground whitespace-pre-wrap">
              {template.body}
            </p>
            <div className="flex gap-3">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
                onClick={() => onEdit(template)}
              >
                <Pencil className="mr-1 size-3" />
                Edit Template
              </Button>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
              >
                <Send className="mr-1 size-3" />
                Send Test
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
