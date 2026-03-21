import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ComposedChart, ReferenceLine,
} from 'recharts'
import { createRoot } from 'react-dom/client'



const T = {
  brandMid:"#1C2D4F",brandPrimary:"#1C2D4F",brandLighter:"#E8EDF5",
  bgApp:"#F5F6F9",bgHeader:"#F0F2F7",bgRow:"#FAFBFC",
  bgRowHover:"#F0F2F7",bgSelected:"#E8EDF5",
  border:"#DDE1EA",borderFocus:"#1C2D4F",
  textStrong:"#0D1726",text:"#2C3547",textMuted:"#6B7280",
  textLight:"#9CA3AF",textLink:"#1C2D4F",
  success:"#2E844A",successBg:"#EEF8F0",
  warning:"#DD7A01",warningBg:"#FEF8E8",
  error:"#BA0517",errorBg:"#FEF0F0",
  infoBg:"#E8EDF5",purple:"#7526E3",purpleBg:"#F3EFF8",
  teal:"#016558",tealBg:"#EEF6F4",callGreen:"#1A7F3C",
  shadowSm:"0 1px 2px rgba(0,0,0,.10),0 2px 4px rgba(0,0,0,.06)",
  shadowLg:"0 8px 24px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.10)",
  radius:"4px",
};
const ff="'Lato',sans-serif";

const STAGES=[
  {key:"akquise",label:"Projektakquise",short:"Akquise",color:"#706E6B",bg:"#F3F2F2"},
  {key:"teaser",label:"Teaser versendet",short:"Teaser",color:"#1C2D4F",bg:"#EAF4FF"},
  {key:"rueckmeldung",label:"Rückmeldung Käufer",short:"Rückmeldg.",color:"#1C2D4F",bg:"#EAF4FF"},
  {key:"nda",label:"NDA unterzeichnet",short:"NDA",color:"#DD7A01",bg:"#FEF8E8"},
  {key:"dr1",label:"1. Datenraum",short:"DR 1",color:"#DD7A01",bg:"#FEF8E8"},
  {key:"loi",label:"LOI eingegangen",short:"LOI",color:"#7526E3",bg:"#F3EFF8"},
  {key:"dr2",label:"2. Datenraum",short:"DR 2",color:"#7526E3",bg:"#F3EFF8"},
  {key:"dd",label:"Due Diligence",short:"DD",color:"#016558",bg:"#EEF6F4"},
  {key:"verhandlung",label:"Kaufpreisverhandlung",short:"Verhandlg.",color:"#016558",bg:"#EEF6F4"},
  {key:"kaufvertrag",label:"Kaufvertragbestellung",short:"KV-Best.",color:"#032D60",bg:"#EAF4FF"},
  {key:"notar",label:"Notar",short:"Notar",color:"#032D60",bg:"#EAF4FF"},
  {key:"won",label:"Gewonnen ✓",short:"Gewonnen",color:"#2E844A",bg:"#EEF8F0"},
  {key:"lost",label:"Verloren",short:"Verloren",color:"#BA0517",bg:"#FEF0F0"},
  {key:"aftersales",label:"After Sales",short:"AfterSales",color:"#016558",bg:"#EEF6F4"},
];
const GU_STAGES=[
  {key:"gu_akquise",label:"1 – Akquise",short:"Akquise",color:"#706E6B",bg:"#F3F2F2"},
  {key:"gu_beratung",label:"2 – Erstberatung",short:"Erstberatg.",color:"#1C2D4F",bg:"#EAF4FF"},
  {key:"gu_angebot",label:"3 – Unverb. Angebot",short:"Angebot",color:"#DD7A01",bg:"#FEF8E8"},
  {key:"gu_termin",label:"4 – Vor-Ort Termin",short:"Vor-Ort",color:"#7526E3",bg:"#F3EFF8"},
  {key:"gu_unterschrift",label:"5 – Unterschrift",short:"Unterschrift",color:"#016558",bg:"#EEF6F4"},
  {key:"gu_re6a",label:"6a – RE Vermittlung",short:"RE 6a",color:"#2E844A",bg:"#EEF8F0"},
  {key:"gu_re6b",label:"6b – RE Fertigstellung",short:"RE 6b",color:"#1A7F3C",bg:"#D6F0DE"},
  {key:"gu_won",label:"Abgeschlossen ✓",short:"Fertig",color:"#2E844A",bg:"#EEF8F0"},
  {key:"gu_lost",label:"Verloren",short:"Verloren",color:"#BA0517",bg:"#FEF0F0"},
];
const GU_CHECKLIST={
  gu_akquise:["Kundenkontakt hergestellt","Sanierungsbedarf identifiziert","Objekt besichtigt"],
  gu_beratung:["Beratungsgespräch geführt","Leistungsumfang definiert","GU vorqualifiziert"],
  gu_angebot:["Angebot erstellt","Angebot versendet","Rückmeldung erhalten"],
  gu_termin:["Termin vereinbart","GU bestätigt","Besichtigung durchgeführt"],
  gu_unterschrift:["Vertrag unterzeichnet","Kopie archiviert","Prov.-vereinbarung geprüft"],
  gu_re6a:["RE 6a erstellt","RE 6a versendet","Zahlung 6a eingegangen"],
  gu_re6b:["Fertigstellungsmeldung erhalten","Abnahme vorhanden","RE 6b erstellt","RE 6b versendet","Zahlung 6b eingegangen"],
  gu_won:["Gesamtprovision eingegangen","Kundenfeedback","Weiterempfehlung angefragt"],
};
const STAGE_CL={
  teaser:["Teaser erstellt","Teaser versendet","Empfangsbestätigung"],
  nda:["NDA versendet","NDA Käufer unterzeichnet","NDA Verkäufer unterzeichnet","NDA archiviert"],
  dr1:["Basisdokumente hochgeladen","Zugangsdaten versendet","Login bestätigt"],
  loi:["LOI erhalten","LOI geprüft","LOI unterzeichnet","Preisvorstellung fixiert"],
  dr2:["Vollständige Unterlagen","Technische Dokumente","Rechtliche Dokumente","Finanzdokumente"],
  dd:["DD-Beauftragung","Technische DD","Rechtliche DD","Steuerliche DD","DD-Report erhalten"],
  verhandlung:["Erstes Angebot","Gegenangebot","Kaufpreiseinigung"],
  kaufvertrag:["KV-Entwurf erstellt","KV-Prüfung Käufer","KV-Prüfung Verkäufer","KV finalisiert"],
  notar:["Notartermin vereinbart","Beurkundung erfolgt","Auflassung beantragt"],
  won:["Kaufpreis eingegangen","Eigentumsübertragung","Provision abgerechnet"],
};
const DEAL_TYPES=[
  {key:"b2b_offmarket",label:"B2B Off-Market",icon:"🏢",color:"#1C2D4F"},
  {key:"b2c_offmarket",label:"B2C Off-Market",icon:"🏠",color:"#DD7A01"},
  {key:"sanierung",label:"Sanierungsber.",icon:"🔨",color:"#2E844A"},
  {key:"gu_b2c",label:"GU Vermittl. B2C",icon:"👷",color:"#7526E3"},
  {key:"gu_b2b",label:"GU Vermittl. B2B",icon:"🏗️",color:"#5B2FBE"},
];
const GU_ASSETS=[
  {key:"wohnen",label:"Wohngebäude/EFH",icon:"🏠"},{key:"mfh",label:"Mehrfamilienhaus",icon:"🏘️"},
  {key:"buero",label:"Bürogebäude",icon:"🏢"},{key:"hotel",label:"Hotel/Gastro",icon:"🏨"},
  {key:"gewerbe",label:"Gewerbe allg.",icon:"🏪"},{key:"industrie",label:"Industrie/Halle",icon:"🏭"},
  {key:"hoch_tief",label:"Hoch- & Tiefbau",icon:"⛏️"},{key:"denkmal",label:"Denkmalschutz",icon:"🏛️"},
];
const GU_PARTNER_TYPEN=[
  {key:"wohnen_privat",label:"Wohnen & Privat B2C",icon:"🏠",color:"#1C2D4F"},
  {key:"gewerbe_b2b",label:"Gewerbe & B2B",icon:"🏢",color:"#7526E3"},
  {key:"hoch_tief",label:"Hoch- & Tiefbau",icon:"⛏️",color:"#016558"},
  {key:"denkmal",label:"Denkmalpflege",icon:"🏛️",color:"#DD7A01"},
  {key:"schluessel",label:"Schlüsselfertig",icon:"🔑",color:"#2E844A"},
];
const OUTCOMES={
  connected:{label:"Verbunden",color:"#2E844A",icon:"✅"},
  no_answer:{label:"Keine Antwort",color:"#DD7A01",icon:"📵"},
  voicemail:{label:"Mailbox",color:"#7526E3",icon:"📬"},
  busy:{label:"Besetzt",color:"#BA0517",icon:"🔴"},
};
const OBJ_TYPES=["Wohngebäude","Gewerbeimmobilie","Grundstück","Gemischt","Industriegebäude","Hotel","Pflegeheim","Projektentwicklung","Data Center","Special Asset"];
const COMPANY_TYPES=[
  {key:"investor",label:"Investor",icon:"💼",color:"#7526E3"},
  {key:"family_office",label:"Family Office",icon:"👨‍👩‍👧",color:"#DD7A01"},
  {key:"projektentwickler",label:"Projektentwickler",icon:"🏗️",color:"#0176D3"},
  {key:"bautraeger",label:"Bauträger",icon:"🏚️",color:"#016558"},
  {key:"bank",label:"Bank",icon:"🏦",color:"#032D60"},
  {key:"versicherung",label:"Versicherung",icon:"🛡️",color:"#706E6B"},
  {key:"pensionskasse",label:"Pensionskasse",icon:"📋",color:"#016558"},
  {key:"immomakler",label:"Immobilienmakler",icon:"🔑",color:"#1C2D4F"},
  {key:"gu",label:"Generalunternehmer",icon:"👷",color:"#7526E3"},
  {key:"architekt",label:"Architekt",icon:"📐",color:"#7526E3"},
  {key:"notar",label:"Notar",icon:"⚖️",color:"#032D60"},
  {key:"anwalt",label:"Anwalt / Kanzlei",icon:"⚖️",color:"#BA0517"},
  {key:"sonstiges",label:"Sonstiges",icon:"🏢",color:"#706E6B"},
];

const fmt=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
const fmtM=n=>{if(!n&&n!==0)return"—";if(n>=1e6)return`€${(n/1e6).toFixed(2)}M`;if(n>=1e3)return`€${(n/1e3).toFixed(0)}T`;return fmt(n);};
const today=()=>new Date().toISOString().split("T")[0];
const nowISO=()=>new Date().toISOString();
const uid=()=>Math.random().toString(36).slice(2,10);
const fmtSec=s=>{const m=Math.floor(s/60),sec=s%60;return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;};
const fmtDT=iso=>{if(!iso)return"—";const d=new Date(iso);return d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})+" "+d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});};
const dateStr=d=>d?new Date(d).toLocaleDateString("de-DE",{day:"2-digit",month:"short",year:"numeric"}):"—";
const r2=n=>Math.round(n*100)/100;
const isGU=t=>t==="gu_b2c"||t==="gu_b2b";
const getStg=k=>STAGES.find(s=>s.key===k)||GU_STAGES.find(s=>s.key===k)||STAGES[0];
const getTyp=k=>DEAL_TYPES.find(t=>t.key===k)||DEAL_TYPES[0];
const getVolN=d=>isGU(d.type)?(d.guVolumen||0):(d.askPrice||0);
const getProvN=d=>isGU(d.type)?Math.round((d.guVolumen||0)*(d.commission||7)/100):((d.agreedPrice||d.askPrice||0)*(d.commission||0)/100);

function load(key,fb){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fb;}catch{return fb;}}
function save(key,v){try{localStorage.setItem(key,JSON.stringify(v));}catch{}}

const DSGVO_GRUNDLAGEN=[
  {key:"einwilligung",label:"Einwilligung (Art. 6 I lit. a)",color:"#2E844A",hint:"Kontakt hat aktiv eingewilligt"},
  {key:"vertragsanbahnung",label:"Vertragsanbahnung (Art. 6 I lit. b)",color:"#1C2D4F",hint:"Notwendig für Vertragsanbahnung"},
  {key:"berechtigtes_interesse",label:"Berechtigtes Interesse (Art. 6 I lit. f)",color:"#DD7A01",hint:"B2B: überwiegendes berechtigtes Interesse"},
  {key:"beschaeftigung",label:"Beschäftigungsverhältnis (§ 26 BDSG)",color:"#7526E3",hint:"Mitarbeiter / Kooperationspartner"},
  {key:"gesetzlich",label:"Gesetzliche Pflicht (Art. 6 I lit. c)",color:"#706E6B",hint:"Gesetzliche Aufbewahrungspflicht"},
];
const DSGVO_ZWECKE=["Immobilienvermittlung","GU-Vermittlung / Sanierung","Investorenbetreuung","Käuferbetreuung","Verkäuferbetreuung","Notarkoordination","Partnerbetreuung","Interne Nutzung","Sonstiges"];
const DSGVO_HERKUNFT=["Website / Kontaktformular","Empfehlung","Messe / Event","Kaltakquise","WhatsApp Business","E-Mail","Telefonisch","LinkedIn / Xing","Intern","Sonstiges"];

const dsgvoStatus=c=>{
  const d=c.dsgvo;
  if(!d?.rechtsgrundlage)return{status:"fehlt",color:"#BA0517",label:"Keine Rechtsgrundlage",icon:"⛔"};
  if(d.rechtsgrundlage==="geloescht")return{status:"geloescht",color:"#706E6B",label:"Anonymisiert",icon:"🗑️"};
  if(d.loeschfrist&&new Date(d.loeschfrist)<new Date())return{status:"abgelaufen",color:"#BA0517",label:"Löschfrist abgelaufen",icon:"🔴"};
  const warn=new Date();warn.setMonth(warn.getMonth()+2);
  if(d.loeschfrist&&new Date(d.loeschfrist)<warn)return{status:"bald",color:"#DD7A01",label:"Frist in <2 Monaten",icon:"🟡"};
  return{status:"ok",color:"#2E844A",label:"DSGVO-konform",icon:"✅"};
};
const exportAuskunft=(contact,calls)=>{
  const data={meta:{erstellt:new Date().toISOString(),art:"Auskunftsanfrage Art. 15 DSGVO",verantwortlicher:"Grenford"},stammdaten:{vorname:contact.firstName,nachname:contact.lastName,email:contact.email,telefon:contact.phone,mobil:contact.mobile,rolle:contact.role,notizen:contact.notes},dsgvo:contact.dsgvo||{},anrufe:calls.filter(c=>c.contactId===contact.id).map(c=>({datum:c.startedAt,dauer:c.duration+"s",ergebnis:c.outcome,notizen:c.notes}))};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Grenford_Auskunft_${contact.firstName}_${contact.lastName}_${today()}.json`;a.click();
};
const anonymizeContact=contact=>({...contact,firstName:"[Gelöscht]",lastName:"[Gelöscht]",email:"",phone:"",mobile:"",notes:`[Anonymisiert Art. 17 DSGVO – ${new Date().toLocaleDateString("de-DE")}]`,dsgvo:{...contact.dsgvo,anonymisiert:new Date().toISOString(),rechtsgrundlage:"geloescht"}});

const INIT_DEALS=[
  {id:"d1",name:"Bürokomplex Düsseldorf-Süd",type:"b2b_offmarket",stage:"dd",accountName:"Fonds Alpha GmbH",companyId:"",seller:"Immobilien AG",buyer:"Fonds Alpha GmbH",address:"Erkrather Str. 100, 40233 Düsseldorf",objType:"Gewerbeimmobilie",sqm:4200,askPrice:8500000,agreedPrice:null,commission:1.5,probability:70,closeDate:"2025-06-30",owner:"Thomas Reiter",priority:"High",description:"DD läuft positiv.",checklist:{},log:[{date:"2025-03-01",text:"NDA unterzeichnet",by:"T. Reiter",type:"stage"}]},
  {id:"d2",name:"MFH Köln-Nippes 8 WE",type:"b2c_offmarket",stage:"loi",accountName:"K. Becker",companyId:"",seller:"Familie Mayer",buyer:"Karl Becker",address:"Neusser Str. 45, 50733 Köln",objType:"Wohngebäude",sqm:620,askPrice:1850000,agreedPrice:null,commission:3.0,probability:55,closeDate:"2025-07-15",owner:"Sandra Kluge",priority:"High",description:"LOI eingegangen.",checklist:{},log:[]},
  {id:"d3",name:"Logistikzentrum Hannover",type:"b2b_offmarket",stage:"notar",accountName:"ImmoPrime KG",companyId:"",seller:"Logistics SE",buyer:"ImmoPrime KG",address:"Messeschnellweg 12, 30539 Hannover",objType:"Industriegebäude",sqm:12000,askPrice:14200000,agreedPrice:13800000,commission:1.0,probability:90,closeDate:"2025-04-20",owner:"Thomas Reiter",priority:"High",description:"Notartermin 15.04.",checklist:{},log:[]},
  {id:"d4",name:"Kernsanierung EFH Weber Köln",type:"gu_b2c",stage:"gu_termin",accountName:"Familie Weber",companyId:"",seller:"",buyer:"Familie Weber",address:"Musterstraße 12, 50667 Köln",objType:"Wohngebäude",sqm:180,askPrice:0,agreedPrice:null,commission:7,probability:75,closeDate:"2025-05-30",owner:"Sandra Kluge",priority:"High",guVolumen:280000,guAsset:"wohnen",guPartner:"wohnen_privat",guPartnerName:"Bau & Sanierung Müller GmbH",invoiceA:{amount:9800,sent:false,paid:false,date:""},invoiceB:{amount:9800,sent:false,paid:false,date:""},description:"EFH Vollsanierung.",checklist:{},log:[]},
  {id:"d5",name:"Bürosanierung Stadtwerke Düsseldorf",type:"gu_b2b",stage:"gu_angebot",accountName:"Stadtwerke Holding",companyId:"",seller:"",buyer:"Stadtwerke Holding",address:"Speditionstr. 21, 40221 Düsseldorf",objType:"Bürogebäude",sqm:2400,askPrice:0,agreedPrice:null,commission:5,probability:50,closeDate:"2025-08-01",owner:"Thomas Reiter",priority:"Medium",guVolumen:1200000,guAsset:"buero",guPartner:"gewerbe_b2b",guPartnerName:"HochBau Rhein GmbH",invoiceA:{amount:30000,sent:false,paid:false,date:""},invoiceB:{amount:30000,sent:false,paid:false,date:""},description:"Komplettsanierung.",checklist:{},log:[]},
  {id:"d6",name:"Pflegeheim-Portfolio Frankfurt",type:"b2b_offmarket",stage:"won",accountName:"Sozial-REIT AG",companyId:"",seller:"Care Invest GmbH",buyer:"Sozial-REIT AG",address:"Sachsenhäuser Ufer 5, 60594 Frankfurt",objType:"Pflegeheim",sqm:8500,askPrice:22000000,agreedPrice:21500000,commission:1.2,probability:100,closeDate:"2025-03-01",owner:"Sandra Kluge",priority:"Medium",description:"Abgeschlossen.",checklist:{},log:[]},
];
const INIT_CONTACTS=[
  {id:"c1",firstName:"Thomas",lastName:"Reiter",title:"Senior Broker",companyId:"co4",email:"t.reiter@grenford.de",phone:"+49 211 9988776",mobile:"+49 170 9988776",role:"Makler",type:"intern",notes:"B2B & Gewerbe",dsgvo:{rechtsgrundlage:"beschaeftigung",einwilligung_datum:"2025-01-01",zweck:"Interne Nutzung CRM",loeschfrist:"2030-01-01",herkunft:"intern",notizen:"Mitarbeiter"}},
  {id:"c2",firstName:"Sandra",lastName:"Kluge",title:"Senior Brokerin",companyId:"co4",email:"s.kluge@grenford.de",phone:"+49 221 7654321",mobile:"+49 172 7654321",role:"Makler",type:"intern",notes:"B2C & Wohnen",dsgvo:{rechtsgrundlage:"beschaeftigung",einwilligung_datum:"2025-01-01",zweck:"Interne Nutzung CRM",loeschfrist:"2030-01-01",herkunft:"intern",notizen:"Mitarbeiter"}},
  {id:"c3",firstName:"Karl",lastName:"Becker",title:"Geschäftsführer",companyId:"co1",email:"k.becker@fondsalpha.de",phone:"+49 172 1234567",mobile:"+49 172 1234567",role:"Käufer",type:"buyer",notes:"MFH Köln bis 2M",dsgvo:{rechtsgrundlage:"vertragsanbahnung",einwilligung_datum:"2025-02-10",zweck:"Immobilienvermittlung",loeschfrist:"2027-02-10",herkunft:"empfehlung",notizen:""}},
  {id:"c4",firstName:"Familie",lastName:"Weber",title:"",companyId:"",email:"weber@privat.de",phone:"+49 221 5566778",mobile:"+49 177 5566778",role:"Käufer",type:"buyer",notes:"EFH Sanierung Köln",dsgvo:{rechtsgrundlage:"einwilligung",einwilligung_datum:"2025-03-01",zweck:"GU-Vermittlung Sanierung",loeschfrist:"2027-03-01",herkunft:"website",notizen:"Einwilligung per E-Mail erteilt"}},
];
const INIT_COMPANIES=[
  {id:"co1",name:"Fonds Alpha GmbH",type:"investor",street:"Königsallee 55",city:"Düsseldorf",country:"Deutschland",phone:"+49 211 112233",email:"deal@fondsalpha.de",website:"",notes:"Aktiver Käufer Gewerbe NRW",ankaufsprofil:{}},
  {id:"co2",name:"Bau & Sanierung Müller",type:"gu",street:"Kölner Str. 12",city:"Köln",country:"Deutschland",phone:"+49 221 9876543",email:"info@mueller-bau.de",website:"",notes:"Wohnen & Privat B2C, NRW",ankaufsprofil:{}},
  {id:"co3",name:"HochBau Rhein GmbH",type:"bautraeger",street:"Speditionstr. 8",city:"Düsseldorf",country:"Deutschland",phone:"+49 211 4455667",email:"info@hochbau-rhein.de",website:"",notes:"Gewerbe & B2B",ankaufsprofil:{}},
  {id:"co4",name:"Grenford",type:"immomakler",street:"Musterstr. 1",city:"Düsseldorf",country:"Deutschland",phone:"+49 211 9988776",email:"info@grenford.de",website:"grenford.de",notes:"Eigenes Unternehmen",ankaufsprofil:{}},
];
const INIT_CALLS=[
  {id:"cl1",contactId:"c3",contactName:"Karl Becker",phone:"+49 172 1234567",dealId:"d2",dealName:"MFH Köln-Nippes",direction:"outbound",startedAt:"2025-03-18T09:32:00Z",duration:247,notes:"LOI-Abgabe Freitag.",outcome:"connected",user:"Sandra Kluge"},
  {id:"cl2",contactId:"c1",contactName:"Thomas Reiter",phone:"+49 211 9988776",dealId:"d1",dealName:"Bürokomplex Düsseldorf",direction:"inbound",startedAt:"2025-03-15T16:44:00Z",duration:412,notes:"DD-Gutachten positiv.",outcome:"connected",user:"Thomas Reiter"},
  {id:"cl3",contactId:"c4",contactName:"Familie Weber",phone:"+49 177 5566778",dealId:"d4",dealName:"Kernsanierung EFH Weber",direction:"outbound",startedAt:"2025-03-16T11:08:00Z",duration:0,notes:"",outcome:"no_answer",user:"Sandra Kluge"},
];
const INIT_TASKS=[
  {id:"tk1",subject:"DD-Report anfordern – Düsseldorf",dealId:"d1",contact:"Fonds Alpha GmbH",type:"Call",due:"2025-03-22",priority:"High",status:"Not Started",description:""},
  {id:"tk2",subject:"Vor-Ort-Termin GU Müller vorbereiten",dealId:"d4",contact:"Familie Weber",type:"Meeting",due:"2025-03-28",priority:"High",status:"In Progress",description:"Checkliste mitbringen"},
];

// ─── DEAL TEMPLATES & HELPERS ──────────────────────────────────────────────────
const DEAL_TEMPLATES=[
  {id:"t1",name:"B2B Off-Market Standard",icon:"🏢",type:"b2b_offmarket",stage:"akquise",commission:1.5,probability:30,priority:"Medium",objType:"Gewerbeimmobilie",description:"B2B Off-Market.",guVolumen:0},
  {id:"t2",name:"B2C Off-Market Wohnen",icon:"🏠",type:"b2c_offmarket",stage:"akquise",commission:3.57,probability:30,priority:"Medium",objType:"Wohngebäude",description:"B2C Off-Market Wohnimmobilie.",guVolumen:0},
  {id:"t3",name:"GU Vermittlung B2C",icon:"👷",type:"gu_b2c",stage:"gu_akquise",commission:7,probability:40,priority:"High",objType:"Wohngebäude",description:"GU Vermittlung Privatkunde.",guVolumen:0,guAsset:"wohnen",invoiceA:{amount:0,sent:false,paid:false,date:""},invoiceB:{amount:0,sent:false,paid:false,date:""}},
  {id:"t4",name:"GU Vermittlung B2B",icon:"🏗️",type:"gu_b2b",stage:"gu_akquise",commission:5,probability:35,priority:"Medium",objType:"Bürogebäude",description:"GU Vermittlung Geschäftskunde.",guVolumen:0,guAsset:"buero",invoiceA:{amount:0,sent:false,paid:false,date:""},invoiceB:{amount:0,sent:false,paid:false,date:""}},
  {id:"t5",name:"Sanierungsberatung",icon:"🔨",type:"sanierung",stage:"akquise",commission:2.0,probability:25,priority:"Low",objType:"Wohngebäude",description:"Sanierungsberatung.",guVolumen:0},
];
const findDuplicate=(contacts,form)=>contacts.find(c=>c.id!==form.id&&((form.email&&c.email&&c.email.toLowerCase()===form.email.toLowerCase())||(form.mobile&&c.mobile&&c.mobile.replace(/\s/g,"")===form.mobile.replace(/\s/g,""))||(form.phone&&c.phone&&c.phone.replace(/\s/g,"")===form.phone.replace(/\s/g,""))));
const requestNotif=()=>{if("Notification"in window&&Notification.permission==="default")Notification.requestPermission();};
const sendNotif=(title,body)=>{if("Notification"in window&&Notification.permission==="granted")new Notification(`🏗️ ${title}`,{body});};

// ─── ANKAUFSPROFIL ─────────────────────────────────────────────────────────────
const ANKAUF_ASSET_KLASSEN=[
  {key:"wohnen",label:"Wohnen",icon:"🏠"},{key:"mfh",label:"Mehrfamilienhaus",icon:"🏘️"},
  {key:"buero",label:"Büro",icon:"🏢"},{key:"logistik",label:"Logistik",icon:"🏭"},
  {key:"hotel",label:"Hotel",icon:"🏨"},{key:"einzelhandel",label:"Einzelhandel",icon:"🏪"},
  {key:"pflegeheim",label:"Pflegeheim",icon:"🏥"},{key:"datacenter",label:"Data Center",icon:"💻"},
  {key:"gemischt",label:"Gemischt",icon:"🏗️"},{key:"special",label:"Special Asset",icon:"⭐"},
];
const ANKAUF_DEAL_FORMEN=[
  {key:"asset_deal",label:"Asset Deal"},{key:"share_deal",label:"Share Deal"},
  {key:"fwd_purchase",label:"Forward Purchase"},{key:"fwd_funding",label:"Forward Funding"},
  {key:"club_deal",label:"Club Deal"},{key:"sale_leaseback",label:"Sale & Leaseback"},
  {key:"npl",label:"NPL"},{key:"joint_venture",label:"Joint Venture"},
];
const ANKAUF_RISIKOPROFILE=[
  {key:"core",label:"Core",color:"#2E844A",desc:"Vollvermietet, Top-Lage"},
  {key:"core_plus",label:"Core+",color:"#016558",desc:"Geringe Risiken"},
  {key:"value_add",label:"Value Add",color:"#DD7A01",desc:"Aufwertungspotenzial"},
  {key:"opportunistic",label:"Opportunistic",color:"#BA0517",desc:"Hohe Chancen/Risiken"},
  {key:"development",label:"Development",color:"#7526E3",desc:"Projektentwicklung"},
];
const ANKAUF_LAENDER=["Deutschland","Österreich","Schweiz","Niederlande","Belgien","Luxemburg","Frankreich","Polen","Tschechien","Ungarn","Skandinavien","Sonstiges Europa"];
const ANKAUF_REGIONEN_DE=["Bundesweit","NRW","Bayern","Baden-Württemberg","Hessen","Berlin","Hamburg","Niedersachsen","Sachsen","Brandenburg","Andere"];

// ─── UI BASICS ────────────────────────────────────────────────────────────────
const Avatar=({name,size=28,color=T.brandPrimary})=>{
  const i=(name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:700,color:"#fff",fontFamily:ff,flexShrink:0}}>{i}</div>;
};
const Badge=({children,color=T.brandPrimary,bg})=><span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:700,fontFamily:ff,whiteSpace:"nowrap",color,background:bg||color+"18"}}>{children}</span>;
const Pill=({label,color,bg})=><span style={{display:"inline-block",padding:"1px 10px",borderRadius:99,fontSize:11,fontWeight:700,color,background:bg||color+"18",whiteSpace:"nowrap"}}>{label}</span>;

function SFBtn({children,onClick,variant="brand",small,icon,disabled}){
  const[h,sH]=useState(false);
  const styles={brand:{bg:h?"#0D1A2E":T.brandPrimary,color:"#fff",border:T.brandPrimary},neutral:{bg:h?T.bgRowHover:"#fff",color:T.text,border:T.border},inverse:{bg:h?"rgba(255,255,255,.2)":"transparent",color:"#fff",border:"rgba(255,255,255,.5)"},success:{bg:h?"#1E5C36":T.success,color:"#fff",border:T.success},destructive:{bg:h?"#8E0011":T.error,color:"#fff",border:T.error}};
  const s=styles[variant]||styles.brand;
  return <button onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} onClick={onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",gap:6,padding:small?"4px 10px":"8px 16px",borderRadius:T.radius,border:`1px solid ${s.border}`,background:s.bg,color:s.color,fontSize:small?12:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,fontFamily:ff,boxShadow:T.shadowSm,transition:"all .15s",whiteSpace:"nowrap"}}>{icon&&<span style={{fontSize:small?11:14}}>{icon}</span>}{children}</button>;
}
function SFInput({label,value,onChange,placeholder,type="text",required,full,readOnly}){
  return <div style={{display:"flex",flexDirection:"column",gap:4,flex:full?1:"unset"}}>{label&&<label style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:ff}}>{label}{required&&<span style={{color:T.error}}> *</span>}</label>}<input type={type} value={value||""} readOnly={readOnly} onChange={e=>!readOnly&&onChange(e.target.value)} placeholder={placeholder} style={{background:readOnly?T.bgApp:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"6px 10px",color:T.textStrong,fontSize:13,fontFamily:ff,outline:"none",width:full?"100%":"auto"}} onFocus={e=>!readOnly&&(e.target.style.borderColor=T.borderFocus)} onBlur={e=>e.target.style.borderColor=T.border}/></div>;
}
function SFSelect({label,value,onChange,options,full}){
  return <div style={{display:"flex",flexDirection:"column",gap:4,flex:full?1:"unset"}}>{label&&<label style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:ff}}>{label}</label>}<select value={value||""} onChange={e=>onChange(e.target.value)} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"6px 10px",color:T.textStrong,fontSize:13,fontFamily:ff,outline:"none",width:full?"100%":"auto"}} onFocus={e=>e.target.style.borderColor=T.borderFocus} onBlur={e=>e.target.style.borderColor=T.border}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}
function SFTA({label,value,onChange,placeholder,rows=3}){
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>{label&&<label style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:ff}}>{label}</label>}<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"6px 10px",color:T.textStrong,fontSize:13,fontFamily:ff,outline:"none",resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.borderFocus} onBlur={e=>e.target.style.borderColor=T.border}/></div>;
}
function Modal({title,icon,onClose,children,size=600,footer}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{background:"#fff",borderRadius:T.radius,width:size,maxWidth:"96vw",maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:T.shadowLg}}><div style={{background:T.brandMid,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}>{icon&&<span style={{fontSize:18}}>{icon}</span>}<span style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:ff}}>{title}</span></div><button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.8)",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button></div><div style={{flex:1,overflow:"auto",padding:24}}>{children}</div>{footer&&<div style={{padding:"12px 24px",borderTop:`1px solid ${T.border}`,background:T.bgApp,display:"flex",gap:8,justifyContent:"flex-end"}}>{footer}</div>}</div></div>;
}
function SCard({title,icon,children,action}){
  return <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden",marginBottom:14}}><div style={{background:T.bgHeader,padding:"10px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{icon&&<span style={{marginRight:5}}>{icon}</span>}{title}</span>{action}</div><div style={{padding:16}}>{children}</div></div>;
}
function PathComp({stages,current,onChange}){
  const display=stages.filter(s=>s.key!=="lost"&&s.key!=="gu_lost");
  return <div style={{display:"flex",alignItems:"stretch",overflow:"hidden",borderRadius:T.radius,border:`1px solid ${T.border}`,background:"#fff"}}>{display.map((s,i)=>{const idx=display.findIndex(x=>x.key===current);const isActive=s.key===current,isDone=i<idx;return <div key={s.key} onClick={()=>onChange(s.key)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"7px 2px",background:isActive?s.color:isDone?T.bgRowHover:"#fff",cursor:"pointer",borderRight:i<display.length-1?`1px solid ${T.border}`:"none",transition:"background .15s"}} onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=s.color+"22";}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background=isDone?T.bgRowHover:"#fff";}}><span style={{fontSize:9,fontWeight:isActive?700:500,color:isActive?"#fff":isDone?T.text:T.textMuted,textAlign:"center",lineHeight:1.2,fontFamily:ff}}>{isDone?"✓ ":""}{s.short}</span></div>})}</div>;
}

// ─── DSGVO COMPONENTS ─────────────────────────────────────────────────────────
function DSGVOBanner({onAccept}){
  return <div style={{position:"fixed",inset:0,background:"rgba(28,45,79,.85)",zIndex:99999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 24px"}}><div style={{background:"#fff",borderRadius:12,maxWidth:720,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.3)",overflow:"hidden",fontFamily:ff}}><div style={{background:"#1C2D4F",padding:"16px 24px",display:"flex",alignItems:"center",gap:12}}><svg width="28" height="28" viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="33" stroke="rgba(255,255,255,0.8)" strokeWidth="2"/><text x="14" y="47" fontFamily="Georgia,serif" fontSize="26" fill="white">GF</text></svg><div><div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif",letterSpacing:"0.1em"}}>GRENFORD</div><div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>Datenschutzhinweis · DSGVO</div></div></div><div style={{padding:"20px 24px"}}><div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:10}}>🔒 Datenschutz & Datensicherheit</div><div style={{fontSize:13,color:T.textMuted,lineHeight:1.7,marginBottom:14}}>Dieses CRM-System verarbeitet personenbezogene Daten gemäß der <strong>EU-DSGVO</strong> und dem <strong>BDSG</strong>.</div><div style={{background:"#FEF8E8",borderRadius:8,padding:"10px 14px",border:"1px solid #DD7A0133",marginBottom:16}}><div style={{fontSize:12,color:"#DD7A01",fontWeight:600}}>⚠️ Hinweis Verantwortlichkeit</div><div style={{fontSize:12,color:T.textMuted,marginTop:3}}>Als Verantwortlicher gemäß Art. 4 Nr. 7 DSGVO sind Sie verpflichtet, für jeden gespeicherten Kontakt eine Rechtsgrundlage zu dokumentieren.</div></div><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button onClick={onAccept} style={{padding:"10px 24px",borderRadius:8,border:"none",background:"#1C2D4F",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:ff}}>✓ Verstanden – Grenford CRM öffnen</button></div></div></div></div>;
}

function DSGVOTab({contact,onUpdate}){
  const d=contact.dsgvo||{};const st=dsgvoStatus(contact);const rg=DSGVO_GRUNDLAGEN.find(g=>g.key===d.rechtsgrundlage);const f=k=>v=>onUpdate({...contact,dsgvo:{...d,[k]:v}});
  return <div style={{display:"flex",flexDirection:"column",gap:14}}><div style={{background:st.color+"12",border:`1px solid ${st.color}44`,borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:26}}>{st.icon}</span><div><div style={{fontSize:14,fontWeight:700,color:st.color,fontFamily:ff}}>{st.label}</div>{rg&&<div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{rg.label}</div>}</div></div><div style={{display:"flex",gap:8}}><button onClick={()=>exportAuskunft(contact,[])} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:"#fff",color:T.text,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:ff}}>📥 Auskunft</button>{d.rechtsgrundlage!=="geloescht"&&<button onClick={()=>{if(window.confirm(`Kontakt unwiderruflich anonymisieren?`))onUpdate(anonymizeContact(contact));}} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${T.error}`,background:T.errorBg,color:T.error,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:ff}}>🗑️ Anonymisieren</button>}</div></div>
  {d.rechtsgrundlage==="geloescht"?<div style={{padding:32,textAlign:"center",color:T.textMuted,fontSize:14}}><div style={{fontSize:32,marginBottom:10}}>🗑️</div><div style={{fontWeight:700}}>Kontakt anonymisiert</div></div>:
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
    <div style={{background:"#fff",borderRadius:10,border:`1px solid ${T.border}`,padding:16,gridColumn:"span 2"}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>⚖️ Rechtsgrundlage</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{DSGVO_GRUNDLAGEN.map(g=><div key={g.key} onClick={()=>f("rechtsgrundlage")(g.key)} style={{border:`2px solid ${d.rechtsgrundlage===g.key?g.color:T.border}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",background:d.rechtsgrundlage===g.key?g.color+"10":"#fff"}}><div style={{fontSize:12,fontWeight:700,color:d.rechtsgrundlage===g.key?g.color:T.text,marginBottom:3}}>{g.label.split("(")[0].trim()}</div><div style={{fontSize:10,color:T.textMuted}}>{g.hint}</div></div>)}</div></div>
    <div style={{background:"#fff",borderRadius:10,border:`1px solid ${T.border}`,padding:16}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>📋 Details</div><div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:12,fontWeight:700,color:T.text}}>Zweck</label><select value={d.zweck||""} onChange={e=>f("zweck")(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"6px 10px",fontSize:13,fontFamily:ff,outline:"none"}}><option value="">— wählen —</option>{DSGVO_ZWECKE.map(z=><option key={z}>{z}</option>)}</select></div><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:12,fontWeight:700,color:T.text}}>Herkunft</label><select value={d.herkunft||""} onChange={e=>f("herkunft")(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"6px 10px",fontSize:13,fontFamily:ff,outline:"none"}}><option value="">— wählen —</option>{DSGVO_HERKUNFT.map(h=><option key={h}>{h}</option>)}</select></div></div></div>
    <div style={{background:"#fff",borderRadius:10,border:`1px solid ${T.border}`,padding:16}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>📅 Fristen</div><div style={{display:"flex",flexDirection:"column",gap:10}}><SFInput label="Dokumentiert am" value={d.einwilligung_datum||""} onChange={f("einwilligung_datum")} type="date" full/><SFInput label="Löschfrist" value={d.loeschfrist||""} onChange={f("loeschfrist")} type="date" full/>{st.status==="abgelaufen"&&<div style={{background:T.errorBg,border:`1px solid ${T.error}44`,borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:12,fontWeight:700,color:T.error}}>🔴 Löschfrist abgelaufen!</div></div>}</div></div>
  </div>}
  </div>;
}

// ─── CALL SYSTEM ──────────────────────────────────────────────────────────────
function ActiveCallOverlay({call,onHangup}){
  const[secs,setSecs]=useState(0);const[notes,setNotes]=useState("");const[outcome,setOutcome]=useState("connected");const timer=useRef(null);
  useEffect(()=>{timer.current=setInterval(()=>setSecs(s=>s+1),1000);return()=>clearInterval(timer.current);},[]);
  return <div style={{position:"fixed",bottom:24,right:24,zIndex:99999,width:310,background:"#fff",borderRadius:12,border:`2px solid ${T.callGreen}`,boxShadow:"0 8px 32px rgba(26,127,60,.25)",overflow:"hidden",fontFamily:ff}}><div style={{background:`linear-gradient(135deg,${T.callGreen},#0F5A26)`,padding:"13px 16px",display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📞</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{call.contactName}</div><div style={{fontSize:11,color:"rgba(255,255,255,.8)"}}>{call.phone}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{fmtSec(secs)}</div></div></div><div style={{padding:"12px 14px"}}><div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{Object.entries(OUTCOMES).map(([k,v])=><button key={k} onClick={()=>setOutcome(k)} style={{padding:"2px 8px",borderRadius:99,border:`1.5px solid ${outcome===k?v.color:T.border}`,background:outcome===k?v.color+"18":"#fff",color:outcome===k?v.color:T.textMuted,fontSize:10,fontWeight:outcome===k?700:400,cursor:"pointer",fontFamily:ff}}>{v.icon} {v.label}</button>)}</div><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Gesprächsnotizen…" rows={2} style={{width:"100%",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"6px 8px",fontSize:12,fontFamily:ff,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:10}}/><button onClick={()=>{clearInterval(timer.current);onHangup({duration:secs,notes,outcome});}} style={{width:"100%",padding:"9px",borderRadius:T.radius,border:"none",background:T.error,color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:ff,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>📵 Gespräch beenden</button></div></div>;
}
function CallButton({contact,dealId,dealName,onCallStart,small}){
  const phone=contact.mobile||contact.phone;if(!phone)return null;
  const handle=e=>{e.stopPropagation();window.location.href=`tel:${phone.replace(/\s/g,"")}`;onCallStart({contactId:contact.id,contactName:`${contact.firstName} ${contact.lastName}`,phone,dealId:dealId||"",dealName:dealName||"",direction:"outbound",startedAt:nowISO()});};
  return <button onClick={handle} title={`Anrufen: ${phone}`} style={{display:"inline-flex",alignItems:"center",gap:small?3:5,padding:small?"3px 8px":"5px 12px",borderRadius:T.radius,border:`1px solid ${T.callGreen}`,background:"#fff",color:T.callGreen,fontSize:small?11:12,fontWeight:700,cursor:"pointer",fontFamily:ff,transition:"background .15s",whiteSpace:"nowrap"}} onMouseEnter={e=>e.currentTarget.style.background=T.successBg} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>📞{!small&&" Anrufen"}</button>;
}
function CallList({calls}){
  if(!calls.length)return <div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:13,fontFamily:ff}}>Noch keine Anrufe.</div>;
  return <div>{[...calls].sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).map((c,i)=>{const out=OUTCOMES[c.outcome]||OUTCOMES.connected;return <div key={c.id} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:i<calls.length-1?`1px solid ${T.border}`:"none",alignItems:"flex-start"}}><div style={{width:28,height:28,borderRadius:"50%",background:c.direction==="inbound"?T.infoBg:T.successBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,border:`1px solid ${T.border}`}}>{c.direction==="inbound"?"📲":"📞"}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{fontSize:13,fontWeight:700,color:T.textStrong,fontFamily:ff}}>{c.contactName}</span><span style={{fontSize:11,fontFamily:"monospace",color:T.brandPrimary,background:T.infoBg,padding:"1px 6px",borderRadius:99,fontWeight:700}}>{fmtSec(c.duration)}</span><span style={{fontSize:11,color:out.color,fontWeight:700}}>{out.icon} {out.label}</span></div>{c.notes&&<div style={{fontSize:12,color:T.text,fontFamily:ff,marginTop:2,background:T.bgApp,borderRadius:T.radius,padding:"3px 7px"}}>{c.notes}</div>}<div style={{fontSize:10,color:T.textLight,fontFamily:ff,marginTop:2}}>{fmtDT(c.startedAt)} · {c.user||"Ich"}{c.dealName?` · ${c.dealName}`:""}</div></div></div>;})}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🆕 NEU: LEXWARE EXPORT
// Generiert eine Lexware-kompatible CSV-Zeile für RE 6a oder RE 6b
// ═══════════════════════════════════════════════════════════════════════════════
function exportLexwareCSV(deal, invoiceType) {
  const inv = invoiceType === "6a" ? deal.invoiceA : deal.invoiceB;
  const amount = inv?.amount || 0;
  const netto = Math.round(amount / 1.19 * 100) / 100;
  const mwst = Math.round((amount - netto) * 100) / 100;
  const datum = inv?.date || today();
  const rechnungsNr = `GF-${deal.id.toUpperCase()}-RE${invoiceType === "6a" ? "A" : "B"}-${datum.replace(/-/g,"")}`;
  const bezeichnung = invoiceType === "6a"
    ? `Vermittlungsprovision – ${deal.name}`
    : `Fertigstellungsprovision – ${deal.name}`;
  const kunde = deal.buyer || deal.accountName || "Unbekannt";

  // Lexware Buchhalter CSV-Format (DATEV-kompatibel)
  const headers = [
    "Rechnungsnummer","Datum","Kunde","Bezeichnung",
    "Nettobetrag","MwSt %","MwSt Betrag","Bruttobetrag",
    "Konto","Gegenkonto","Kostenstelle","Zahlungsziel"
  ];
  const row = [
    rechnungsNr, datum, kunde, bezeichnung,
    netto.toFixed(2).replace(".",","),
    "19", mwst.toFixed(2).replace(".",","),
    amount.toFixed(2).replace(".",","),
    "8400", "1400", "GRENFORD", "14"
  ];

  const csvContent = [
    headers.join(";"),
    row.map(v => `"${v}"`).join(";")
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Lexware_${rechnungsNr}.csv`;
  a.click();

  return rechnungsNr;
}

// ─── GU INVOICE TRACKER (mit Lexware Export) ──────────────────────────────────
function GUInvoice({deal,onChange}){
  const vol=deal.guVolumen||0;
  const totalProv=Math.round(vol*(deal.commission||7)/100);
  const half=Math.round(totalProv/2);
  const invA=deal.invoiceA||{amount:half,sent:false,paid:false,date:""};
  const invB=deal.invoiceB||{amount:half,sent:false,paid:false,date:""};
  const upA=v=>onChange({...deal,invoiceA:{...invA,...v}});
  const upB=v=>onChange({...deal,invoiceB:{...invB,...v}});
  const paid=(invA.paid?(invA.amount||0):0)+(invB.paid?(invB.amount||0):0);
  const[lexMsg,setLexMsg]=useState("");

  const handleLexware=(type)=>{
    const nr=exportLexwareCSV(deal,type);
    setLexMsg(`✅ ${nr}.csv heruntergeladen – in Lexware unter Datei → Import → CSV importieren`);
    setTimeout(()=>setLexMsg(""),6000);
  };

  function InvCard({label,desc,inv,onUp,color,bg,icon,invoiceType}){
    return <div style={{background:bg,border:`1px solid ${color}44`,borderRadius:T.radius,padding:16,flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{fontSize:18}}>{icon}</span><div><div style={{fontSize:13,fontWeight:700,color,fontFamily:ff}}>{label}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{desc}</div></div></div><div style={{display:"flex",flexDirection:"column",gap:9}}><SFInput label="Betrag €" value={inv.amount||""} onChange={v=>onUp({amount:Number(v)})} type="number" full/><SFInput label="Datum" value={inv.date||""} onChange={v=>onUp({date:v})} type="date" full/><div style={{display:"flex",gap:8}}><button onClick={()=>onUp({sent:!inv.sent})} style={{flex:1,padding:"7px",borderRadius:T.radius,border:`1px solid ${inv.sent?T.success:T.border}`,background:inv.sent?T.successBg:"#fff",color:inv.sent?T.success:T.textMuted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{inv.sent?"✓ Versendet":"Versendet?"}</button><button onClick={()=>onUp({paid:!inv.paid})} style={{flex:1,padding:"7px",borderRadius:T.radius,border:`1px solid ${inv.paid?color:T.border}`,background:inv.paid?bg:"#fff",color:inv.paid?color:T.textMuted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{inv.paid?"✓ Bezahlt":"Bezahlt?"}</button></div>
    {/* LEXWARE EXPORT BUTTON */}
    <button onClick={()=>handleLexware(invoiceType)} style={{width:"100%",padding:"7px 10px",borderRadius:T.radius,border:"1px solid #0066CC",background:"#E8F0FF",color:"#0066CC",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>📊 Lexware CSV exportieren</button>
    {inv.paid&&<div style={{fontSize:11,color:T.success,fontFamily:ff,textAlign:"center",fontWeight:700}}>✅ {fmt(inv.amount||0)} eingegangen</div>}</div></div>;
  }

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{background:T.bgHeader,borderRadius:T.radius,border:`1px solid ${T.border}`,padding:"12px 16px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>{[["GU-Volumen",fmt(vol),T.brandPrimary],[`Prov. ${deal.commission||7}%`,fmt(totalProv),T.purple],["RE 6a",fmt(invA.amount||half),invA.paid?T.success:T.warning],["RE 6b",fmt(invB.amount||half),invB.paid?T.success:T.warning]].map(([l,v,c])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:10,color:T.textMuted,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{l}</div><div style={{fontSize:15,fontWeight:900,color:c,fontFamily:ff}}>{v}</div></div>)}</div>
      <div style={{height:6,background:T.border,borderRadius:3}}><div style={{width:`${totalProv>0?Math.round(paid/totalProv*100):0}%`,height:"100%",background:T.success,borderRadius:3,transition:"width .4s"}}/></div>
      <div style={{fontSize:11,color:T.textMuted,fontFamily:ff,marginTop:4}}>Bezahlt: {fmt(paid)} von {fmt(totalProv)}</div>
    </div>
    {lexMsg&&<div style={{background:"#E8F0FF",border:"1px solid #0066CC44",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#0066CC",fontFamily:ff,fontWeight:600}}>{lexMsg}</div>}
    <div style={{background:"#F0F7FF",border:"1px solid #0066CC22",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#475569",fontFamily:ff}}>
      <strong style={{color:"#0066CC"}}>📊 Lexware-Integration:</strong> Der CSV-Export erzeugt eine DATEV-kompatible Datei. In Lexware: <em>Datei → Datenimport → Buchungen importieren → CSV</em>. Konto 8400 (Provisionserlöse), Gegenkonto 1400 (Forderungen). Bitte Kontonummern mit deinem Steuerberater abstimmen.
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <InvCard label="RE 6a – Vermittlungsprovision" desc="Fällig nach Unterschrift" inv={invA} onUp={upA} color={T.teal} bg={T.tealBg} icon="📄" invoiceType="6a"/>
      <InvCard label="RE 6b – Fertigstellungsprovision" desc="Fällig nach Abnahme" inv={invB} onUp={upB} color="#1A7F3C" bg="#D6F0DE" icon="🏗️" invoiceType="6b"/>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🆕 NEU: HUBSPOT / CSV IMPORT MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function CSVImportModal({onClose,onImport,companies}){
  const[step,setStep]=useState(1); // 1=upload, 2=mapping, 3=preview, 4=done
  const[headers,setHeaders]=useState([]);
  const[rows,setRows]=useState([]);
  const[mapping,setMapping]=useState({});
  const[imported,setImported]=useState(0);

  const GRENFORD_FIELDS=[
    {key:"firstName",label:"Vorname",required:true},
    {key:"lastName",label:"Nachname",required:false},
    {key:"email",label:"E-Mail",required:false},
    {key:"phone",label:"Telefon",required:false},
    {key:"mobile",label:"Mobil",required:false},
    {key:"title",label:"Titel / Position",required:false},
    {key:"role",label:"Rolle",required:false},
    {key:"notes",label:"Notizen",required:false},
    {key:"_skip",label:"— Ignorieren —",required:false},
  ];

  // HubSpot auto-mapping hints
  const HUBSPOT_MAP={
    "First Name":"firstName","Vorname":"firstName",
    "Last Name":"lastName","Nachname":"lastName",
    "Email":"email","E-Mail Address":"email","Email Address":"email",
    "Phone Number":"phone","Phone":"phone","Telefon":"phone",
    "Mobile Phone Number":"mobile","Mobile":"mobile","Mobil":"mobile",
    "Job Title":"title","Jobtitel":"title","Position":"title",
    "Notes":"notes","Notizen":"notes",
    "Contact Owner":"_skip","Record ID":"_skip","HubSpot Owner ID":"_skip",
    "Create Date":"_skip","Last Modified Date":"_skip",
  };

  const handleFile=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const text=ev.target.result;
      const lines=text.split(/\r?\n/).filter(l=>l.trim());
      if(lines.length<2){alert("CSV hat keine Datenzeilen.");return;}
      // detect separator: ; or ,
      const sep=lines[0].includes(";")?";":",";
      const hdrs=lines[0].split(sep).map(h=>h.replace(/^"|"$/g,"").trim());
      const dataRows=lines.slice(1).map(l=>{
        const vals=[];let cur="",inQ=false;
        for(let i=0;i<l.length;i++){
          if(l[i]==='"')inQ=!inQ;
          else if(l[i]===sep&&!inQ){vals.push(cur.trim());cur="";}
          else cur+=l[i];
        }
        vals.push(cur.trim());
        return Object.fromEntries(hdrs.map((h,i)=>[h,vals[i]||""]));
      });
      setHeaders(hdrs);
      setRows(dataRows.slice(0,200)); // max 200
      // auto-map
      const autoMap={};
      hdrs.forEach(h=>{if(HUBSPOT_MAP[h])autoMap[h]=HUBSPOT_MAP[h];else autoMap[h]="_skip";});
      setMapping(autoMap);
      setStep(2);
    };
    reader.readAsText(file,"UTF-8");
  };

  const doImport=()=>{
    const contacts=rows.map(row=>{
      const c={id:uid(),type:"buyer",role:"Kontakt",dsgvo:{rechtsgrundlage:"berechtigtes_interesse",einwilligung_datum:today(),zweck:"Immobilienvermittlung",loeschfrist:"",herkunft:"HubSpot Import",notizen:`Importiert ${today()}`}};
      Object.entries(mapping).forEach(([csvCol,gField])=>{if(gField&&gField!=="")c[gField]=(c[gField]||"")+(row[csvCol]||"");});
      if(!c.firstName)c.firstName="Unbekannt";
      return c;
    }).filter(c=>c.firstName!=="Unbekannt"||c.email);
    onImport(contacts);
    setImported(contacts.length);
    setStep(4);
  };

  return <Modal title="📥 Kontakte importieren (HubSpot / CSV)" icon="📥" onClose={onClose} size={700}
    footer={step===2?<><SFBtn variant="neutral" onClick={()=>setStep(1)}>← Zurück</SFBtn><SFBtn onClick={()=>setStep(3)} icon="👁️">Vorschau</SFBtn></>:step===3?<><SFBtn variant="neutral" onClick={()=>setStep(2)}>← Mapping</SFBtn><SFBtn onClick={doImport} icon="✅" variant="success">{rows.length} Kontakte importieren</SFBtn></>:null}>
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

    {step===1&&<div>
      <div style={{background:T.infoBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px 18px",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:T.brandPrimary,marginBottom:8}}>📤 HubSpot Export – so geht's:</div>
        <ol style={{fontSize:12,color:T.text,lineHeight:1.9,margin:0,paddingLeft:18}}>
          <li>HubSpot öffnen → <strong>Kontakte</strong></li>
          <li>Oben rechts: <strong>Exportieren</strong> (oder Aktionen → Exportieren)</li>
          <li>Format: <strong>CSV</strong> wählen</li>
          <li>Du bekommst eine E-Mail mit Download-Link</li>
          <li>Die CSV-Datei hier hochladen</li>
        </ol>
      </div>
      <div style={{border:`2px dashed ${T.border}`,borderRadius:10,padding:"40px",textAlign:"center",background:T.bgApp,cursor:"pointer"}} onClick={()=>document.getElementById("csv-upload").click()}>
        <input id="csv-upload" type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleFile}/>
        <div style={{fontSize:32,marginBottom:10}}>📁</div>
        <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:ff}}>CSV-Datei ablegen oder klicken</div>
        <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>HubSpot, Outlook, Excel CSV · UTF-8 oder ANSI</div>
      </div>
    </div>}

    {step===2&&<div>
      <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>{headers.length} Spalten erkannt · {rows.length} Kontakte · Spalten zuordnen:</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 20px 1fr",gap:"8px 12px",alignItems:"center",maxHeight:340,overflowY:"auto"}}>
        {headers.map(h=>[
          <div key={h+"l"} style={{background:T.bgApp,borderRadius:6,padding:"6px 10px",fontSize:12,fontFamily:"monospace",color:T.text,border:`1px solid ${T.border}`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h}<div style={{fontSize:10,color:T.textMuted,marginTop:2,fontFamily:ff}}>{rows[0]?.[h]||"—"}</div></div>,
          <div key={h+"a"} style={{textAlign:"center",color:T.textMuted}}>→</div>,
          <select key={h+"r"} value={mapping[h]||"_skip"} onChange={e=>setMapping(p=>({...p,[h]:e.target.value}))} style={{border:`1px solid ${mapping[h]&&mapping[h]!=="skip"?T.brandPrimary:T.border}`,borderRadius:6,padding:"6px 10px",fontSize:12,fontFamily:ff,outline:"none",background:mapping[h]&&mapping[h]!=="skip"?T.brandLighter:"#fff"}}>
            {GRENFORD_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}{f.required?" *":""}</option>)}
          </select>
        ])}
      </div>
    </div>}

    {step===3&&<div>
      <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Vorschau – erste {Math.min(rows.length,5)} von {rows.length} Kontakten:</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {rows.slice(0,5).map((row,i)=>{
          const firstName=row[Object.keys(mapping).find(k=>mapping[k]==="firstName")]||"—";
          const lastName=row[Object.keys(mapping).find(k=>mapping[k]==="lastName")]||"";
          const email=row[Object.keys(mapping).find(k=>mapping[k]==="email")]||"—";
          const phone=row[Object.keys(mapping).find(k=>mapping[k]==="phone")]||row[Object.keys(mapping).find(k=>mapping[k]==="mobile")]||"—";
          return <div key={i} style={{background:T.bgApp,borderRadius:8,padding:"10px 14px",border:`1px solid ${T.border}`,display:"flex",gap:12,alignItems:"center"}}>
            <Avatar name={`${firstName} ${lastName}`} size={32}/>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{firstName} {lastName}</div><div style={{fontSize:11,color:T.textMuted}}>{email} · {phone}</div></div>
            <Badge color={T.success}>✓ bereit</Badge>
          </div>;
        })}
        {rows.length>5&&<div style={{fontSize:12,color:T.textMuted,textAlign:"center",fontFamily:ff}}>... und {rows.length-5} weitere</div>}
      </div>
    </div>}

    {step===4&&<div style={{textAlign:"center",padding:"32px 16px"}}>
      <div style={{fontSize:48,marginBottom:16}}>✅</div>
      <div style={{fontSize:18,fontWeight:700,color:T.success,fontFamily:ff,marginBottom:8}}>{imported} Kontakte importiert!</div>
      <div style={{fontSize:13,color:T.textMuted,fontFamily:ff,marginBottom:16}}>Alle Kontakte wurden mit DSGVO-Rechtsgrundlage "Berechtigtes Interesse" angelegt. Bitte prüfe und ergänze die DSGVO-Daten je Kontakt.</div>
      <SFBtn onClick={onClose} icon="✓">Fertig</SFBtn>
    </div>}

    </div>
  </Modal>;
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
function exportDealPDF(deal){
  const prov=isGU(deal.type)?Math.round((deal.guVolumen||0)*(deal.commission||7)/100):((deal.agreedPrice||deal.askPrice||0)*(deal.commission||0)/100);
  const money=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
  const html=`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#1C2D4F;padding:40px;font-size:13px}.header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:2.5px solid #1C2D4F}.logo{font-size:26px;font-weight:700;letter-spacing:0.14em}h1{font-size:22px;margin-bottom:8px}.badge{display:inline-block;padding:3px 14px;border-radius:99px;font-size:11px;font-weight:700;background:#1C2D4F;color:#fff;margin-bottom:20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}.field{background:#F5F6F9;border-radius:6px;padding:12px 14px}.fl{font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:#6B7280;margin-bottom:4px}.fv{font-size:15px;font-weight:700;color:#1C2D4F;font-family:monospace}.hl{background:#1C2D4F;color:#fff;border-radius:8px;padding:18px;margin:20px 0;text-align:center}.hl-v{font-size:30px;font-weight:700;font-family:monospace}.footer{margin-top:36px;padding-top:14px;border-top:1px solid #DDE1EA;font-size:10px;color:#9CA3AF;text-align:center}@media print{body{padding:20px}}</style></head><body>
  <div class="header"><div><div class="logo">GRENFORD</div><div style="font-size:10px;color:#6B7280;letter-spacing:0.1em">OFF-MARKET CRM · DEAL SUMMARY</div></div><div style="text-align:right;font-size:12px;color:#6B7280"><div style="font-weight:700;font-size:14px;margin-bottom:3px">Deal Summary</div>${new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"})}</div></div>
  <h1>${deal.name}</h1><span class="badge">${deal.type.replace(/_/g," ").toUpperCase()} · ${deal.stage.toUpperCase()}</span>
  <div class="grid">
  ${isGU(deal.type)?`<div class="field"><div class="fl">GU-Auftragsvolumen</div><div class="fv">${money(deal.guVolumen)}</div></div><div class="field"><div class="fl">Provision ${deal.commission||7}%</div><div class="fv">${money(prov)}</div></div><div class="field"><div class="fl">GU-Partner</div><div class="fv">${deal.guPartnerName||"—"}</div></div>`:`<div class="field"><div class="fl">Kaufpreis</div><div class="fv">${money(deal.askPrice)}</div></div><div class="field"><div class="fl">Einigungspreis</div><div class="fv">${deal.agreedPrice?money(deal.agreedPrice):"Offen"}</div></div><div class="field"><div class="fl">Provision ${deal.commission||0}%</div><div class="fv">${money(prov)}</div></div>`}
  <div class="field"><div class="fl">Adresse</div><div class="fv">${deal.address||"—"}</div></div>
  <div class="field"><div class="fl">Käufer / Kunde</div><div class="fv">${deal.buyer||deal.accountName||"—"}</div></div>
  <div class="field"><div class="fl">Wahrscheinlichkeit</div><div class="fv">${deal.probability||0}%</div></div>
  </div>
  <div class="hl"><div style="font-size:10px;opacity:.6;margin-bottom:4px">ERWARTETE PROVISION (GEWICHTET)</div><div class="hl-v">${money(Math.round(prov*(deal.probability||100)/100))}</div></div>
  ${deal.description?`<div style="margin-top:20px;padding-top:14px;border-top:1px solid #DDE1EA"><p style="line-height:1.7;color:#475569">${deal.description}</p></div>`:""}
  <div class="footer">Grenford Off-Market CRM · Vertraulich · ${new Date().toLocaleDateString("de-DE")} · Powered by Anthropic Claude</div>
  </body></html>`;
  const w=window.open("","_blank");w.document.write(html);w.document.close();setTimeout(()=>w.print(),600);
}

// ─── DOC UPLOAD ───────────────────────────────────────────────────────────────
function DocUpload({deal,onUpdate}){
  const[drag,setDrag]=useState(false);
  const docs=deal.docs||[];
  const fmtSz=b=>b>1e6?`${(b/1e6).toFixed(1)}MB`:b>1024?`${(b/1024).toFixed(0)}KB`:`${b}B`;
  const FICONS={"application/pdf":"📄","image/png":"🖼️","image/jpeg":"🖼️","image/jpg":"🖼️","application/msword":"📝","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"📝"};
  const addFiles=files=>Array.from(files).forEach(file=>{
    if(file.size>5*1024*1024){alert(`${file.name} ist zu groß (max 5MB)`);return;}
    const r=new FileReader();r.onload=e=>{const doc={id:uid(),name:file.name,type:file.type,size:file.size,data:e.target.result,date:today(),stage:deal.stage,by:"Ich"};onUpdate({...deal,docs:[...(deal.docs||[]),doc]});};r.readAsDataURL(file);
  });
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files);}} style={{border:`2px dashed ${drag?T.brandPrimary:T.border}`,borderRadius:10,padding:"30px",textAlign:"center",background:drag?T.brandLighter:T.bgApp,cursor:"pointer"}} onClick={()=>document.getElementById(`fu-${deal.id}`)?.click()}>
      <input id={`fu-${deal.id}`} type="file" multiple style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
      <div style={{fontSize:30,marginBottom:8}}>📁</div>
      <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:ff}}>Dateien ablegen oder klicken</div>
      <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>PDF, Word, Excel, Bilder · max. 5MB</div>
    </div>
    {docs.length>0&&<div style={{background:"#fff",borderRadius:10,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{background:T.bgHeader,padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>📎 Anhänge ({docs.length})</div>
      {docs.map((doc,i)=><div key={doc.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:i<docs.length-1?`1px solid ${T.border}`:"none"}}><span style={{fontSize:22,flexShrink:0}}>{FICONS[doc.type]||"📎"}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:ff,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{fmtSz(doc.size)} · {doc.date}</div></div><div style={{display:"flex",gap:6}}><button onClick={()=>{const a=document.createElement("a");a.href=doc.data;a.download=doc.name;a.click();}} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${T.border}`,background:"#fff",color:T.text,fontSize:12,cursor:"pointer",fontFamily:ff}}>⬇</button><button onClick={()=>onUpdate({...deal,docs:docs.filter(d=>d.id!==doc.id)})} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${T.error}44`,background:T.errorBg,color:T.error,fontSize:12,cursor:"pointer",fontFamily:ff}}>🗑</button></div></div>)}
    </div>}
  </div>;
}

// ─── EMAIL COMPOSER ───────────────────────────────────────────────────────────
const EMAIL_TEMPLATES={
  teaser:{subject:"Exposé: {{deal}}",body:"Sehr geehrte Damen und Herren,\n\nanbei übersende ich Ihnen das Exposé zu {{deal}}.\n\nMit freundlichen Grüßen\nIhr Grenford Team"},
  nda:{subject:"NDA-Anfrage: {{deal}}",body:"Sehr geehrte Damen und Herren,\n\nim Rahmen unserer Zusammenarbeit bitten wir Sie, beiliegendes NDA für {{deal}} zu unterzeichnen.\n\nMit freundlichen Grüßen\nIhr Grenford Team"},
  loi:{subject:"LOI-Eingang: {{deal}}",body:"Sehr geehrte Damen und Herren,\n\nvielen Dank für die Übermittlung Ihres Letter of Intent zu {{deal}}.\n\nMit freundlichen Grüßen\nIhr Grenford Team"},
  gu_angebot:{subject:"GU-Angebot: {{deal}}",body:"Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie unser unverbindliches Angebot für {{deal}}.\n\nMit freundlichen Grüßen\nIhr Grenford Team"},
  followup:{subject:"Nachfassung: {{deal}}",body:"Sehr geehrte Damen und Herren,\n\nich wollte kurz nachfassen bezüglich {{deal}}.\n\nMit freundlichen Grüßen\nIhr Grenford Team"},
  inv_family_office:{subject:"Off-Market Opportunity – {{deal}}",body:"Dear [Name],\n\nI hope you are well.\n\nWe are currently offering an off-market investment opportunity – {{deal}} – which we believe could be of interest given your investment profile.\n\nThe asset offers a balanced risk-return profile through:\n• stable in-place income\n• defined value-add / redevelopment potential\n• selective off-market process\n\nWe are sharing this with a small number of investors only.\n\nPlease let me know if you would be interested in receiving further details under NDA.\n\nBest regards\n[Dein Name] | Grenford"},
  inv_developer:{subject:"Off-Market Development – {{deal}}",body:"Hi [Name],\n\nWe are currently marketing an off-market development opportunity – {{deal}}.\n\nKey facts:\n• Defined development potential\n• Existing income during transition\n• Residential / mixed-use focus\n\nGiven your focus on development projects, I thought this could be relevant for you.\n\nHappy to share further details and discuss.\n\nBest\n[Dein Name] | Grenford"},
  inv_value_add:{subject:"Value-Add Investment – {{deal}}",body:"Dear [Name],\n\nWe are currently offering a value-add investment opportunity in Germany – {{deal}}.\n\nThe asset combines:\n• secured NOI with upside potential\n• clear repositioning strategy\n• attractive entry pricing\n\nWe are currently in discussions with selected investors and would be happy to include you in the process.\n\nKind regards\n[Dein Name] | Grenford"},
  inv_micro:{subject:"Micro Living / Student Housing – {{deal}}",body:"Hi [Name],\n\nWe are currently marketing an off-market residential opportunity with strong micro-living fundamentals – {{deal}}.\n\nHighlights:\n• Strong student / young professional demand\n• High absorption rates for 1–2 room units\n• Potential for furnished concept (premium rents)\n\nHappy to share more details.\n\nBest regards\n[Dein Name] | Grenford"},
  custom:{subject:"",body:""},
};
function EmailComposer({deal,contacts,onClose,onSent}){
  const relContacts=contacts.filter(c=>c.companyId===deal?.companyId);
  const[to,setTo]=useState(relContacts[0]?.email||"");
  const[sub,setSub]=useState(deal?`Grenford – ${deal.name}`:"");
  const[body,setBody]=useState("");
  const[tpl,setTpl]=useState("custom");
  const[sent,setSent]=useState(false);
  const applyTpl=k=>{setTpl(k);const t=EMAIL_TEMPLATES[k];const n=deal?.name||"";setSub(t.subject.replace("{{deal}}",n));setBody(t.body.replace(/{{deal}}/g,n));};
  const send=()=>{window.open(`mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`);if(onSent)onSent({to,subject:sub,body,date:today(),type:"email"});setSent(true);setTimeout(onClose,1400);};
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{background:"#fff",borderRadius:12,width:680,maxWidth:"96vw",maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}><div style={{background:T.brandMid,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:ff}}>✉️ E-Mail{deal?` · ${deal.name}`:""}</span><button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.8)",cursor:"pointer",fontSize:22}}>×</button></div>
  {sent?<div style={{padding:48,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>✅</div><div style={{fontSize:16,fontWeight:700,color:T.success,fontFamily:ff}}>E-Mail-Client geöffnet</div></div>:<>
    <div style={{flex:1,overflow:"auto",padding:20,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[["teaser","Teaser"],["nda","NDA"],["loi","LOI"],["gu_angebot","GU-Angebot"],["followup","Nachfassung"],["inv_family_office","🏦 Family Office"],["inv_developer","🏗️ Developer"],["inv_value_add","📈 Value Add"],["inv_micro","🏠 Micro Living"],["custom","Individuell"]].map(([k,l])=><button key={k} onClick={()=>applyTpl(k)} style={{padding:"4px 12px",borderRadius:6,border:`1px solid ${tpl===k?T.brandPrimary:T.border}`,background:tpl===k?T.brandLighter:"#fff",color:tpl===k?T.brandPrimary:T.textMuted,fontSize:12,fontWeight:tpl===k?700:400,cursor:"pointer",fontFamily:ff}}>{l}</button>)}</div>
      <SFInput label="An" value={to} onChange={setTo} placeholder="empfaenger@email.de" full/>
      <SFInput label="Betreff" value={sub} onChange={setSub} full/>
      <SFTA label="Nachricht" value={body} onChange={setBody} rows={9}/>
    </div>
    <div style={{padding:"12px 20px",borderTop:`1px solid ${T.border}`,background:T.bgApp,display:"flex",gap:8,justifyContent:"flex-end"}}><SFBtn variant="neutral" onClick={onClose}>Abbrechen</SFBtn><SFBtn disabled={!to||!sub} onClick={send} icon="✉️">Senden</SFBtn></div>
  </>}
  </div></div>;
}

// ─── DEAL RECORD ──────────────────────────────────────────────────────────────

// ─── INVESTOR LEVELS ─────────────────────────────────────────────────────────
const INVESTOR_LEVELS=[
  {key:"A",label:"A-Level",color:"#2E844A",bg:"#EEF8F0",icon:"🔥",desc:"Top-Käufer – sofort kontaktieren (max. 15–20)"},
  {key:"B",label:"B-Level",color:"#DD7A01",bg:"#FEF8E8",icon:"⭐",desc:"Gute Käufer – aktiv im Prozess"},
  {key:"C",label:"C-Level",color:"#706E6B",bg:"#F3F2F2",icon:"📋",desc:"Backup – bei Bedarf einbinden"},
];

// ─── LOI SCORING WEIGHTS ──────────────────────────────────────────────────────
const LOI_CRITERIA=[
  {key:"preis",label:"Kaufpreis",weight:30,hint:"Höhe & Realismus des Angebots"},
  {key:"sicherheit",label:"Sicherheit (Equity)",weight:25,hint:"Eigenkapitalquote & Finanzierungsstruktur"},
  {key:"track_record",label:"Track Record",weight:15,hint:"Erfahrung & Referenzprojekte"},
  {key:"geschwindigkeit",label:"Geschwindigkeit",weight:15,hint:"Closing-Timeline & Entscheidungsstruktur"},
  {key:"struktur",label:"Struktur",weight:10,hint:"Komplexität, Bedingungen, Subject-to's"},
  {key:"chemie",label:"Chemie / Professionalität",weight:5,hint:"Qualität der Kommunikation"},
];

// ─── LOI SCORING MODAL COMPONENT ─────────────────────────────────────────────
function LOIModal({buyerId,buyers,onClose,onSave}){
  const b=buyers.find(x=>x.id===buyerId);
  const[sc,setSc]=useState((b&&b.loiScore)||{});
  if(!b)return null;
  const score=LOI_CRITERIA.reduce((s,c)=>{const v=Number(sc[c.key]||0);return s+v*(c.weight/100);},0);
  const rounded=Math.round(score);
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:"#fff",borderRadius:12,width:580,maxWidth:"96vw",overflow:"hidden",boxShadow:T.shadowLg,maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:T.brandMid,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div><div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:ff}}>⚖️ LOI Bewertung</div><div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{b.companyName||b.contactName}</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:22}}>×</button>
      </div>
      <div style={{flex:1,overflow:"auto",padding:20}}>
        <div style={{background:T.infoBg,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:T.text,fontFamily:ff,lineHeight:1.6}}>
          <strong>Profi-Regel:</strong> Lieber -2% Preis + sichere Execution als +2% Preis + Risiko. Gewinner ist NICHT immer der Höchstpreis.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {LOI_CRITERIA.map(c=>{
            const val=Number(sc[c.key]||0);
            const pct=val;
            return <div key={c.key} style={{background:T.bgApp,borderRadius:8,padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{c.label} <span style={{fontSize:11,color:T.textMuted,fontWeight:400}}>({c.weight}% Gewicht)</span></div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff,marginTop:1}}>{c.hint}</div></div>
                <div style={{fontSize:22,fontWeight:900,color:val>=80?T.success:val>=50?T.warning:val>0?T.error:T.textLight,fontFamily:ff,minWidth:40,textAlign:"right"}}>{val||"—"}</div>
              </div>
              <div style={{display:"flex",gap:4}}>
                {[0,20,40,60,80,100].map(v=><button key={v} onClick={()=>setSc(p=>({...p,[c.key]:v}))} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid "+(val===v?T.brandPrimary:T.border),background:val===v?T.brandPrimary:"#fff",color:val===v?"#fff":T.textMuted,fontSize:12,fontWeight:val===v?700:400,cursor:"pointer",fontFamily:ff,transition:"all .15s"}}>{v||"0"}</button>)}
              </div>
            </div>;
          })}
        </div>
        <div style={{marginTop:16,borderRadius:10,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",background:rounded>=80?T.successBg:rounded>=60?T.warningBg:rounded>0?T.errorBg:T.bgApp,border:"1px solid "+(rounded>=80?T.success:rounded>=60?T.warning:rounded>0?T.error:T.border)+"44"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>Gesamt-Score</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff,marginTop:2}}>Gewichteter Durchschnitt · Gewinner ≠ immer Höchstpreis</div></div>
          <div style={{fontSize:42,fontWeight:900,color:rounded>=80?T.success:rounded>=60?T.warning:rounded>0?T.error:T.textMuted,fontFamily:ff}}>{rounded>0?rounded:"–"}<span style={{fontSize:14,fontWeight:400,color:T.textMuted}}>/100</span></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
          <div style={{background:T.successBg,border:"1px solid "+T.success+"33",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:11,fontWeight:700,color:T.success,marginBottom:6,fontFamily:ff}}>🟢 Gute LOI-Signale</div><div style={{fontSize:11,color:T.text,fontFamily:ff,lineHeight:1.9}}>✓ Klare Preisangabe<br/>✓ Wenig Bedingungen<br/>✓ Schnelles Closing<br/>✓ Starkes Eigenkapital</div></div>
          <div style={{background:T.errorBg,border:"1px solid "+T.error+"33",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:11,fontWeight:700,color:T.error,marginBottom:6,fontFamily:ff}}>🔴 Warnsignale</div><div style={{fontSize:11,color:T.text,fontFamily:ff,lineHeight:1.9}}>✗ Viele "subject to…"<br/>✗ Finanzierung unklar<br/>✗ Lange DD-Dauer<br/>✗ Unrealistische Annahmen</div></div>
        </div>
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid "+T.border,background:T.bgApp,display:"flex",gap:8,justifyContent:"flex-end",flexShrink:0}}>
        <SFBtn variant="neutral" onClick={onClose}>Abbrechen</SFBtn>
        <SFBtn variant="success" icon="💾" onClick={()=>onSave(buyerId,sc)}>Score speichern</SFBtn>
      </div>
    </div>
  </div>;
}

// ─── BUYER STATUS STAGES ─────────────────────────────────────────────────────
const BUYER_STATUS=[
  {key:"angeschrieben",label:"Angeschrieben",color:"#706E6B",bg:"#F3F2F2",icon:"📬"},
  {key:"rueckmeldung",label:"Rückmeldung erhalten",color:"#1C2D4F",bg:"#EAF4FF",icon:"📩"},
  {key:"nda",label:"NDA unterzeichnet",color:"#DD7A01",bg:"#FEF8E8",icon:"🔏"},
  {key:"teaser",label:"Teaser / DR 1",color:"#7526E3",bg:"#F3EFF8",icon:"📄"},
  {key:"loi",label:"LOI eingegangen",color:"#016558",bg:"#EEF6F4",icon:"✍️"},
  {key:"dr2",label:"DR 2 freigegeben",color:"#032D60",bg:"#EAF4FF",icon:"🗂️"},
  {key:"dd",label:"DD-Prüfung läuft",color:"#7526E3",bg:"#F3EFF8",icon:"🔍"},
  {key:"angebot",label:"Angebot eingegangen",color:"#2E844A",bg:"#EEF8F0",icon:"💶"},
  {key:"verhandlung",label:"Preisverhandlung",color:"#BA0517",bg:"#FEF0F0",icon:"🤝"},
  {key:"abgesagt",label:"Abgesagt",color:"#9CA3AF",bg:"#F3F4F6",icon:"❌"},
  {key:"gewonnen",label:"Gewonnen ✓",color:"#2E844A",bg:"#EEF8F0",icon:"🏆"},
];

// ─── BUYER LIST COMPONENT ─────────────────────────────────────────────────────
function BuyerList({deal,onChange,contacts,companies}){
  const buyers=deal.buyerList||[];
  const[showAdd,setShowAdd]=useState(false);
  const[search,setSearch]=useState("");
  const[editId,setEditId]=useState(null);
  const[editForm,setEditForm]=useState({});
  const[statusFilter,setStatusFilter]=useState("all");
  const[levelFilter,setLevelFilter]=useState("all");
  const[loiModal,setLoiModal]=useState(null); // buyer id being scored

  const addBuyer=(company,contact)=>{
    const entry={id:uid(),companyId:company?.id||"",companyName:company?.name||"",companyType:company?.type||"",contactId:contact?.id||"",contactName:contact?contact.firstName+" "+contact.lastName:"",contactPhone:contact?.mobile||contact?.phone||"",contactEmail:contact?.email||"",status:"angeschrieben",level:"B",loiScore:{},notes:"",addedAt:today(),updatedAt:today(),log:[]};
    onChange({...deal,buyerList:[...buyers,entry]});
    setSearch("");setShowAdd(false);
  };

  const updateBuyer=(id,patch)=>onChange({...deal,buyerList:buyers.map(b=>b.id===id?{...b,...patch,updatedAt:today()}:b)});
  const removeBuyer=id=>onChange({...deal,buyerList:buyers.filter(b=>b.id!==id)});

  const searchResults=search.length>1?companies.filter(c=>[c.name,c.city].some(v=>(v||"").toLowerCase().includes(search.toLowerCase()))&&!buyers.find(b=>b.companyId===c.id)).slice(0,8):[];
  const contactResults=search.length>1?contacts.filter(c=>[c.firstName+" "+c.lastName,c.email].some(v=>(v||"").toLowerCase().includes(search.toLowerCase()))&&!buyers.find(b=>b.contactId===c.id)).slice(0,4):[];
  const filtered=buyers.filter(b=>(statusFilter==="all"||b.status===statusFilter)&&(levelFilter==="all"||b.level===levelFilter));
  const getSt=id=>BUYER_STATUS.find(s=>s.key===id)||BUYER_STATUS[0];
  const activeCount=buyers.filter(b=>!["abgesagt","gewonnen"].includes(b.status)).length;
  const stats=BUYER_STATUS.map(s=>({...s,count:buyers.filter(b=>b.status===s.key).length})).filter(s=>s.count>0);
  const calcLoiScore=b=>{if(!b.loiScore||!Object.keys(b.loiScore).length)return null;const total=LOI_CRITERIA.reduce((s,c)=>{const v=Number(b.loiScore[c.key]||0);return s+v*(c.weight/100);},(0));return Math.round(total);};
  const getLevel=id=>INVESTOR_LEVELS.find(l=>l.key===id)||INVESTOR_LEVELS[1];

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    {/* Stats Bar */}
    <div style={{background:"#fff",borderRadius:T.radius,border:"1px solid "+T.border,padding:"12px 16px",boxShadow:T.shadowSm}}>
      <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:24}}>👥</span><div><div style={{fontSize:20,fontWeight:900,color:T.brandPrimary,fontFamily:ff}}>{buyers.length}</div><div style={{fontSize:10,color:T.textMuted,fontFamily:ff}}>Interessenten</div></div></div>
        <div style={{width:1,height:32,background:T.border}}/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:18}}>🔄</span><div><div style={{fontSize:16,fontWeight:700,color:T.teal,fontFamily:ff}}>{activeCount}</div><div style={{fontSize:10,color:T.textMuted}}>Im Prozess</div></div></div>
        <div style={{width:1,height:32,background:T.border}}/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:18}}>🏆</span><div><div style={{fontSize:16,fontWeight:700,color:T.success,fontFamily:ff}}>{buyers.filter(b=>b.status==="gewonnen").length}</div><div style={{fontSize:10,color:T.textMuted}}>Gewonnen</div></div></div>
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:3}}>
            {INVESTOR_LEVELS.map(lv=>{const cnt=buyers.filter(b=>b.level===lv.key).length;return <div key={lv.key} onClick={()=>setLevelFilter(levelFilter===lv.key?"all":lv.key)} title={lv.desc} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,background:levelFilter===lv.key?lv.color:lv.bg,border:"1px solid "+lv.color+"44",cursor:"pointer",fontFamily:ff}}><span style={{fontSize:11}}>{lv.icon}</span><span style={{fontSize:11,fontWeight:700,color:levelFilter===lv.key?"#fff":lv.color}}>{lv.key}: {cnt}</span></div>;})}
          </div>
          <div style={{width:1,height:20,background:T.border}}/>
          <div style={{display:"flex",gap:3}}>
            {stats.map(s=><div key={s.key} onClick={()=>setStatusFilter(statusFilter===s.key?"all":s.key)} title={s.label} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,background:statusFilter===s.key?s.color:s.bg,border:"1px solid "+s.color+"44",cursor:"pointer"}}><span style={{fontSize:11}}>{s.icon}</span><span style={{fontSize:11,fontWeight:700,color:statusFilter===s.key?"#fff":s.color}}>{s.count}</span></div>)}
          </div>
        </div>
      </div>
    </div>

    {/* Search & Add */}
    <div style={{position:"relative",zIndex:100}}>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
        <input value={search} onChange={e=>{setSearch(e.target.value);setShowAdd(true);}} onFocus={()=>setShowAdd(true)} placeholder="Investor / Käufer suchen und hinzufügen (Name, Firma)…" style={{width:"100%",background:"#fff",border:"1px solid "+(showAdd&&search?T.brandPrimary:T.border),borderRadius:T.radius,padding:"9px 12px 9px 32px",fontSize:13,fontFamily:ff,outline:"none",boxSizing:"border-box"}}/>
      </div>
      {showAdd&&search.length>1&&(searchResults.length>0||contactResults.length>0)&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid "+T.border,borderRadius:T.radius,boxShadow:T.shadowLg,zIndex:9999,maxHeight:320,overflowY:"auto",marginTop:4}}>
        {searchResults.length>0&&<div>
          <div style={{padding:"6px 12px",fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",background:T.bgHeader,fontFamily:ff}}>Unternehmen aus deiner Kartei</div>
          {searchResults.map(co=>{const ct=COMPANY_TYPES.find(t=>t.key===co.type)||COMPANY_TYPES[0];const relContact=contacts.find(c=>c.companyId===co.id);return <div key={co.id} onClick={()=>addBuyer(co,relContact)} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid "+T.border}} onMouseEnter={e=>e.currentTarget.style.background=T.bgSelected} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><div style={{width:32,height:32,borderRadius:8,background:ct.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{ct.icon}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{co.name}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{ct.label}{co.city?" · "+co.city:""}{relContact?" · AP: "+relContact.firstName+" "+relContact.lastName:""}</div></div><span style={{fontSize:11,color:T.brandPrimary,fontWeight:600}}>+ hinzufügen</span></div>;})}
        </div>}
        {contactResults.length>0&&<div>
          <div style={{padding:"6px 12px",fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",background:T.bgHeader,fontFamily:ff}}>Einzelkontakte</div>
          {contactResults.map(c=><div key={c.id} onClick={()=>addBuyer(null,c)} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid "+T.border}} onMouseEnter={e=>e.currentTarget.style.background=T.bgSelected} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><Avatar name={c.firstName+" "+c.lastName} size={32}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{c.firstName} {c.lastName}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{c.role} · {c.email||"—"}</div></div><span style={{fontSize:11,color:T.brandPrimary,fontWeight:600}}>+ hinzufügen</span></div>)}
        </div>}
        <div style={{position:"fixed",inset:0,zIndex:-1}} onClick={()=>{setShowAdd(false);setSearch("");}}/>
      </div>}
    </div>

    {/* Table */}
    {filtered.length===0?<div style={{background:"#fff",borderRadius:T.radius,border:"1px solid "+T.border,padding:"40px",textAlign:"center",color:T.textMuted,fontFamily:ff}}><div style={{fontSize:32,marginBottom:10}}>👥</div><div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Noch keine Investoren in der Liste</div><div style={{fontSize:12}}>Suche oben nach Unternehmen oder Kontakten aus deiner Kartei</div></div>:
    <div style={{background:"#fff",borderRadius:T.radius,border:"1px solid "+T.border,boxShadow:T.shadowSm,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:T.bgHeader}}>{["Level","Investor / Käufer","Ansprechpartner","Status im Prozess","LOI Score","Notiz / letzter Kontakt","Seit",""].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:T.text,fontFamily:ff,borderBottom:"2px solid "+T.border,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map((b,i)=>{
            const s=getSt(b.status);
            const isEdit=editId===b.id;
            const ct=b.companyType?COMPANY_TYPES.find(t=>t.key===b.companyType)||COMPANY_TYPES[0]:null;
            const lastLog=b.log&&b.log.length?b.log[b.log.length-1]:null;
            const procStages=BUYER_STATUS.filter(x=>x.key!=="abgesagt"&&x.key!=="gewonnen");
            const curIdx=procStages.findIndex(x=>x.key===b.status);
            return <tr key={b.id} style={{borderBottom:"1px solid "+T.border,background:b.status==="abgesagt"?"#FAFAFA":b.status==="gewonnen"?T.successBg:i%2===0?"#fff":T.bgRow,verticalAlign:"top",opacity:b.status==="abgesagt"?0.6:1}}>
              {/* Level cell */}
              <td style={{padding:"11px 12px",textAlign:"center",minWidth:60}}>
                {isEdit?<select value={editForm.level||b.level||"B"} onChange={e=>setEditForm(p=>({...p,level:e.target.value}))} style={{border:"1px solid "+T.border,borderRadius:6,padding:"4px 6px",fontSize:12,fontFamily:ff,outline:"none",width:60}}>
                  {INVESTOR_LEVELS.map(lv=><option key={lv.key} value={lv.key}>{lv.icon} {lv.key}</option>)}
                </select>:<div onClick={()=>{setEditId(b.id);setEditForm({status:b.status,notes:b.notes||"",level:b.level||"B",contactName:b.contactName||"",contactPhone:b.contactPhone||""});}} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:"50%",background:getLevel(b.level||"B").bg,border:"2px solid "+getLevel(b.level||"B").color,cursor:"pointer",title:getLevel(b.level||"B").desc}}><span style={{fontSize:14,fontWeight:900,color:getLevel(b.level||"B").color}}>{getLevel(b.level||"B").icon}</span></div>}
              </td>
              <td style={{padding:"11px 12px",minWidth:160}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {ct&&<div style={{width:30,height:30,borderRadius:6,background:ct.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ct.icon}</div>}
                  <div><div style={{fontSize:13,fontWeight:700,color:T.textStrong,fontFamily:ff}}>{b.companyName||"—"}</div>{ct&&<div style={{fontSize:10,color:ct.color,fontWeight:600,fontFamily:ff}}>{ct.label}</div>}</div>
                </div>
              </td>
              <td style={{padding:"11px 12px",minWidth:150}}>
                {b.contactName?<div><div style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:ff}}>{b.contactName}</div>{b.contactPhone&&<div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>📞 {b.contactPhone}</div>}{b.contactEmail&&<div style={{fontSize:10,color:T.textMuted,fontFamily:ff,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>✉️ {b.contactEmail}</div>}</div>:<span style={{fontSize:12,color:T.textLight,fontFamily:ff}}>—</span>}
              </td>
              <td style={{padding:"11px 12px",minWidth:190}}>
                {isEdit?<select value={editForm.status||b.status} onChange={e=>setEditForm(p=>({...p,status:e.target.value}))} style={{border:"1px solid "+T.border,borderRadius:6,padding:"5px 8px",fontSize:12,fontFamily:ff,outline:"none",background:"#fff",width:"100%"}}>
                  {BUYER_STATUS.map(st=><option key={st.key} value={st.key}>{st.icon} {st.label}</option>)}
                </select>:
                <div>
                  <div onClick={()=>{setEditId(b.id);setEditForm({status:b.status,notes:b.notes||"",contactName:b.contactName||"",contactPhone:b.contactPhone||""});}} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,background:s.bg,border:"1px solid "+s.color+"55",cursor:"pointer"}}>
                    <span style={{fontSize:13}}>{s.icon}</span>
                    <span style={{fontSize:11,fontWeight:700,color:s.color,fontFamily:ff,whiteSpace:"nowrap"}}>{s.label}</span>
                  </div>
                  <div style={{display:"flex",gap:2,marginTop:6}}>
                    {procStages.map((x,xi)=><div key={x.key} title={x.label} style={{height:3,flex:1,borderRadius:2,background:xi<=curIdx&&curIdx>=0?s.color:T.border}}/>)}
                  </div>
                </div>}
              </td>
              {/* LOI Score cell */}
              <td style={{padding:"11px 12px",textAlign:"center",minWidth:90}}>
                {["loi","angebot","verhandlung"].includes(b.status)?
                  <div onClick={()=>setLoiModal(b.id)} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    {calcLoiScore(b)!==null?<>
                      <div style={{fontSize:18,fontWeight:900,color:calcLoiScore(b)>=80?T.success:calcLoiScore(b)>=60?T.warning:T.error,fontFamily:ff}}>{calcLoiScore(b)}</div>
                      <div style={{fontSize:9,color:T.textMuted,fontFamily:ff}}>von 100</div>
                    </>:<div style={{fontSize:10,color:T.brandPrimary,fontWeight:600,fontFamily:ff,textDecoration:"underline"}}>+ LOI<br/>Bewerten</div>}
                  </div>
                :<span style={{fontSize:11,color:T.textLight}}>—</span>}
              </td>
              <td style={{padding:"11px 12px",minWidth:200}}>
                {isEdit?<textarea value={editForm.notes||""} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))} placeholder="Notiz…" rows={2} style={{width:"100%",border:"1px solid "+T.border,borderRadius:6,padding:"5px 8px",fontSize:12,fontFamily:ff,outline:"none",resize:"none",boxSizing:"border-box"}}/>:
                <div>
                  {b.notes&&<div style={{fontSize:12,color:T.text,fontFamily:ff,marginBottom:3,lineHeight:1.4}}>{b.notes}</div>}
                  {lastLog?<div style={{fontSize:10,color:T.textMuted,fontFamily:ff,background:T.bgApp,borderRadius:4,padding:"2px 7px",display:"inline-block"}}>{lastLog.date}: {lastLog.text}</div>:(!b.notes&&<span style={{fontSize:11,color:T.textLight,fontFamily:ff}}>—</span>)}
                </div>}
              </td>
              <td style={{padding:"11px 12px",fontSize:11,color:T.textLight,fontFamily:ff,whiteSpace:"nowrap"}}>{b.addedAt||"—"}</td>
              <td style={{padding:"11px 12px"}}>
                <div style={{display:"flex",gap:5,flexDirection:"column",alignItems:"stretch",minWidth:60}}>
                  {isEdit?<>
                    <SFBtn small variant="success" onClick={()=>{updateBuyer(b.id,{status:editForm.status,notes:editForm.notes,level:editForm.level||b.level||"B"});setEditId(null);}}>💾 Speichern</SFBtn>
                    <SFBtn small variant="neutral" onClick={()=>setEditId(null)}>✕</SFBtn>
                  </>:<>
                    <SFBtn small variant="neutral" onClick={()=>{setEditId(b.id);setEditForm({status:b.status,notes:b.notes||""});}}>✏️ Edit</SFBtn>
                    <button onClick={()=>removeBuyer(b.id)} style={{padding:"3px 8px",borderRadius:4,border:"1px solid "+T.border,background:"#fff",color:T.error,fontSize:11,cursor:"pointer",fontFamily:ff}}>🗑️</button>
                  </>}
                </div>
              </td>
            </tr>;
          })}
        </tbody>
      </table>
      <div style={{background:T.bgHeader,padding:"8px 16px",borderTop:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{filtered.length} von {buyers.length} Investoren{statusFilter!=="all"?" (Filter: "+getSt(statusFilter).label+")":""}</span>
        <span style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>Klick auf Status-Badge zum Bearbeiten</span>
      </div>
    </div>}

    {/* LOI Bewertungsmodal */}
    {loiModal&&<LOIModal buyerId={loiModal} buyers={buyers} onClose={()=>setLoiModal(null)} onSave={(id,sc)=>{updateBuyer(id,{loiScore:sc});setLoiModal(null);}}/>}

    {/* LOI Ranking Tabelle (wenn mind. 2 LOIs vorhanden) */}
    {buyers.filter(b=>["loi","angebot","verhandlung"].includes(b.status)&&calcLoiScore(b)!==null).length>=2&&<div style={{background:"#fff",borderRadius:T.radius,border:"1px solid "+T.border,overflow:"hidden",boxShadow:T.shadowSm}}>
      <div style={{background:"linear-gradient(135deg,"+T.brandMid+",#2D4A7A)",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:ff}}>⚖️ LOI Ranking – automatische Auswertung</span>
        <span style={{fontSize:11,color:"rgba(255,255,255,.7)",fontFamily:ff}}>Höchster Score ≠ automatisch Gewinner</span>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:T.bgHeader}}>{["#","Investor","Level","LOI Status","Score","Empfehlung"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:T.text,fontFamily:ff,borderBottom:"2px solid "+T.border}}>{h}</th>)}</tr></thead>
        <tbody>
          {[...buyers].filter(b=>["loi","angebot","verhandlung"].includes(b.status)).map(b=>({...b,_score:calcLoiScore(b)||0})).sort((a,b)=>b._score-a._score).map((b,idx)=>{
            const lv=getLevel(b.level||"B");const st=BUYER_STATUS.find(s=>s.key===b.status)||BUYER_STATUS[0];
            const medal=idx===0?"🥇":idx===1?"🥈":idx===2?"🥉":"";
            const rec=b._score>=80?"✅ Stark priorisieren":b._score>=60?"⭐ Aktiv halten":b._score>0?"📋 Beobachten":"—";
            return <tr key={b.id} style={{borderBottom:"1px solid "+T.border,background:idx===0?T.successBg:"#fff"}}>
              <td style={{padding:"9px 12px",fontSize:16}}>{medal||idx+1}</td>
              <td style={{padding:"9px 12px"}}><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{b.companyName||b.contactName}</div>{b.contactName&&b.companyName&&<div style={{fontSize:11,color:T.textMuted}}>{b.contactName}</div>}</td>
              <td style={{padding:"9px 12px"}}><span style={{fontSize:11,fontWeight:700,color:lv.color,background:lv.bg,padding:"2px 8px",borderRadius:99}}>{lv.icon} {lv.key}</span></td>
              <td style={{padding:"9px 12px"}}><span style={{fontSize:11,color:st.color,background:st.bg,padding:"2px 8px",borderRadius:99,fontWeight:600}}>{st.icon} {st.label}</span></td>
              <td style={{padding:"9px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:6,background:T.border,borderRadius:3,minWidth:60}}><div style={{width:b._score+"%",height:"100%",background:b._score>=80?T.success:b._score>=60?T.warning:T.error,borderRadius:3}}/></div><span style={{fontSize:13,fontWeight:900,color:b._score>=80?T.success:b._score>=60?T.warning:T.error,fontFamily:ff,minWidth:28}}>{b._score}</span></div></td>
              <td style={{padding:"9px 12px",fontSize:12,color:T.text,fontFamily:ff}}>{rec}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>}
  </div>;
}

function DealRecord({deal,onClose,onSave,contacts,calls,onCallStart,companies}){
  const[d,setD]=useState({...deal,checklist:deal.checklist||{}});
  const[tab,setTab]=useState("activity");
  const[logText,setLogText]=useState("");
  const[lt,setLt]=useState("note");
  const[editing,setEditing]=useState(false);
  const[emailOpen,setEmailOpen]=useState(false);

  const guDeal=isGU(d.type);
  const stg=guDeal?GU_STAGES.find(s=>s.key===d.stage)||GU_STAGES[0]:getStg(d.stage);
  const typ=getTyp(d.type);
  const checkItems=guDeal?(GU_CHECKLIST[d.stage]||[]):(STAGE_CL[d.stage]||[]);
  const checkDone=checkItems.filter(i=>d.checklist[i]).length;
  const commission=guDeal?Math.round((d.guVolumen||0)*(d.commission||7)/100):((d.agreedPrice||d.askPrice||0)*(d.commission||0)/100);
  const f=k=>v=>setD(p=>({...p,[k]:v}));
  const dealCalls=calls.filter(c=>c.dealId===d.id);
  const guAsset=GU_ASSETS.find(a=>a.key===d.guAsset);
  const guPartner=GU_PARTNER_TYPEN.find(p=>p.key===d.guPartner);

  const addLog=()=>{if(!logText.trim())return;setD(p=>({...p,log:[...(p.log||[]),{date:today(),text:logText,by:"Ich",type:lt}]}));setLogText("");};
  const toggleCL=item=>setD(p=>({...p,checklist:{...p.checklist,[item]:!p.checklist[item]}}));
  const changeStg=key=>setD(p=>({...p,stage:key,log:[...(p.log||[]),{date:today(),text:`Stage → ${getStg(key).label}`,by:"System",type:"stage"}]}));
  const LOG_ICONS={note:"📝",email:"✉️",call:"📞",task:"☑️",stage:"🔄",created:"✨",won:"🏆"};
  const TABS=guDeal?["activity","investoren","rechnungen","dokumente","details","checklist"]:["activity","investoren","calls","dokumente","details","checklist"];

  const highlights=guDeal?[["GU-Volumen",fmt(d.guVolumen||0),"#D8EDFF"],[`Prov. ${d.commission||7}%`,fmt(commission),"#FFD966"],["RE 6a",d.invoiceA?.paid?fmt(d.invoiceA.amount||0):"offen",d.invoiceA?.paid?"#7FD6A5":"rgba(255,255,255,.6)"],["RE 6b",d.invoiceB?.paid?fmt(d.invoiceB.amount||0):"offen",d.invoiceB?.paid?"#7FD6A5":"rgba(255,255,255,.6)"],["Abschl.-W.",`${d.probability||0}%`,"rgba(255,255,255,.9)"],["Anrufe",String(dealCalls.length),"#7FD6A5"]]:[["Kaufpreis",fmtM(d.askPrice),"#D8EDFF"],["Einigung",fmtM(d.agreedPrice),"#FFD966"],["Provision",fmtM(commission),"#7FD6A5"],["Abschl.-W.",`${d.probability||0}%`,"rgba(255,255,255,.9)"],["Abschluss",dateStr(d.closeDate),"rgba(255,255,255,.9)"],["Anrufe",String(dealCalls.length),"#7FD6A5"]];

  return <div style={{position:"fixed",inset:0,background:"rgba(3,45,96,.6)",zIndex:8000,display:"flex",flexDirection:"column"}}>
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{background:T.brandMid,padding:"12px 24px 0",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:12,fontFamily:ff,padding:0}}>← Grenford CRM</button>
          <span style={{color:"rgba(255,255,255,.4)"}}>›</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,.9)",fontFamily:ff}}>{d.name}</span>
        </div>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:48,height:48,borderRadius:T.radius,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{typ.icon}</div>
            <div>
              <div style={{display:"flex",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                <Pill label={typ.label} color="#fff" bg="rgba(255,255,255,.2)"/>
                {guDeal&&guAsset&&<Pill label={`${guAsset.icon} ${guAsset.label}`} color="#FFD966" bg="transparent"/>}
                <Pill label={d.priority} color={d.priority==="High"?"#FFD966":"rgba(255,255,255,.7)"} bg="transparent"/>
              </div>
              <h1 style={{margin:0,fontSize:20,fontWeight:700,color:"#fff",fontFamily:ff}}>{d.name}</h1>
              <div style={{fontSize:13,color:"rgba(255,255,255,.75)",marginTop:3,fontFamily:ff}}>{d.accountName||d.buyer} · {d.address||"—"}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button onClick={()=>exportDealPDF(d)} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:T.radius,border:"1px solid rgba(255,255,255,.4)",background:"transparent",color:"rgba(255,255,255,.9)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>📄 PDF</button>
            <button onClick={()=>setEmailOpen(true)} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:T.radius,border:"1px solid rgba(255,255,255,.4)",background:"transparent",color:"rgba(255,255,255,.9)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>✉️ E-Mail</button>
            <SFBtn variant="inverse" small icon="✏️" onClick={()=>setEditing(!editing)}>{editing?"Abbrechen":"Bearbeiten"}</SFBtn>
            {editing&&<SFBtn variant="success" small icon="💾" onClick={()=>{onSave(d);setEditing(false);}}>Speichern</SFBtn>}
            <SFBtn variant="inverse" small onClick={onClose}>✕</SFBtn>
          </div>
        </div>
        <div style={{display:"flex",gap:0,background:"rgba(255,255,255,.08)",borderRadius:"4px 4px 0 0",overflow:"hidden"}}>
          {highlights.map(([k,v,c])=><div key={k} style={{flex:1,padding:"9px 14px",borderRight:"1px solid rgba(255,255,255,.1)"}}><div style={{fontSize:9,color:"rgba(255,255,255,.6)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:ff}}>{k}</div><div style={{fontSize:13,color:c,fontWeight:700,marginTop:2,fontFamily:ff}}>{v}</div></div>)}
        </div>
        <div style={{padding:"10px 0 0"}}><PathComp stages={guDeal?GU_STAGES:STAGES} current={d.stage} onChange={changeStg}/></div>
        <div style={{display:"flex",gap:0,marginTop:8}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",background:tab===t?"#fff":"transparent",color:tab===t?T.brandPrimary:"rgba(255,255,255,.8)",fontSize:13,fontWeight:700,fontFamily:ff,cursor:"pointer",borderBottom:tab===t?`2px solid ${T.brandPrimary}`:"2px solid transparent",transition:"all .15s"}}>{t==="investoren"?`🎯 Investoren (${(d.buyerList||[]).length})`:t==="rechnungen"?"💰 Rechnungen":t==="calls"?`📞 Anrufe (${dealCalls.length})`:t==="checklist"?`Checkliste (${checkDone}/${checkItems.length})`:t==="dokumente"?`📁 Dokumente (${(d.docs||[]).length})`:t==="activity"?"Aktivität":"Details"}</button>)}
        </div>
      </div>

      <div style={{flex:1,background:T.bgApp,padding:20,overflow:"auto"}}>
        {tab==="activity"&&<div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,alignItems:"start"}}>
          <div>
            <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,padding:14,marginBottom:14,boxShadow:T.shadowSm}}>
              <div style={{display:"flex",gap:6,marginBottom:10}}>{[{v:"note",l:"📝 Notiz"},{v:"email",l:"✉️ E-Mail"},{v:"call",l:"📞 Anruf"},{v:"task",l:"☑️ Task"}].map(o=><button key={o.v} onClick={()=>setLt(o.v)} style={{padding:"4px 10px",borderRadius:T.radius,border:`1px solid ${lt===o.v?T.brandPrimary:T.border}`,background:lt===o.v?T.brandLighter:"#fff",color:lt===o.v?T.brandPrimary:T.text,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{o.l}</button>)}</div>
              <textarea value={logText} onChange={e=>setLogText(e.target.value)} placeholder="Aktivität erfassen…" rows={2} style={{width:"100%",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"7px 10px",fontSize:13,fontFamily:ff,outline:"none",resize:"none",boxSizing:"border-box"}} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),addLog())}/>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><SFBtn small onClick={addLog} disabled={!logText.trim()} icon="💾">Speichern</SFBtn></div>
            </div>
            {[...(d.log||[]),...dealCalls.map(c=>({date:c.startedAt?.split("T")[0],text:`📞 ${c.contactName} · ${fmtSec(c.duration)} · ${OUTCOMES[c.outcome]?.label||""}${c.notes?" – "+c.notes:""}`,by:c.user||"Ich",type:"call"}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((l,i)=><div key={i} style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,padding:"11px 14px",marginBottom:7,boxShadow:T.shadowSm,display:"flex",gap:10}}><div style={{width:28,height:28,borderRadius:"50%",background:l.type==="call"?T.successBg:l.type==="stage"?T.infoBg:T.bgApp,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,border:`1px solid ${T.border}`}}>{LOG_ICONS[l.type]||"📝"}</div><div style={{flex:1}}><div style={{fontSize:13,color:T.textStrong,fontFamily:ff}}>{l.text}</div><div style={{fontSize:11,color:T.textMuted,marginTop:2,fontFamily:ff}}>{l.by} · {l.date}</div></div></div>)}
          </div>
          <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden"}}>
            <div style={{background:stg.color,padding:"10px 14px"}}><div style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:ff}}>Checkliste: {stg.label}</div><div style={{fontSize:11,color:"rgba(255,255,255,.8)",marginTop:1}}>{checkDone}/{checkItems.length}</div></div>
            {checkItems.map(item=>{const done=d.checklist[item];return <div key={item} onClick={()=>toggleCL(item)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 14px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",background:done?T.successBg:"#fff"}}><div style={{width:15,height:15,borderRadius:3,border:`2px solid ${done?T.success:T.border}`,background:done?T.success:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{done&&<span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}</div><span style={{fontSize:12,color:done?T.success:T.text,textDecoration:done?"line-through":"none",fontFamily:ff}}>{item}</span></div>;})}
          </div>
        </div>}

        {tab==="investoren"&&<BuyerList deal={d} onChange={setD} contacts={contacts||[]} companies={companies||[]}/>}
        {tab==="rechnungen"&&guDeal&&<GUInvoice deal={d} onChange={setD}/>}
        {tab==="calls"&&!guDeal&&<SCard title={`Anrufe (${dealCalls.length})`} icon="📞"><CallList calls={dealCalls}/></SCard>}
        {tab==="dokumente"&&<DocUpload deal={d} onUpdate={updated=>setD(updated)}/>}
        {tab==="checklist"&&<SCard title={`Checkliste – ${stg.label}`} icon="☑️">{checkItems.length===0&&<div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:13,fontFamily:ff}}>Keine Punkte für diese Phase.</div>}{checkItems.map((item,i)=>{const done=d.checklist[item];return <div key={item} onClick={()=>toggleCL(item)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}><div style={{width:18,height:18,borderRadius:3,border:`2px solid ${done?T.success:T.border}`,background:done?T.success:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{done&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}</div><span style={{fontSize:13,color:done?T.success:T.textStrong,textDecoration:done?"line-through":"none",fontFamily:ff,fontWeight:done?700:400}}>{item}</span>{done&&<span style={{marginLeft:"auto",fontSize:11,color:T.success,fontFamily:ff}}>✓ Erledigt</span>}</div>;})}
        </SCard>}

        {tab==="details"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {guDeal?<>
            <SCard title="GU Vermittlung" icon="👷"><div style={{display:"flex",flexDirection:"column",gap:10}}>
              <SFSelect label="Auftragstyp" value={d.type||"gu_b2c"} onChange={editing?f("type"):()=>{}} full options={[{value:"gu_b2c",label:"👷 GU B2C"},{value:"gu_b2b",label:"🏗️ GU B2B"}]}/>
              <SFSelect label="Asset-Klasse" value={d.guAsset||""} onChange={editing?f("guAsset"):()=>{}} full options={[{value:"",label:"— wählen —"},...GU_ASSETS.map(a=>({value:a.key,label:`${a.icon} ${a.label}`}))]}/>
              <SFInput label="GU-Partner Name" value={d.guPartnerName||""} onChange={editing?f("guPartnerName"):()=>{}} placeholder="Firma GmbH" full readOnly={!editing}/>
              <SFInput label="GU-Auftragsvolumen €" value={d.guVolumen||""} onChange={editing?f("guVolumen"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Provision %" value={d.commission||7} onChange={editing?f("commission"):()=>{}} type="number" full readOnly={!editing}/>
              <div style={{background:T.successBg,borderRadius:T.radius,padding:"10px 14px",border:`1px solid ${T.success}33`}}><div style={{fontSize:11,color:T.success,fontFamily:ff,fontWeight:700}}>💰 Provision gesamt</div><div style={{fontSize:18,fontWeight:900,color:T.success,fontFamily:ff}}>{fmt(Math.round((d.guVolumen||0)*(d.commission||7)/100))}</div></div>
            </div></SCard>
            <SCard title="Auftragsdaten" icon="📋"><div style={{display:"flex",flexDirection:"column",gap:10}}>
              <SFInput label="Kunde" value={d.buyer||""} onChange={editing?f("buyer"):()=>{}} full readOnly={!editing}/>
              <SFInput label="Adresse" value={d.address||""} onChange={editing?f("address"):()=>{}} full readOnly={!editing}/>
              <SFInput label="Fläche m²" value={d.sqm||""} onChange={editing?f("sqm"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Wahrscheinlichkeit %" value={d.probability||""} onChange={editing?f("probability"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Geplanter Abschluss" value={d.closeDate||""} onChange={editing?f("closeDate"):()=>{}} type="date" full readOnly={!editing}/>
              <SFInput label="Owner" value={d.owner||""} onChange={editing?f("owner"):()=>{}} full readOnly={!editing}/>
              <SFTA label="Beschreibung" value={d.description||""} onChange={editing?f("description"):()=>{}} rows={3}/>
            </div></SCard>
          </>:<>
            <SCard title="Transaktionsdetails" icon="📋"><div style={{display:"flex",flexDirection:"column",gap:10}}>
              <SFInput label="Titel" value={d.name||""} onChange={editing?f("name"):()=>{}} full readOnly={!editing}/>
              <SFSelect label="Typ" value={d.type||""} onChange={editing?f("type"):()=>{}} full options={DEAL_TYPES.map(t=>({value:t.key,label:t.icon+" "+t.label}))}/>
              <SFInput label="Kaufpreis €" value={d.askPrice||""} onChange={editing?f("askPrice"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Einigungspreis €" value={d.agreedPrice||""} onChange={editing?f("agreedPrice"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Provision %" value={d.commission||""} onChange={editing?f("commission"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Wahrscheinlichkeit %" value={d.probability||""} onChange={editing?f("probability"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Abschlussdatum" value={d.closeDate||""} onChange={editing?f("closeDate"):()=>{}} type="date" full readOnly={!editing}/>
            </div></SCard>
            <SCard title="Objektdaten" icon="🏢"><div style={{display:"flex",flexDirection:"column",gap:10}}>
              <SFSelect label="Objekttyp" value={d.objType||""} onChange={editing?f("objType"):()=>{}} full options={OBJ_TYPES.map(o=>({value:o,label:o}))}/>
              <SFInput label="Fläche m²" value={d.sqm||""} onChange={editing?f("sqm"):()=>{}} type="number" full readOnly={!editing}/>
              <SFInput label="Adresse" value={d.address||""} onChange={editing?f("address"):()=>{}} full readOnly={!editing}/>
              <SFInput label="Verkäufer" value={d.seller||""} onChange={editing?f("seller"):()=>{}} full readOnly={!editing}/>
              <SFInput label="Käufer" value={d.buyer||""} onChange={editing?f("buyer"):()=>{}} full readOnly={!editing}/>
              <SFInput label="Account" value={d.accountName||""} onChange={editing?f("accountName"):()=>{}} full readOnly={!editing}/>
              <SFInput label="Owner" value={d.owner||""} onChange={editing?f("owner"):()=>{}} full readOnly={!editing}/>
              <SFTA label="Beschreibung" value={d.description||""} onChange={editing?f("description"):()=>{}} rows={3}/>
            </div></SCard>
          </>}
        </div>}
      </div>
    </div>
    {emailOpen&&<EmailComposer deal={d} contacts={contacts} onClose={()=>setEmailOpen(false)} onSent={entry=>{setD(p=>({...p,log:[...(p.log||[]),{date:entry.date,text:`✉️ E-Mail an ${entry.to}: ${entry.subject}`,by:"Ich",type:"email"}]}));}}/>}
  </div>;
}

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
const emptyDeal={name:"",type:"b2b_offmarket",stage:"akquise",accountName:"",companyId:"",seller:"",buyer:"",address:"",objType:"Wohngebäude",sqm:"",askPrice:"",agreedPrice:"",commission:2,probability:30,closeDate:"",owner:"",description:"",priority:"Medium",checklist:{},log:[],guVolumen:"",guAsset:"",guPartner:"",guPartnerName:"",invoiceA:{amount:0,sent:false,paid:false,date:""},invoiceB:{amount:0,sent:false,paid:false,date:""}};

function Opportunities({deals,setDeals,contacts,companies,calls,onCallStart}){
  const[view,setView]=useState("list");const[filter,setFilter]=useState("all");const[search,setSearch]=useState("");const[record,setRecord]=useState(null);const[newModal,setNewModal]=useState(false);const[form,setForm]=useState(emptyDeal);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));const guForm=isGU(form.type);
  const filtered=deals.filter(d=>{if(filter!=="all"&&d.type!==filter)return false;if(search&&![d.name,d.accountName,d.buyer,d.address].some(v=>(v||"").toLowerCase().includes(search.toLowerCase())))return false;return true;});
  const saveNew=()=>{const guD=isGU(form.type);const e={...form,id:uid(),askPrice:guD?0:Number(form.askPrice),sqm:Number(form.sqm),guVolumen:guD?Number(form.guVolumen):0,commission:Number(form.commission)||(guD?7:2),stage:guD?"gu_akquise":"akquise",log:[{date:today(),text:"Deal angelegt",by:"Ich",type:"created"}]};setDeals([...deals,e]);setNewModal(false);};
  const getVol=d=>isGU(d.type)?fmtM(d.guVolumen):fmtM(d.askPrice);
  const getProv=d=>isGU(d.type)?fmtM(Math.round((d.guVolumen||0)*(d.commission||7)/100)):fmtM((d.agreedPrice||d.askPrice||0)*(d.commission||0)/100);

  return <div>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
      <div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Deals suchen…" style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"7px 12px 7px 30px",fontSize:13,fontFamily:ff,outline:"none",width:220}} onFocus={e=>e.target.style.borderColor=T.borderFocus} onBlur={e=>e.target.style.borderColor=T.border}/></div>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"7px 10px",fontSize:13,fontFamily:ff,outline:"none"}}><option value="all">Alle Typen</option>{DEAL_TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}</select>
      <div style={{flex:1}}/><span style={{fontSize:12,color:T.textMuted,fontFamily:ff}}>{filtered.length} Deals</span>
      <div style={{display:"flex",border:`1px solid ${T.border}`,borderRadius:T.radius,overflow:"hidden"}}>{["list","kanban"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"6px 14px",border:"none",background:view===v?T.brandPrimary:"#fff",color:view===v?"#fff":T.text,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{v==="list"?"≡ Liste":"▦ Kanban"}</button>)}</div>
      <SFBtn icon="+" onClick={()=>{setForm(emptyDeal);setNewModal(true);}}>Neuer Deal</SFBtn>
    </div>

    {view==="list"&&<div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Deal / Objekt","Typ","Phase","Volumen","Provision","Account","Owner","📞",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:12,fontWeight:700,color:T.text,fontFamily:ff,background:T.bgHeader,borderBottom:`2px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map((d,i)=>{const stg=getStg(d.stage),typ=getTyp(d.type);const dCalls=calls.filter(c=>c.dealId===d.id);return <tr key={d.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"#fff":T.bgRow,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.bgSelected} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":T.bgRow}>
            <td style={{padding:"10px 12px"}} onClick={()=>setRecord(d)}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{typ.icon}</span><div><div style={{fontSize:13,color:T.textLink,fontWeight:700,fontFamily:ff}}>{d.name}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{d.address||"—"}</div></div></div></td>
            <td style={{padding:"10px 12px"}} onClick={()=>setRecord(d)}><Badge color={typ.color}>{typ.label}</Badge></td>
            <td style={{padding:"10px 12px"}} onClick={()=>setRecord(d)}><Pill label={stg.short} color={stg.color} bg={stg.bg}/></td>
            <td style={{padding:"10px 12px",textAlign:"right",fontSize:13,fontWeight:700,color:T.brandPrimary,fontFamily:ff}} onClick={()=>setRecord(d)}>{getVol(d)}</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontSize:12,color:T.success,fontWeight:700,fontFamily:ff}} onClick={()=>setRecord(d)}>{getProv(d)}</td>
            <td style={{padding:"10px 12px",fontSize:12,color:T.text,fontFamily:ff}} onClick={()=>setRecord(d)}>{d.accountName||d.buyer||"—"}</td>
            <td style={{padding:"10px 12px"}} onClick={()=>setRecord(d)}><div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={d.owner||"?"} size={20}/><span style={{fontSize:12,color:T.textMuted,fontFamily:ff}}>{d.owner||"—"}</span></div></td>
            <td style={{padding:"10px 12px"}}>{dCalls.length>0?<Badge color={T.brandPrimary}>{dCalls.length} 📞</Badge>:<span style={{color:T.textLight,fontSize:11}}>—</span>}</td>
            <td style={{padding:"10px 12px"}}><div style={{display:"flex",gap:4}}><button onClick={()=>setRecord(d)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>📂</button><button onClick={()=>setDeals(deals.filter(x=>x.id!==d.id))} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>🗑️</button></div></td>
          </tr>;})}
          {filtered.length===0&&<tr><td colSpan={9} style={{padding:40,textAlign:"center",color:T.textMuted,fontSize:14,fontFamily:ff}}>Keine Deals.</td></tr>}
        </tbody>
      </table>
      <div style={{background:T.bgHeader,padding:"8px 16px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.textMuted,fontFamily:ff}}>{filtered.length} Deals</span><span style={{fontSize:12,color:T.textMuted,fontFamily:ff}}>Pipeline: <strong style={{color:T.brandPrimary}}>{fmtM(filtered.filter(d=>!["won","lost","aftersales","gu_won","gu_lost"].includes(d.stage)).reduce((s,d)=>s+(isGU(d.type)?(d.guVolumen||0):(d.askPrice||0)),0))}</strong></span></div>
    </div>}

    {view==="kanban"&&<div style={{overflowX:"auto",paddingBottom:8}}><div style={{display:"flex",gap:8,minWidth:1200}}>{[...STAGES.slice(0,12),...GU_STAGES.filter(s=>!["gu_lost","gu_won"].includes(s.key))].map(stg=>{const sd=filtered.filter(d=>d.stage===stg.key);if(!sd.length&&!["akquise","gu_akquise"].includes(stg.key))return null;return <div key={stg.key} style={{flex:"0 0 145px",background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,boxShadow:T.shadowSm,display:"flex",flexDirection:"column"}}><div style={{background:stg.color,padding:"8px 10px",borderRadius:`${T.radius} ${T.radius} 0 0`}}><div style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:ff}}>{stg.label}</div><div style={{fontSize:9,color:"rgba(255,255,255,.8)",marginTop:1}}>{sd.length} Deals</div></div><div style={{flex:1,padding:7,display:"flex",flexDirection:"column",gap:6,minHeight:60}}>{sd.map(d=>{const t=getTyp(d.type);return <div key={d.id} onClick={()=>setRecord(d)} style={{background:T.bgApp,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"9px 10px",cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background=T.bgSelected;e.currentTarget.style.borderColor=T.brandPrimary;}} onMouseLeave={e=>{e.currentTarget.style.background=T.bgApp;e.currentTarget.style.borderColor=T.border;}}><div style={{fontSize:10,color:t.color,fontWeight:700,fontFamily:ff,marginBottom:2}}>{t.icon} {t.label}</div><div style={{fontSize:11,fontWeight:700,color:T.textLink,fontFamily:ff,lineHeight:1.3,marginBottom:3}}>{d.name}</div><div style={{fontSize:12,fontWeight:700,color:T.brandPrimary,fontFamily:ff}}>{getVol(d)}</div></div>;})}
          <button onClick={()=>{setForm({...emptyDeal,type:stg.key.startsWith("gu_")?"gu_b2c":"b2b_offmarket",stage:stg.key});setNewModal(true);}} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:T.radius,padding:"6px",color:T.textMuted,cursor:"pointer",fontSize:18}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.brandPrimary;e.currentTarget.style.color=T.brandPrimary;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted;}}>+</button>
          </div></div>;}).filter(Boolean)}</div></div>}

    {record&&<DealRecord deal={record} onClose={()=>setRecord(null)} onSave={updated=>{setDeals(deals.map(d=>d.id===updated.id?updated:d));setRecord(null);}} contacts={contacts} companies={companies} calls={calls} onCallStart={onCallStart}/>}

    {newModal&&<Modal title="Neuen Deal anlegen" icon="🏗️" onClose={()=>setNewModal(false)} size={700}
      footer={<><SFBtn variant="neutral" onClick={()=>setNewModal(false)}>Abbrechen</SFBtn><SFBtn disabled={!form.name||(guForm?!form.guVolumen:!form.askPrice)} onClick={saveNew} icon="💾">Deal speichern</SFBtn></>}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{DEAL_TEMPLATES.map(tpl=><button key={tpl.id} onClick={()=>setForm(p=>({...p,...tpl,id:undefined,name:"",closeDate:"",owner:"",accountName:"",buyer:"",seller:"",address:"",sqm:""}))} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:"#fff",color:T.text,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:ff,display:"flex",alignItems:"center",gap:6}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.brandPrimary;e.currentTarget.style.background=T.brandLighter;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="#fff";}}><span>{tpl.icon}</span>{tpl.name}</button>)}</div>
        <div style={{borderTop:`1px solid ${T.border}`}}/>
        <SFInput label="Titel" value={form.name} onChange={f("name")} required full placeholder="z.B. EFH Sanierung Köln"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <SFSelect label="Deal-Typ" value={form.type} onChange={v=>setForm(p=>({...p,type:v}))} full options={DEAL_TYPES.map(t=>({value:t.key,label:t.icon+" "+t.label}))}/>
          <SFInput label="Adresse" value={form.address} onChange={f("address")} full placeholder="Straße, PLZ Stadt"/>
          {guForm?<><SFSelect label="Asset-Klasse" value={form.guAsset||""} onChange={f("guAsset")} full options={[{value:"",label:"— wählen —"},...GU_ASSETS.map(a=>({value:a.key,label:`${a.icon} ${a.label}`}))]}/><SFInput label="GU-Partner Name" value={form.guPartnerName||""} onChange={f("guPartnerName")} placeholder="Firma GmbH" full/><SFInput label="Kunde" value={form.buyer||""} onChange={f("buyer")} placeholder="Herr Müller" full/><SFInput label="GU-Auftragsvolumen € *" value={form.guVolumen||""} onChange={f("guVolumen")} type="number" full placeholder="280000"/><SFInput label="Provision % (5–10%)" value={form.commission||7} onChange={f("commission")} type="number" full/></>:<><SFSelect label="Objekttyp" value={form.objType||"Wohngebäude"} onChange={f("objType")} full options={OBJ_TYPES.map(o=>({value:o,label:o}))}/><SFInput label="Fläche m²" value={form.sqm||""} onChange={f("sqm")} type="number" full/><SFInput label="Kaufpreis € *" value={form.askPrice||""} onChange={f("askPrice")} type="number" full/><SFInput label="Verkäufer" value={form.seller||""} onChange={f("seller")} full/><SFInput label="Käufer / Account" value={form.accountName||""} onChange={f("accountName")} full/><SFInput label="Provision %" value={form.commission||2} onChange={f("commission")} type="number" full/></>}
          <SFInput label="Wahrscheinlichkeit %" value={form.probability||30} onChange={f("probability")} type="number" full/>
          <SFInput label="Geplanter Abschluss" value={form.closeDate||""} onChange={f("closeDate")} type="date" full/>
          <SFSelect label="Priorität" value={form.priority||"Medium"} onChange={f("priority")} full options={[{value:"High",label:"Hoch"},{value:"Medium",label:"Mittel"},{value:"Low",label:"Niedrig"}]}/>
          <SFInput label="Owner" value={form.owner||""} onChange={f("owner")} full placeholder="Dein Name"/>
        </div>
        <SFTA label="Beschreibung" value={form.description||""} onChange={f("description")} rows={2}/>
      </div>
    </Modal>}
  </div>;
}

// ─── CONTACTS (mit CSV Import Button) ─────────────────────────────────────────
function Contacts({contacts,setContacts,companies,calls,onCallStart}){
  const[search,setSearch]=useState("");const[modal,setModal]=useState(null);const[form,setForm]=useState({firstName:"",lastName:"",title:"",companyId:"",email:"",phone:"",mobile:"",role:"Käufer",type:"buyer",notes:""});const[detail,setDetail]=useState(null);const[ctab,setCtab]=useState("daten");
  const[csvModal,setCsvModal]=useState(false); // 🆕 CSV Import state
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const TC={intern:T.brandPrimary,buyer:T.warning,seller:"#7526E3",partner:T.success,notar:"#706E6B"};
  const filtered=contacts.filter(c=>[c.firstName,c.lastName,c.email,c.role].some(v=>(v||"").toLowerCase().includes(search.toLowerCase())));
  const save=()=>{
    const dup=findDuplicate(contacts,form);
    if(dup&&!window.confirm(`⚠️ Mögliches Duplikat: "${dup.firstName} ${dup.lastName}"\n\nTrotzdem speichern?`))return;
    const e={...form,id:modal==="add"?uid():modal,createdAt:modal==="add"?today():form.createdAt};
    setContacts(modal==="add"?[...contacts,e]:contacts.map(c=>c.id===modal?e:c));
    setModal(null);
  };
  // 🆕 CSV Import handler
  const handleCSVImport=newContacts=>{
    const existing=contacts.map(c=>(c.email||"").toLowerCase());
    const toAdd=newContacts.filter(c=>!existing.includes((c.email||"").toLowerCase()));
    setContacts([...contacts,...toAdd]);
  };

  return <div>
    {csvModal&&<CSVImportModal onClose={()=>setCsvModal(false)} onImport={cs=>{handleCSVImport(cs);}} companies={companies}/>}

    {detail&&(()=>{
      const c=contacts.find(x=>x.id===detail);if(!c)return null;
      const cCalls=calls.filter(x=>x.contactId===c.id);const color=TC[c.type]||T.textMuted;const st=dsgvoStatus(c);
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:8000,display:"flex",justifyContent:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)setDetail(null);}}>
        <div style={{width:600,background:"#fff",borderLeft:`1px solid ${T.border}`,height:"100%",overflow:"auto",display:"flex",flexDirection:"column"}}>
          <div style={{background:T.brandMid,padding:"16px 20px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}><Avatar name={`${c.firstName} ${c.lastName}`} size={44} color={color}/><div><h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#fff",fontFamily:ff}}>{c.firstName} {c.lastName}</h2><div style={{fontSize:13,color:"rgba(255,255,255,.75)",marginTop:2}}>{c.title||c.role}</div><span style={{background:st.color+"33",color:"#fff",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,marginTop:4,display:"inline-block"}}>{st.icon} {st.label}</span></div></div>
              <SFBtn variant="inverse" small onClick={()=>setDetail(null)}>✕</SFBtn>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}><CallButton contact={c} onCallStart={onCallStart}/><a href={`mailto:${c.email}`} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:T.radius,border:"1px solid rgba(255,255,255,.4)",background:"transparent",color:"rgba(255,255,255,.9)",fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:ff}}>✉️ E-Mail</a></div>
            <div style={{display:"flex",gap:0}}>{[["daten","📋 Daten"],["anrufe",`📞 Anrufe (${cCalls.length})`],["dsgvo","🔒 DSGVO"]].map(([k,l])=><button key={k} onClick={()=>setCtab(k)} style={{padding:"8px 16px",border:"none",background:ctab===k?"#fff":"transparent",color:ctab===k?T.brandPrimary:"rgba(255,255,255,.8)",fontSize:13,fontWeight:700,fontFamily:ff,cursor:"pointer",borderBottom:ctab===k?`2px solid ${T.brandPrimary}`:"2px solid transparent"}}>{l}{k==="dsgvo"&&st.status!=="ok"&&<span style={{marginLeft:4,fontSize:10,background:st.color,color:"#fff",padding:"1px 5px",borderRadius:99}}>{st.status==="fehlt"?"!":"~"}</span>}</button>)}</div>
          </div>
          <div style={{flex:1,overflow:"auto",padding:16,background:T.bgApp}}>
            {ctab==="daten"&&<SCard title="Kontaktdaten" icon="📋"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["E-Mail",c.email],["Mobil",c.mobile||"—"],["Telefon",c.phone||"—"],["Rolle",c.role]].map(([k,v])=><div key={k}><div style={{fontSize:10,color:T.textMuted,fontFamily:ff,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{k}</div><div style={{fontSize:13,color:T.text,fontFamily:ff,marginTop:2,fontWeight:500}}>{v}</div></div>)}</div>{c.notes&&<div style={{marginTop:10,fontSize:13,color:T.text,fontFamily:ff,borderTop:`1px solid ${T.border}`,paddingTop:10}}>{c.notes}</div>}</SCard>}
            {ctab==="anrufe"&&<SCard title={`Anrufe (${cCalls.length})`} icon="📞"><CallList calls={cCalls}/></SCard>}
            {ctab==="dsgvo"&&<DSGVOTab contact={c} onUpdate={updated=>setContacts(contacts.map(x=>x.id===c.id?updated:x))}/>}
          </div>
        </div>
      </div>;
    })()}

    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
      <div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kontakte suchen…" style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"7px 12px 7px 30px",fontSize:13,fontFamily:ff,outline:"none",width:260}} onFocus={e=>e.target.style.borderColor=T.borderFocus} onBlur={e=>e.target.style.borderColor=T.border}/></div>
      <span style={{fontSize:12,color:T.textMuted,fontFamily:ff}}>{filtered.length} Kontakte</span>
      <div style={{flex:1}}/>
      {/* 🆕 CSV IMPORT BUTTON */}
      <button onClick={()=>setCsvModal(true)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:T.radius,border:`1px solid ${T.border}`,background:"#fff",color:T.text,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.brandPrimary;e.currentTarget.style.background=T.brandLighter;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="#fff";}}>📥 CSV Import</button>
      <SFBtn icon="+" onClick={()=>{setForm({firstName:"",lastName:"",title:"",companyId:"",email:"",phone:"",mobile:"",role:"Käufer",type:"buyer",notes:""});setModal("add");}}>Neuer Kontakt</SFBtn>
    </div>

    <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Name","Firma","Rolle","Mobil / Telefon","Zuletzt angerufen","DSGVO",""].map(h=><th key={h} style={{padding:"8px 14px",textAlign:"left",fontSize:12,fontWeight:700,color:T.text,fontFamily:ff,background:T.bgHeader,borderBottom:`2px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map((c,i)=>{
            const color=TC[c.type]||T.textMuted;
            const co=companies?.find(x=>x.id===c.companyId);
            const lastCall=calls.filter(x=>x.contactId===c.id).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt))[0];
            return <tr key={c.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"#fff":T.bgRow,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.bgSelected} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":T.bgRow}>
              <td style={{padding:"10px 14px"}} onClick={()=>setDetail(c.id)}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={`${c.firstName} ${c.lastName}`} size={30} color={color}/><div><div style={{fontSize:13,fontWeight:700,color:T.textLink,fontFamily:ff}}>{c.firstName} {c.lastName}</div>{c.title&&<div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{c.title}</div>}</div></div></td>
              <td style={{padding:"10px 14px"}} onClick={()=>setDetail(c.id)}>{co?<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{COMPANY_TYPES.find(t=>t.key===co.type)?.icon||"🏢"}</span><div><div style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:ff}}>{co.name}</div>{co.city&&<div style={{fontSize:10,color:T.textMuted,fontFamily:ff}}>{co.city}</div>}</div></div>:<span style={{fontSize:12,color:T.textLight,fontFamily:ff}}>—</span>}</td>
              <td style={{padding:"10px 14px"}} onClick={()=>setDetail(c.id)}><Badge color={color}>{c.role}</Badge></td>
              <td style={{padding:"10px 14px",fontSize:12,fontFamily:ff}} onClick={()=>setDetail(c.id)}><div style={{color:T.textStrong}}>{c.mobile||c.phone||"—"}</div>{c.mobile&&c.phone&&c.mobile!==c.phone&&<div style={{color:T.textMuted,fontSize:11}}>{c.phone}</div>}</td>
              <td style={{padding:"10px 14px"}} onClick={()=>setDetail(c.id)}>{lastCall?<div><div style={{fontSize:11,color:OUTCOMES[lastCall.outcome]?.color,fontWeight:700,fontFamily:ff}}>{OUTCOMES[lastCall.outcome]?.icon} {OUTCOMES[lastCall.outcome]?.label}</div><div style={{fontSize:10,color:T.textLight,fontFamily:ff}}>{fmtDT(lastCall.startedAt)}</div></div>:<span style={{color:T.textLight,fontSize:12,fontFamily:ff}}>—</span>}</td>
              <td style={{padding:"10px 14px"}} onClick={()=>{setDetail(c.id);setCtab("dsgvo");}}>{(()=>{const st=dsgvoStatus(c);return <span style={{fontSize:11,fontWeight:600,color:st.color,background:st.color+"12",padding:"2px 8px",borderRadius:99,whiteSpace:"nowrap",cursor:"pointer"}}>{st.icon} {st.label}</span>;})()}</td>
              <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:6,alignItems:"center"}}><CallButton contact={c} onCallStart={onCallStart} small/><button onClick={e=>{e.stopPropagation();setForm({...c});setModal(c.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>✏️</button><button onClick={e=>{e.stopPropagation();setContacts(contacts.filter(x=>x.id!==c.id));}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>🗑️</button></div></td>
            </tr>;
          })}
        </tbody>
      </table>
      {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:T.textMuted,fontSize:14,fontFamily:ff}}>Keine Kontakte.</div>}
      <div style={{background:T.bgHeader,padding:"8px 16px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.textMuted,fontFamily:ff}}>{filtered.length} Datensätze</span><span style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>📥 CSV Import für HubSpot/Outlook verfügbar</span></div>
    </div>

    {modal&&<Modal title={modal==="add"?"Neuer Kontakt":"Kontakt bearbeiten"} icon="👤" onClose={()=>setModal(null)} footer={<><SFBtn variant="neutral" onClick={()=>setModal(null)}>Abbrechen</SFBtn><SFBtn disabled={!form.firstName} onClick={save} icon="💾">Speichern</SFBtn></>}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <SFInput label="Vorname" value={form.firstName} onChange={f("firstName")} required full/>
          <SFInput label="Nachname" value={form.lastName} onChange={f("lastName")} full/>
          <SFInput label="Titel / Position" value={form.title} onChange={f("title")} full/>
          <SFSelect label="Unternehmen" value={form.companyId||""} onChange={f("companyId")} full options={[{value:"",label:"— Kein Unternehmen —"},...(companies||[]).map(c=>({value:c.id,label:c.name}))]}/>
          <SFSelect label="Rolle" value={form.role} onChange={f("role")} full options={["Verkäufer","Käufer","Notar","GU","Berater","Investor","Makler","Anwalt","Sonstiges"].map(r=>({value:r,label:r}))}/>
          <SFSelect label="Typ" value={form.type} onChange={f("type")} full options={[{value:"intern",label:"Intern"},{value:"buyer",label:"Käufer"},{value:"seller",label:"Verkäufer"},{value:"partner",label:"Partner"},{value:"notar",label:"Notar"}]}/>
          <SFInput label="📱 Mobil" value={form.mobile||""} onChange={f("mobile")} placeholder="+49 170 …" full/>
          <SFInput label="📞 Telefon" value={form.phone||""} onChange={f("phone")} placeholder="+49 211 …" full/>
          <SFInput label="E-Mail" value={form.email||""} onChange={f("email")} type="email" full/>
        </div>
        <SFTA label="Notizen" value={form.notes||""} onChange={f("notes")} rows={2}/>
      </div>
    </Modal>}
  </div>;
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({tasks,setTasks,deals,contacts,onCallStart}){
  const[filter,setFilter]=useState("open");const[modal,setModal]=useState(null);const[form,setForm]=useState({subject:"",dealId:"",contact:"",type:"Task",due:today(),priority:"Normal",status:"Not Started",description:""});
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const overdueC=tasks.filter(t=>t.status!=="Completed"&&t.due<today()).length;
  const filtered=tasks.filter(t=>filter==="open"?t.status!=="Completed":filter==="done"?t.status==="Completed":filter==="overdue"?t.status!=="Completed"&&t.due<today():true);
  const complete=id=>setTasks(tasks.map(t=>t.id===id?{...t,status:"Completed"}:t));
  const save=()=>{const e={...form,id:modal==="add"?uid():modal};setTasks(modal==="add"?[...tasks,e]:tasks.map(t=>t.id===modal?e:t));setModal(null);};
  const TYPE_ICON={Call:"📞",Email:"✉️",Task:"☑️",Meeting:"📅"};
  const PRI_COLOR={High:T.error,Normal:T.warning,Low:T.textMuted};

  return <div>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
      <div style={{display:"flex",border:`1px solid ${T.border}`,borderRadius:T.radius,overflow:"hidden"}}>{[{v:"open",l:"Offen"},{v:"overdue",l:`Überfällig${overdueC?` (${overdueC})`:""}`},{v:"done",l:"Erledigt"},{v:"all",l:"Alle"}].map(o=><button key={o.v} onClick={()=>setFilter(o.v)} style={{padding:"6px 14px",border:"none",background:filter===o.v?T.brandPrimary:"#fff",color:filter===o.v?"#fff":o.v==="overdue"&&overdueC?T.error:T.text,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff,borderRight:`1px solid ${T.border}`}}>{o.l}</button>)}</div>
      <div style={{flex:1}}/><SFBtn icon="+" onClick={()=>{setForm({subject:"",dealId:"",contact:"",type:"Task",due:today(),priority:"Normal",status:"Not Started",description:""});setModal("add");}}>Neue Aufgabe</SFBtn>
    </div>
    <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["","Betreff","Typ","Priorität","Fälligkeit","Deal","Status",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:12,fontWeight:700,color:T.text,fontFamily:ff,background:T.bgHeader,borderBottom:`2px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map((t,i)=>{const od=t.status!=="Completed"&&t.due<today(),done=t.status==="Completed";const rel=deals.find(d=>d.id===t.dealId);const relC=contacts.find(c=>`${c.firstName} ${c.lastName}`===t.contact);
          return <tr key={t.id} style={{borderBottom:`1px solid ${T.border}`,background:od?T.errorBg:i%2===0?"#fff":T.bgRow,opacity:done?.6:1}} onMouseEnter={e=>e.currentTarget.style.background=T.bgSelected} onMouseLeave={e=>e.currentTarget.style.background=od?T.errorBg:i%2===0?"#fff":T.bgRow}>
            <td style={{padding:"10px 12px"}}><button onClick={()=>complete(t.id)} style={{width:18,height:18,borderRadius:3,border:`2px solid ${done?T.success:T.border}`,background:done?T.success:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{done&&<span style={{color:"#fff",fontSize:10,fontWeight:900}}>✓</span>}</button></td>
            <td style={{padding:"10px 12px"}}><div style={{fontSize:13,fontWeight:700,color:T.textStrong,fontFamily:ff,textDecoration:done?"line-through":"none"}}>{t.subject}</div>{t.description&&<div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{t.description}</div>}</td>
            <td style={{padding:"10px 12px"}}><span style={{fontSize:14}}>{TYPE_ICON[t.type]||"☑️"}</span></td>
            <td style={{padding:"10px 12px"}}><Badge color={PRI_COLOR[t.priority]||T.textMuted}>{t.priority}</Badge></td>
            <td style={{padding:"10px 12px",fontSize:12,fontWeight:od?700:400,color:od?T.error:T.text,fontFamily:ff}}>{od?"⚠️ ":""}{t.due}</td>
            <td style={{padding:"10px 12px",fontSize:12,color:T.textLink,fontFamily:ff}}>{rel?.name||"—"}</td>
            <td style={{padding:"10px 12px"}}><Pill label={t.status} color={t.status==="Completed"?T.success:T.brandPrimary} bg={t.status==="Completed"?T.successBg:T.infoBg}/></td>
            <td style={{padding:"10px 12px"}}><div style={{display:"flex",gap:4,alignItems:"center"}}>{t.type==="Call"&&relC&&<CallButton contact={relC} dealId={t.dealId} dealName={rel?.name} onCallStart={onCallStart} small/>}<button onClick={()=>{setForm({...t});setModal(t.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>✏️</button><button onClick={()=>setTasks(tasks.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>🗑️</button></div></td>
          </tr>;})}
        </tbody>
      </table>
      {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:T.textMuted,fontSize:14,fontFamily:ff}}>Keine Aufgaben.</div>}
    </div>
    {modal&&<Modal title={modal==="add"?"Neue Aufgabe":"Aufgabe bearbeiten"} icon="☑️" onClose={()=>setModal(null)} footer={<><SFBtn variant="neutral" onClick={()=>setModal(null)}>Abbrechen</SFBtn><SFBtn disabled={!form.subject} onClick={save} icon="💾">Speichern</SFBtn></>}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <SFInput label="Betreff" value={form.subject} onChange={f("subject")} required full/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <SFSelect label="Typ" value={form.type} onChange={f("type")} full options={[{value:"Task",label:"☑️ Aufgabe"},{value:"Call",label:"📞 Anruf"},{value:"Email",label:"✉️ E-Mail"},{value:"Meeting",label:"📅 Meeting"}]}/>
          <SFSelect label="Priorität" value={form.priority} onChange={f("priority")} full options={[{value:"High",label:"Hoch"},{value:"Normal",label:"Normal"},{value:"Low",label:"Niedrig"}]}/>
          <SFInput label="Fälligkeit" value={form.due} onChange={f("due")} type="date" full/>
          <SFSelect label="Status" value={form.status} onChange={f("status")} full options={["Not Started","In Progress","Completed","Deferred"].map(s=>({value:s,label:s}))}/>
          <SFSelect label="Deal" value={form.dealId||""} onChange={f("dealId")} full options={[{value:"",label:"— Kein Deal —"},...deals.map(d=>({value:d.id,label:d.name}))]}/>
          <SFInput label="Kontakt" value={form.contact||""} onChange={f("contact")} full/>
        </div>
        <SFTA label="Beschreibung" value={form.description||""} onChange={f("description")} rows={2}/>
      </div>
    </Modal>}
  </div>;
}

// ─── KALENDER ─────────────────────────────────────────────────────────────────
function KalenderView({deals,tasks}){
  const[vd,setVd]=useState(new Date());
  const yr=vd.getFullYear(),mo=vd.getMonth();
  const first=new Date(yr,mo,1).getDay(),dim=new Date(yr,mo+1,0).getDate();
  const offset=first===0?6:first-1;
  const cells=Array.from({length:42},(_,i)=>{const d=i-offset+1;return(d>=1&&d<=dim)?d:null;});
  const todayStr=today();
  const WDAYS=["Mo","Di","Mi","Do","Fr","Sa","So"];
  const MONTHS_DE=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const pad=n=>String(n).padStart(2,"0");
  const getItems=d=>{if(!d)return{deals:[],tasks:[]};const ds=`${yr}-${pad(mo+1)}-${pad(d)}`;return{deals:deals.filter(x=>x.closeDate===ds),tasks:tasks.filter(t=>t.due===ds&&t.status!=="Completed")};};
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:T.shadowSm}}>
      <button onClick={()=>setVd(new Date(yr,mo-1,1))} style={{padding:"6px 16px",borderRadius:6,border:`1px solid ${T.border}`,background:"#fff",cursor:"pointer",fontSize:16,color:T.text}}>‹</button>
      <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:ff}}>{MONTHS_DE[mo]} {yr}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff,marginTop:2}}>{deals.filter(d=>d.closeDate?.startsWith(`${yr}-${pad(mo+1)}`)).length} Deal-Fristen · {tasks.filter(t=>t.due?.startsWith(`${yr}-${pad(mo+1)}`)&&t.status!=="Completed").length} Tasks</div></div>
      <button onClick={()=>setVd(new Date(yr,mo+1,1))} style={{padding:"6px 16px",borderRadius:6,border:`1px solid ${T.border}`,background:"#fff",cursor:"pointer",fontSize:16,color:T.text}}>›</button>
    </div>
    <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:T.bgHeader,borderBottom:`1px solid ${T.border}`}}>{WDAYS.map(d=><div key={d} style={{padding:"8px 0",textAlign:"center",fontSize:12,fontWeight:700,color:T.textMuted,fontFamily:ff}}>{d}</div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
        {cells.map((d,i)=>{const{deals:dD,tasks:dT}=getItems(d);const ds=d?`${yr}-${pad(mo+1)}-${pad(d)}`:"";const isTd=ds===todayStr,isWe=i%7>=5;
        return <div key={i} style={{minHeight:88,padding:"6px 7px",border:`1px solid ${T.border}`,background:!d?"#FAFBFC":isTd?T.brandLighter:isWe?"#FAFBFC":"#fff"}}>
          {d&&<><div style={{fontSize:13,width:24,height:24,borderRadius:"50%",background:isTd?T.brandPrimary:"transparent",color:isTd?"#fff":isWe?T.textMuted:T.text,fontWeight:isTd?900:400,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4,fontFamily:ff}}>{d}</div>
          {dD.map(dl=>{const t=DEAL_TYPES.find(x=>x.key===dl.type)||DEAL_TYPES[0];return <div key={dl.id} style={{fontSize:10,padding:"2px 5px",borderRadius:3,background:t.color+"22",color:t.color,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:ff}}>{t.icon} {dl.name.slice(0,15)}</div>;})}
          {dT.map(tk=><div key={tk.id} style={{fontSize:10,padding:"2px 5px",borderRadius:3,background:tk.due<todayStr?T.errorBg:T.warningBg,color:tk.due<todayStr?T.error:T.warning,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:ff}}>☑ {tk.subject.slice(0,13)}</div>)}</>}
        </div>;})}
      </div>
    </div>
  </div>;
}

// ─── CALL CENTER ──────────────────────────────────────────────────────────────
function CallCenter({calls,contacts,onCallStart}){
  const[search,setSearch]=useState("");
  const totalMin=Math.round(calls.reduce((s,c)=>s+c.duration,0)/60);
  const connCalls=calls.filter(c=>c.outcome==="connected");
  const connRate=calls.length?Math.round(connCalls.length/calls.length*100):0;
  const todayC=calls.filter(c=>c.startedAt?.startsWith(today()));
  const avgDur=connCalls.length?Math.round(connCalls.reduce((s,c)=>s+c.duration,0)/connCalls.length):0;
  const filtered=[...calls].filter(c=>!search||[c.contactName,c.phone,c.dealName,c.notes].some(v=>(v||"").toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
      {[{l:"Anrufe gesamt",v:calls.length,i:"📞",c:T.brandPrimary,bg:T.infoBg,sub:`${todayC.length} heute`},{l:"Verbunden",v:connCalls.length,i:"✅",c:T.success,bg:T.successBg,sub:`${connRate}% Quote`},{l:"Gesprächsminuten",v:`${totalMin} Min.`,i:"⏱️",c:T.purple,bg:T.purpleBg,sub:`Ø ${fmtSec(avgDur)} / Gespräch`},{l:"Keine Antwort",v:calls.filter(c=>c.outcome==="no_answer").length,i:"📵",c:T.warning,bg:T.warningBg,sub:"Rückruf empfohlen"}].map(k=><div key={k.l} style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,padding:"13px 15px",boxShadow:T.shadowSm,display:"flex",gap:11}}><div style={{width:40,height:40,borderRadius:T.radius,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{k.i}</div><div><div style={{fontSize:20,fontWeight:900,color:k.c,fontFamily:ff,lineHeight:1}}>{k.v}</div><div style={{fontSize:12,color:T.text,marginTop:2,fontFamily:ff}}>{k.l}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{k.sub}</div></div></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
      <SCard title="Alle Anrufe" icon="📋">
        <div style={{position:"relative",marginBottom:12}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Anrufe suchen…" style={{width:"100%",background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"7px 12px 7px 30px",fontSize:13,fontFamily:ff,outline:"none",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=T.borderFocus} onBlur={e=>e.target.style.borderColor=T.border}/></div>
        <CallList calls={filtered}/>
      </SCard>
      <div>
        <SCard title="Schnellwahl" icon="⚡">{contacts.filter(c=>c.phone||c.mobile).map(c=>{const lastCall=calls.filter(x=>x.contactId===c.id).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt))[0];return <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}><Avatar name={`${c.firstName} ${c.lastName}`} size={28}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:ff}}>{c.firstName} {c.lastName}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{c.mobile||c.phone}</div>{lastCall&&<div style={{fontSize:10,color:T.textLight,fontFamily:ff}}>{fmtDT(lastCall.startedAt)}</div>}</div><CallButton contact={c} onCallStart={onCallStart} small/></div>;})}
        </SCard>
        {calls.filter(c=>c.outcome==="no_answer").length>0&&<SCard title="📵 Rückruf erforderlich" icon="">{calls.filter(c=>c.outcome==="no_answer").slice(0,5).map(c=><div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}><div><div style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:ff}}>{c.contactName}</div><div style={{fontSize:10,color:T.textMuted,fontFamily:ff}}>{fmtDT(c.startedAt)}</div></div><CallButton contact={{id:c.contactId,firstName:c.contactName.split(" ")[0],lastName:c.contactName.split(" ").slice(1).join(" "),phone:c.phone,mobile:c.phone}} onCallStart={onCallStart} small/></div>)}</SCard>}
      </div>
    </div>
  </div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({deals,tasks,contacts,calls,onCallStart}){
  const active=deals.filter(d=>!["won","lost","aftersales","gu_won","gu_lost"].includes(d.stage));
  const won=deals.filter(d=>["won","aftersales","gu_won"].includes(d.stage));
  const pipeline=active.reduce((s,d)=>s+(isGU(d.type)?(d.guVolumen||0):(d.askPrice||0)),0);
  const provision=won.reduce((s,d)=>s+(isGU(d.type)?Math.round((d.guVolumen||0)*(d.commission||7)/100):((d.agreedPrice||d.askPrice||0)*(d.commission||0)/100)),0);
  const openT=tasks.filter(t=>t.status!=="Completed");
  const overdueT=openT.filter(t=>t.due<today()).length;
  const todayCalls=calls.filter(c=>c.startedAt?.startsWith(today())).length;
  const guDeals=deals.filter(d=>isGU(d.type)&&!["gu_won","gu_lost"].includes(d.stage));

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    {(()=>{const issues=contacts.filter(c=>{const s=dsgvoStatus(c);return s.status==="fehlt"||s.status==="abgelaufen"||s.status==="bald";});if(!issues.length)return null;return <div style={{background:"#FEF8E8",border:"1px solid #DD7A0155",borderRadius:T.radius,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:12}}><span style={{fontSize:20,flexShrink:0}}>⚠️</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.warning,fontFamily:ff,marginBottom:5}}>DSGVO-Handlungsbedarf – {issues.length} Kontakt{issues.length!==1?"e":""}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{issues.map(c=>{const st=dsgvoStatus(c);return <span key={c.id} style={{fontSize:11,padding:"2px 9px",borderRadius:99,background:st.color+"15",color:st.color,fontWeight:600,border:`1px solid ${st.color}33`}}>{st.icon} {c.firstName} {c.lastName} – {st.label}</span>;})}</div></div></div>;})()}

    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
      {[{l:"Aktive Deals",v:active.length,i:"🏗️",c:T.brandPrimary,bg:T.infoBg,sub:`${deals.filter(d=>d.stage==="notar").length} beim Notar`},{l:"Pipeline",v:fmtM(pipeline),i:"📊",c:T.brandPrimary,bg:T.infoBg,sub:`${deals.length} Deals gesamt`},{l:"Provision",v:fmtM(provision),i:"💰",c:T.success,bg:T.successBg,sub:`${won.length} gewonnen`},{l:"Offene Tasks",v:openT.length,i:"☑️",c:overdueT?T.error:T.warning,bg:overdueT?T.errorBg:T.warningBg,sub:overdueT?`⚠️ ${overdueT} überfällig`:"Alles OK ✓"},{l:"Anrufe heute",v:todayCalls,i:"📞",c:T.teal,bg:T.tealBg,sub:`${calls.length} gesamt`}].map(k=><div key={k.l} style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,padding:"13px 15px",boxShadow:T.shadowSm,display:"flex",gap:11,alignItems:"flex-start"}}><div style={{width:40,height:40,borderRadius:T.radius,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{k.i}</div><div><div style={{fontSize:20,fontWeight:900,color:k.c,fontFamily:ff,lineHeight:1.1}}>{k.v}</div><div style={{fontSize:12,color:T.text,marginTop:2,fontFamily:ff}}>{k.l}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff,marginTop:1}}>{k.sub}</div></div></div>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
      <SCard title="Grenford Pipeline" icon="📊">
        {STAGES.filter(s=>!["won","lost","aftersales"].includes(s.key)).map(s=>{
          const ds=deals.filter(d=>d.stage===s.key),vol=ds.reduce((a,d)=>a+(d.askPrice||0),0);
          const maxV=Math.max(...STAGES.filter(x=>!["won","lost","aftersales"].includes(x.key)).map(x=>deals.filter(d=>d.stage===x.key).reduce((a,d)=>a+(d.askPrice||0),0)),1);
          if(!vol&&!ds.length)return null;
          return <div key={s.key} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:T.text,fontFamily:ff}}>{s.label}</span><div style={{display:"flex",gap:12}}><span style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{ds.length} Deals</span><span style={{fontSize:12,fontWeight:700,color:s.color,fontFamily:ff,minWidth:56,textAlign:"right"}}>{vol>0?fmtM(vol):"—"}</span></div></div><div style={{height:5,background:T.bgApp,borderRadius:3,border:`1px solid ${T.border}`}}><div style={{width:`${(vol/maxV)*100}%`,height:"100%",background:s.color,borderRadius:3,transition:"width .5s"}}/></div></div>;
        }).filter(Boolean)}
      </SCard>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <SCard title="📞 Letzte Anrufe" icon="">
          {[...calls].sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).slice(0,4).map(c=>{const out=OUTCOMES[c.outcome]||OUTCOMES.connected;return <div key={c.id} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}><span style={{fontSize:13}}>{c.direction==="inbound"?"📲":"📞"}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:ff,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.contactName}</div><div style={{fontSize:10,color:T.textMuted,fontFamily:ff}}>{fmtDT(c.startedAt)}</div></div><span style={{fontSize:10,color:out.color,fontWeight:700,whiteSpace:"nowrap"}}>{out.icon} {fmtSec(c.duration)}</span></div>;})}
          {calls.length===0&&<div style={{fontSize:13,color:T.textMuted,fontFamily:ff}}>Noch keine Anrufe.</div>}
        </SCard>
        <SCard title="⚡ Schnellwahl" icon="">
          {contacts.filter(c=>c.phone||c.mobile).slice(0,4).map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}><Avatar name={`${c.firstName} ${c.lastName}`} size={26}/><div style={{flex:1,fontSize:12,fontFamily:ff,color:T.text,fontWeight:600}}>{c.firstName} {c.lastName}</div><CallButton contact={c} onCallStart={onCallStart} small/></div>)}
        </SCard>
      </div>
    </div>

    {guDeals.length>0&&<SCard title="👷 GU Vermittlung – Offene Aufträge & Rechnungen" icon="">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {guDeals.map(d=>{const typ=DEAL_TYPES.find(t=>t.key===d.type)||DEAL_TYPES[0];const stg=GU_STAGES.find(s=>s.key===d.stage)||GU_STAGES[0];const prov=Math.round((d.guVolumen||0)*(d.commission||7)/100);return <div key={d.id} style={{background:T.bgApp,borderRadius:T.radius,border:`1px solid ${T.border}`,padding:"12px 14px"}}><div style={{fontSize:11,color:typ.color,fontWeight:700,fontFamily:ff,marginBottom:3}}>{typ.icon} {typ.label}</div><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff,marginBottom:3}}>{d.name}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff,marginBottom:6}}>{d.guPartnerName||"—"}</div><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}><Pill label={stg.short} color={stg.color} bg={stg.bg}/><span style={{fontSize:12,fontWeight:700,color:T.success,fontFamily:ff}}>{fmtM(prov)}</span></div><div style={{display:"flex",gap:5}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:99,fontFamily:ff,fontWeight:700,background:d.invoiceA?.paid?"#D6F0DE":T.warningBg,color:d.invoiceA?.paid?"#1A7F3C":T.warning}}>RE 6a {d.invoiceA?.paid?"✓":"offen"}</span><span style={{fontSize:10,padding:"2px 7px",borderRadius:99,fontFamily:ff,fontWeight:700,background:d.invoiceB?.paid?"#D6F0DE":T.warningBg,color:d.invoiceB?.paid?"#1A7F3C":T.warning}}>RE 6b {d.invoiceB?.paid?"✓":"offen"}</span></div></div>;})}
      </div>
    </SCard>}
  </div>;
}


// ─── ANALYTICS (simplified, bug-fixed) ────────────────────────────────────────
const aff="'IBM Plex Sans',sans-serif";const afm="'IBM Plex Mono',monospace";
const AC={bg:"#F8F9FC",card:"#FFFFFF",border:"#E2E8F0",text:"#1E293B",textMid:"#475569",textLight:"#94A3B8",blue:"#2563EB",blueDim:"#EFF6FF",teal:"#0D9488",tealDim:"#F0FDFA",green:"#16A34A",greenDim:"#F0FDF4",amber:"#D97706",amberDim:"#FFFBEB",red:"#DC2626",redDim:"#FEF2F2",purple:"#7C3AED",purpleDim:"#F5F3FF",shadow:"0 1px 3px rgba(0,0,0,.08)",shadowMd:"0 4px 6px rgba(0,0,0,.07)"};
// FIX 1: AnalyticsCard alias (was undefined in report components)
const AnalyticsCard=({title,sub,children,span})=><div style={{background:AC.card,borderRadius:12,border:`1px solid ${AC.border}`,boxShadow:AC.shadow,overflow:"hidden",gridColumn:span?`span ${span}`:"auto"}}><div style={{padding:"16px 20px",borderBottom:`1px solid ${AC.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:14,fontWeight:600,color:AC.text,fontFamily:aff}}>{title}</div>{sub&&<div style={{fontSize:11,color:AC.textLight,marginTop:2}}>{sub}</div>}</div></div><div style={{padding:"16px 12px"}}>{children}</div></div>;
// FIX 2: TYPE_META alias
const TYPE_META={b2b_offmarket:{label:"B2B Off-Market",color:"#2563EB",icon:"🏢"},b2c_offmarket:{label:"B2C Off-Market",color:"#D97706",icon:"🏠"},sanierung:{label:"Sanierungsber.",color:"#16A34A",icon:"🔨"},gu_b2c:{label:"GU B2C",color:"#7C3AED",icon:"👷"},gu_b2b:{label:"GU B2B",color:"#9333EA",icon:"🏗️"}};
const MONTHS=["2024-10","2024-11","2024-12","2025-01","2025-02","2025-03"];
const MONTH_LABELS={"2024-10":"Okt 24","2024-11":"Nov 24","2024-12":"Dez 24","2025-01":"Jan 25","2025-02":"Feb 25","2025-03":"Mär 25"};
const CHART_PALETTE=["#2563EB","#0D9488","#D97706","#7C3AED","#DC2626","#16A34A"];
const GU_STAGES_META=[{k:"gu_akquise",l:"Akquise",c:AC.blue},{k:"gu_beratung",l:"Beratung",c:AC.blue},{k:"gu_angebot",l:"Angebot",c:AC.amber},{k:"gu_termin",l:"Vor-Ort",c:AC.purple},{k:"gu_unterschrift",l:"Unterschrift",c:AC.teal},{k:"gu_re6a",l:"RE 6a",c:AC.green},{k:"gu_re6b",l:"RE 6b",c:AC.green},{k:"gu_won",l:"Fertig",c:AC.green}];

const ANALYTICS_CALL_DATA=[{month:"Okt 24",count:4,connected:3,duration:580},{month:"Nov 24",count:6,connected:5,duration:920},{month:"Dez 24",count:5,connected:4,duration:710},{month:"Jan 25",count:9,connected:7,duration:1340},{month:"Feb 25",count:11,connected:9,duration:1820},{month:"Mär 25",count:13,connected:10,duration:2100}];

const KPI=({label,value,sub,icon,color,bg,delta})=><div style={{background:AC.card,borderRadius:12,border:`1px solid ${AC.border}`,padding:"18px 20px",boxShadow:AC.shadow,display:"flex",flexDirection:"column",gap:8}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}><div style={{width:38,height:38,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{icon}</div>{delta!=null&&<div style={{fontSize:11,fontWeight:600,color:delta>=0?AC.green:AC.red,background:delta>=0?AC.greenDim:AC.redDim,padding:"3px 8px",borderRadius:99}}>{delta>=0?"▲":"▼"} {Math.abs(delta)}%</div>}</div><div><div style={{fontSize:24,fontWeight:700,color:color,fontFamily:afm,lineHeight:1.1}}>{value}</div><div style={{fontSize:12,color:AC.textMid,marginTop:3,fontFamily:aff}}>{label}</div>{sub&&<div style={{fontSize:11,color:AC.textLight,marginTop:2}}>{sub}</div>}</div></div>;

const CTip=({active,payload,label,unit=""})=>{if(!active||!payload?.length)return null;return <div style={{background:"#fff",border:`1px solid ${AC.border}`,borderRadius:8,padding:"10px 14px",boxShadow:AC.shadowMd,fontFamily:aff}}>{label&&<div style={{fontSize:11,fontWeight:600,color:AC.textMid,marginBottom:6}}>{label}</div>}{payload.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><div style={{width:8,height:8,borderRadius:2,background:p.color||p.fill,flexShrink:0}}/><span style={{fontSize:12,color:AC.textMid}}>{p.name}:</span><span style={{fontSize:12,fontWeight:600,color:AC.text,fontFamily:afm}}>{p.value}{unit}</span></div>)}</div>;};

function OverviewReport({deals}){
  const active=deals.filter(d=>!["won","lost","aftersales","gu_won","gu_lost"].includes(d.stage));
  const won=deals.filter(d=>["won","aftersales","gu_won"].includes(d.stage));
  const pipeline=active.reduce((s,d)=>s+getVolN(d),0);
  const provision=won.reduce((s,d)=>s+getProvN(d),0);
  const weighted=active.reduce((s,d)=>s+getVolN(d)*(d.probability||0)/100,0);
  const byType=Object.entries(TYPE_META).map(([k,v])=>({name:v.label,color:v.color,icon:v.icon,value:r2(deals.filter(d=>d.type===k).reduce((s,d)=>s+getVolN(d),0)/1e6),count:deals.filter(d=>d.type===k).length})).filter(d=>d.value>0);
  const stageGroups=[{label:"Frühe Phase",stages:["akquise","teaser","rueckmeldung"],color:AC.blue},{label:"Qualifiziert",stages:["nda","dr1","loi","dr2","gu_akquise","gu_beratung","gu_angebot"],color:AC.amber},{label:"Fortgeschritten",stages:["dd","verhandlung","gu_termin","gu_unterschrift"],color:AC.purple},{label:"Abschluss",stages:["kaufvertrag","notar","gu_re6a","gu_re6b"],color:AC.teal},{label:"Gewonnen",stages:["won","aftersales","gu_won"],color:AC.green}].map(g=>({...g,count:deals.filter(d=>g.stages.includes(d.stage)).length,vol:r2(deals.filter(d=>g.stages.includes(d.stage)).reduce((s,d)=>s+getVolN(d),0)/1e6)}));
  const maxCount=Math.max(...stageGroups.map(g=>g.count),1);
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}><KPI label="Pipeline gesamt" value={fmtM(pipeline)} icon="📊" color={AC.blue} bg={AC.blueDim} sub={`${active.length} aktive Deals`} delta={12}/><KPI label="Gew. Pipeline" value={fmtM(weighted)} icon="🎯" color={AC.purple} bg={AC.purpleDim} sub="Wahrscheinl.-adj."/><KPI label="Provision erzielt" value={fmtM(provision)} icon="💰" color={AC.green} bg={AC.greenDim} sub={`${won.length} Deals gewonnen`} delta={22}/><KPI label="Aktive Deals" value={active.length} icon="🏗️" color={AC.teal} bg={AC.tealDim} sub={`${deals.length} gesamt`}/><KPI label="Conversion Rate" value={`${deals.length?Math.round(won.length/deals.length*100):0}%`} icon="📈" color={AC.amber} bg={AC.amberDim} sub="Akquise → Gewonnen"/></div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
      <AnalyticsCard title="Volumen nach Deal-Typ"><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={byType} cx="50%" cy="44%" outerRadius={88} innerRadius={44} dataKey="value" labelLine={false}>{byType.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip content={<CTip unit="M"/>}/><Legend wrapperStyle={{fontSize:11,fontFamily:aff}}/></PieChart></ResponsiveContainer></AnalyticsCard>
      <AnalyticsCard title="Deal-Funnel"><div style={{display:"flex",flexDirection:"column",gap:8,padding:"4px 0"}}>{stageGroups.map(g=><div key={g.label} style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:11,color:AC.textMid,fontFamily:aff,width:100,flexShrink:0}}>{g.label}</div><div style={{flex:1,height:20,background:AC.border,borderRadius:4,overflow:"hidden"}}><div style={{width:`${Math.max(Math.round(g.count/maxCount*100),g.count?5:0)}%`,height:"100%",background:g.color,borderRadius:4,transition:"width .5s",display:"flex",alignItems:"center",justifyContent:"center"}}>{g.count>0&&<span style={{fontSize:10,fontWeight:700,color:"#fff"}}>{g.count}</span>}</div></div><div style={{fontSize:11,fontFamily:afm,color:g.color,fontWeight:600,width:42,textAlign:"right"}}>{g.vol>0?`€${g.vol}M`:"—"}</div></div>)}</div></AnalyticsCard>
    </div>
  </div>;
}

function PipelineReport({deals}){
  const active=deals.filter(d=>!["won","lost","gu_won","gu_lost"].includes(d.stage));
  const wskDist=[{range:"0–20%",v:active.filter(d=>(d.probability||0)<=20).length,fill:AC.red},{range:"21–50%",v:active.filter(d=>(d.probability||0)>20&&(d.probability||0)<=50).length,fill:AC.amber},{range:"51–80%",v:active.filter(d=>(d.probability||0)>50&&(d.probability||0)<=80).length,fill:AC.teal},{range:"81–100%",v:active.filter(d=>(d.probability||0)>80).length,fill:AC.green}];
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}><KPI label="Aktive Pipeline" value={fmtM(active.reduce((s,d)=>s+getVolN(d),0))} icon="📊" color={AC.blue} bg={AC.blueDim} sub={`${active.length} Deals`}/><KPI label="Gewichtete Pipeline" value={fmtM(active.reduce((s,d)=>s+getVolN(d)*(d.probability||0)/100,0))} icon="🎯" color={AC.purple} bg={AC.purpleDim} sub="Ø WSK-justiert"/><KPI label="Ø Wahrscheinlichkeit" value={`${active.length?Math.round(active.reduce((s,d)=>s+(d.probability||0),0)/active.length):0}%`} icon="📈" color={AC.amber} bg={AC.amberDim} sub="Aktive Deals"/></div>
    <AnalyticsCard title="Abschluss-Wahrscheinlichkeit – Verteilung" sub="Aktive Deals"><ResponsiveContainer width="100%" height={200}><BarChart data={wskDist} margin={{top:4,right:8,bottom:0,left:0}}><CartesianGrid strokeDasharray="3 3" stroke={AC.border} vertical={false}/><XAxis dataKey="range" tick={{fontSize:11,fill:AC.textLight,fontFamily:aff}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:AC.textLight,fontFamily:afm}} axisLine={false} tickLine={false} allowDecimals={false}/><Tooltip content={<CTip/>}/><Bar dataKey="v" name="Deals" radius={[4,4,0,0]} maxBarSize={60}>{wskDist.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar></BarChart></ResponsiveContainer></AnalyticsCard>
    <AnalyticsCard title="Aktive Deals nach Wahrscheinlichkeit sortiert"><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Deal","Typ","Volumen","Provision","WSK","Abschluss"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:AC.textMid,fontFamily:aff,background:AC.bg,borderBottom:`1px solid ${AC.border}`}}>{h}</th>)}</tr></thead><tbody>{[...active].sort((a,b)=>(b.probability||0)-(a.probability||0)).map((d,i)=>{const typ=TYPE_META[d.type]||{label:d.type,color:AC.blue,icon:"🏢"};const prob=d.probability||0;return <tr key={d.id} style={{borderBottom:`1px solid ${AC.border}`,background:i%2===0?"#fff":AC.bg}}><td style={{padding:"9px 12px",fontSize:13,color:AC.text,fontFamily:aff}}>{d.name}</td><td style={{padding:"9px 12px"}}><span style={{fontSize:11,fontWeight:600,color:typ.color,background:typ.color+"15",padding:"2px 8px",borderRadius:99}}>{typ.icon} {typ.label}</span></td><td style={{padding:"9px 12px",fontSize:12,fontWeight:600,color:AC.blue,fontFamily:afm}}>{fmtM(getVolN(d))}</td><td style={{padding:"9px 12px",fontSize:12,fontWeight:600,color:AC.green,fontFamily:afm}}>{fmtM(getProvN(d))}</td><td style={{padding:"9px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:5,background:AC.border,borderRadius:3,minWidth:50}}><div style={{width:`${prob}%`,height:"100%",background:prob>=70?AC.green:prob>=40?AC.amber:AC.red,borderRadius:3}}/></div><span style={{fontSize:11,fontFamily:afm,fontWeight:600,color:prob>=70?AC.green:prob>=40?AC.amber:AC.red,minWidth:28}}>{prob}%</span></div></td><td style={{padding:"9px 12px",fontSize:12,color:AC.textMid,fontFamily:afm}}>{d.closeDate||"—"}</td></tr>;})}</tbody></table></AnalyticsCard>
  </div>;
}

function RevenueReport({deals}){
  const won=deals.filter(d=>["won","aftersales","gu_won","gu_re6b"].includes(d.stage));
  const totalProv=won.reduce((s,d)=>s+getProvN(d),0);
  const provByType=Object.entries(TYPE_META).map(([k,v])=>({name:v.label,color:v.color,prov:r2(deals.filter(d=>d.type===k&&["won","aftersales","gu_won","gu_re6b"].includes(d.stage)).reduce((s,d)=>s+getProvN(d),0)/1000),count:deals.filter(d=>d.type===k&&["won","aftersales","gu_won","gu_re6b"].includes(d.stage)).length})).filter(d=>d.prov>0);
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}><KPI label="Provision gesamt" value={fmtM(totalProv)} icon="💰" color={AC.green} bg={AC.greenDim} sub={`${won.length} Deals gewonnen`} delta={18}/><KPI label="Ø Provision / Deal" value={fmtM(won.length?Math.round(totalProv/won.length):0)} icon="📊" color={AC.blue} bg={AC.blueDim} sub="Abgeschlossene Deals"/><KPI label="Erwartete Provision" value={fmtM(deals.filter(d=>!["won","lost","gu_won","gu_lost"].includes(d.stage)).reduce((s,d)=>s+getProvN(d)*(d.probability||0)/100,0))} icon="🎯" color={AC.amber} bg={AC.amberDim} sub="Gewichtete Pipeline"/></div>
    {provByType.length>0&&<AnalyticsCard title="Provision nach Deal-Typ" sub="T€"><ResponsiveContainer width="100%" height={200}><BarChart data={provByType} layout="vertical" margin={{top:0,right:20,bottom:0,left:0}}><CartesianGrid strokeDasharray="3 3" stroke={AC.border} horizontal={false}/><XAxis type="number" tick={{fontSize:10,fill:AC.textLight,fontFamily:afm}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v}T`}/><YAxis type="category" dataKey="name" tick={{fontSize:10,fill:AC.textMid,fontFamily:aff}} axisLine={false} tickLine={false} width={80}/><Tooltip content={<CTip unit="T€"/>}/><Bar dataKey="prov" name="Provision T€" radius={[0,4,4,0]} maxBarSize={22}>{provByType.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer></AnalyticsCard>}
  </div>;
}

// FIX 3: GUReport uses guVolumen (not guVol)
function GUReport({deals}){
  const guDeals=deals.filter(d=>isGU(d.type));
  const totalVol=guDeals.reduce((s,d)=>s+(d.guVolumen||0),0); // FIXED: guVolumen
  const totalProv=guDeals.reduce((s,d)=>s+Math.round((d.guVolumen||0)*(d.commission||7)/100),0); // FIXED
  const re6aPaid=guDeals.filter(d=>d.invoiceA?.paid).reduce((s,d)=>s+(d.invoiceA?.amount||0),0);
  const re6bPaid=guDeals.filter(d=>d.invoiceB?.paid).reduce((s,d)=>s+(d.invoiceB?.amount||0),0);
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}><KPI label="GU-Auftragsvolumen" value={fmtM(totalVol)} icon="🏗️" color={AC.purple} bg={AC.purpleDim} sub={`${guDeals.length} Aufträge`}/><KPI label="GU-Provision ges." value={fmtM(totalProv)} icon="💰" color={AC.green} bg={AC.greenDim} sub={`${guDeals.filter(d=>d.type==="gu_b2c").length} B2C · ${guDeals.filter(d=>d.type==="gu_b2b").length} B2B`}/><KPI label="RE 6a bezahlt" value={fmtM(re6aPaid)} icon="📄" color={AC.teal} bg={AC.tealDim} sub={`${guDeals.filter(d=>d.invoiceA?.paid).length} von ${guDeals.length}`}/><KPI label="RE 6b bezahlt" value={fmtM(re6bPaid)} icon="🏗️" color={AC.blue} bg={AC.blueDim} sub={`${guDeals.filter(d=>d.invoiceB?.paid).length} von ${guDeals.length}`}/></div>
    <AnalyticsCard title="Rechnungsstatus je GU-Auftrag"><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Auftrag","Typ","GU-Partner","Volumen","Prov.","RE 6a","RE 6b"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:AC.textMid,fontFamily:aff,background:AC.bg,borderBottom:`1px solid ${AC.border}`}}>{h}</th>)}</tr></thead><tbody>{guDeals.map((d,i)=>{const typ=TYPE_META[d.type]||{label:d.type,color:AC.purple,icon:"👷"};const prov=Math.round((d.guVolumen||0)*(d.commission||7)/100); // FIXED: guVolumen
  return <tr key={d.id} style={{borderBottom:`1px solid ${AC.border}`,background:i%2===0?"#fff":AC.bg}}><td style={{padding:"9px 12px",fontSize:13,color:AC.text,fontFamily:aff}}>{d.name}</td><td style={{padding:"9px 12px"}}><span style={{fontSize:11,fontWeight:600,color:typ.color,background:typ.color+"15",padding:"2px 8px",borderRadius:99}}>{typ.icon} {typ.label}</span></td><td style={{padding:"9px 12px",fontSize:12,color:AC.textMid,fontFamily:aff}}>{d.guPartnerName||"—"}</td><td style={{padding:"9px 12px",fontSize:12,fontWeight:600,color:AC.blue,fontFamily:afm}}>{fmtM(d.guVolumen||0)}</td><td style={{padding:"9px 12px",fontSize:12,fontWeight:600,color:AC.green,fontFamily:afm}}>{fmtM(prov)}</td><td style={{padding:"9px 12px"}}><span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:99,background:d.invoiceA?.paid?"#D1FAE5":AC.amberDim,color:d.invoiceA?.paid?AC.green:AC.amber}}>{d.invoiceA?.paid?`✓ ${fmt(d.invoiceA.amount||0)}`:"Offen"}</span></td><td style={{padding:"9px 12px"}}><span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:99,background:d.invoiceB?.paid?"#D1FAE5":AC.bg,color:d.invoiceB?.paid?AC.green:AC.textLight}}>{d.invoiceB?.paid?`✓ ${fmt(d.invoiceB.amount||0)}`:"Offen"}</span></td></tr>;})}
  </tbody></table></AnalyticsCard>
  </div>;
}

// FIX 4: ActivityReport receives calls as prop
function ActivityReport({calls}){
  const callData=calls&&calls.length>0
    ? (() => {
        const grouped={};
        calls.forEach(c=>{const m=c.startedAt?.slice(0,7)||"";if(!grouped[m])grouped[m]={month:m,count:0,connected:0,duration:0};grouped[m].count++;if(c.outcome==="connected")grouped[m].connected++;grouped[m].duration+=c.duration||0;});
        return Object.values(grouped).sort((a,b)=>a.month.localeCompare(b.month)).map(g=>({month:g.month.slice(0,7),count:g.count,connected:g.connected,minutes:Math.round(g.duration/60),rate:Math.round(g.connected/g.count*100)}));
      })()
    : ANALYTICS_CALL_DATA;

  const totalCalls=callData.reduce((s,c)=>s+c.count,0);
  const totalConn=callData.reduce((s,c)=>s+c.connected,0);
  const connRate=totalCalls?Math.round(totalConn/totalCalls*100):0;

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}><KPI label="Anrufe gesamt" value={totalCalls} icon="📞" color={AC.blue} bg={AC.blueDim} sub="Alle Zeiträume" delta={15}/><KPI label="Verbindungsrate" value={`${connRate}%`} icon="✅" color={AC.green} bg={AC.greenDim} sub={`${totalConn} verbunden`}/><KPI label="Ø Gespräch" value={`${callData.length?Math.round(callData.reduce((s,c)=>s+(c.minutes||0),0)/callData.length):0} Min.`} icon="⏱️" color={AC.purple} bg={AC.purpleDim} sub="Pro Monat"/></div>
    <AnalyticsCard title="Anruf-Trend" sub="Anrufe · Verbunden"><ResponsiveContainer width="100%" height={240}><BarChart data={callData} margin={{top:4,right:12,bottom:0,left:0}}><CartesianGrid strokeDasharray="3 3" stroke={AC.border} vertical={false}/><XAxis dataKey="month" tick={{fontSize:11,fill:AC.textLight,fontFamily:aff}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:AC.textLight,fontFamily:afm}} axisLine={false} tickLine={false} allowDecimals={false}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11,fontFamily:aff}}/><Bar dataKey="count" name="Anrufe" fill={AC.blue} opacity={.7} radius={[4,4,0,0]} maxBarSize={24}/><Bar dataKey="connected" name="Verbunden" fill={AC.green} opacity={.8} radius={[4,4,0,0]} maxBarSize={24}/></BarChart></ResponsiveContainer></AnalyticsCard>
  </div>;
}

function BrokerReport({deals}){
  const owners=[...new Set(deals.map(d=>d.owner).filter(Boolean))];
  const brokerData=owners.map(o=>{const myDeals=deals.filter(d=>d.owner===o);const active=myDeals.filter(d=>!["won","lost","gu_won","gu_lost"].includes(d.stage));const won=myDeals.filter(d=>["won","aftersales","gu_won"].includes(d.stage));return{owner:o,short:o.split(" ").map((n,i)=>i===0?n:n.slice(0,1)+".").join(" "),deals:myDeals.length,active:active.length,pipeline:r2(active.reduce((s,d)=>s+getVolN(d),0)/1e6),won:won.length,prov:r2(won.reduce((s,d)=>s+getProvN(d),0)/1000),avgWSK:active.length?Math.round(active.reduce((s,d)=>s+(d.probability||0),0)/active.length):0,conversion:myDeals.length?Math.round(won.length/myDeals.length*100):0};});
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
      {brokerData.map((b,i)=><div key={b.owner} style={{background:AC.card,borderRadius:12,border:`1px solid ${AC.border}`,padding:"20px",boxShadow:AC.shadow}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}><div style={{width:44,height:44,borderRadius:"50%",background:CHART_PALETTE[i%CHART_PALETTE.length]+"22",border:`2px solid ${CHART_PALETTE[i%CHART_PALETTE.length]}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:CHART_PALETTE[i%CHART_PALETTE.length],fontFamily:afm}}>{b.owner.split(" ").map(n=>n[0]).join("")}</div><div><div style={{fontSize:15,fontWeight:700,color:AC.text,fontFamily:aff}}>{b.owner}</div><div style={{fontSize:11,color:AC.textLight}}>{b.deals} Deals gesamt</div></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["Aktiv",b.active,CHART_PALETTE[i%CHART_PALETTE.length]],["Pipeline",`€${b.pipeline}M`,AC.blue],["Gewonnen",b.won,AC.green],["Provision",`€${b.prov}T`,AC.green],["Ø WSK",`${b.avgWSK}%`,b.avgWSK>=60?AC.green:AC.amber],["Conversion",`${b.conversion}%`,b.conversion>=30?AC.green:AC.amber]].map(([l,v,c])=><div key={l} style={{background:AC.bg,borderRadius:8,padding:"9px 12px"}}><div style={{fontSize:10,color:AC.textLight,fontFamily:aff,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{l}</div><div style={{fontSize:16,fontWeight:700,color:c,fontFamily:afm}}>{v}</div></div>)}</div></div>)}
    </div>
  </div>;
}

// FIX 5: Analytics passes calls to ActivityReport
function Analytics({deals,calls}){
  const[report,setReport]=useState("overview");
  const[filters,setFilters]=useState({year:"all",type:"all",owner:"all"});
  const[sidebarOpen,setSidebar]=useState(true);
  const handleFilter=(key,val)=>setFilters(p=>({...p,[key]:val}));
  const filteredDeals=useMemo(()=>(deals||[]).filter(d=>{if(filters.year!=="all"&&!(d.closeDate||"").startsWith(filters.year))return false;if(filters.type!=="all"&&d.type!==filters.type)return false;if(filters.owner!=="all"&&d.owner!==filters.owner)return false;return true;}),[deals,filters]);
  const REPORTS=[{key:"overview",label:"Übersicht",icon:"◉"},{key:"pipeline",label:"Pipeline",icon:"⧖"},{key:"revenue",label:"Provision",icon:"€"},{key:"gu",label:"GU Vermittlung",icon:"👷"},{key:"activity",label:"Aktivitäten",icon:"📞"},{key:"broker",label:"Broker",icon:"👤"}];
  const cur=REPORTS.find(r=>r.key===report);

  return <div style={{display:"flex",height:"calc(100vh - 100px)",fontFamily:aff,background:AC.bg,overflow:"hidden",borderRadius:T.radius,border:`1px solid ${T.border}`}}>
    {sidebarOpen&&<div style={{width:200,background:"#0F172A",display:"flex",flexDirection:"column",flexShrink:0,borderRight:"1px solid rgba(255,255,255,.06)"}}>
      <div style={{padding:"18px 14px 14px",borderBottom:"1px solid rgba(255,255,255,.08)"}}><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>📊 Analytics</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>Grenford CRM</div></div>
      <nav style={{flex:1,padding:"10px 8px"}}>{REPORTS.map(r=><button key={r.key} onClick={()=>setReport(r.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,border:"none",background:report===r.key?"rgba(59,130,246,.25)":"transparent",color:report===r.key?"#93C5FD":"rgba(255,255,255,.6)",fontSize:13,fontWeight:report===r.key?600:400,cursor:"pointer",fontFamily:aff,marginBottom:2,textAlign:"left",borderLeft:report===r.key?"2px solid #3B82F6":"2px solid transparent"}}><span>{r.icon}</span>{r.label}</button>)}</nav>
      <div style={{padding:"10px 12px 14px",borderTop:"1px solid rgba(255,255,255,.08)"}}>{[["Deals",(deals||[]).length],["Gewonnen",(deals||[]).filter(d=>["won","gu_won"].includes(d.stage)).length],["Provision",fmtM((deals||[]).reduce((s,d)=>s+getProvN(d),0))]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{l}</span><span style={{fontSize:11,fontFamily:afm,fontWeight:600,color:"rgba(255,255,255,.8)"}}>{v}</span></div>)}</div>
    </div>}
    <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",borderBottom:`1px solid ${AC.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={()=>setSidebar(s=>!s)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${AC.border}`,background:"#fff",cursor:"pointer",fontSize:14,color:AC.textMid}}>☰</button><div><h1 style={{margin:0,fontSize:18,fontWeight:700,color:AC.text}}>{cur?.label}</h1><div style={{fontSize:11,color:AC.textLight,marginTop:1}}>{filteredDeals.length} Deals im Filter</div></div></div>
        <div style={{display:"flex",gap:8}}>{[["all","Gesamt"],["2025","2025"],["2024","2024"]].map(([v,l])=><button key={v} onClick={()=>handleFilter("year",v)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${filters.year===v?AC.blue:AC.border}`,background:filters.year===v?AC.blueDim:"#fff",color:filters.year===v?AC.blue:AC.textMid,fontSize:12,cursor:"pointer",fontFamily:aff}}>{l}</button>)}</div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
        {report==="overview"&&<OverviewReport deals={filteredDeals}/>}
        {report==="pipeline"&&<PipelineReport deals={filteredDeals}/>}
        {report==="revenue"&&<RevenueReport deals={filteredDeals}/>}
        {report==="gu"&&<GUReport deals={filteredDeals}/>}
        {/* FIX 4: calls prop passed through */}
        {report==="activity"&&<ActivityReport calls={calls}/>}
        {report==="broker"&&<BrokerReport deals={filteredDeals}/>}
      </div>
    </div>
  </div>;
}



// ─── COMPANIES (Bug-fixed: Tabs-Verschachtelung korrekt) ──────────────────────
const ANKAUF_EMPTY={assetKlassen:[],risikoprofile:[],dealFormen:[],ticketMin:"",ticketMax:"",renditeMin:"",renditeMax:"",laender:[],regionenDE:[],zustandPref:[],notizen:"",aktiv:false};

function AnkaufsprofilEditor({profil,onChange}){
  const p=profil||ANKAUF_EMPTY;
  const toggle=(key,val)=>{const arr=p[key]||[];onChange({...p,[key]:arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]});};
  const f=k=>v=>onChange({...p,[k]:v});
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:p.aktiv?T.successBg:T.bgApp,borderRadius:8,padding:"10px 14px",border:`1px solid ${p.aktiv?T.success:T.border}`}}>
      <div><div style={{fontSize:13,fontWeight:700,color:p.aktiv?T.success:T.text,fontFamily:ff}}>Ankaufsprofil {p.aktiv?"✅ Aktiv":"⚪ Inaktiv"}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>Für Investoren-Matching relevant</div></div>
      <button onClick={()=>f("aktiv")(!p.aktiv)} style={{padding:"6px 16px",borderRadius:6,border:`1px solid ${p.aktiv?T.success:T.border}`,background:p.aktiv?T.success:"#fff",color:p.aktiv?"#fff":T.text,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{p.aktiv?"Deaktivieren":"Aktivieren"}</button>
    </div>
    <div style={{background:"#fff",borderRadius:8,border:`1px solid ${T.border}`,padding:14}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8,fontFamily:ff}}>Asset-Klassen</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {ANKAUF_ASSET_KLASSEN.map(a=>{const sel=(p.assetKlassen||[]).includes(a.key);return <button key={a.key} onClick={()=>toggle("assetKlassen",a.key)} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${sel?T.brandPrimary:T.border}`,background:sel?T.brandLighter:"#fff",color:sel?T.brandPrimary:T.text,fontSize:12,fontWeight:sel?700:400,cursor:"pointer",fontFamily:ff}}>{a.icon} {a.label}</button>;})}
      </div>
    </div>
    <div style={{background:"#fff",borderRadius:8,border:`1px solid ${T.border}`,padding:14}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8,fontFamily:ff}}>Risikoprofil</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {ANKAUF_RISIKOPROFILE.map(r=>{const sel=(p.risikoprofile||[]).includes(r.key);return <button key={r.key} onClick={()=>toggle("risikoprofile",r.key)} title={r.desc} style={{padding:"5px 14px",borderRadius:99,border:`1.5px solid ${sel?r.color:T.border}`,background:sel?r.color+"18":"#fff",color:sel?r.color:T.text,fontSize:12,fontWeight:sel?700:400,cursor:"pointer",fontFamily:ff}}>{r.label}</button>;})}
      </div>
    </div>
    <div style={{background:"#fff",borderRadius:8,border:`1px solid ${T.border}`,padding:14}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8,fontFamily:ff}}>Deal-Formen</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {ANKAUF_DEAL_FORMEN.map(d=>{const sel=(p.dealFormen||[]).includes(d.key);return <button key={d.key} onClick={()=>toggle("dealFormen",d.key)} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${sel?T.purple:T.border}`,background:sel?T.purpleBg:"#fff",color:sel?T.purple:T.text,fontSize:12,fontWeight:sel?700:400,cursor:"pointer",fontFamily:ff}}>{d.label}</button>;})}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
      <SFInput label="Ticket min. €" value={p.ticketMin||""} onChange={f("ticketMin")} type="number" full placeholder="500000"/>
      <SFInput label="Ticket max. €" value={p.ticketMax||""} onChange={f("ticketMax")} type="number" full placeholder="50000000"/>
      <SFInput label="Rendite min. %" value={p.renditeMin||""} onChange={f("renditeMin")} type="number" full placeholder="4"/>
      <SFInput label="Rendite max. %" value={p.renditeMax||""} onChange={f("renditeMax")} type="number" full placeholder="15"/>
    </div>
    <div style={{background:"#fff",borderRadius:8,border:`1px solid ${T.border}`,padding:14}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8,fontFamily:ff}}>Regionen Deutschland</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {ANKAUF_REGIONEN_DE.map(r=>{const sel=(p.regionenDE||[]).includes(r);return <button key={r} onClick={()=>toggle("regionenDE",r)} style={{padding:"4px 11px",borderRadius:99,border:`1.5px solid ${sel?T.teal:T.border}`,background:sel?T.tealBg:"#fff",color:sel?T.teal:T.text,fontSize:11,fontWeight:sel?700:400,cursor:"pointer",fontFamily:ff}}>{r}</button>;})}
      </div>
    </div>
    <SFTA label="Investoren-Notizen" value={p.notizen||""} onChange={f("notizen")} rows={2} placeholder="Besonderheiten, Ausschlusskriterien, Kontaktpräferenzen…"/>
  </div>;
}

function InvestorenMatching({companies,deals}){
  const activeDeals=deals.filter(d=>!["won","lost","aftersales","gu_won","gu_lost"].includes(d.stage)&&!isGU(d.type));
  const investors=companies.filter(c=>c.ankaufsprofil?.aktiv&&["investor","family_office","pensionskasse"].includes(c.type));
  const matchScore=(inv,deal)=>{const p=inv.ankaufsprofil||{};let score=0,max=0;if(p.assetKlassen?.length){max+=30;const dt=deal.objType?.toLowerCase()||"";if(p.assetKlassen.some(a=>{const ak=ANKAUF_ASSET_KLASSEN.find(x=>x.key===a);return ak&&dt.includes(ak.label.toLowerCase().slice(0,4));}))score+=30;}if(p.ticketMin||p.ticketMax){max+=25;const vol=deal.askPrice||0;if((!p.ticketMin||vol>=p.ticketMin)&&(!p.ticketMax||vol<=p.ticketMax))score+=25;}if(p.regionenDE?.length){max+=20;if(p.regionenDE.includes("Bundesweit"))score+=20;}if(p.risikoprofile?.length){max+=15;score+=10;}max=Math.max(max,25);return max>0?Math.round(score/max*100):0;};
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{background:T.infoBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>🔍</span>
      <div><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>Investoren-Matching</div><div style={{fontSize:12,color:T.textMuted,fontFamily:ff}}>{investors.length} aktive Investorenprofile · {activeDeals.length} aktive Off-Market Deals</div></div>
    </div>
    {investors.length===0&&<div style={{padding:32,textAlign:"center",color:T.textMuted,fontFamily:ff}}><div style={{fontSize:32,marginBottom:10}}>👥</div><div style={{fontSize:14,fontWeight:700}}>Keine aktiven Ankaufsprofile</div><div style={{fontSize:12,marginTop:4}}>Aktiviere Ankaufsprofile im Unternehmens-Tab.</div></div>}
    {investors.map(inv=>{
      const matches=activeDeals.map(d=>({...d,score:matchScore(inv,d)})).filter(d=>d.score>=40).sort((a,b)=>b.score-a.score);
      return <div key={inv.id} style={{background:"#fff",borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden"}}>
        <div style={{background:T.brandMid,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💼</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:ff}}>{inv.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",fontFamily:ff}}>{(inv.ankaufsprofil?.assetKlassen||[]).map(k=>ANKAUF_ASSET_KLASSEN.find(a=>a.key===k)?.label).filter(Boolean).join(" · ")||"Kein Asset-Profil"}</div></div>
          <Badge color="#FFD966">{matches.length} Matches</Badge>
        </div>
        {matches.length===0?<div style={{padding:"16px",fontSize:12,color:T.textMuted,fontFamily:ff}}>Keine passenden Deals gefunden.</div>:
        <div style={{padding:"10px 14px"}}>{matches.map(d=><div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:ff}}>{d.name}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{d.objType} · {d.address?.split(",").pop()?.trim()||"—"}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:T.brandPrimary,fontFamily:ff}}>{fmtM(d.askPrice)}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{d.probability}% WSK</div></div>
          <div style={{width:38,height:38,borderRadius:"50%",background:d.score>=70?T.successBg:T.warningBg,border:`2px solid ${d.score>=70?T.success:T.warning}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:11,fontWeight:900,color:d.score>=70?T.success:T.warning,fontFamily:ff}}>{d.score}%</span></div>
        </div>)}</div>}
      </div>;
    })}
  </div>;
}

function Companies({companies,setCompanies,contacts,deals}){
  const[search,setSearch]=useState("");const[typeF,setTypeF]=useState("all");const[modal,setModal]=useState(null);const[form,setForm]=useState({name:"",type:"investor",street:"",city:"",country:"Deutschland",phone:"",email:"",website:"",notes:"",ankaufsprofil:ANKAUF_EMPTY});const[detail,setDetail]=useState(null);
  // BUG FIX: correct tab state (was nested inside wrong component scope)
  const[dtab,setDtab]=useState("daten");
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const filtered=companies.filter(c=>{if(typeF!=="all"&&c.type!==typeF)return false;if(search&&![c.name,c.city,c.email].some(v=>(v||"").toLowerCase().includes(search.toLowerCase())))return false;return true;});
  const save=()=>{const e={...form,id:modal==="add"?uid():modal,ankaufsprofil:form.ankaufsprofil||ANKAUF_EMPTY};setCompanies(modal==="add"?[...companies,e]:companies.map(c=>c.id===modal?e:c));setModal(null);};
  const activeAP=companies.filter(c=>c.ankaufsprofil?.aktiv).length;

  return <div>
    {/* DETAIL DRAWER */}
    {detail&&(()=>{
      const c=companies.find(x=>x.id===detail);if(!c)return null;
      const ct=COMPANY_TYPES.find(t=>t.key===c.type)||COMPANY_TYPES[0];
      const relContacts=contacts.filter(x=>x.companyId===c.id);
      const relDeals=deals.filter(d=>d.companyId===c.id||d.accountName===c.name);
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:8000,display:"flex",justifyContent:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)setDetail(null);}}>
        <div style={{width:640,background:"#fff",borderLeft:`1px solid ${T.border}`,height:"100%",overflow:"auto",display:"flex",flexDirection:"column"}}>
          {/* HEADER */}
          <div style={{background:T.brandMid,padding:"16px 20px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:48,height:48,borderRadius:10,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{ct.icon}</div>
                <div><h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#fff",fontFamily:ff}}>{c.name}</h2><div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginTop:2}}>{ct.label} · {c.city||"—"}</div></div>
              </div>
              <SFBtn variant="inverse" small onClick={()=>setDetail(null)}>✕</SFBtn>
            </div>
            {/* BUG FIX: Tabs korrekt als Flex-Container ohne justify-between Konflikt */}
            <div style={{display:"flex",gap:0,borderRadius:"4px 4px 0 0",overflow:"hidden"}}>
              {[["daten","📋 Daten"],["kontakte",`👥 Kontakte (${relContacts.length})`],["deals",`🏗️ Deals (${relDeals.length})`],["ankauf","📊 Ankaufsprofil"]].map(([k,l])=>(
                <button key={k} onClick={()=>setDtab(k)} style={{padding:"8px 16px",border:"none",background:dtab===k?"#fff":"transparent",color:dtab===k?T.brandPrimary:"rgba(255,255,255,.8)",fontSize:12,fontWeight:700,fontFamily:ff,cursor:"pointer",borderBottom:dtab===k?`2px solid ${T.brandPrimary}`:"2px solid transparent",whiteSpace:"nowrap"}}>
                  {l}{k==="ankauf"&&c.ankaufsprofil?.aktiv&&<span style={{marginLeft:4,fontSize:9,background:"#FFD966",color:"#0D1726",padding:"1px 5px",borderRadius:99}}>AKTIV</span>}
                </button>
              ))}
            </div>
          </div>
          {/* CONTENT */}
          <div style={{flex:1,overflow:"auto",padding:16,background:T.bgApp}}>
            {dtab==="daten"&&<SCard title="Stammdaten" icon="📋"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["Typ",ct.label],["Stadt",c.city||"—"],["Telefon",c.phone||"—"],["E-Mail",c.email||"—"],["Website",c.website||"—"],["Land",c.country||"—"]].map(([k,v])=><div key={k}><div style={{fontSize:10,color:T.textMuted,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:700}}>{k}</div><div style={{fontSize:13,color:T.text,fontFamily:ff,marginTop:2}}>{v}</div></div>)}</div>{c.notes&&<div style={{marginTop:12,fontSize:13,color:T.text,fontFamily:ff,borderTop:`1px solid ${T.border}`,paddingTop:10}}>{c.notes}</div>}</SCard>}
            {dtab==="kontakte"&&<SCard title={`Kontakte (${relContacts.length})`} icon="👥">{relContacts.length===0?<div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:13,fontFamily:ff}}>Keine Kontakte zugeordnet.</div>:relContacts.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}><Avatar name={`${c.firstName} ${c.lastName}`} size={30}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{c.firstName} {c.lastName}</div><div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{c.role} · {c.email||"—"}</div></div></div>)}</SCard>}
            {dtab==="deals"&&<SCard title={`Deals (${relDeals.length})`} icon="🏗️">{relDeals.length===0?<div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:13,fontFamily:ff}}>Keine Deals zugeordnet.</div>:relDeals.map(d=>{const stg=getStg(d.stage),typ=getTyp(d.type);return <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:18}}>{typ.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:ff}}>{d.name}</div><div style={{fontSize:11,fontFamily:ff}}><Pill label={stg.short} color={stg.color} bg={stg.bg}/></div></div><div style={{fontSize:13,fontWeight:700,color:T.brandPrimary,fontFamily:ff}}>{fmtM(isGU(d.type)?d.guVolumen:d.askPrice)}</div></div>;})}
            </SCard>}
            {dtab==="ankauf"&&<AnkaufsprofilEditor profil={c.ankaufsprofil||ANKAUF_EMPTY} onChange={profil=>setCompanies(companies.map(x=>x.id===c.id?{...x,ankaufsprofil:profil}:x))}/>}
          </div>
        </div>
      </div>;
    })()}

    {/* LIST */}
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
      <div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Unternehmen suchen…" style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"7px 12px 7px 30px",fontSize:13,fontFamily:ff,outline:"none",width:260}} onFocus={e=>e.target.style.borderColor=T.borderFocus} onBlur={e=>e.target.style.borderColor=T.border}/></div>
      <select value={typeF} onChange={e=>setTypeF(e.target.value)} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"7px 10px",fontSize:13,fontFamily:ff,outline:"none"}}><option value="all">Alle Typen</option>{COMPANY_TYPES.map(t=><option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}</select>
      {activeAP>0&&<Badge color={T.success}>{activeAP} aktive Ankaufsprofile</Badge>}
      <div style={{flex:1}}/>
      <SFBtn icon="+" onClick={()=>{setForm({name:"",type:"investor",street:"",city:"",country:"Deutschland",phone:"",email:"",website:"",notes:"",ankaufsprofil:ANKAUF_EMPTY});setModal("add");}}>Neues Unternehmen</SFBtn>
    </div>

    <div style={{background:"#fff",borderRadius:T.radius,border:`1px solid ${T.border}`,boxShadow:T.shadowSm,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Unternehmen","Typ","Stadt","Kontakte","Deals","Ankauf",""].map(h=><th key={h} style={{padding:"8px 14px",textAlign:"left",fontSize:12,fontWeight:700,color:T.text,fontFamily:ff,background:T.bgHeader,borderBottom:`2px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map((co,i)=>{const ct=COMPANY_TYPES.find(t=>t.key===co.type)||COMPANY_TYPES[0];const relC=contacts.filter(c=>c.companyId===co.id).length;const relD=deals.filter(d=>d.companyId===co.id||d.accountName===co.name).length;
          return <tr key={co.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"#fff":T.bgRow,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.bgSelected} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":T.bgRow}>
            <td style={{padding:"10px 14px"}} onClick={()=>{setDetail(co.id);setDtab("daten");}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:8,background:ct.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{ct.icon}</div><div><div style={{fontSize:13,fontWeight:700,color:T.textLink,fontFamily:ff}}>{co.name}</div>{co.email&&<div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{co.email}</div>}</div></div></td>
            <td style={{padding:"10px 14px"}} onClick={()=>setDetail(co.id)}><Badge color={ct.color}>{ct.label}</Badge></td>
            <td style={{padding:"10px 14px",fontSize:12,color:T.text,fontFamily:ff}} onClick={()=>setDetail(co.id)}>{co.city||"—"}</td>
            <td style={{padding:"10px 14px",textAlign:"center"}} onClick={()=>{setDetail(co.id);setDtab("kontakte");}}>{relC>0?<Badge color={T.brandPrimary}>{relC}</Badge>:<span style={{color:T.textLight}}>—</span>}</td>
            <td style={{padding:"10px 14px",textAlign:"center"}} onClick={()=>{setDetail(co.id);setDtab("deals");}}>{relD>0?<Badge color={T.purple}>{relD}</Badge>:<span style={{color:T.textLight}}>—</span>}</td>
            <td style={{padding:"10px 14px"}} onClick={()=>{setDetail(co.id);setDtab("ankauf");}}>{co.ankaufsprofil?.aktiv?<Badge color={T.success}>✅ Aktiv</Badge>:<span style={{fontSize:11,color:T.textLight,fontFamily:ff}}>—</span>}</td>
            <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:4}}><button onClick={e=>{e.stopPropagation();setForm({...co,ankaufsprofil:co.ankaufsprofil||ANKAUF_EMPTY});setModal(co.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>✏️</button><button onClick={e=>{e.stopPropagation();setCompanies(companies.filter(x=>x.id!==co.id));}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>🗑️</button></div></td>
          </tr>;})}
        </tbody>
      </table>
      {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:T.textMuted,fontSize:14,fontFamily:ff}}>Keine Unternehmen.</div>}
    </div>

    {modal&&<Modal title={modal==="add"?"Neues Unternehmen":"Unternehmen bearbeiten"} icon="🏢" onClose={()=>setModal(null)} size={680} footer={<><SFBtn variant="neutral" onClick={()=>setModal(null)}>Abbrechen</SFBtn><SFBtn disabled={!form.name} onClick={save} icon="💾">Speichern</SFBtn></>}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
          <SFInput label="Firmenname" value={form.name} onChange={f("name")} required full/>
          <SFSelect label="Typ" value={form.type} onChange={f("type")} full options={COMPANY_TYPES.map(t=>({value:t.key,label:t.icon+" "+t.label}))}/>
          <SFInput label="Straße & Nr." value={form.street||""} onChange={f("street")} full/>
          <SFInput label="Stadt" value={form.city||""} onChange={f("city")} full/>
          <SFInput label="Land" value={form.country||""} onChange={f("country")} full/>
          <SFInput label="Telefon" value={form.phone||""} onChange={f("phone")} full/>
          <SFInput label="E-Mail" value={form.email||""} onChange={f("email")} type="email" full/>
          <SFInput label="Website" value={form.website||""} onChange={f("website")} full placeholder="grenford.de"/>
        </div>
        <SFTA label="Notizen" value={form.notes||""} onChange={f("notes")} rows={2}/>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}><div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10,fontFamily:ff}}>📊 Ankaufsprofil (für Investor-Matching)</div><AnkaufsprofilEditor profil={form.ankaufsprofil||ANKAUF_EMPTY} onChange={v=>setForm(p=>({...p,ankaufsprofil:v}))}/></div>
      </div>
    </Modal>}
  </div>;
}


// ─── NAVIGATION APPS ──────────────────────────────────────────────────────────
const APPS=[
  {key:"home",label:"Home",icon:"⌂",desc:"Dashboard"},
  {key:"deals",label:"Deals",icon:"🏗️",desc:"Pipeline"},
  {key:"contacts",label:"Kontakte",icon:"👥",desc:"CRM"},
  {key:"companies",label:"Unternehmen",icon:"🏢",desc:"Firmen"},
  {key:"tasks",label:"Aufgaben",icon:"☑️",desc:"Tasks"},
  {key:"calendar",label:"Kalender",icon:"📅",desc:"Termine"},
  {key:"calls",label:"Anrufe",icon:"📞",desc:"Call Center"},
  {key:"analytics",label:"Analytics",icon:"📊",desc:"Reports"},
  {key:"matching",label:"Matching",icon:"🔍",desc:"Investoren"},
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App(){
  const[app,setApp]=useState("home");
  const[deals,setDeals]=useState(INIT_DEALS);
  const[contacts,setContacts]=useState(INIT_CONTACTS);
  const[companies,setCompanies]=useState(INIT_COMPANIES);
  const[tasks,setTasks]=useState(INIT_TASKS);
  const[calls,setCalls]=useState(INIT_CALLS);
  const[activeCall,setActiveCall]=useState(null);
  const[dsgvoSeen,setDsgvoSeen]=useState(false);
  const[loaded,setLoaded]=useState(false);

  // LOAD FROM STORAGE
  useEffect(()=>{
    requestNotif();
    const ds=load("grenford:deals",INIT_DEALS);
    const cs=load("grenford:contacts",INIT_CONTACTS);
    const cos=load("grenford:companies",INIT_COMPANIES);
    const ts=load("grenford:tasks",INIT_TASKS);
    const cls=load("grenford:calls",INIT_CALLS);
    const dv=load("grenford:dsgvo_seen",false);
    setDeals(ds);setContacts(cs);setCompanies(cos);setTasks(ts);setCalls(cls);setDsgvoSeen(dv);
    setLoaded(true);
  },[]);

  // SAVE TO STORAGE
  useEffect(()=>{if(loaded)save("grenford:deals",deals);},[deals,loaded]);
  useEffect(()=>{if(loaded)save("grenford:contacts",contacts);},[contacts,loaded]);
  useEffect(()=>{if(loaded)save("grenford:companies",companies);},[companies,loaded]);
  useEffect(()=>{if(loaded)save("grenford:tasks",tasks);},[tasks,loaded]);
  useEffect(()=>{if(loaded)save("grenford:calls",calls);},[calls,loaded]);

  const handleCallStart=useCallback(call=>{setActiveCall(call);sendNotif("Anruf gestartet",`${call.contactName} · ${call.phone}`);setCalls(prev=>[...prev,{...call,id:uid(),duration:0,outcome:"connected",notes:""}]);},[]);
  const handleHangup=useCallback(({duration,notes,outcome})=>{if(!activeCall)return;setCalls(prev=>prev.map((c,i)=>i===prev.length-1?{...c,duration,notes,outcome}:c));setActiveCall(null);},[activeCall]);

  if(!loaded)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bgApp,fontFamily:ff}}><div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🏗️</div><div style={{fontSize:14,color:T.textMuted}}>Grenford CRM wird geladen…</div></div></div>;

  // DSGVO BANNER
  if(!dsgvoSeen)return <DSGVOBanner onAccept={async()=>{await save("grenford:dsgvo_seen",true);setDsgvoSeen(true);}}/>;

  const dsgvoAlerts=contacts.filter(c=>{const s=dsgvoStatus(c);return s.status==="fehlt"||s.status==="abgelaufen";}).length;
  const overdueT=tasks.filter(t=>t.status!=="Completed"&&t.due<today()).length;

  return <div style={{display:"flex",height:"100vh",background:T.bgApp,fontFamily:ff,overflow:"hidden"}}>
    {/* SIDEBAR */}
    <div style={{width:60,background:T.brandMid,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:8,flexShrink:0,boxShadow:"2px 0 8px rgba(0,0,0,.18)"}}>
      {/* Logo */}
      <div style={{width:40,height:40,borderRadius:8,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,cursor:"pointer"}} onClick={()=>setApp("home")}>
        <svg width="22" height="22" viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="33" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/><text x="13" y="46" fontFamily="Georgia,serif" fontSize="24" fill="white">GF</text></svg>
      </div>
      {APPS.map(a=>{const isCur=app===a.key;const badge=a.key==="tasks"&&overdueT>0?overdueT:a.key==="contacts"&&dsgvoAlerts>0?dsgvoAlerts:0;return <div key={a.key} onClick={()=>setApp(a.key)} title={`${a.label} – ${a.desc}`} style={{width:44,height:44,borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:2,background:isCur?"rgba(255,255,255,.15)":"transparent",border:isCur?"1px solid rgba(255,255,255,.25)":"1px solid transparent",transition:"all .15s",position:"relative"}} onMouseEnter={e=>{if(!isCur)e.currentTarget.style.background="rgba(255,255,255,.08)";}} onMouseLeave={e=>{if(!isCur)e.currentTarget.style.background="transparent";}}><span style={{fontSize:18,lineHeight:1}}>{a.icon}</span><span style={{fontSize:7.5,color:isCur?"rgba(255,255,255,.95)":"rgba(255,255,255,.55)",fontWeight:isCur?700:400,fontFamily:ff,marginTop:1,letterSpacing:"-0.01em"}}>{a.label}</span>{badge>0&&<div style={{position:"absolute",top:2,right:2,width:14,height:14,borderRadius:"50%",background:T.error,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#fff",fontWeight:900}}>{badge}</span></div>}</div>;})}
    </div>

    {/* MAIN */}
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* TOP BAR */}
      <div style={{background:"#fff",borderBottom:`1px solid ${T.border}`,padding:"8px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.07)"}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:T.textStrong,fontFamily:ff}}>{APPS.find(a=>a.key===app)?.label}</div>
          <div style={{fontSize:11,color:T.textMuted,fontFamily:ff}}>{APPS.find(a=>a.key===app)?.desc}</div>
        </div>
        <div style={{flex:1}}/>
        {/* Status indicators */}
        {overdueT>0&&<div style={{display:"flex",alignItems:"center",gap:5,background:T.errorBg,border:`1px solid ${T.error}44`,borderRadius:99,padding:"3px 10px",cursor:"pointer"}} onClick={()=>setApp("tasks")}><span style={{fontSize:11}}>⚠️</span><span style={{fontSize:11,fontWeight:700,color:T.error,fontFamily:ff}}>{overdueT} Aufgaben überfällig</span></div>}
        {dsgvoAlerts>0&&<div style={{display:"flex",alignItems:"center",gap:5,background:"#FEF8E8",border:"1px solid #DD7A0144",borderRadius:99,padding:"3px 10px",cursor:"pointer"}} onClick={()=>setApp("contacts")}><span style={{fontSize:11}}>🔒</span><span style={{fontSize:11,fontWeight:700,color:T.warning,fontFamily:ff}}>{dsgvoAlerts} DSGVO-Probleme</span></div>}
        {/* Quick stats */}
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          {[["Pipeline",fmtM(deals.filter(d=>!["won","lost","aftersales","gu_won","gu_lost"].includes(d.stage)).reduce((s,d)=>s+(isGU(d.type)?(d.guVolumen||0):(d.askPrice||0)),0)),T.brandPrimary],["Provision",fmtM(deals.filter(d=>["won","aftersales","gu_won"].includes(d.stage)).reduce((s,d)=>s+(isGU(d.type)?Math.round((d.guVolumen||0)*(d.commission||7)/100):((d.agreedPrice||d.askPrice||0)*(d.commission||0)/100)),0)),T.success]].map(([l,v,c])=><div key={l} style={{textAlign:"right"}}><div style={{fontSize:9,color:T.textMuted,fontFamily:ff,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:c,fontFamily:ff}}>{v}</div></div>)}
        </div>
        <div style={{width:1,height:28,background:T.border}}/>
        <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name="Grenford" size={28} color={T.brandPrimary}/><div><div style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:ff}}>Grenford</div><div style={{fontSize:10,color:T.textMuted,fontFamily:ff}}>Off-Market CRM</div></div></div>
      </div>

      {/* PAGE CONTENT */}
      <div style={{flex:1,overflow:"auto",padding:20}}>
        {app==="home"&&<Dashboard deals={deals} tasks={tasks} contacts={contacts} calls={calls} onCallStart={handleCallStart}/>}
        {app==="deals"&&<Opportunities deals={deals} setDeals={setDeals} contacts={contacts} companies={companies} calls={calls} onCallStart={handleCallStart}/>}
        {app==="contacts"&&<Contacts contacts={contacts} setContacts={setContacts} companies={companies} calls={calls} onCallStart={handleCallStart}/>}
        {app==="companies"&&<Companies companies={companies} setCompanies={setCompanies} contacts={contacts} deals={deals}/>}
        {app==="tasks"&&<Tasks tasks={tasks} setTasks={setTasks} deals={deals} contacts={contacts} onCallStart={handleCallStart}/>}
        {app==="calendar"&&<KalenderView deals={deals} tasks={tasks}/>}
        {app==="calls"&&<CallCenter calls={calls} contacts={contacts} onCallStart={handleCallStart}/>}
        {app==="analytics"&&<Analytics deals={deals} calls={calls}/>}
        {app==="matching"&&<InvestorenMatching companies={companies} deals={deals}/>}
      </div>
    </div>

    {/* ACTIVE CALL OVERLAY */}
    {activeCall&&<ActiveCallOverlay call={activeCall} onHangup={handleHangup}/>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>)
