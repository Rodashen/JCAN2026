// GitHub Pages provides the public information site; Cloudflare protects exams.
if (location.hostname.endsWith('.github.io')) {
  const page = location.pathname.split('/').pop() || 'exams.html';
  const target = new URL(page, 'https://jcan-exam-access.tararoneee.workers.dev/');
  target.search = location.search;
  location.replace(target.href);
}
