-- Add currency field to projects, proposals, and payments tables.
-- Existing rows default to 'BRL' so the app remains fully functional
-- without any data migration step.

alter table projects
  add column if not exists currency varchar(3) not null default 'BRL';

alter table proposals
  add column if not exists currency varchar(3) not null default 'BRL';

alter table payments
  add column if not exists currency varchar(3) not null default 'BRL';

-- Optional: add a check constraint to reject unsupported currency codes.
alter table projects
  add constraint projects_currency_check
  check (currency in ('BRL', 'USD', 'EUR', 'GBP'));

alter table proposals
  add constraint proposals_currency_check
  check (currency in ('BRL', 'USD', 'EUR', 'GBP'));

alter table payments
  add constraint payments_currency_check
  check (currency in ('BRL', 'USD', 'EUR', 'GBP'));
