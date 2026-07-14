(function () {
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(current());
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('theme', next); } catch (e) {}
        apply(next);
      });
    }
  });

  // Follow OS changes only until the user picks explicitly.
  mq.addEventListener('change', function (e) {
    if (!stored()) apply(e.matches ? 'dark' : 'light');
  });
})();
