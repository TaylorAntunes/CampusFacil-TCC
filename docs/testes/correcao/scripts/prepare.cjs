const fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os');
const project='C:/Users/taylor/Desktop/CampusFacil';
const dir=project+'/docs/testes/correcao';
const backendRequire=require('module').createRequire(project+'/backend/package.json');
const {Client}=backendRequire('pg');
const original=backendRequire('dotenv').parse(fs.readFileSync(project+'/backend/.env'));
const configPath=dir+'/runtime/config.private.json';
function manifest(base){const entries=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','dist','build','uploads','.git'].includes(e.name)||e.name.startsWith('.env'))continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else entries.push({path:path.relative(base,p).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')});}}walk(base);return entries;}
(async()=>{
 let config;
 if(fs.existsSync(configPath))config=JSON.parse(fs.readFileSync(configPath));
 else {
 const name='campusfacil_audit_'+new Date().toISOString().replace(/\D/g,'').slice(0,14);
 const admin=new Client({connectionString:original.DATABASE_URL,connectionTimeoutMillis:5000});await admin.connect();
 const u=new URL(original.DATABASE_URL);if(!['localhost','127.0.0.1','[::1]'].includes(u.hostname))throw Error('Somente banco local permitido');
 await admin.query('CREATE DATABASE "'+name+'"');await admin.end();u.pathname='/'+name;
 config={databaseName:name,DATABASE_URL:u.toString(),JWT_SECRET:crypto.randomBytes(48).toString('base64url'),PORT:'4433',CORS_ORIGIN:'http://localhost:5274',NODE_ENV:'test'};
 fs.writeFileSync(configPath,JSON.stringify(config,null,2));
 }
 if(!/^campusfacil_audit_\d+$/.test(config.databaseName))throw Error('Banco inseguro');
 fs.writeFileSync(dir+'/evidencias/source-before.json',JSON.stringify({backend:manifest(project+'/backend'),frontend:manifest(project+'/frontend')},null,2));
 fs.writeFileSync(dir+'/evidencias/ambiente.json',JSON.stringify({timestamp:new Date().toISOString(),timezone:'America/Sao_Paulo',platform:os.platform(),release:os.release(),architecture:os.arch(),cpus:os.cpus()[0]?.model,logicalCpus:os.cpus().length,totalMemoryGB:os.totalmem()/2**30,node:process.version,databaseName:config.databaseName,api:'http://127.0.0.1:4433',frontend:'http://localhost:5274',versions:Object.fromEntries(['fastify','@prisma/client','bcryptjs','socket.io','pg','zod'].map(x=>[x,JSON.parse(fs.readFileSync(project+'/backend/node_modules/'+x+'/package.json')).version]))},null,2));
 const {spawnSync}=require('child_process');
 const r=spawnSync(process.execPath,[project+'/backend/node_modules/prisma/build/index.js','migrate','deploy'],{cwd:dir+'/runtime/backend',env:{...process.env,...config,NODE_PATH:project+'/backend/node_modules'},encoding:'utf8',timeout:120000});
 fs.writeFileSync(dir+'/evidencias/migracoes.log',(r.stdout||'')+(r.stderr||''));
 if(r.status!==0)throw Error('Falha nas migrações: consulte migracoes.log');
 console.log('Banco isolado preparado:',config.databaseName);
})().catch(e=>{console.error(e.message);process.exitCode=1;});

