const FLAG = /^(B|E|PC|PT|EC|SC|ST|BGN|BEGIN|END|CLS|CLOSE|J|BG)$/i;

export type FieldPart = { code: string; flags: string[] };

export type FieldCode = {
  codes: FieldPart[];
  note: string;
};

export function rootCode(code: string): string {
  return code.toUpperCase().replace(/\d+$/g, "") || code.toUpperCase();
}

export function parseField(description: string): FieldCode {
  const slash = description.split("/");
  const left = (slash[0] ?? "").trim();
  const note = slash.slice(1).join("/").trim();
  const codes: FieldPart[] = [];
  for (const raw of left.split(/\s+/)) {
    const t = raw.replace(/[.,;:]+$/g, "");
    if (!t) continue;
    if (FLAG.test(t)) {
      if (codes.length) codes[codes.length - 1].flags.push(t.toUpperCase());
      continue;
    }
    if (/^[A-Za-z]/.test(t)) codes.push({ code: t.toUpperCase(), flags: [] });
  }
  return { codes, note };
}

export function formatField(field: FieldCode): string {
  const left = field.codes
    .filter((c) => c.code)
    .map((c) => [c.code.toUpperCase(), ...c.flags].join(" "))
    .join(" ");
  const note = field.note.trim();
  if (left && note) return `${left} / ${note}`;
  return left || note;
}

export function replaceCode(description: string, from: string, to: string): string {
  const field = parseField(description);
  const src = from.toUpperCase();
  const next = to.trim().toUpperCase();
  let hit = false;
  for (const c of field.codes) {
    if (c.code === src) {
      c.code = next;
      hit = true;
    }
  }
  if (!hit) {
    if (field.codes[0]) field.codes[0].code = next;
    else field.codes.push({ code: next, flags: [] });
  }
  return formatField(field);
}

export function withNote(description: string, note: string): string {
  const field = parseField(description);
  field.note = note.trim();
  return formatField(field);
}
