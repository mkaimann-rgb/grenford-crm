import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
// Prüft die Übertragung an das CRM (Google-Apps-Script-Web-App) ohne echten Request.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,process.argv[2]||'dist','ux.js'),'utf8').split('const strategic=')[0];
let calls=[];
const reply=body=>({ok:true,json:async()=>body});
const context=vm.createContext({AbortController,setTimeout,clearTimeout,GRENFORD_FORM_ENDPOINT:'https://script.google.com/macros/s/TEST/exec',
  location:{href:'https://example.test/investment/#anfrage'},document:{title:'GRENFORD Investment'},fetch:async(url,options)=>{calls.push({url,...options});return reply({ok:true});}});
vm.runInContext(source,context);
assert.equal(calls.length,0,'Kein Versand vor ausdrücklichem Absenden');
await context.sendRequest({name:'UX Test Person',email:'preview@example.com',phone:'',subject:'investment',message:'Region: Berlin\nThemen: Objektsuche'});
assert.equal(calls.length,1);
assert.equal(calls[0].url,'https://script.google.com/macros/s/TEST/exec');
assert.match(calls[0].headers['Content-Type'],/^text\/plain/,'text/plain, damit keine CORS-Vorabfrage nötig ist');
const p=JSON.parse(calls[0].body);
assert.equal(p.firstname,'UX');assert.equal(p.lastname,'Test Person');assert.equal(p.name,'UX Test Person');assert.equal(p.subject,'investment');
assert.equal(p.source,'grenford-website');assert.equal(p.message,'Region: Berlin\nThemen: Objektsuche');assert.equal(p.page,'https://example.test/investment/');
context.fetch=async()=>reply({ok:false,error:'invalid'});await assert.rejects(context.sendRequest({name:'Test',email:'preview@example.com',subject:'general',message:'Test'}),'Ablehnung durch die Web-App');
context.fetch=async()=>({ok:true,json:async()=>{throw new Error('kein JSON')}});await assert.rejects(context.sendRequest({name:'Test',email:'preview@example.com',subject:'general',message:'Test'}),'Antwort ohne Bestätigung');
context.fetch=async()=>({ok:false});await assert.rejects(context.sendRequest({name:'Test',email:'preview@example.com',subject:'general',message:'Test'}));
context.fetch=async()=>{throw new Error('network unavailable')};await assert.rejects(context.sendRequest({name:'Test',email:'preview@example.com',subject:'general',message:'Test'}));
const empty=vm.createContext({AbortController,setTimeout,clearTimeout,location:{href:'x'},document:{title:'x'},fetch:async()=>{throw new Error('darf nicht senden')}});
vm.runInContext(source,empty);await assert.rejects(empty.sendRequest({name:'T',email:'t@example.com'}),/no-endpoint/);
console.log('CRM transport checks passed: explicit submit, sheet schema, confirmation required, failed responses, network failures, no endpoint. No live request sent.');
