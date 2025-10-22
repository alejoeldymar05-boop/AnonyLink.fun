// app.js - main SPA logic (hash routing)
(function(){
  // Utilities
  const $ = sel => document.querySelector(sel);
  const qs = sel => Array.from(document.querySelectorAll(sel));
  const tpl = id => document.getElementById(id).content.cloneNode(true);

  // LocalStorage keys
  const LS_MESSAGES_KEY = 'anony_messages_v1';
  const LS_PROFILES_KEY = 'anony_profiles_v1';
  const LS_OWNERKEY_PREFIX = 'anony_ownerkey_';

  // Merge seeded DB with stored localStorage
  function loadLocal() {
    let localProfiles = JSON.parse(localStorage.getItem(LS_PROFILES_KEY) || '[]');
    let localMsgs = JSON.parse(localStorage.getItem(LS_MESSAGES_KEY) || '[]');
    const profiles = (DB.profiles || []).concat(localProfiles);
    const messages = (DB.messages || []).concat(localMsgs);
    return {profiles, messages, config: DB.config || {messageMaxLength:400, profanityList:[]}};
  }

  function saveLocalMessages(messages) {
    // Only save messages that were created client-side (id starts with 'local_')
    const localMsgs = messages.filter(m => m.id && m.id.startsWith('local_'));
    localStorage.setItem(LS_MESSAGES_KEY, JSON.stringify(localMsgs));
  }

  function saveLocalProfile(profile) {
    const stored = JSON.parse(localStorage.getItem(LS_PROFILES_KEY) || '[]');
    stored.push(profile);
    localStorage.setItem(LS_PROFILES_KEY, JSON.stringify(stored));
    // store owner key in LS as well as convenience
    if(profile.ownerKey) localStorage.setItem(LS_OWNERKEY_PREFIX + profile.slug, profile.ownerKey);
  }

  function createId(prefix){
    return prefix + '_' + Math.random().toString(36).slice(2,10);
  }

  // Router & Views
  const view = $('#view');
  function route() {
    const hash = location.hash || '#/';
    const parts = hash.replace(/^#\/?/, '').split('?')[0].split('/');
    const path = parts[0] || '';
    if(path === '' ) renderHome();
    else if(path === 'profile') renderProfile(parts[1]);
    else if(path === 'about') renderStatic('about-tpl');
    else if(path === 'faq') renderStatic('faq-tpl');
    else if(path === 'support') renderStatic('support-tpl');
    else if(path === 'terms') renderStatic('terms-tpl');
    else if(path === 'privacy') renderStatic('privacy-tpl');
    else renderNotFound();
  }

  function renderStatic(tplId) {
    view.innerHTML = '';
    view.appendChild(tpl(tplId));
  }

  function renderNotFound() {
    view.innerHTML = '<div class="card"><h2>404 — Not Found</h2><p class="muted">Page not found.</p></div>';
  }

  // Home
  function renderHome(){
    view.innerHTML = '';
    view.appendChild(tpl('home-tpl'));
    const data = loadLocal();

    const slugInput = $('#slug');
    const previewLink = $('#previewLink');
    const sampleProfiles = $('#sampleProfiles');

    // show sample profiles
    sampleProfiles.innerHTML = '';
    data.profiles.slice(0,8).forEach(p => {
      const btn = document.createElement('button');
      btn.textContent = `@${p.slug} • ${p.avatar||''}`;
      btn.style.margin = '6px';
      btn.addEventListener('click', ()=> location.hash = `#/profile/${p.slug}`);
      sampleProfiles.appendChild(btn);
    });

    slugInput.addEventListener('input', ()=>{
      const v = slugInput.value.trim().toLowerCase();
      previewLink.textContent = v ? `${location.origin}${location.pathname}#/profile/${encodeURIComponent(v)}` : '#';
    });

    $('#createBtn').addEventListener('click', ()=>{
      const slug = slugInput.value.trim().toLowerCase();
      if(!slug || !/^[a-z0-9\-_]{2,32}$/.test(slug)){
        alert('Please enter a valid slug: 2-32 chars, letters, numbers, - or _');
        return;
      }
      // check if exists in seed or local
      const data = loadLocal();
      if(data.profiles.find(p=>p.slug===slug)){
        if(!confirm('This slug already exists. Open profile?')) return;
        location.hash = `#/profile/${slug}`; return;
      }
      // create local profile
      const profile = {
        id: createId('user'),
        slug,
        displayName: slug,
        avatar: '🙂',
        createdAt: new Date().toISOString(),
        ownerKey: createId('owner')
      };
      saveLocalProfile(profile);
      alert('Profile created! Save this owner key somewhere safe:\n\n' + profile.ownerKey);
      location.hash = `#/profile/${slug}?owner=${profile.ownerKey}`;
    });
  }

  // Profile
  function renderProfile(slug){
    if(!slug){ renderNotFound(); return; }
    view.innerHTML = '';
    view.appendChild(tpl('profile-tpl'));
    const data = loadLocal();
    const profile = data.profiles.find(p => p.slug === slug);
    if(!profile){
      // show option to create a profile with this slug quickly
      view.innerHTML = `
        <div class="card">
          <h2>Profile not found</h2>
          <p class="muted">No profile with slug <strong>${slug}</strong> exists in seed or local storage.</p>
          <div class="row"><button id="createNow">Create this profile</button> <button id="goHome">Go home</button></div>
        </div>`;
      $('#createNow').addEventListener('click', ()=>{
        const p = {
          id: createId('user'),
          slug,
          displayName: slug,
          avatar: '🙂',
          createdAt: new Date().toISOString(),
          ownerKey: createId('owner')
        };
        saveLocalProfile(p);
        alert('Profile created! Owner key:\n\n' + p.ownerKey);
        location.hash = `#/profile/${slug}?owner=${p.ownerKey}`;
      });
      $('#goHome').addEventListener('click', ()=> location.hash = '#/');
      return;
    }

    // populate header
    $('#profileAvatar').textContent = profile.avatar || '🙂';
    $('#profileName').textContent = profile.displayName || profile.slug;
    const fullLink = `${location.origin}${location.pathname}#/profile/${encodeURIComponent(profile.slug)}`;
    $('#shareLink').value = fullLink;

    // copy button
    $('#copyBtn').addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText($('#shareLink').value);
        alert('Link copied to clipboard');
      }catch(e){ prompt('Copy this link', $('#shareLink').value); }
    });

    // messages rendering
    let {messages, config} = loadLocal();
    const profileMessages = () => messages.filter(m => m.profileId === profile.id && !m.deleted).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    function renderMessages(ownerMode=false){
      const list = $('#messagesList');
      list.innerHTML = '';
      const msgs = profileMessages();
      if(msgs.length === 0) { list.innerHTML = '<div class="muted">No messages yet. Be the first!</div>'; return; }
      msgs.forEach(m=>{
        const el = document.createElement('div');
        el.className = 'msg';
        el.innerHTML = `<div class="meta">${m.category? '['+m.category+'] ' : ''}<span class="muted">${new Date(m.createdAt).toLocaleString()}</span></div>
                        <div class="text">${escapeHtml(m.text)}</div>`;
        if(ownerMode){
          const row = document.createElement('div');
          row.style.marginTop = '8px';
          const del = document.createElement('button');
          del.textContent = 'Delete';
          del.style.background = 'transparent';
          del.style.color = 'var(--muted)';
          del.addEventListener('click', ()=>{
            if(!confirm('Delete this message?')) return;
            // mark deleted
            m.deleted = true;
            // persist: only keep local created messages; we still save local messages to LS
            saveLocalMessages(messages);
            renderMessages(true);
          });
          const exportBtn = document.createElement('button');
          exportBtn.textContent = 'Export';
          exportBtn.style.marginLeft='8px';
          exportBtn.addEventListener('click', ()=>{
            const dataStr = JSON.stringify(profileMessages(), null, 2);
            const blob = new Blob([dataStr], {type:'application/json'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${profile.slug}_messages.json`;
            a.click();
          });
          row.appendChild(del);
          row.appendChild(exportBtn);
          el.appendChild(row);
        }
        list.appendChild(el);
      });
    }

    // owner detection: either URL param ?owner=xxx or typed into owner input or stored owner key in LS
    const urlParams = new URLSearchParams(location.hash.split('?')[1] || '');
    let ownerKeyFromQuery = urlParams.get('owner') || '';
    const storedOwnerKey = localStorage.getItem(LS_OWNERKEY_PREFIX + profile.slug) || '';
    let ownerMode = false;
    if(ownerKeyFromQuery && ownerKeyFromQuery === profile.ownerKey) { ownerMode = true; localStorage.setItem(LS_OWNERKEY_PREFIX + profile.slug, ownerKeyFromQuery); }
    if(storedOwnerKey && storedOwnerKey === profile.ownerKey) ownerMode = true;

    // wire owner button
    $('#enterOwnerBtn').addEventListener('click', ()=>{
      const val = $('#ownerKey').value.trim();
      if(!val){ alert('Paste your owner key'); return; }
      if(val === profile.ownerKey){
        localStorage.setItem(LS_OWNERKEY_PREFIX + profile.slug, val);
        alert('Owner view enabled for this browser.');
        renderMessages(true);
      } else alert('Owner key invalid for this profile.');
    });

    // send message UI
    const MAX = config.messageMaxLength || 400;
    $('#msgText').addEventListener('input', ()=>{
      const len = $('#msgText').value.length;
      $('#charCount').textContent = `${len} / ${MAX}`;
    });
    $('#sendBtn').addEventListener('click', ()=>{
      const txt = $('#msgText').value.trim();
      const cat = $('#msgCategory').value || '';
      if(!txt){ alert('Message cannot be empty'); return; }
      if(txt.length > MAX){ alert('Message too long'); return; }
      // basic profanity filter
      const low = txt.toLowerCase();
      const bad = (DB.config.profanityList || []).some(b => low.includes(b));
      if(bad){
        if(!confirm('Your message contains words that may be offensive. Send anyway?')) return;
      }
      // create message
      const msg = {
        id: createId('local'),
        profileId: profile.id,
        text: txt,
        createdAt: new Date().toISOString(),
        deleted:false,
        likes:0,
        category: cat
      };
      messages.push(msg);
      // persist local-only messages
      saveLocalMessages(messages);
      $('#msgText').value = '';
      $('#charCount').textContent = `0 / ${MAX}`;
      alert('Message sent (anonymous).');
      renderMessages(ownerMode);
    });

    renderMessages(ownerMode);

    // if ownerMode show owner tools
    if(ownerMode){
      // show export all
      const ownerTools = document.querySelector('.owner');
      const exportAll = document.createElement('button');
      exportAll.textContent = 'Export All Messages (JSON)';
      exportAll.addEventListener('click', ()=>{
        const dataStr = JSON.stringify(messages.filter(m=>m.profileId===profile.id), null, 2);
        const blob = new Blob([dataStr], {type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${profile.slug}_all_messages.json`;
        a.click();
      });
      ownerTools.appendChild(exportAll);
    }
  }

  // helpers
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
  }

  // initial router
  window.addEventListener('hashchange', route);
  window.addEventListener('load', route);
})();
