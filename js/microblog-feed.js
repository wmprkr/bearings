<script>
/* QuietType Micro.blog feed */
(async () => {
  const root = document.querySelector('.qt-mb-feed');
  if (!root) return;

  const list = root.querySelector('.qt-mb-feed-list');
  const feedUrl = root.getAttribute('data-feed');
  const limit = parseInt(root.getAttribute('data-limit') || '10', 10);

  if (!feedUrl) {
    list.innerHTML = '<p>Feed not configured.</p>';
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
        items.push(...(data.items || []).filter(i => i?.content_html || i?.content_text));
        next = data.next_url || null;
      } catch {
        break;
      }
    }

    return items.slice(0, max);
  }

  async function fetchReplies(permalink, el) {
    try {
      const res = await fetch(
        'https://micro.blog/conversation.js?url=' +
        encodeURIComponent(permalink) +
        '&format=jsonfeed'
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      const count = data.items?.length || 0;
      const page = data.home_page_url || permalink;

      el.innerHTML =
        '<a href="' + page + '" rel="noopener">' +
        (count > 0
          ? count + ' ' + (count === 1 ? 'reply' : 'replies')
          : 'Reply') +
        '</a>';
    } catch {
      el.innerHTML = '<a href="' + permalink + '" rel="noopener">Reply</a>';
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  try {
    const items = await fetchItems(feedUrl, limit);

    if (!items.length) {
      list.innerHTML = '<p>No recent notes found.</p>';
      return;
    }

    list.innerHTML = '';

    items
      .sort((a, b) => new Date(b.date_published || 0) - new Date(a.date_published || 0))
      .forEach(item => {
        const card = document.createElement('article');
        card.className = 'qt-mb-feed-note';

        const html = item.content_html
          || '<p>' + escapeHtml(item.content_text || '') + '</p>';

        const permalink = item.url || '#';

        const date = new Date(item.date_published || Date.now()).toLocaleDateString(
          'en-US',
          { year: 'numeric', month: 'short', day: 'numeric' }
        );

        card.innerHTML =
          '<div class="qt-mb-feed-content">' + html + '</div>' +
          '<div class="qt-mb-feed-meta">' +
            '<a class="qt-mb-feed-date" href="' + permalink + '" rel="noopener">' + date + '</a>' +
            '<span class="qt-mb-feed-replies"><a href="' + permalink + '" rel="noopener">Reply</a></span>' +
          '</div>';

        list.appendChild(card);
        fetchReplies(permalink, card.querySelector('.qt-mb-feed-replies'));
      });
  } catch {
    list.innerHTML = "<p>Couldn't load notes right now.</p>";
  }
})();
</script>