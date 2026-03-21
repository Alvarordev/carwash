"use client";

import { useState, useEffect, useCallback } from "react";
import type { CompanyProfile } from "@/lib/types";
import type { CompanyProfileFormData } from "@/lib/schemas/companyProfile";
import { createClient } from "@/lib/supabase/client";
import { getCompanyId } from "@/lib/supabase/get-company-id";

function mapProfile(row: Record<string, unknown>): CompanyProfile {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    ruc: (row.ruc as string) ?? null,
    ownerName: (row.owner_name as string) ?? null,
    address: (row.address as string) ?? null,
    phone: (row.phone as string) ?? null,
    logoUrl: (row.logo_url as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const company_id = await getCompanyId();

      const [profileRes, companyRes] = await Promise.all([
        supabase.from("company_profiles").select("*").eq("company_id", company_id).maybeSingle(),
        supabase.from("companies").select("name").eq("id", company_id).single(),
      ]);

      if (profileRes.error) throw new Error(profileRes.error.message);
      if (companyRes.error) throw new Error(companyRes.error.message);

      setProfile(profileRes.data ? mapProfile(profileRes.data as Record<string, unknown>) : null);
      setCompanyName(companyRes.data?.name ?? "");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const upsertProfile = useCallback(
    async (data: CompanyProfileFormData): Promise<CompanyProfile> => {
      const company_id = await getCompanyId();
      const { data: result, error: err } = await supabase
        .from("company_profiles")
        .upsert(
          {
            company_id,
            ruc: data.ruc || null,
            owner_name: data.ownerName || null,
            address: data.address || null,
            phone: data.phone || null,
            logo_url: profile?.logoUrl ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "company_id" }
        )
        .select()
        .single();

      if (err) throw new Error(err.message);
      const updated = mapProfile(result as Record<string, unknown>);
      setProfile(updated);
      return updated;
    },
    [profile] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const uploadLogo = useCallback(
    async (file: File): Promise<string> => {
      const company_id = await getCompanyId();
      const ext = file.name.split(".").pop();
      const path = `${company_id}/logo.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("company-logos")
        .upload(path, file, { upsert: true });

      if (uploadErr) throw new Error(uploadErr.message);

      const { data: urlData } = supabase.storage.from("company-logos").getPublicUrl(path);
      const logoUrl = urlData.publicUrl;

      const { data: updated, error: updateErr } = await supabase
        .from("company_profiles")
        .upsert(
          {
            company_id,
            logo_url: logoUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "company_id" }
        )
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      const mapped = mapProfile(updated as Record<string, unknown>);
      setProfile(mapped);
      return logoUrl;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    profile,
    companyName,
    loading,
    error,
    fetchProfile,
    upsertProfile,
    uploadLogo,
  };
}
