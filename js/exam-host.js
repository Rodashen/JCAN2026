// GitHub Pages provides the public information site; Cloudflare protects exams.
if (location.hostname.endsWith('.github.io')) {
  const page = location.pathname.split('/').pop() || 'exams.html';
  const target = new URL(page, 'https://jcan-exam-access.tararoneee.workers.dev/');
  target.search = location.search;
  location.replace(target.href);
}
// Recheck open exam pages so an older browser session also loses its workspace.
if (!location.hostname.endsWith('.github.io') && /\/(cbt|ubt|exams|ishihara|skills)\.html$/.test(location.pathname)) {
  let checking = false;
  async function checkAccess() {
    if (checking) return;
    checking = true;
    try {
      const response = await fetch('/api/session', {credentials:'same-origin', cache:'no-store'});
      if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
        const session = await response.json();
        if (!session.authenticated) location.replace('/exam-access.html?next='+location.pathname.split('/').pop().replace('.html',''));
      }
    } catch { /* Temporary network failures should not erase exam progress. */ }
    finally { checking = false; }
  }
  setInterval(checkAccess, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkAccess(); });
  window.addEventListener('focus', checkAccess);
}
