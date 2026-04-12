-- Add currency field to projects, proposals, and payments tables.
-- Existing rows default to 'BRL' so the app remains fully functional
-- without any data migration step.

alter table projects
  add column if not exists currency varchar(3) not null default 'BRL';

alter table proposals
  add column if not exists currency varchar(3) not null default 'BRL';

alter table payments
  add column if not exists currency varchar(3) not null default 'BRL';

