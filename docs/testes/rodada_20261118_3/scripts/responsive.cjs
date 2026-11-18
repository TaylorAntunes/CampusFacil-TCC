const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'..');
process.env.PLAYWRIGHT_BROWSERS_PATH=dir+'/../runtime/browsers';
const {chromium}=require(dir+'/../node_modules/playwright');
const fixtures=require(dir+'/runtime/fixtures.private.json');
const results=[], browserLogs=[],base='http://localhost:5274';
fs.mkdirSync(dir+'/evidencias/capturas',{recursive:true});
let page,browser;
async function test(area,title,expected,procedure,fn){const id='CT'+String(92+results.length).padStart(3,'0');const start=performance.now();let outcome='aprovado',obtained;try{obtained=await fn(id);}catch(e){outcome='reprovado';obtained=e.message.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[TOKEN REDACTED]');}results.push({id,area,title,requirement:area,preconditions:'Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.',procedure,expected,obtained:typeof obtained==='string'?obtained:JSON.stringify(obtained??'Asserções satisfeitas'),status:outcome,durationMs:performance.now()-start,evidence:'evidencias/responsividade-resultados.json; evidencias/capturas/'});fs.writeFileSync(dir+'/evidencias/responsividade-resultados.json',JSON.stringify(results,null,2));console.log(id,outcome,title);}
async function shot(id,name){const file=`evidencias/capturas/${id}-${name}.png`;await page.screenshot({path:dir+'/'+file,fullPage:true,animations:'disabled'});return file;}
async function main(){
 browser=await chromium.launch({headless:true});
 fs.writeFileSync(dir+'/evidencias/navegador.json',JSON.stringify({browser:browser.version(),tool:require(dir+'/../node_modules/playwright/package.json').version,headless:true,externalResources:'Recursos externos bloqueados para execução controlada local; fontes, avatares e imagens remotos podem ser substituídos pelo fallback do navegador.'},null,2));
 // Responsive matrix: every route and theme is executed in a real browser viewport.
 const routes=[['inicio','/'],['cadastro','/register'],['login','/login'],['explorar','/explore'],['prestador','/seller/'+fixtures.a.id],['chat','/conversas/'+fixtures.b.id],['painel','/dashboard'],['solicitacoes','/meus-pedidos']];
 for(const viewport of [{width:360,height:800},{width:390,height:844},{width:768,height:1024},{width:1920,height:1080}]){
  for(const theme of ['light','dark']){
   for(const [name,route] of routes){
    await test('Responsividade',`${name} ${viewport.width}x${viewport.height} ${theme}`,'Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto','Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG',async id=>{
     const ctx=await browser.newContext({viewport});await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname))r.continue();else r.abort();});
     await ctx.addInitScript(({user,token,theme,authenticated})=>{if(authenticated){localStorage.setItem('user',JSON.stringify(user));localStorage.setItem('accessToken',token);}localStorage.setItem('campusfacil-theme',theme);},{user:{...fixtures.a,token:undefined},token:fixtures.a.token,theme,authenticated:['chat','painel','solicitacoes'].includes(name)});
     const p=await ctx.newPage();const previous=page;page=p;const errors=[];p.on('pageerror',e=>errors.push(e.message));
     try{
      await p.goto(base+route,{waitUntil:'networkidle',timeout:20000});await p.waitForTimeout(700);
      const layout=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,theme:document.documentElement.className,heading:document.querySelector('h1,h2')?.textContent,mainVisible:[...document.querySelectorAll('h1,h2,input,textarea')].some(el=>{const r=el.getBoundingClientRect();const style=getComputedStyle(el);return r.width>0&&r.height>0&&style.display!=='none'&&style.visibility!=='hidden';}),overflow:[...document.querySelectorAll('body *')].filter(e=>{const b=e.getBoundingClientRect();const s=getComputedStyle(e);return b.width>0&&b.right>innerWidth+2&&s.position!=='absolute'&&s.position!=='fixed';}).slice(0,8).map(e=>({tag:e.tagName,text:e.textContent?.slice(0,80),right:e.getBoundingClientRect().right}))}));
      const capture=await shot(id,`${name}-${viewport.width}-${theme}`);
      // Additional chat/help visual evidence for all sizes and themes.
      if(name==='inicio'){await p.getByRole('button',{name:'Abrir ajuda'}).click();await p.waitForTimeout(400);await shot(id,`chatbot-${viewport.width}-${theme}`);}
      assert.equal(errors.length,0,'Erros JavaScript: '+errors.join('; '));assert.ok(layout.mainVisible,'Conteúdo principal ausente');assert.ok(layout.theme.includes(theme),'Tema diferente');assert.ok(!p.url().includes('/login')||route==='/login','Redirecionamento inesperado');
      assert.ok(layout.scrollWidth<=viewport.width+2&&layout.bodyWidth<=viewport.width+2,'Overflow horizontal: '+JSON.stringify(layout));return {...layout,capture};
     }finally{await ctx.close();page=previous;}
    });
   }
  }
 }
 fs.writeFileSync(dir+'/evidencias/browser-errors.json',JSON.stringify(browserLogs,null,2));
 await browser.close();console.log('UI concluída',results.length);
}
main().catch(async e=>{console.error('Interrupção UI:',e.message);fs.writeFileSync(dir+'/evidencias/ui-interrupcao.txt',e.message);if(browser)await browser.close();process.exitCode=1;});
