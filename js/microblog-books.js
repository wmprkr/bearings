/* Micro.blog books | robertbirming.com — qt-mb- port */
(async () => {
  const root = document.querySelector('.qt-mb-books');
  if (!root) return;

  const grid = root.querySelector('.qt-mb-books-grid');
  const feedUrl = root.getAttribute('data-feed');
  const limit = parseInt(root.getAttribute('data-limit') || '12', 10);

  if (!feedUrl) { grid.innerHTML = '<p>Feed not configured.</p>'; return; }

  async function fetchItems(url, max) {
    const items = [];
    let next = url;
    while (next && items.length < max) {
      try {
        const res = await fetch(next);
        if (!res.ok) break;
        const data = await res.json();
        items.push(...(data.items || []));
        next = data.next_url || null;
      } catch { break; }
    }
    return items;
  }

  const tmp = document.createElement('div');

  function parseBook(item) {
    if (!item.content_html) return null;
    tmp.innerHTML = item.content_html;
    const img = tmp.querySelector('img.microblog_book');
    if (!img?.src) return null;
    const bookLink = tmp.querySelector('a[href*="micro.blog/books"]');
    const title = bookLink?.textContent?.trim() || 'Book';

    let author = '';
    let review = '';

    const paras = tmp.querySelectorAll('p');
    paras.forEach((p, i) => {
      if (i === 0) {
        const text = p.textContent || '';
        const byMatch = text.match(/\bby\s+([^.📚\n]+)/);
        if (byMatch) author = byMatch[1].trim();
        const afterBy = text.replace(/^.*\bby\s+[^.📚\n]+[.📚]?\s*/, '').trim();
        if (afterBy) review = afterBy;
      } else {
        review += (review ? ' ' : '') + p.textContent.trim();
      }
    });

    review = review.replace(/📚/g, '').trim();

    return {
      cover: img.src,
      title,
      author,
      review,
      url: item.url || '#',
      date: new Date(item.date_published || 0).getTime()
    };
  }

  try {
    const items = await fetchItems(feedUrl, limit * 2);
    const books = items
      .map(parseBook)
      .filter(Boolean)
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);

    if (!books.length) { grid.innerHTML = '<p>No recent books found.</p>'; return; }

    const fragment = document.createDocumentFragment();
    books.forEach(book => {
      const cell = document.createElement('div');
      cell.className = 'qt-mb-books-item';
      cell.innerHTML =
        '<a class="qt-mb-books-cover" href="' + book.url + '" rel="noopener" title="' + book.title + '">' +
          '<img src="' + book.cover + '" alt="' + book.title + '" loading="lazy" decoding="async">' +
        '</a>' +
        '<div class="qt-mb-books-meta">' +
          '<a class="qt-mb-books-title" href="' + book.url + '" rel="noopener">' + book.title + '</a>' +
          (book.author ? '<span class="qt-mb-books-author">' + book.author + '</span>' : '') +
          (book.review ? '<p class="qt-mb-books-review">' + book.review + '</p>' : '') +
        '</div>';
      fragment.appendChild(cell);
    });

    grid.replaceChildren(fragment);
  } catch {
    grid.innerHTML = "<p>Couldn't load books right now.</p>";
  }
})();