import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useBook } from "@/lib/store";

export function KeyIn() {
  const [value, setValue] = useState("");

  function run(raw: string) {
    const q = raw.trim();
    if (!q) return;
    const st = useBook.getState();
    const low = q.toLowerCase();
    if (low === "fit" || low === "ze" || low === "za") {
      st.fitView();
      return;
    }
    const ne = q.match(/^(?:ne|xy)\s+(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/i);
    if (ne) {
      const n = Number(ne[1]);
      const e = Number(ne[2]);
      if (st.tool === "place") {
        st.addShot({ n, e, z: st.cursor?.z ?? st.shots[0]?.elevation ?? 0 });
      }
      st.locate(n, e);
      return;
    }
    const tagged = q.match(/^(?:pt|pn|p)\s+(\S+)$/i);
    const num = tagged ? tagged[1] : /^\d+[a-z]?$/i.test(q) ? q : null;
    if (num) {
      const shot = st.shots.find((s) => s.point.toLowerCase() === num.toLowerCase());
      if (!shot) {
        toast.error(`Point ${num} is not in this book`);
        return;
      }
      st.setSelected(shot.uid);
      st.setSelectedLine(null);
      st.locate(shot.northing, shot.easting);
      return;
    }
    toast.message("Key-in: point number, NE n,e, fit");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    run(value);
    setValue("");
  }

  return (
    <form onSubmit={onSubmit} className="shrink-0">
      <input
        id="cad-keyin"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Key-in"
        aria-label="Key-in"
        spellCheck={false}
        autoCapitalize="off"
        className="h-7 w-36 rounded-sm border border-border bg-card px-2 font-mono text-xs text-foreground outline-none focus:border-ring sm:w-44"
      />
    </form>
  );
}
