/* projects.js — AEA Club Projects Page Logic (with API backend) */
(function () {
  'use strict';

  /* ─────────────────────────────
     STATE
  ───────────────────────────── */
  let isMember       = false;
  let memberEmail    = '';
  let pendingProject = null;
  let pendingSubmit  = false;

  /* ─────────────────────────────
     MEMBER SESSION UI
  ───────────────────────────── */
  function setMemberStatus(state, email) {
    isMember    = state;
    memberEmail = email || '';
    var dot  = document.querySelector('.member-dot');
    var text = document.getElementById('memberStatusText');
    var btn  = document.getElementById('memberSignInBtn');
    if (!dot || !text || !btn) return;
    if (state) {
      dot.className    = 'member-dot online';
      text.textContent = 'Signed in — ' + (email || 'Member');
      btn.textContent  = 'Sign Out';
      btn.classList.add('signed-in');
    } else {
      dot.className    = 'member-dot offline';
      text.textContent = 'Not signed in as member';
      btn.textContent  = 'Sign In';
      btn.classList.remove('signed-in');
    }
  }

  /* ─────────────────────────────
     PROJECT ACCORDION
  ───────────────────────────── */
  window.toggleProject = function (id) {
    var panel   = document.getElementById('detail-' + id);
    var chevron = document.getElementById('chevron-' + id);
    if (!panel) return;
    var isOpen = panel.classList.contains('open');
    document.querySelectorAll('.proj-detail-panel').forEach(function (p) { p.classList.remove('open'); });
    document.querySelectorAll('.proj-chevron').forEach(function (c) { c.classList.remove('open'); });
    if (!isOpen) {
      panel.classList.add('open');
      if (chevron) chevron.classList.add('open');
    }
  };

  /* ─────────────────────────────
     FILTER TABS
  ───────────────────────────── */
  var pfTabs    = document.querySelectorAll('.pf-tab');
  var projRows  = document.querySelectorAll('.proj-row');
  var projCount = document.getElementById('projCount');

  pfTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      pfTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter  = tab.dataset.filter;
      var visible = 0;
      projRows.forEach(function (row) {
        var show = filter === 'all' || row.dataset.status === filter;
        row.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (projCount) projCount.textContent = visible + ' project' + (visible !== 1 ? 's' : '');
    });
  });

  /* ─────────────────────────────
     MODAL HELPERS
  ───────────────────────────── */
  function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(function (m) { m.classList.remove('open'); });
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeAllModals();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllModals();
  });

  /* ─────────────────────────────
     BUTTON LOADING HELPER
  ───────────────────────────── */
  function setBtn(btn, loading, text) {
    if (!btn) return;
    btn.disabled = loading;
    var span = btn.querySelector('span') || btn;
    if (span.tagName === 'BUTTON') span.textContent = text;
    else span.textContent = text;
  }

  /* ─────────────────────────────
     MEMBER SIGN-IN → /api/auth
  ───────────────────────────── */
  var memberSignInBtn  = document.getElementById('memberSignInBtn');
  var memberModalClose = document.getElementById('memberModalClose');
  var memberSignInForm = document.getElementById('memberSignInForm');
  var memberError      = document.getElementById('memberError');

  if (memberSignInBtn) {
    memberSignInBtn.addEventListener('click', function () {
      if (isMember) { setMemberStatus(false, ''); return; }
      openModal('memberModal');
    });
  }

  if (memberModalClose) {
    memberModalClose.addEventListener('click', function () { closeModal('memberModal'); });
  }

  if (memberSignInForm) {
    memberSignInForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email    = document.getElementById('mem-email').value.trim();
      var memId    = document.getElementById('mem-id').value.trim();
      var submitBtn = memberSignInForm.querySelector('button[type="submit"]');
      var origText  = submitBtn.querySelector('span') ? submitBtn.querySelector('span').textContent : submitBtn.textContent;

      if (!email || !memId) {
        if (memberError) { memberError.textContent = 'Please fill in both fields.'; memberError.classList.add('show'); }
        return;
      }

      submitBtn.disabled = true;
      (submitBtn.querySelector('span') || submitBtn).textContent = 'Verifying…';
      if (memberError) memberError.classList.remove('show');

      try {
        var res  = await fetch('/api/auth', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: email, memberId: memId }),
        });
        var data = await res.json();

        if (res.ok && data.success) {
          setMemberStatus(true, email);
          closeModal('memberModal');
          memberSignInForm.reset();

          // Handle pending action
          if (pendingProject) {
            var proj = pendingProject; pendingProject = null;
            setTimeout(function () { openCollabModal(proj); }, 350);
          }
          if (pendingSubmit) {
            pendingSubmit = false;
            setTimeout(openSubmitModal, 350);
          }
        } else {
          if (memberError) {
            memberError.textContent = data.error || 'Invalid credentials. Please try again.';
            memberError.classList.add('show');
          }
          submitBtn.disabled = false;
          (submitBtn.querySelector('span') || submitBtn).textContent = origText;
        }
      } catch {
        if (memberError) {
          memberError.textContent = 'Network error. Please check your connection.';
          memberError.classList.add('show');
        }
        submitBtn.disabled = false;
        (submitBtn.querySelector('span') || submitBtn).textContent = origText;
      }
    });
  }

  /* ─────────────────────────────
     REGISTER TO COLLABORATE → /api/collab
  ───────────────────────────── */
  var collabModalClose   = document.getElementById('collabModalClose');
  var collabRegForm      = document.getElementById('collabRegForm');
  var collabSuccess      = document.getElementById('collabSuccess');
  var collabFormState    = document.getElementById('collabFormState');
  var collabProjLabel    = document.getElementById('collabProjLabel');
  var collabSuccessClose = document.getElementById('collabSuccessClose');

  document.querySelectorAll('.proj-register-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!isMember) {
        pendingProject = btn.dataset.project;
        openModal('memberModal');
        return;
      }
      openCollabModal(btn.dataset.project);
    });
  });

  function openCollabModal(projectName) {
    if (collabProjLabel) collabProjLabel.textContent = projectName;
    if (collabFormState) collabFormState.style.display = '';
    if (collabSuccess)   collabSuccess.classList.remove('show');
    if (collabRegForm)   { collabRegForm.reset(); collabRegForm.dataset.project = projectName; }
    resetFileUpload('crCvArea', 'crCvLabel');
    openModal('collabModal');
  }

  if (collabModalClose)   collabModalClose.addEventListener('click', function () { closeModal('collabModal'); });
  if (collabSuccessClose) collabSuccessClose.addEventListener('click', function () { closeModal('collabModal'); });

  if (collabRegForm) {
    collabRegForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var submitBtn = collabRegForm.querySelector('button[type="submit"]');
      var span      = submitBtn.querySelector('span') || submitBtn;
      var origText  = span.textContent;
      submitBtn.disabled = true;
      span.textContent   = 'Submitting…';

      var body = {
        project:  collabRegForm.dataset.project || (collabProjLabel ? collabProjLabel.textContent : ''),
        name:     document.getElementById('cr-name').value.trim(),
        email:    document.getElementById('cr-email').value.trim(),
        branch:   document.getElementById('cr-branch').value,
        year:     document.getElementById('cr-year').value,
        skills:   document.getElementById('cr-skills').value.trim(),
        why:      document.getElementById('cr-why').value.trim(),
        memberEmail: memberEmail,
      };

      try {
        var res  = await fetch('/api/collab', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        var data = await res.json();
        if (res.ok && data.success) {
          if (collabFormState) collabFormState.style.display = 'none';
          if (collabSuccess)   collabSuccess.classList.add('show');
        } else {
          span.textContent   = data.error || 'Error — try again';
          submitBtn.disabled = false;
          setTimeout(function () { span.textContent = origText; }, 3500);
        }
      } catch {
        span.textContent   = 'Network error — retry';
        submitBtn.disabled = false;
        setTimeout(function () { span.textContent = origText; }, 3500);
      }
    });
  }

  /* ─────────────────────────────
     SUBMIT PROJECT → /api/project
  ───────────────────────────── */
  var submitProjectBtn   = document.getElementById('submitProjectBtn');
  var submitModalClose   = document.getElementById('submitModalClose');
  var submitProjForm     = document.getElementById('submitProjForm');
  var submitSuccess      = document.getElementById('submitSuccess');
  var submitFormState    = document.getElementById('submitFormState');
  var submitSuccessClose = document.getElementById('submitSuccessClose');

  if (submitProjectBtn) {
    submitProjectBtn.addEventListener('click', function () {
      if (!isMember) { pendingSubmit = true; openModal('memberModal'); return; }
      openSubmitModal();
    });
  }

  function openSubmitModal() {
    if (submitFormState) submitFormState.style.display = '';
    if (submitSuccess)   submitSuccess.classList.remove('show');
    if (submitProjForm)  submitProjForm.reset();
    openModal('submitModal');
  }

  if (submitModalClose)   submitModalClose.addEventListener('click', function () { closeModal('submitModal'); });
  if (submitSuccessClose) submitSuccessClose.addEventListener('click', function () { closeModal('submitModal'); });

  if (submitProjForm) {
    submitProjForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var submitBtn = submitProjForm.querySelector('button[type="submit"]');
      var span      = submitBtn.querySelector('span') || submitBtn;
      var origText  = span.textContent;
      submitBtn.disabled = true;
      span.textContent   = 'Submitting…';

      var body = {
        memberEmail:  memberEmail,
        title:        document.getElementById('sp-title').value.trim(),
        domain:       document.getElementById('sp-domain').value,
        seats:        document.getElementById('sp-seats').value,
        description:  document.getElementById('sp-desc').value.trim(),
        skills:       document.getElementById('sp-skills').value.trim(),
      };

      try {
        var res  = await fetch('/api/project', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        var data = await res.json();
        if (res.ok && data.success) {
          if (submitFormState) submitFormState.style.display = 'none';
          if (submitSuccess)   submitSuccess.classList.add('show');
        } else {
          span.textContent   = data.error || 'Error — try again';
          submitBtn.disabled = false;
          setTimeout(function () { span.textContent = origText; }, 3500);
        }
      } catch {
        span.textContent   = 'Network error — retry';
        submitBtn.disabled = false;
        setTimeout(function () { span.textContent = origText; }, 3500);
      }
    });
  }

  /* ─────────────────────────────
     FILE UPLOAD UX
  ───────────────────────────── */
  function resetFileUpload(areaId, labelId) {
    var area  = document.getElementById(areaId);
    var label = document.getElementById(labelId);
    if (area)  area.classList.remove('has-file');
    if (label) label.innerHTML = 'Drop your CV here or <strong>click to browse</strong>';
  }

  function initFileUpload(inputId, areaId, labelId) {
    var input = document.getElementById(inputId);
    var area  = document.getElementById(areaId);
    var label = document.getElementById(labelId);
    if (!input || !area || !label) return;

    input.addEventListener('change', function () {
      var file = input.files[0];
      if (file) { area.classList.add('has-file'); label.innerHTML = '&#128196; <strong>' + file.name + '</strong>'; }
    });
    area.addEventListener('dragover',  function (e) { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', function ()  { area.classList.remove('dragover'); });
    area.addEventListener('drop', function (e) {
      e.preventDefault(); area.classList.remove('dragover');
      var file = e.dataTransfer.files[0];
      if (file) { area.classList.add('has-file'); label.innerHTML = '&#128196; <strong>' + file.name + '</strong>'; }
    });
  }

  initFileUpload('cr-cv', 'crCvArea', 'crCvLabel');

})();
