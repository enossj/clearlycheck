function initFAQ() {
  var items = document.querySelectorAll('.faq-q');
  items.forEach(function(btn, index) {
    var answer = btn.nextElementSibling;
    if (!answer || !answer.classList.contains('faq-a')) return;

    var answerId = answer.id || 'faq-answer-' + index;
    answer.id = answerId;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', answerId);

    if (!btn.querySelector('.faq-icon')) {
      var icon = document.createElement('span');
      icon.className = 'faq-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '+';
      btn.appendChild(icon);
    }

    btn.addEventListener('click', function() {
      var isOpen = btn.classList.contains('open');
      document.querySelectorAll('.faq-q.open').forEach(function(b) {
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
        if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
      });
      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFAQ);
} else {
  initFAQ();
}
