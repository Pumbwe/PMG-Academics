// scripts/scripts.js
(async function(){
  const MANIFEST = '/course_manifest.json';

  async function loadManifest(){
    try{
      const r = await fetch(MANIFEST, {cache:'no-store'});
      if(!r.ok) throw new Error('manifest not found');
      return await r.json();
    }catch(e){
      console.warn('Manifest load failed', e);
      return null;
    }
  }

  function el(tag, cls, html){
    const d = document.createElement(tag);
    if(cls) d.className = cls;
    if(html !== undefined) d.innerHTML = html;
    return d;
  }

  function safePath(folder, file='index.html'){
    return `${folder}/${file}`;
  }

  window.openInViewer = function(path){
    const frame = document.getElementById('viewerFrame');
    const viewer = document.getElementById('viewer');
    if(!frame || !viewer) return window.open(path, '_blank');
    frame.src = path;
    viewer.style.display = 'block';
    frame.scrollIntoView({behavior:'smooth'});
  };

  function buildProgramCard(program){
    const card = el('div','program-card collapsed');
    const header = el('div','program-header');
    const title = el('div','program-title', program.label);
    const chevron = el('div','chev','&#9654;'); // triangle
    header.appendChild(title);
    header.appendChild(chevron);
    card.appendChild(header);

    const sections = el('div','sections');
    // For each of the four sections create a block with course links
    const sectionNames = [
      {key:'notes', label:'Notes'},
      {key:'papers', label:'Past Papers'},
      {key:'assignments', label:'Assignments'},
      {key:'labs', label:'Lab Reports'}
    ];

    sectionNames.forEach(s=>{
      const block = el('div','section-block');
      block.appendChild(el('h3',null, s.label));
      const list = el('div',null,'');
      program.courses.forEach(course=>{
        const row = el('div','course-row');
        const left = el('div',null, `<strong>${course.code}</strong> — ${course.title}`);
        // link opens the folder index in viewer; you can change to open specific files
        const folder = program.folders && program.folders[s.key] ? program.folders[s.key] : '';
        const href = safePath(folder,'index.html');
        const link = el('a','btn-mini', s.label);
        link.href = href;
        link.onclick = (ev)=> { ev.preventDefault(); window.openInViewer(href); };
        row.appendChild(left);
        row.appendChild(link);
        list.appendChild(row);
      });
      block.appendChild(list);
      sections.appendChild(block);
    });

    card.appendChild(sections);

    // toggle behavior
    header.addEventListener('click', ()=>{
      const open = sections.classList.toggle('open');
      if(open){
        card.classList.remove('collapsed');
        chevron.style.transform = 'rotate(90deg)';
      } else {
        card.classList.add('collapsed');
        chevron.style.transform = 'rotate(0deg)';
      }
    });

    return card;
  }

  window.renderPortal = async function(){
    const container = document.getElementById('programs');
    container.innerHTML = '';
    const manifest = await loadManifest();
    if(!manifest || !manifest.programs){
      container.appendChild(el('p','small-note','No manifest found. Add course_manifest.json at repo root.'));
      return;
    }
    manifest.programs.forEach(p=>{
      const card = buildProgramCard(p);
      container.appendChild(card);
    });
  };

  // expose for debugging
  window._pmg = { loadManifest, buildProgramCard };
})();
