function showError(msg) {
  var el = document.getElementById('errorMsg');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.setAttribute('role', 'alert');
}

function hideError() {
  var el = document.getElementById('errorMsg');
  if (el) el.style.display = 'none';
}

async function handleSubmit(event) {
  event.preventDefault();
  hideError();

  var form = document.getElementById('contactForm');
  var name = document.getElementById('name').value.trim();
  var email = document.getElementById('email').value.trim();
  var subject = document.getElementById('subject').value;
  var message = document.getElementById('message').value.trim();

  if (!name || !email || !subject || !message) {
    showError('Please fill in all fields before sending.');
    return;
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  var formId = window.CLEARLYCHECK_FORMSPREE_ID;
  if (!formId || formId === 'YOUR_FORM_ID') {
    showError('Contact form is not configured yet. Email us at hello@clearlycheck.com');
    return;
  }

  var submitBtn = form.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    var response = await fetch('https://formspree.io/f/' + formId, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      form.style.display = 'none';
      document.getElementById('successMsg').style.display = 'block';
    } else {
      var data = await response.json().catch(function() { return {}; });
      showError(data.error || 'Something went wrong. Please try again or email hello@clearlycheck.com');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message →';
    }
  } catch (err) {
    showError('Network error. Please try again or email hello@clearlycheck.com');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message →';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', handleSubmit);
});
