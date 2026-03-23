/* QuietType Micro.blog latest post */
(async () => {
  const root = document.querySelector('.qt-mb-latest');
  const feed = root?.getAttribute('data-feed');

  if (!root || !feed) return;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  try {
    const res = await fetch(feed);
    if (!res.ok) return;

    const data = await res.json();
    const post = data.items?.[0];
    if (!post) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content_html || '', 'text/html');

    let thumb = null;
    let isBook = false;

    const img = doc.querySelector('img');
    if (img) {
      thumb = img.src;
      isBook = img.classList.contains('microblog_book');
      img.remove();
    }

    const cleanedHtml = doc.body.innerHTML.trim();
    const fallbackText = post.content_text
      ? `<p>${escapeHtml(post.content_text)}</p>`
      : '';

    const bodyHtml = cleanedHtml || fallbackText || '<p>Untitled post.</p>';

    const published = new Date(post.date_published || Date.now());
    const mins = Math.floor((Date.now() - published.getTime()) / 60000);

    function ago(n, unit) {
      return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    }

    const when =
      mins < 1 ? 'just now' :
      mins < 60 ? ago(mins, 'minute') :
      mins < 1440 ? ago(Math.floor(mins / 60), 'hour') :
      mins < 43200 ? ago(Math.floor(mins / 1440), 'day') :
      mins < 525600 ? ago(Math.floor(mins / 43200), 'month') :
      ago(Math.floor(mins / 525600), 'year');

    const permalink = post.url || '#';

    root.innerHTML =
      '<div class="qt-mb-latest-inner">' +
        (thumb
          ? '<a class="qt-mb-latest-media" href="' + permalink + '" rel="noopener">' +
              '<img class="qt-mb-latest-thumb' + (isBook ? ' qt-mb-latest-thumb--book' : '') + '" src="' + thumb + '" alt="">' +
            '</a>'
          : ''
        ) +
        '<div class="qt-mb-latest-body">' +
          '<div class="qt-label">Current status</div>' +
          '<div class="qt-mb-latest-text">' + bodyHtml + '</div>' +
          '<a class="qt-mb-latest-time" href="' + permalink + '" rel="noopener">' + when + '</a>' +
        '</div>' +
      '</div>';

    root.removeAttribute('hidden');
  } catch {
    root.innerHTML = '<p class="qt-mb-latest-fallback">Couldn’t load current status right now.</p>';
    root.removeAttribute('hidden');
  }
})();