/* Micro.blog latest post | robertbirming.com — qt-mb- port */
(async () => {
  const root = document.querySelector('.qt-mb-latest');
  const feed = root?.getAttribute('data-feed');
  if (!feed) return;
  try {
    const res = await fetch(feed);
    if (!res.ok) return;
    const { items } = await res.json();
    const post = items?.[0];
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
    const text = doc.body.innerHTML.trim();
    const mins = (Date.now() - new Date(post.date_published)) / 60000 | 0;
    const ago = (n, u) => n + ' ' + u + (n === 1 ? '' : 's') + ' ago';
    const when = mins < 1 ? 'just now'
      : mins < 60    ? ago(mins, 'minute')
      : mins < 1440  ? ago(mins / 60 | 0, 'hour')
      : mins < 43200 ? ago(mins / 1440 | 0, 'day')
      : mins < 525600 ? ago(mins / 43200 | 0, 'month')
      : ago(mins / 525600 | 0, 'year');
    root.innerHTML =
      (thumb
        ? '<a href="' + post.url + '" rel="noopener">'
          + '<img class="qt-mb-latest-thumb'
          + (isBook ? ' qt-mb-latest-thumb--book' : '')
          + '" src="' + thumb + '" alt=""></a>'
        : '') +
      '<div class="qt-mb-latest-body">' +
        '<div class="qt-mb-latest-text">' + text + '</div>' +
        '<a class="qt-mb-latest-time" href="' + post.url + '" rel="noopener">'
          + when + '</a>' +
      '</div>';
    root.removeAttribute('hidden');
  } catch {}
})();