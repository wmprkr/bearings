/* QuietType Micro.blog gallery */
(async () => {
  const root = document.querySelector('.qt-mb-gallery');
  if (!root) return;

  const grid = root.querySelector('.qt-mb-gallery-grid');
  const feedUrl = root.getAttribute('data-feed');
  const limit = parseInt(root.getAttribute('data-limit') || '12', 10);

  if (!feedUrl) {
    grid.innerHTML = '<p>Feed not configured.</p>';
    return;
  }

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
      } catch {
        break;
      }
    }

    return items;
  }

  const tmp = document.createElement('div');

  function parsePhoto(item) {
    if (!item.content_html) return null;

    tmp.innerHTML = item.content_html;
    const img = tmp.querySelector('img');
    if (!img?.src) return null;

    return {
      src: img.src,
      alt: (item.content_text || tmp.textContent || '').trim().slice(0, 140) || img.alt || 'Photo',
      url: item.url || '#',
      date: new Date(item.date_published || 0).getTime()
    };
  }

  try {
    const items = await fetchItems(feedUrl, limit * 3);

    const photos = items
      .map(parsePhoto)
      .filter(Boolean)
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);

    if (!photos.length) {
      grid.innerHTML = '<p>No recent photos found.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    photos.forEach(photo => {
      const cell = document.createElement('figure');
      cell.className = 'qt-mb-gallery-item';

      const link = document.createElement('a');
      link.className = 'qt-mb-gallery-link';
      link.href = photo.url;
      link.rel = 'noopener';

      const img = document.createElement('img');
      img.className = 'qt-mb-gallery-image';
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.decoding = 'async';

      link.appendChild(img);
      cell.appendChild(link);
      fragment.appendChild(cell);
    });

    grid.replaceChildren(fragment);
  } catch {
    grid.innerHTML = "<p>Couldn't load photos right now.</p>";
  }
})();