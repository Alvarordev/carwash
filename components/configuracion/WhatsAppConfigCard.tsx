"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { WhatsAppConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  config: WhatsAppConfig | null;
  onSave: (data: {
    phoneNumberId: string;
    accessToken: string;
    isActive: boolean;
  }) => Promise<void>;
};

export function WhatsAppConfigCard({ config, onSave }: Props) {
  const [accessToken, setAccessToken] = useState(config?.accessToken ?? "");
  const [phoneNumberId, setPhoneNumberId] = useState(config?.phoneNumberId ?? "");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);

  const isConnected = config?.isActive ?? false;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        phoneNumberId,
        accessToken,
        isActive: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>WhatsApp API Configuration</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-500 hover:bg-green-600" : ""}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access-token">API Token</Label>
          <div className="relative">
            <Input
              id="access-token"
              type={showToken ? "text" : "password"}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter your WhatsApp API token"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Provided by Meta for Developers</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone-number-id">Phone Number ID</Label>
            <Input
              id="phone-number-id"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="e.g. 100287445"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-account-id">Business Account ID</Label>
            <Input
              id="business-account-id"
              disabled
              placeholder="Auto-detected"
              className="bg-muted"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving || !accessToken || !phoneNumberId}>
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
