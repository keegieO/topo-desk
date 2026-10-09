-- GeoLine Solutions: survey projects and PNEZD point store.
-- A "project" is a named survey engagement (separate from a billing job).
-- Each project holds one or more PNEZD uploads; each shot row is immutable once
-- inserted.  The active_file_id foreign key tracks which upload is the current
-- working field book.

create table if not exists survey_projects (
  id          text primary key,
  user_id     text not null,
  job_id      text,                          -- optional link to jobs table
  name        text not null,
  description text not null default '',
  crs         text not null default 'Indiana InGCS — NAD 1983 (2011)',
  coord_order text not null default 'PNEZD', -- 'PNEZD' | 'PENZD'
  status      text not null default 'active',
  active_file_id text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists survey_projects_user_id_idx on survey_projects (user_id);
create index if not exists survey_projects_job_id_idx  on survey_projects (job_id);

-- One row per uploaded PNEZD/CSV file.  The raw text is kept for re-parsing.
create table if not exists pnezd_files (
  id          text primary key,
  project_id  text not null references survey_projects (id) on delete cascade,
  user_id     text not null,
  file_name   text not null,
  coord_order text not null default 'PNEZD',
  delimiter   text not null default ',',
  raw_text    text not null,
  shot_count  int  not null default 0,
  parse_errors int not null default 0,
  uploaded_at timestamptz not null default now()
);

create index if not exists pnezd_files_project_idx on pnezd_files (project_id);

-- One row per survey shot parsed from a PNEZD file.
-- Northing/Easting/Elevation kept as double precision; point number as text
-- (some instruments emit non-integer point IDs such as "1001A").
create table if not exists pnezd_shots (
  id          bigserial primary key,
  file_id     text not null references pnezd_files (id) on delete cascade,
  project_id  text not null,
  user_id     text not null,
  row_index   int  not null,
  point       text not null,
  northing    double precision not null,
  easting     double precision not null,
  elevation   double precision not null,
  description text not null default '',
  raw_line    text not null default '',
  issues      text not null default '[]', -- JSON array of issue strings
  created_at  timestamptz not null default now()
);

create index if not exists pnezd_shots_file_idx    on pnezd_shots (file_id);
create index if not exists pnezd_shots_project_idx on pnezd_shots (project_id);
create index if not exists pnezd_shots_user_idx    on pnezd_shots (user_id);
-- Spatial lookup: find shots by bounding box
create index if not exists pnezd_shots_ne_idx      on pnezd_shots (northing, easting);
