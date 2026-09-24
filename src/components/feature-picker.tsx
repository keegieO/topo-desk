import { useMemo, useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getFeature, searchFeatures, type Feature } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function FeaturePicker({
  value,
  onChange,
  placeholder = "Map to INDOT code",
}: {
  value?: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = getFeature(value);
  const results = useMemo(() => searchFeatures(q, { kind: "survey" }).slice(0, 80), [q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-0 max-w-full justify-between font-normal">
          <span className="truncate font-mono text-xs">
            {selected ? `${selected.alphas[0] ?? "—"}  ${selected.name}` : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search alpha, name, description…" value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>No INDOT code matches.</CommandEmpty>
            <CommandGroup heading="Survey feature codes">
              {results.map((f) => (
                <CommandItem
                  key={f.id}
                  value={f.id}
                  onSelect={() => {
                    onChange(f.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-3.5 w-3.5", selected?.id === f.id ? "opacity-100" : "opacity-0")} />
                  <FeatureLine f={f} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FeatureLine({ f }: { f: Feature }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="flex items-baseline gap-2">
        <span className="font-mono text-xs font-medium">{f.alphas[0] ?? "—"}</span>
        <span className="truncate text-sm">{f.desc || f.name}</span>
      </span>
      <span className="block truncate font-mono text-[0.6875rem] text-muted-foreground">{f.name}</span>
    </span>
  );
}
