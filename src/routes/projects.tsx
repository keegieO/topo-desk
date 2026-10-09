import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { FirmShell } from "@/components/firm-shell";
import { AccountGate } from "@/components/account-gate";
import {
  createProject,
  listProjects,
  deleteProject,
  uploadPnezd,
  listFiles,
  deleteFile,
  type SurveyProject,
  type PnezdFile,
} from "@/lib/projects-api";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({ component: ProjectsPage });

// ─── tiny icon helpers ──────────────────────────────────────────────────────

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-4 h-4 shrink-0", className)}
    >
      <path d={d} />
    </svg>
  );
}

const PLUS = "M12 5v14M5 12h14";
const TRASH = "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6";
const UPLOAD = "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12";
const FOLDER = "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z";
const X_ICON = "M18 6L6 18M6 6l12 12";
const FILE = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6";
const CHEVRON = "M9 18l6-6-6-6";

// ─── types ──────────────────────────────────────────────────────────────────

type Panel = "list" | "create" | "files";

// ─── New Project Form ────────────────────────────────────────────────────────

function NewProjectForm({ onCreated }: { onCreated: (p: SurveyProject) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [crs, setCrs] = useState("Indiana InGCS — NAD 1983 (2011)");
  const [order, setOrder] = useState<"PNEZD" | "PENZD">("PNEZD");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const p = await createProject({ data: { name: name.trim(), description: desc, crs, coordOrder: order } });
      toast.success(`Project "${p.name}" created`);
      onCreated(p);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">Project Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="SR-67 Widening — Mooresville"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          placeholder="Optional project notes"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">Coordinate Reference System</label>
        <select
          value={crs}
          onChange={(e) => setCrs(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
        >
          <option>Indiana InGCS — NAD 1983 (2011)</option>
          <option>Indiana InGCS East — NAD 1983 (2011)</option>
          <option>Indiana InGCS West — NAD 1983 (2011)</option>
          <option>NAD83 / Indiana East (EPSG:32038)</option>
          <option>NAD83 / Indiana West (EPSG:32039)</option>
          <option>WGS84 / UTM Zone 16N (EPSG:32616)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">Field Book Column Order</label>
        <div className="flex gap-3">
          {(["PNEZD", "PENZD"] as const).map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                value={o}
                checked={order === o}
                onChange={() => setOrder(o)}
                className="accent-emerald-500"
              />
              <span className="text-neutral-300">{o}</span>
              <span className="text-neutral-600 text-xs">
                {o === "PNEZD" ? "(Point, N, E, Z, Desc)" : "(Point, E, N, Z, Desc)"}
              </span>
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={busy || !name.trim()}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 rounded text-sm transition-colors"
      >
        {busy ? "Creating…" : "Create Project"}
      </button>
    </form>
  );
}

// ─── File Upload Panel ────────────────────────────────────────────────────────

function FileUploadPanel({
  project,
  onUploaded,
}: {
  project: SurveyProject;
  onUploaded: () => void;
}) {
  const [files, setFiles] = useState<PnezdFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const f = await listFiles({ data: { projectId: project.id } });
      setFiles(f);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => { void reload(); }, [reload]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const raw = await file.text();
      const result = await uploadPnezd({
        data: { projectId: project.id, fileName: file.name, rawText: raw },
      });
      toast.success(
        `Uploaded ${result.file.shotCount} shots from ${file.name}` +
          (result.skipped ? ` · ${result.skipped} skipped` : ""),
      );
      onUploaded();
      await reload();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(fileId: string, name: string) {
    if (!confirm(`Delete "${name}"? This removes all shots from this upload.`)) return;
    try {
      await deleteFile({ data: { fileId, projectId: project.id } });
      toast.success(`Deleted ${name}`);
      await reload();
    } catch (err) {
      toast.error(String(err));
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer transition-colors",
          busy ? "opacity-50" : "hover:border-emerald-600 hover:bg-emerald-950/20",
        )}
        onClick={() => !busy && inputRef.current?.click()}
      >
        <Icon d={UPLOAD} className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
        <p className="text-sm text-neutral-400">
          {busy ? "Uploading…" : "Click to upload a PNEZD / CSV fieldbook"}
        </p>
        <p className="text-xs text-neutral-600 mt-1">
          Supports .csv, .txt, .pnezd, .rw5, .fbk, .gsi, .jxl
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.pnezd,.rw5,.fbk,.gsi,.jxl"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {loading ? (
        <p className="text-xs text-neutral-600 text-center py-2">Loading…</p>
      ) : files.length === 0 ? (
        <p className="text-xs text-neutral-600 text-center py-2">No files uploaded yet</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Uploaded Files
          </p>
          {files.map((f) => (
            <div
              key={f.id}
              className={cn(
                "flex items-center gap-3 bg-neutral-800/60 rounded px-3 py-2 border",
                project.activeFileId === f.id
                  ? "border-emerald-600/50"
                  : "border-neutral-700/50",
              )}
            >
              <Icon d={FILE} className="text-neutral-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-200 truncate">{f.fileName}</p>
                <p className="text-xs text-neutral-500">
                  {f.shotCount.toLocaleString()} shots ·{" "}
                  {f.parseErrors > 0 ? (
                    <span className="text-amber-500">{f.parseErrors} parse errors · </span>
                  ) : null}
                  {f.coordOrder} · {f.uploadedAt.slice(0, 10)}
                  {project.activeFileId === f.id && (
                    <span className="ml-2 text-emerald-400 font-medium">active</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => void handleDelete(f.id, f.fileName)}
                className="text-neutral-600 hover:text-red-400 transition-colors"
                title="Delete file"
              >
                <Icon d={TRASH} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onDelete,
  onSelect,
  selected,
}: {
  project: SurveyProject;
  onDelete: (id: string) => void;
  onSelect: (p: SurveyProject) => void;
  selected: boolean;
}) {
  const statusColor = {
    active: "text-emerald-400 bg-emerald-950/50 border-emerald-800/40",
    complete: "text-sky-400 bg-sky-950/50 border-sky-800/40",
    archived: "text-neutral-500 bg-neutral-800/50 border-neutral-700/40",
  }[project.status];

  return (
    <div
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all",
        selected
          ? "border-emerald-600 bg-emerald-950/20"
          : "border-neutral-700 bg-neutral-900 hover:border-neutral-600",
      )}
      onClick={() => onSelect(project)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <Icon d={FOLDER} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-neutral-100 truncate">{project.name}</p>
            {project.description && (
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{project.description}</p>
            )}
            <p className="text-xs text-neutral-600 mt-1">
              {project.crs} · Updated {project.updatedAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded border capitalize",
              statusColor,
            )}
          >
            {project.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete project "${project.name}"? This cannot be undone.`))
                onDelete(project.id);
            }}
            className="text-neutral-600 hover:text-red-400 transition-colors"
          >
            <Icon d={TRASH} />
          </button>
          <Icon d={CHEVRON} className={cn("transition-transform", selected && "rotate-90")} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function ProjectsPage() {
  return (
    <FirmShell>
      <AccountGate>
        <ProjectsContent />
      </AccountGate>
    </FirmShell>
  );
}

function ProjectsContent() {
  const user = useCurrentUser();
  const [projects, setProjects] = useState<SurveyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<Panel>("list");
  const [selected, setSelected] = useState<SurveyProject | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const ps = await listProjects();
      setProjects(ps);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void reload();
  }, [user, reload]);

  async function handleDelete(id: string) {
    try {
      await deleteProject({ data: { id } });
      toast.success("Project deleted");
      if (selected?.id === id) {
        setSelected(null);
        setPanel("list");
      }
      await reload();
    } catch (err) {
      toast.error(String(err));
    }
  }

  function handleCreated(p: SurveyProject) {
    setProjects((prev) => [p, ...prev]);
    setSelected(p);
    setPanel("files");
  }

  function handleSelect(p: SurveyProject) {
    if (selected?.id === p.id) {
      setSelected(null);
      setPanel("list");
    } else {
      setSelected(p);
      setPanel("files");
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Survey Projects</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage PNEZD fieldbooks and survey data collections
          </p>
        </div>
        <button
          onClick={() => {
            setPanel(panel === "create" ? "list" : "create");
            setSelected(null);
          }}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded transition-colors",
            panel === "create"
              ? "bg-neutral-700 text-neutral-300"
              : "bg-emerald-700 hover:bg-emerald-600 text-white",
          )}
        >
          {panel === "create" ? (
            <>
              <Icon d={X_ICON} />
              Cancel
            </>
          ) : (
            <>
              <Icon d={PLUS} />
              New Project
            </>
          )}
        </button>
      </div>

      {/* Body — two column on wide screens */}
      <div className="flex flex-1 overflow-hidden">
        {/* Project list */}
        <div
          className={cn(
            "flex flex-col overflow-y-auto border-r border-neutral-800",
            selected ? "hidden md:flex md:w-1/2 lg:w-2/5" : "flex-1",
          )}
        >
          {/* Create form */}
          {panel === "create" && (
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
              <h2 className="text-sm font-semibold text-neutral-300 mb-4">New Project</h2>
              <NewProjectForm onCreated={handleCreated} />
            </div>
          )}

          <div className="p-4 space-y-2 flex-1">
            {loading ? (
              <p className="text-sm text-neutral-600 text-center py-8">Loading projects…</p>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Icon d={FOLDER} className="w-12 h-12 mx-auto text-neutral-700 mb-3" />
                <p className="text-sm text-neutral-500">No projects yet</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Create a project to start managing survey data
                </p>
              </div>
            ) : (
              projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onDelete={handleDelete}
                  onSelect={handleSelect}
                  selected={selected?.id === p.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel — file management */}
        {selected && (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800">
              <button
                onClick={() => { setSelected(null); setPanel("list"); }}
                className="md:hidden text-neutral-500 hover:text-neutral-300"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">{selected.name}</h2>
                <p className="text-xs text-neutral-500">{selected.crs}</p>
              </div>
            </div>
            <div className="p-6">
              <FileUploadPanel
                project={selected}
                onUploaded={() => {
                  // Refresh project list to get updated activeFileId
                  void reload().then(() => {
                    setSelected((prev) =>
                      prev ? (projects.find((p) => p.id === prev.id) ?? prev) : null,
                    );
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
