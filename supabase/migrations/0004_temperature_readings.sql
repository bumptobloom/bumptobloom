-- Vitals temperature log. This is intentionally separate from fever_checks:
-- Vitals records measurements, while fever_checks belongs to the retired
-- triage flow and has a different, audit-oriented shape.

create table temperature_readings (
  id         uuid primary key default uuid_generate_v4(),
  baby_id    uuid not null references babies(id) on delete cascade,
  temp_f     numeric(4,1) not null,
  method     text not null check (
    method in ('tympanic', 'axillary', 'temporal', 'rectal')
  ),
  notes      text,
  created_at timestamptz not null default now()
);

create index temperature_readings_baby_idx
  on temperature_readings(baby_id, created_at desc);

alter table temperature_readings enable row level security;

create policy "own temperature readings" on temperature_readings
  for all
  using (owns_baby(baby_id))
  with check (owns_baby(baby_id));
