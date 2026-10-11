-- Prüft Kernregeln des Schemas auf einer WEGWERF-Datenbank (nie gegen Produktivdaten ausführen).
-- Erwartet: alle Zeilen "OK".
\set ON_ERROR_STOP 1
begin;
insert into benutzer (id, name, kuerzel, email, rolle) values ('u-test', 'Test', 'TT', 'test@grenford.de', 'admin');
insert into unternehmen (id, name, ort, status) values ('f-test', 'Testfirma GmbH', 'Berlin', 'Aktiv');
insert into personen (id, vorname, nachname, email, status) values ('p-test', 'Max', 'Muster', 'max@example.org', 'Aktiv');

-- Nummernkreis
select case when naechste_nummer('INV-2099') = 'INV-2099-001' and naechste_nummer('INV-2099') = 'INV-2099-002' then 'OK Nummernkreis' else 'FEHLER Nummernkreis' end;

-- Dubletten Person (E-Mail)
do $$ begin
  insert into personen (id, vorname, nachname, email, status) values ('p-dup', 'Max', 'Muster', 'MAX@example.org', 'Aktiv');
  raise notice 'FEHLER Dublette erlaubt';
exception when unique_violation then raise notice 'OK Personen-Dublette abgewiesen'; end $$;

-- Polymorpher Verweis
do $$ begin
  insert into interessenten (id, ref_art, ref_id, typ, status) values ('INT-X', 'person', 'p-gibtsnicht', 'Kauf', 'Aktiv');
  raise notice 'FEHLER ungültiger Verweis erlaubt';
exception when raise_exception then raise notice 'OK ungültiger Verweis abgewiesen'; end $$;

-- Teilzahlungen und Überzahlung
insert into forderungen (nr, kunde, bereich, betrag, faellig) values ('RE-2099-001', 'Testfirma GmbH', 'Investment', 1000, current_date - 1);
insert into zahlungseingaenge values ('z1', current_date, 'RE-2099-001', 400);
select case when rest = 600 and status = 'Überfällig' then 'OK Teilzahlung/überfällig' else 'FEHLER Teilzahlung' end from forderungen_status where nr = 'RE-2099-001';
do $$ begin
  insert into zahlungseingaenge values ('z2', current_date, 'RE-2099-001', 700);
  raise notice 'FEHLER Überzahlung erlaubt';
exception when raise_exception then raise notice 'OK Überzahlung abgewiesen'; end $$;
insert into zahlungseingaenge values ('z3', current_date, 'RE-2099-001', 600);
select case when rest = 0 and status = 'Bezahlt' then 'OK vollständig bezahlt' else 'FEHLER Bezahlt' end from forderungen_status where nr = 'RE-2099-001';

-- Audit
select case when count(*) >= 5 then 'OK Audit-Log' else 'FEHLER Audit-Log' end from audit_log;
rollback;

-- Row Level Security: nicht freigeschaltetes Konto sieht nichts und darf nichts anlegen
begin;
insert into auth.users values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
insert into benutzer (id, auth_id, name, kuerzel, email, rolle) values ('u-mk', '00000000-0000-0000-0000-000000000001', 'Admin', 'AD', 'admin@grenford.de', 'admin');
insert into unternehmen (id, name, ort, status) values ('f-rls', 'RLS GmbH', 'Köln', 'Aktiv');
grant usage on schema public, auth to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select case when count(*) = 0 then 'OK RLS: fremdes Konto sieht keine Daten' else 'FEHLER RLS' end from unternehmen;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select case when count(*) = 1 then 'OK RLS: GRENFORD-Benutzer sieht Daten' else 'FEHLER RLS' end from unternehmen;
rollback;
