-- =====================================================================
-- GRENFORD CRM Lightning – Initiales Datenbankschema (PostgreSQL / Supabase)
--
-- STATUS: VORBEREITET, NICHT AUSGEFÜHRT. Es besteht keine Verbindung zu einer
-- Datenbank. Ausführung erst nach ausdrücklicher Freigabe durch GRENFORD
-- (Supabase-Projekt, Region EU, Auftragsverarbeitungsvertrag).
--
-- Grundsätze
--  * Fachliche IDs (z. B. INV-2026-007, PRO-2026-014, RE-2026-001) sind Primärschlüssel
--    und werden über die Tabelle nummernkreise vergeben (eindeutig, nie doppelt).
--  * Stammdaten (Unternehmen, Personen, Objekte) existieren genau einmal; Vorgänge
--    aller Bereiche verweisen per Fremdschlüssel darauf (keine Dubletten).
--  * Verweise auf "Person ODER Unternehmen" werden als (…_art, …_id) mit Prüfregel
--    und Prüf-Trigger abgebildet.
--  * Geldbeträge: numeric(14,2) in EUR. Sätze: numeric(6,3) in Prozent.
--  * Jede Tabelle hat Row Level Security; Zugriff nur für angemeldete, freigeschaltete
--    GRENFORD-Benutzer (Tabelle benutzer). Rolle 'admin' = Hauptbenutzer.
--  * Jede Änderung wird per Trigger im audit_log protokolliert.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Aufzählungen
-- ---------------------------------------------------------------------
create type geschaeftsbereich as enum ('Investment', 'Property', 'Projects');
create type ref_art as enum ('person', 'unternehmen');
create type benutzer_rolle as enum ('admin', 'mitarbeiter', 'lesend');

-- ---------------------------------------------------------------------
-- Benutzer & Einstellungen
-- ---------------------------------------------------------------------
create table benutzer (
  id          text primary key,                     -- z. B. u-mk
  auth_id     uuid unique references auth.users (id) on delete set null,
  name        text not null,
  kuerzel     text not null,
  email       text not null unique check (email ~* '@grenford\.de$'),
  rolle       benutzer_rolle not null default 'mitarbeiter',
  aktiv       boolean not null default true,
  erstellt_am timestamptz not null default now()
);

create table einstellungen (
  schluessel  text primary key,                     -- z. B. provisionsstandards, benachrichtigungen, unternehmen
  wert        jsonb not null,
  geaendert_am timestamptz not null default now(),
  geaendert_von text references benutzer (id)
);

create table nummernkreise (
  praefix     text primary key,                     -- z. B. INV-2026, PROP-2026, RE-2026
  letzte_nr   integer not null default 0,
  stellen     integer not null default 3
);

-- Vergibt die nächste fachliche Nummer atomar (keine Doppelvergabe bei gleichzeitigen Zugriffen)
create or replace function naechste_nummer(p_praefix text) returns text
language plpgsql as $$
declare v_nr integer; v_stellen integer;
begin
  if auth.uid() is not null and not darf_schreiben() then
    raise exception 'Keine Berechtigung zur Nummernvergabe';
  end if;
  insert into nummernkreise (praefix) values (p_praefix) on conflict do nothing;
  update nummernkreise set letzte_nr = letzte_nr + 1 where praefix = p_praefix
    returning letzte_nr, stellen into v_nr, v_stellen;
  return p_praefix || '-' || lpad(v_nr::text, v_stellen, '0');
end $$;

create table statusdefinitionen (
  modul       text not null,                         -- z. B. akquise, investment_projekt, forderung
  status      text not null,
  reihenfolge integer not null default 0,
  primary key (modul, status)
);

-- ---------------------------------------------------------------------
-- Stammdaten
-- ---------------------------------------------------------------------
create table unternehmen (
  id               text primary key,
  name             text not null,
  arten            text[] not null default '{}',
  rechtsform       text not null default '',
  ust_id           text not null default '',
  handelsregister  text not null default '',
  website          text not null default '',
  linkedin         text not null default '',
  telefon          text not null default '',
  email            text not null default '',
  strasse          text not null default '',
  plz              text not null default '',
  ort              text not null default '',
  land             text not null default 'Deutschland',
  beschreibung     text not null default '',
  labels           text[] not null default '{}',
  status           text not null,
  betreuer_id      text references benutzer (id),
  quelle           text not null default '',
  bereich_pruefen  text,
  erstellt_am      date not null default current_date,
  letzter_kontakt  date
);
-- Dubletten-Schutz: gleicher Name am gleichen Ort
create unique index unternehmen_name_ort_uq on unternehmen (lower(name), lower(ort));

create table personen (
  id                    text primary key,
  anrede                text not null default '',
  titel                 text not null default '',
  vorname               text not null,
  nachname              text not null,
  geburtsdatum          date,
  email                 text not null default '',
  telefon_mobil         text not null default '',
  telefon_geschaeftlich text not null default '',
  linkedin              text not null default '',
  strasse               text not null default '',
  plz                   text not null default '',
  ort                   text not null default '',
  land                  text not null default 'Deutschland',
  status                text not null,
  betreuer_id           text references benutzer (id),
  quelle                text not null default '',
  favorit               boolean not null default false,
  bereich_pruefen       text,
  privat                jsonb,                       -- Kundenrolle Privatkunde (Status, Interessen, Budget …)
  sanierung             jsonb,                       -- Kundenrolle Sanierungskunde
  erstellt_am           date not null default current_date,
  letzter_kontakt       date
);
-- Dubletten-Schutz: E-Mail eindeutig (sofern gepflegt)
create unique index personen_email_uq on personen (lower(email)) where email <> '';

-- Kontaktverknüpfung Person ↔ Unternehmen (n:m, mit Position/Rolle)
create table kontaktverknuepfungen (
  person_id      text not null references personen (id) on delete cascade,
  unternehmen_id text not null references unternehmen (id) on delete cascade,
  position       text not null default '',
  abteilung      text not null default '',
  rolle          text not null,
  haupt          boolean not null default false,
  leitung        boolean not null default false,
  primary key (person_id, unternehmen_id)
);

-- Geschäftsbereich-Zuordnung auf Kontaktebene (Mehrfachzuordnung)
create table bereichszuordnungen (
  id          uuid primary key default gen_random_uuid(),
  ref_art     ref_art not null,
  ref_id      text not null,
  bereich     geschaeftsbereich not null,
  funktion    text not null default '',
  herkunft    text not null check (herkunft in ('manuell', 'abgeleitet')),
  grund       text,
  unique (ref_art, ref_id, bereich)
);

create table objekte (
  id           text primary key,
  nummer       text unique,                           -- z. B. OPP-2026-003
  titel        text not null,
  adresse      text,
  ort          text not null default '',
  objektart    text,
  einheiten    integer,
  wohnflaeche  numeric(10,2),
  grundstueck  numeric(12,2),
  baujahr      integer,
  zustand      text,
  bild         text,
  hinweis      text                                   -- z. B. möglicher Dubletten-Hinweis (nie automatisch zusammenführen)
);
create unique index objekte_adresse_uq on objekte (lower(adresse)) where adresse is not null and adresse <> '';

-- ---------------------------------------------------------------------
-- Prüffunktion für polymorphe Verweise (Person oder Unternehmen)
-- ---------------------------------------------------------------------
create or replace function ref_existiert(p_art ref_art, p_id text) returns boolean
language sql stable as $$
  select case p_art
    when 'person' then exists (select 1 from personen where id = p_id)
    when 'unternehmen' then exists (select 1 from unternehmen where id = p_id)
  end
$$;

-- ---------------------------------------------------------------------
-- Kundenvorgänge (Vorhaben) – Vorgangsebene mit eigenem Geschäftsbereich
-- ---------------------------------------------------------------------
create table vorhaben (
  id                 text primary key,
  person_id          text references personen (id),
  kundenrolle        text check (kundenrolle in ('privat', 'sanierung')),
  art                text not null,
  titel              text not null,
  ort                text not null default '',
  beschreibung       text not null default '',
  budget             numeric(14,2) not null default 0,
  status             text not null,
  fortschritt        integer not null default 0 check (fortschritt between 0 and 100),
  zeithorizont       text not null default '',
  unternehmen_id     text references unternehmen (id),
  unternehmen_rolle  text,
  objekt_id          text references objekte (id),
  geschaeftsbereich  geschaeftsbereich,              -- null = nicht eindeutig → pruefen
  rolle              text not null default '',
  beteiligte         jsonb not null default '[]',
  referenz           text,                           -- Verweis auf Fachmodul-Vorgang (verhindert Doppelanzeige)
  pruefen            text,
  herkunft           text,
  grund              text,
  geplanter_start    date,
  geplante_fertigstellung date,
  check (geschaeftsbereich is not null or pruefen is not null)
);

-- ---------------------------------------------------------------------
-- Netzwerk (vor den Fachmodulen, da diese darauf verweisen)
-- ---------------------------------------------------------------------
create table empfehlungspartner (
  id               text primary key,                 -- EP-001
  person_id        text not null references personen (id),
  unternehmen_id   text references unternehmen (id),
  kategorie        text not null,
  bereiche         geschaeftsbereich[] not null default '{}',
  saetze           jsonb not null default '{}',      -- individuelle Sätze je Bereich; leer = Standard
  kooperation      jsonb not null default '{}',
  status           text not null,
  seit             date,
  verantwortlich_id text references benutzer (id),
  erstellt_am      date not null default current_date,
  notiz            text,
  unique (person_id)                                 -- eine Person ist höchstens einmal Empfehlungspartner
);

-- ---------------------------------------------------------------------
-- Akquise-Pipeline
-- ---------------------------------------------------------------------
create table akquise (
  id                   text primary key,             -- AKQ-2026-001
  titel                text not null,
  bereich              geschaeftsbereich not null,
  quelle               text not null default '',
  objektart            text not null default '',
  tags                 text[] not null default '{}',
  stufe                integer not null check (stufe between 1 and 7),
  status               text not null,
  prioritaet           text not null,
  wahrscheinlichkeit   integer not null default 0 check (wahrscheinlichkeit between 0 and 100),
  volumen              numeric(14,2) not null default 0,
  kunde_art            ref_art,
  kunde_id             text,
  ansprechpartner_id   text references personen (id),
  eigentuemer_art      ref_art,
  eigentuemer_id       text,
  eigentuemer_hinweis  text,
  vermittler           jsonb,
  objekt_id            text references objekte (id),
  ort                  text not null default '',
  wiedervorlage        date,
  naechster_schritt    text not null default '',
  erwarteter_abschluss text not null default '',
  courtage_netto       numeric(14,2) not null default 0,
  eigener_anteil       numeric(6,3) not null default 100,
  kooperationsart      text not null default '',
  vereinbarung         text not null default '',
  checkliste           jsonb not null default '[]',
  bewertung            text not null default '',
  empfehlungspartner_id text references empfehlungspartner (id),
  uebernommen_in       text,                          -- ID des Vorgangs im Fachbereich (keine Stammdaten-Kopie)
  uebernommen_am       date,
  verantwortlich_id    text references benutzer (id),
  erstellt_am          date not null default current_date,
  notiz                text
);

-- ---------------------------------------------------------------------
-- Investment
-- ---------------------------------------------------------------------
create table investment_projekte (
  id                   text primary key,             -- INV-2026-007
  titel                text not null,
  objekt_id            text not null references objekte (id),
  assetklasse          text not null,
  standort             text not null default '',
  volumen              numeric(14,2) not null default 0,
  zielpreis            text not null default '',
  phase                text not null,                 -- A1 … F3
  status               text not null,
  naechster_schritt    text not null default '',
  wiedervorlage        date,
  eigentuemer_art      ref_art,
  eigentuemer_id       text,
  vermarktungsart      text not null default '',
  faktor               numeric(6,2),
  rendite              numeric(6,3),
  upside               text,
  courtage_satz        numeric(6,3) not null default 0,
  tags                 text[] not null default '{}',
  beteiligte           jsonb not null default '[]',
  akquise_id           text references akquise (id),
  empfehlungspartner_id text references empfehlungspartner (id),
  abschluss_erwartet   text not null default '',
  verantwortlich_id    text references benutzer (id),
  erstellt_am          date not null default current_date,
  notiz                text
);

create table ankaufsprofile (
  id               text primary key,                 -- ANK-2026-001
  unternehmen_id   text references unternehmen (id),
  person_id        text references personen (id),
  investorentyp    text not null,
  assetklassen     text[] not null default '{}',
  regionen         text[] not null default '{}',
  volumen_von      numeric(14,2) not null default 0,
  volumen_bis      numeric(14,2) not null default 0,
  rendite_min      numeric(6,3),
  kriterien        text not null default '',
  status           text not null,
  verantwortlich_id text references benutzer (id),
  erstellt_am      date not null default current_date,
  notiz            text,
  check (unternehmen_id is not null or person_id is not null)
);

-- ---------------------------------------------------------------------
-- Property
-- ---------------------------------------------------------------------
create table property_mandate (
  id                   text primary key,             -- PROP-2026-006
  objekt_id            text not null references objekte (id),   -- ein Objekt kann mehrere Mandate haben
  mandatstyp           text not null,
  eigentuemer_art      ref_art,
  eigentuemer_id       text,
  preis                numeric(14,2) not null default 0,
  courtage_satz        numeric(6,3) not null default 0,
  courtage_modell      text not null default '',
  status               text not null,
  vermarktung          text not null,
  phase                text not null,                 -- A … E (mit Unterphasen)
  naechster_schritt    text not null default '',
  wiedervorlage        date,
  vertrag_von          date,
  vertrag_bis          date,
  vermarktungsart      text not null default '',
  tags                 text[] not null default '{}',
  beteiligte           jsonb not null default '[]',
  empfehlungspartner_id text references empfehlungspartner (id),
  verantwortlich_id    text references benutzer (id),
  erstellt_am          date not null default current_date,
  notiz                text
);

create table interessenten (
  id                 text primary key,               -- INT-2026-001
  ref_art            ref_art not null,
  ref_id             text not null,
  ansprechpartner_id text references personen (id),
  typ                text not null,
  objektarten        text[] not null default '{}',
  regionen           text[] not null default '{}',
  budget_von         numeric(14,2) not null default 0,
  budget_bis         numeric(14,2) not null default 0,
  kriterien          text not null default '',
  status             text not null,
  weitere            jsonb not null default '[]',
  verantwortlich_id  text references benutzer (id),
  erstellt_am        date not null default current_date,
  notiz              text,
  unique (ref_art, ref_id)                           -- keine doppelten Interessenten
);

-- Suchaufträge Investment (SRCH-I-…) und Property (SRCH-P-…) – getrennt über bereich
create table suchauftraege (
  id                 text primary key,
  bereich            geschaeftsbereich not null check (bereich in ('Investment', 'Property')),
  kunde_art          ref_art not null,
  kunde_id           text not null,
  ansprechpartner_id text references personen (id),
  typ                text not null,
  objektart          text not null default '',
  regionen           text[] not null default '{}',
  volumen_von        numeric(14,2) not null default 0,
  volumen_bis        numeric(14,2) not null default 0,
  kriterien          text not null default '',
  status             text not null,
  prioritaet         text not null,
  zielzeitraum       text not null default '',
  mandatstyp         text,
  verantwortlich_id  text references benutzer (id),
  erstellt_am        date not null default current_date,
  notiz              text
);

-- Verknüpfung Suchauftrag ↔ Investment-Projekt / Property-Mandat
create table suchauftrag_verknuepfungen (
  suchauftrag_id text not null references suchauftraege (id) on delete cascade,
  vorgang_id     text not null,
  primary key (suchauftrag_id, vorgang_id)
);

-- Käuferprozesse: mehrere je Projekt/Mandat, jeweils eigene ID
create table kaeuferprozesse (
  id                 text primary key,               -- INV-OPT-0001 / PROP-OPT-0001
  bereich            geschaeftsbereich not null check (bereich in ('Investment', 'Property')),
  investment_projekt_id text references investment_projekte (id),
  property_mandat_id    text references property_mandate (id),
  kaeufer_art        ref_art not null,
  kaeufer_id         text not null,
  ansprechpartner_id text references personen (id),
  typ                text not null,
  indikation         numeric(14,2) not null default 0,
  wahrscheinlichkeit integer not null default 0 check (wahrscheinlichkeit between 0 and 100),
  phase              text not null,
  status             text not null,
  letzter_kontakt    date,
  suchauftrag_id     text references suchauftraege (id),
  verantwortlich_id  text references benutzer (id),
  erstellt_am        date not null default current_date,
  notiz              text,
  check ((bereich = 'Investment' and investment_projekt_id is not null and property_mandat_id is null)
      or (bereich = 'Property' and property_mandat_id is not null and investment_projekt_id is null)),
  -- derselbe Käufer nur einmal je Projekt/Mandat
  unique nulls not distinct (investment_projekt_id, property_mandat_id, kaeufer_art, kaeufer_id)
);

-- ---------------------------------------------------------------------
-- Projects (Beratung/Vermittlung – GRENFORD ist nicht automatisch Bauherr oder GU)
-- ---------------------------------------------------------------------
create table gu_partner (
  id                 text primary key,               -- GU-001
  unternehmen_id     text not null unique references unternehmen (id),
  ansprechpartner_id text references personen (id),
  kategorie          text not null check (kategorie in ('Generalunternehmer', 'Fachpartner')),
  gewerke            text[] not null default '{}',
  regionen           text[] not null default '{}',
  status             text not null,
  bevorzugt          boolean not null default false,
  seit               date,
  vereinbarung       jsonb not null default '{}',     -- Status, Datum, Provisionsregelung
  verantwortlich_id  text references benutzer (id),
  erstellt_am        date not null default current_date,
  notiz              text
);

create table projects_mandate (
  id                 text primary key,               -- MAN-2026-001
  kunde_art          ref_art not null,
  kunde_id           text not null,
  objekt_id          text references objekte (id),
  kundentyp          text not null,
  sanierungsart      text not null,
  status             text not null,
  verguetung_satz    numeric(6,3) not null default 0,
  empfehlungspartner_id text references empfehlungspartner (id),
  verantwortlich_id  text references benutzer (id),
  erstellt_am        date not null default current_date,
  notiz              text
);

create table projects_projekte (
  id                 text primary key,               -- PRO-2026-014
  mandat_id          text not null references projects_mandate (id),   -- ein Mandat, mehrere Projekte
  titel              text not null,
  objekt_id          text references objekte (id),
  einheit            text not null default '',
  bauherr_art        ref_art not null,
  bauherr_id         text not null,
  leistungsumfang    text not null default '',
  budget             numeric(14,2) not null default 0,
  phase              text not null,                   -- A … F mit Unterphasen
  status             text not null,
  geplanter_start    text not null default '',
  geplantes_ende     text not null default '',
  verguetung_satz    numeric(6,3) not null default 0,
  ziele              text[] not null default '{}',
  naechster_schritt  text not null default '',
  wiedervorlage      date,
  beteiligte         jsonb not null default '[]',
  vergabe_angebot_id text,
  vergabe_datum      date,
  vergabe_summe      numeric(14,2),
  -- Auftraggeber des GU: 'Kunde' (Direktbeauftragung, keine GRENFORD-Verbindlichkeit) oder 'GRENFORD'
  vergabe_auftraggeber text check (vergabe_auftraggeber in ('Kunde', 'GRENFORD')),
  empfehlungspartner_id text references empfehlungspartner (id),
  verantwortlich_id  text references benutzer (id),
  erstellt_am        date not null default current_date,
  notiz              text
);

create table angebote (
  id          text primary key,
  projekt_id  text not null references projects_projekte (id) on delete cascade,
  gu_id       text not null references gu_partner (id),
  datum       date,
  summe       numeric(14,2),
  umfang      text not null default '',
  status      text not null,
  dokument    text,                                  -- Original-Angebot (Dateiverweis)
  unique (projekt_id, gu_id)
);
alter table projects_projekte
  add constraint projects_vergabe_angebot_fk foreign key (vergabe_angebot_id) references angebote (id);

-- Empfehlungen (welcher Partner hat welchen Vorgang vermittelt)
create table empfehlungen (
  id                    text primary key,
  empfehlungspartner_id text not null references empfehlungspartner (id),
  referenz              text not null,               -- Vorgangs-ID (INV-/PROP-/PRO-)
  bereich               geschaeftsbereich not null,
  datum                 date not null,
  status                text not null,
  unique (empfehlungspartner_id, referenz)
);

create table provisionsbeteiligungen (
  id               text primary key,                 -- PRV-2026-001
  beteiligter_art  ref_art not null,
  beteiligter_id   text not null,
  referenz         text not null,
  bereich          geschaeftsbereich not null,
  art              text not null,
  grund            text not null default '',
  anteil           numeric(6,3) not null default 0,  -- individueller Satz, KEIN automatischer Standardsatz
  festbetrag       numeric(14,2),
  basis            numeric(14,2) not null default 0,
  faelligkeit      text not null default '',
  status           text not null,
  phase            text not null default '',
  vereinbart_am    date,
  verbindlichkeit_nr text,
  verantwortlich_id text references benutzer (id),
  erstellt_am      date not null default current_date,
  notiz            text
);

-- ---------------------------------------------------------------------
-- Finanzen – eine gemeinsame Datengrundlage
-- erwartete Provision → entstandener Anspruch → Rechnung/Forderung → Zahlungseingang(e)
-- Verbindlichkeit → Auszahlung(en); Rest und "überfällig" werden berechnet, nie gespeichert.
-- ---------------------------------------------------------------------
create table provisionen (
  id          text primary key,                      -- PROV-2026-001
  referenz    text not null,
  bereich     geschaeftsbereich not null,
  art         text not null,
  zahler      text not null,
  zahler_art  ref_art,
  zahler_id   text,
  basis       numeric(14,2) not null default 0,
  satz        numeric(6,3) not null default 0,
  betrag      numeric(14,2) not null,
  status      text not null check (status in ('Erwartet', 'Entstanden', 'Abgerechnet', 'Storniert')),
  datum       date not null,
  rechnung_nr text
);

create table forderungen (
  nr           text primary key,                     -- RE-2026-001 (Rechnungsnummer)
  kunde        text not null,
  kunde_art    ref_art,
  kunde_id     text,
  bereich      geschaeftsbereich not null,
  referenz     text,
  provision_id text references provisionen (id),
  betrag       numeric(14,2) not null check (betrag > 0),
  datum        date,
  faellig      date not null,
  -- Mahnstufe nur zur Nachverfolgung; es werden KEINE rechtlichen Schritte automatisch ausgelöst
  mahnstufe    integer not null default 0 check (mahnstufe between 0 and 3)
);
alter table provisionen add constraint provisionen_rechnung_fk foreign key (rechnung_nr) references forderungen (nr);

create table zahlungseingaenge (
  id          text primary key,
  datum       date not null,
  rechnung_nr text not null references forderungen (nr),
  betrag      numeric(14,2) not null check (betrag > 0)    -- Teilzahlungen = mehrere Zeilen
);

create table verbindlichkeiten (
  nr             text primary key,                   -- VB-2026-001
  empfaenger     text not null,
  empfaenger_art ref_art,
  empfaenger_id  text,
  referenz       text not null,
  bereich        geschaeftsbereich not null,
  typ            text not null,
  betrag         numeric(14,2) not null check (betrag > 0),
  faellig        date not null,
  quelle         text                                -- z. B. PRV-…, EP-…, Vergabe PRO-…
);

create table auszahlungen (
  id                 text primary key,
  datum              date not null,
  verbindlichkeit_nr text not null references verbindlichkeiten (nr),
  betrag             numeric(14,2) not null check (betrag > 0)
);

-- Überzahlung verhindern (Summe Zahlungen ≤ Rechnungsbetrag bzw. Verbindlichkeit)
create or replace function pruefe_ueberzahlung() returns trigger language plpgsql as $$
declare v_soll numeric; v_ist numeric;
begin
  if tg_table_name = 'zahlungseingaenge' then
    select betrag into v_soll from forderungen where nr = new.rechnung_nr;
    select coalesce(sum(betrag), 0) into v_ist from zahlungseingaenge where rechnung_nr = new.rechnung_nr and id <> new.id;
  else
    select betrag into v_soll from verbindlichkeiten where nr = new.verbindlichkeit_nr;
    select coalesce(sum(betrag), 0) into v_ist from auszahlungen where verbindlichkeit_nr = new.verbindlichkeit_nr and id <> new.id;
  end if;
  if v_ist + new.betrag > v_soll then
    raise exception 'Zahlung übersteigt den offenen Betrag (offen: %)', v_soll - v_ist;
  end if;
  return new;
end $$;
create trigger zahlungseingaenge_pruefen before insert or update on zahlungseingaenge
  for each row execute function pruefe_ueberzahlung();
create trigger auszahlungen_pruefen before insert or update on auszahlungen
  for each row execute function pruefe_ueberzahlung();

-- Offene Posten (berechnet; geplante Zahlungen erscheinen nie als bezahlt)
create view forderungen_status as
select f.*,
       coalesce(z.bezahlt, 0) as bezahlt,
       f.betrag - coalesce(z.bezahlt, 0) as rest,
       case when coalesce(z.bezahlt, 0) >= f.betrag then 'Bezahlt'
            when f.faellig < current_date then 'Überfällig'
            when coalesce(z.bezahlt, 0) > 0 then 'Teilweise bezahlt'
            else 'Offen' end as status
from forderungen f
left join (select rechnung_nr, sum(betrag) bezahlt from zahlungseingaenge group by rechnung_nr) z on z.rechnung_nr = f.nr;

create view verbindlichkeiten_status as
select v.*,
       coalesce(a.bezahlt, 0) as bezahlt,
       v.betrag - coalesce(a.bezahlt, 0) as rest,
       case when coalesce(a.bezahlt, 0) >= v.betrag then 'Bezahlt'
            when v.faellig < current_date then 'Überfällig'
            when coalesce(a.bezahlt, 0) > 0 then 'Teilweise bezahlt'
            else 'Offen' end as status
from verbindlichkeiten v
left join (select verbindlichkeit_nr, sum(betrag) bezahlt from auszahlungen group by verbindlichkeit_nr) a on a.verbindlichkeit_nr = v.nr;

-- ---------------------------------------------------------------------
-- Aktivitäten, Dokumente, Verlauf
-- ---------------------------------------------------------------------
create table aktivitaeten (
  id                text primary key,
  typ               text not null check (typ in ('Termin', 'Aufgabe', 'E-Mail', 'Telefon', 'Notiz')),
  titel             text not null,
  beschreibung      text not null default '',
  datum             date not null,
  von               time,
  bis               time,
  termin_art        text,
  kontext           text,
  verantwortlich_id text references benutzer (id),
  erledigt          boolean not null default false,
  -- Google-Calendar-/Gmail-Verknüpfung (erst nach Freigabe der Integration)
  extern_id         text
);

create table aktivitaet_bezuege (
  aktivitaet_id text not null references aktivitaeten (id) on delete cascade,
  art           text not null check (art in ('person', 'unternehmen', 'vorgang')),
  ref_id        text not null,
  primary key (aktivitaet_id, art, ref_id)
);

create table dokumente (
  id        text primary key,
  ref       text not null,                           -- Vorgangs- oder Stammsatz-ID
  name      text not null,
  groesse   text not null default '',
  datum     date not null default current_date,
  ablage    text not null check (ablage in ('Testdaten', 'Google Drive', 'Supabase Storage')),
  drive_id  text
);

create table verlauf (
  id          uuid primary key default gen_random_uuid(),
  ref         text not null,
  zeit        timestamptz not null default now(),
  text        text not null,
  benutzer_id text references benutzer (id)
);

-- ---------------------------------------------------------------------
-- Prüf-Trigger für polymorphe Verweise
-- ---------------------------------------------------------------------
create or replace function pruefe_ref() returns trigger language plpgsql as $$
declare v jsonb := to_jsonb(new); v_art text; v_id text;
begin
  v_art := v ->> (tg_argv[0] || '_art');
  v_id  := v ->> (tg_argv[0] || '_id');
  if v_art is not null and not ref_existiert(v_art::ref_art, v_id) then
    raise exception '% % existiert nicht (%)', v_art, v_id, tg_table_name;
  end if;
  return new;
end $$;

create trigger akquise_kunde_ref        before insert or update on akquise              for each row execute function pruefe_ref('kunde');
create trigger akquise_eigentuemer_ref  before insert or update on akquise              for each row execute function pruefe_ref('eigentuemer');
create trigger inv_eigentuemer_ref      before insert or update on investment_projekte  for each row execute function pruefe_ref('eigentuemer');
create trigger prop_eigentuemer_ref     before insert or update on property_mandate     for each row execute function pruefe_ref('eigentuemer');
create trigger interessent_ref          before insert or update on interessenten        for each row execute function pruefe_ref('ref');
create trigger such_kunde_ref           before insert or update on suchauftraege        for each row execute function pruefe_ref('kunde');
create trigger kaeufer_ref              before insert or update on kaeuferprozesse      for each row execute function pruefe_ref('kaeufer');
create trigger pman_kunde_ref           before insert or update on projects_mandate     for each row execute function pruefe_ref('kunde');
create trigger pro_bauherr_ref          before insert or update on projects_projekte    for each row execute function pruefe_ref('bauherr');
create trigger prv_beteiligter_ref      before insert or update on provisionsbeteiligungen for each row execute function pruefe_ref('beteiligter');
create trigger bz_ref                   before insert or update on bereichszuordnungen  for each row execute function pruefe_ref('ref');

-- ---------------------------------------------------------------------
-- Audit-Log
-- ---------------------------------------------------------------------
create table audit_log (
  id          bigserial primary key,
  zeit        timestamptz not null default now(),
  tabelle     text not null,
  datensatz   text not null,
  aktion      text not null check (aktion in ('INSERT', 'UPDATE', 'DELETE')),
  benutzer    uuid default auth.uid(),
  alt         jsonb,
  neu         jsonb
);

create or replace function audit_schreiben() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_alt jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
        v_neu jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
begin
  insert into audit_log (tabelle, datensatz, aktion, alt, neu)
  values (tg_table_name,
          coalesce(v_neu, v_alt) ->> coalesce(nullif(tg_argv[0], ''), 'id'),
          tg_op, v_alt, v_neu);
  return coalesce(new, old);
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
create or replace function ist_grenford_benutzer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from benutzer where auth_id = auth.uid() and aktiv)
$$;

create or replace function darf_schreiben() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from benutzer where auth_id = auth.uid() and aktiv and rolle in ('admin', 'mitarbeiter'))
$$;

create or replace function ist_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from benutzer where auth_id = auth.uid() and aktiv and rolle = 'admin')
$$;

do $$
declare t text; schluessel text;
begin
  for t, schluessel in select * from (values
    ('unternehmen','id'), ('personen','id'), ('kontaktverknuepfungen','person_id'), ('bereichszuordnungen','id'),
    ('objekte','id'), ('vorhaben','id'), ('empfehlungspartner','id'), ('akquise','id'),
    ('investment_projekte','id'), ('ankaufsprofile','id'), ('property_mandate','id'), ('interessenten','id'),
    ('suchauftraege','id'), ('suchauftrag_verknuepfungen','suchauftrag_id'), ('kaeuferprozesse','id'),
    ('gu_partner','id'), ('projects_mandate','id'), ('projects_projekte','id'), ('angebote','id'),
    ('empfehlungen','id'), ('provisionsbeteiligungen','id'), ('provisionen','id'), ('forderungen','nr'),
    ('zahlungseingaenge','id'), ('verbindlichkeiten','nr'), ('auszahlungen','id'), ('aktivitaeten','id'),
    ('aktivitaet_bezuege','aktivitaet_id'), ('dokumente','id'), ('verlauf','id')
  ) as x(t, s) loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for select to authenticated using (ist_grenford_benutzer())', t || '_lesen', t);
    execute format('create policy %I on %I for insert to authenticated with check (darf_schreiben())', t || '_anlegen', t);
    execute format('create policy %I on %I for update to authenticated using (darf_schreiben()) with check (darf_schreiben())', t || '_aendern', t);
    -- Löschen nur durch Administrator (Datenlöschungen sind freigabepflichtig)
    execute format('create policy %I on %I for delete to authenticated using (ist_admin())', t || '_loeschen', t);
    execute format('create trigger %I after insert or update or delete on %I for each row execute function audit_schreiben(%L)', t || '_audit', t, schluessel);
  end loop;
end $$;

-- Verwaltungstabellen: lesen für alle Benutzer, ändern nur Administrator
do $$
declare t text;
begin
  foreach t in array array['benutzer', 'einstellungen', 'nummernkreise', 'statusdefinitionen'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for select to authenticated using (ist_grenford_benutzer())', t || '_lesen', t);
    execute format('create policy %I on %I for all to authenticated using (ist_admin()) with check (ist_admin())', t || '_verwalten', t);
  end loop;
end $$;
create trigger einstellungen_audit after insert or update or delete on einstellungen
  for each row execute function audit_schreiben('schluessel');

alter table audit_log enable row level security;
create policy audit_lesen on audit_log for select to authenticated using (ist_admin());
-- keine insert/update/delete-Policies: Einträge entstehen ausschließlich über den Trigger

-- Nummernvergabe für angemeldete Schreibbenutzer erlauben (security definer umgeht RLS kontrolliert)
alter function naechste_nummer(text) security definer set search_path = public;
revoke all on function naechste_nummer(text) from public;
grant execute on function naechste_nummer(text) to authenticated;
