
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const loadJSON = (u)=>fetch(u).then(r=>r.json());

  // WhatsApp links
  function setWA(){
    const n=(window.RB_CONFIG&&RB_CONFIG.WHATSAPP)||'919876543210';
    const url=`https://wa.me/${n}?text=${encodeURIComponent('Hello RB Team')}`;
    const waInline=$('#waLink'); const waFab=$('#waFab'); const btn=$('#contactWA');
    if(waInline){ waInline.href=url; }
    if(waFab){ waFab.href=url; }
    if(btn){ btn.href=url; }
  }

  // Theme toggle
  const themeKey='rb_theme';
  const applyTheme=t=>{ document.body.classList.toggle('dark', t==='dark'); $('#btnTheme') && ($('#btnTheme').textContent=(t==='dark'?'☀️':'🌙')); };
  let theme=localStorage.getItem(themeKey)||'light'; applyTheme(theme);
  $('#btnTheme') && $('#btnTheme').addEventListener('click',()=>{ theme=(theme==='dark'?'light':'dark'); localStorage.setItem(themeKey,theme); applyTheme(theme); });

  // Unit toggle
  const unitKey='rb_unit', labels={metric:'Metric',imperial:'Imperial'};
  let unit=localStorage.getItem(unitKey)||'metric'; $('#btnUnit') && ($('#btnUnit').textContent=labels[unit]);
  $('#btnUnit') && $('#btnUnit').addEventListener('click',()=>{ unit=(unit==='metric'?'imperial':'metric'); localStorage.setItem(unitKey,unit); $('#btnUnit').textContent=labels[unit]; renderProducts&&renderProducts(); });

  // Mobile nav
  $('#navToggle') && $('#navToggle').addEventListener('click',()=>$('#nav').classList.toggle('open'));

  // Specs helpers
  function convertSpec(key,val){
    if(localStorage.getItem('rb_unit')!=='imperial') return ''+val;
    try{
      const k=key.toLowerCase();
      if(k.includes('cm')){ const n=parseFloat((''+val).match(/\d+\.?\d*/)); if(!isNaN(n)) return (n/2.54).toFixed(1)+' in'; }
      if(k.includes('mm')){ const n=parseFloat((''+val).match(/\d+\.?\d*/)); if(!isNaN(n)) return (n/25.4).toFixed(2)+' in'; }
      if(k.includes('kg')){ const n=parseFloat((''+val).match(/\d+\.?\d*/)); if(!isNaN(n)) return (n*2.20462).toFixed(1)+' lb'; }
    }catch(e){}
    return ''+val;
  }
  function specTable(specs){
    return '<table class="specs"><tbody>'+Object.entries(specs||{}).map(([k,v])=>{
      let out=v;
      if(typeof v==='number' || typeof v==='string'){ out = convertSpec(k,v); }
      return `<tr><th>${k}</th><td>${out}</td></tr>`;
    }).join('')+'</tbody></table>';
  }
  function productCard(p){
    return `<article class='card product-card' data-id='${p.id}'>
      <div class='media'><img src='${p.image}' alt='${p.name}' class='media-cover'></div>
      <h3>${p.name}</h3><p class='muted small'>${p.category}</p><p>${p.description}</p>
      <div class='row'><button class='btn small' data-view='${p.id}'>View details</button>
      <a class='btn outline small' href='contact.html?product=${encodeURIComponent(p.name)}'>Inquire</a></div>
    </article>`;
  }

  let all=[];
  function renderFilters(){
    const sel=$('#categoryFilter'); if(!sel) return;
    const cats=[...new Set(all.map(p=>p.category))].sort();
    sel.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option>${c}</option>`).join('');
  }
  function renderProducts(){
    const grid=$('#productGrid'); if(!grid) return;
    const q=($('#searchBox')?.value||'').toLowerCase().trim();
    const cat=$('#categoryFilter')?.value||'';
    const list=all.filter(p=>(!cat||p.category===cat) && (p.name.toLowerCase().includes(q)||p.description.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)));
    grid.innerHTML=list.map(productCard).join('') || '<p>No products found.</p>';
    attachProductEvents();
  }
  function renderFeatured(){
    const grid=$('#featuredGrid'); if(!grid) return;
    grid.innerHTML=all.slice(0,3).map(productCard).join('');
    attachProductEvents();
  }
  function attachProductEvents(){
    $$('#productGrid [data-view], #featuredGrid [data-view]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id=parseInt(btn.getAttribute('data-view'),10);
        const p=all.find(x=>x.id===id); if(!p) return;
        $('#modalTitle') && ($('#modalTitle').textContent=p.name);
        $('#modalImg') && ($('#modalImg').src=p.image);
        $('#modalBody') && ($('#modalBody').innerHTML = `<p>${p.description}</p><h4>Specifications</h4>${specTable(p.specs)}<p class='muted small'>Location: ${p.location||'—'}</p><div class='row'><a class='btn primary' href='contact.html?product=${encodeURIComponent(p.name)}'>Contact Sales</a></div>`);
        $('#modal') && ($('#modal').style.display='block');
        const views = JSON.parse(localStorage.getItem('rb_views')||'{}'); views[p.name]=(views[p.name]||0)+1; localStorage.setItem('rb_views', JSON.stringify(views));
      });
    });
  }
  $('#closeModal') && $('#closeModal').addEventListener('click',()=>$('#modal').style.display='none');
  $('#modal') && $('#modal').addEventListener('click',(e)=>{ if(e.target.id==='modal') $('#modal').style.display='none'; });

  if($('#productGrid') || $('#featuredGrid') || $('#catalogList') || location.pathname.endsWith('/contact.html')){
    loadJSON('assets/products.json').then(list=>{
      all=list; renderFilters(); renderProducts(); renderFeatured();
      $('#categoryFilter') && $('#categoryFilter').addEventListener('change', renderProducts);
      $('#searchBox') && $('#searchBox').addEventListener('input', renderProducts);
      if($('#catalogList')){
        $('#catalogList').innerHTML = list.map(p=>`<div class='card'><h3>${p.name}</h3><p class='muted small'>${p.category} • ${p.location||''}</p>${specTable(p.specs)}</div>`).join('');
        $('#btnPrint') && $('#btnPrint').addEventListener('click',()=>window.print());
      }
      // Fill contact product dropdown
      const sel = document.querySelector('form#contactForm select[name="product"]');
      if(sel){
        sel.innerHTML = '<option value="">Select a product</option>' + list.map(p=>`<option>${p.name}</option>`).join('');
      }
    });
  }
  $('#btnCatalog') && $('#btnCatalog').addEventListener('click',()=>location.href='catalog.html');

  // Contact form
  const form=$('#contactForm'); 
  if(form){
    const status=$('#formStatus');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd=new FormData(form);
      const entry={date:new Date().toISOString(),name:fd.get('name'),email:fd.get('email'),country:fd.get('country'),product:fd.get('product'),message:fd.get('message')};
      if(!entry.name || !entry.email || !entry.country || !entry.message){ status.textContent='Please fill required fields.'; return; }
      const leads=JSON.parse(localStorage.getItem('rb_leads')||'[]'); leads.unshift(entry); localStorage.setItem('rb_leads', JSON.stringify(leads));
      // Attempt API send with API key
      let apiOk=false;
      try{
        const res=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':(RB_CONFIG&&RB_CONFIG.API_KEY)||''},body:JSON.stringify(entry)});
        apiOk = res.ok;
      }catch(err){}
      status.textContent = apiOk ? 'Thanks! Your message has been sent.' : 'Thanks! Your message has been recorded.';
      form.reset();
    });
  }

  // Insights
  if($('#blogList')){
    loadJSON('assets/posts.json').then(posts=>{
      $('#blogList').innerHTML = posts.map(p=>`<article class='card'><h3>${p.title}</h3><p class='muted small'>${p.date}</p><p>${p.excerpt}</p></article>`).join('');
    });
  }

  // Dashboard auth gate
  if(location.pathname.endsWith('/dashboard.html')){
    if(localStorage.getItem('rb_admin')!=='true'){ location.replace('admin.html'); }
  }
  // Admin login
  const adminForm = $('#adminForm');
  if(adminForm){
    adminForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const u=adminForm.user.value.trim(), p=adminForm.pass.value.trim();
      if(u===(RB_CONFIG&&RB_CONFIG.ADMIN_USER) && p===(RB_CONFIG&&RB_CONFIG.ADMIN_PASS)){
        localStorage.setItem('rb_admin','true'); location.replace('dashboard.html');
      }else{
        $('#adminStatus').textContent='Invalid credentials';
      }
    });
  }

  // Dashboard logic
  if($('#leadsTable')){
    function renderLeads(){
      const leads=JSON.parse(localStorage.getItem('rb_leads')||'[]');
      $('#kpiTotal').textContent=leads.length;
      $('#kpiUSA').textContent=leads.filter(l=>(l.country||'').toLowerCase().includes('usa')).length;
      $('#kpiEurope').textContent=leads.filter(l=>/(germany|europe|uk|france|italy|spain)/i.test(l.country||'')).length;
      const tb=$('#leadsTable tbody'); tb.innerHTML='';
      leads.forEach(l=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${new Date(l.date).toLocaleString()}</td><td>${l.name}</td><td>${l.email}</td><td>${l.country}</td><td>${l.product||'-'}</td><td>${l.message}</td>`; tb.appendChild(tr); });
    }
    function renderViews(){
      const views=JSON.parse(localStorage.getItem('rb_views')||'{}'); const tb=$('#viewsTable tbody'); tb.innerHTML='';
      Object.entries(views).sort((a,b)=>b[1]-a[1]).forEach(([name,count])=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${name}</td><td>${count}</td>`; tb.appendChild(tr); });
    }
    $('#btnExport').addEventListener('click',()=>{
      const leads=JSON.parse(localStorage.getItem('rb_leads')||'[]'); if(!leads.length){ alert('No leads to export'); return; }
      let csv='Date,Name,Email,Country,Product,Message\n'; leads.forEach(l=>{ csv += [l.date,l.name,l.email,l.country,l.product,'"'+(l.message||'').replace(/"/g,'""')+'"'].join(',')+'\n'; });
      const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='rb_leads.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
    $('#btnClear').addEventListener('click',()=>{ if(confirm('Clear all stored leads?')){ localStorage.removeItem('rb_leads'); renderLeads(); }});
    $('#btnSync').addEventListener('click',async ()=>{
      const leads=JSON.parse(localStorage.getItem('rb_leads')||'[]');
      try{
        const res=await fetch('/api/stats',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':(RB_CONFIG&&RB_CONFIG.API_KEY)||''},body:JSON.stringify({leads,views:JSON.parse(localStorage.getItem('rb_views')||'{}')})});
        alert(res.ok?'Synced to DB (API). Configure RB_API_KEY & DB.':'Sync failed (check API).');
      }catch(e){ alert('Sync failed (network).'); }
    });
    renderLeads(); renderViews();
  }

  // Page analytics
  (function(){ const pg=(location.pathname.split('/').pop()||'index.html'); const stats=JSON.parse(localStorage.getItem('rb_pageviews')||'{}'); stats[pg]=(stats[pg]||0)+1; localStorage.setItem('rb_pageviews', JSON.stringify(stats)); })();

  // Footer setup
  (function(){
    const y = new Date().getFullYear(); const el=$('#year'); if(el) el.textContent=y;
    setWA();
  })();
})();