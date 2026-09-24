import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPANY, RATES } from "./company";

export type FirmRates = {
  conventionalHr: number;
  lidarClassMile: number;
  breaklineMile: number;
  planimetricMile: number;
  codingJob: number;
  rush: number;
};

export type FirmProfile = {
  name: string;
  legal: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  hours: string;
  terms: string;
  ein: string;
  gl: string;
  eo: string;
  remit: string;
  tagline: string;
  rates: FirmRates;
};

export const DEFAULT_FIRM: FirmProfile = {
  name: COMPANY.name,
  legal: COMPANY.legal,
  street: "",
  city: "Greenwood",
  state: "IN",
  zip: "46142",
  phone: COMPANY.phone,
  email: COMPANY.email,
  hours: COMPANY.hours,
  terms: COMPANY.terms,
  ein: "",
  gl: "",
  eo: "",
  remit: "ACH or check. Net 15. W-9 on request.",
  tagline: COMPANY.line,
  rates: { ...RATES },
};

type FirmState = FirmProfile & {
  setFirm: (patch: Partial<FirmProfile>) => void;
  setRates: (patch: Partial<FirmRates>) => void;
};

export const useFirm = create<FirmState>()(
  persist(
    (set) => ({
      ...DEFAULT_FIRM,
      setFirm: (patch) => set(patch),
      setRates: (patch) => set((s) => ({ rates: { ...s.rates, ...patch } })),
    }),
    {
      name: "breakline-firm-v1",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FirmProfile>;
        return {
          ...current,
          ...p,
          rates: { ...DEFAULT_FIRM.rates, ...(p.rates ?? {}) },
        };
      },
    },
  ),
);

export function getFirm(): FirmProfile {
  const s = useFirm.getState();
  return {
    name: s.name || DEFAULT_FIRM.name,
    legal: s.legal || DEFAULT_FIRM.legal,
    street: s.street,
    city: s.city || DEFAULT_FIRM.city,
    state: s.state || DEFAULT_FIRM.state,
    zip: s.zip,
    phone: s.phone || DEFAULT_FIRM.phone,
    email: s.email || DEFAULT_FIRM.email,
    hours: s.hours || DEFAULT_FIRM.hours,
    terms: s.terms || DEFAULT_FIRM.terms,
    ein: s.ein,
    gl: s.gl,
    eo: s.eo,
    remit: s.remit || DEFAULT_FIRM.remit,
    tagline: s.tagline || DEFAULT_FIRM.tagline,
    rates: { ...DEFAULT_FIRM.rates, ...s.rates },
  };
}

export function getRates(): FirmRates {
  return getFirm().rates;
}

export function firmCityLine(f: FirmProfile = getFirm()): string {
  return [f.city, f.state, f.zip].filter(Boolean).join(", ");
}

export function firmAddress(f: FirmProfile = getFirm()): string {
  return [f.street, firmCityLine(f)].filter(Boolean).join(", ");
}
