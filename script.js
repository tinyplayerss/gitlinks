// Responsive GitLinks engine — icons fixed to the left edge inside each button; text offset to the right.
// Spacers now use the same centered max-width as buttons so dividers align.
(function () {
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  let cachedUserData = null;
  let cachedGitHubData = null;

  function computeResponsiveSizes() {
    const w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (w < 360) {
      return { favicon: 36, textPx: 15, rowPaddingY: 10, rowPaddingX: 0, gap: 12, buttonMaxWidth: 'calc(100% - 24px)' };
    } else if (w < 480) {
      return { favicon: 40, textPx: 16, rowPaddingY: 12, rowPaddingX: 0, gap: 12, buttonMaxWidth: 'calc(100% - 28px)' };
    } else if (w < 768) {
      return { favicon: 44, textPx: 18, rowPaddingY: 12, rowPaddingX: 0, gap: 14, buttonMaxWidth: '640px' };
    } else if (w < 1024) {
      return { favicon: 48, textPx: 18, rowPaddingY: 14, rowPaddingX: 0, gap: 16, buttonMaxWidth: '640px' };
    } else {
      return { favicon: 56, textPx: 20, rowPaddingY: 16, rowPaddingX: 0, gap: 18, buttonMaxWidth: '720px' };
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function extractHostname(link) {
    if (!link) return '';
    try {
      let u;
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(link)) {
        u = new URL(link);
      } else if (link.startsWith('//')) {
        u = new URL(window.location.protocol + link);
      } else {
        u = new URL('https://' + link);
      }
      return u.hostname;
    } catch (e) {
      return link.replace(/(^\w+:|^)\/\//, '').split('/')[0];
    }
  }

  function buildFaviconImg(linkUrl, displaySize) {
    const hostname = extractHostname(linkUrl);
    if (!hostname) {
      return '<div class="favicon-placeholder rounded-circle" style="width:' + displaySize + 'px; height:' + displaySize + 'px; background:rgba(255,255,255,0.06); border-radius:9999px;"></div>';
    }
    const g1 = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(hostname) + '&sz=64';
    const g2 = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(hostname) + '&sz=128';
    return '<img alt="Favicon" class="favicon" src="' + g1 + '" srcset="' + g2 + ' 2x" ' +
      'width="' + displaySize + '" height="' + displaySize + '" ' +
      'style="width:' + displaySize + 'px;height:' + displaySize + 'px;object-fit:cover;border-radius:9999px;display:block;" />';
  }

  function renderGitHubProfile(data) {
    if (!data) return;
    $('#githubProfileContainer').empty().append(
      '<img alt="GitHub Profile" class="rounded-circle" style="width:96px;height:96px;border:6px solid rgba(194,43,61,0.9);padding:4px;object-fit:cover;border-radius:9999px;" src="' + data.avatar_url + '"/>' +
      '<span class="github-name fs-3" style="margin-left:12px; font-size:1.25rem; vertical-align:middle; color:var(--username-color);">' + escapeHtml(data.login) + '</span>'
    );
  }

  function renderLinks(userData) {
    if (!userData) return;
    const sizes = computeResponsiveSizes();
    const $targetUl = $('#buttonContainer').length ? $('#buttonContainer ul') : $('#linkContainer ul');
    $targetUl.empty();

    userData.links.forEach(linkData => {
      const isSpacer = !!(linkData && (
        (linkData.type && String(linkData.type).toLowerCase() === 'spacer') ||
        (linkData.item && String(linkData.item).toLowerCase() === 'spacer') ||
        (String(linkData.name).toLowerCase() === 'spacer' && !linkData.url)
      ));

      // shared li inline style used by buttons — reuse for spacers so everything lines up
      const liInlineStyle = 'width:100%;max-width:' + sizes.buttonMaxWidth + ';margin-left:auto;margin-right:auto;box-sizing:border-box;';

      if (isSpacer) {
        const color = escapeHtml(linkData.color || '#ffffff');
        const title = linkData.title ? escapeHtml(linkData.title) : '';
        if (title) {
          $targetUl.append(
            '<li class="w-100 m-0 mb-4 rounded-pill list-item spacer-li" style="pointer-events:none; ' + liInlineStyle + '">' +
              '<div style="display:flex; align-items:center; gap:12px; margin:14px 12px;">' +
                '<div style="flex:1; height:1px; background:' + color + '; opacity:0.25; border-radius:4px;"></div>' +
                '<span style="white-space:nowrap; padding:0 12px; color:' + color + '; opacity:0.95; font-weight:600; font-size:0.95rem;">' + title + '</span>' +
                '<div style="flex:1; height:1px; background:' + color + '; opacity:0.25; border-radius:4px;"></div>' +
              '</div>' +
            '</li>'
          );
        } else {
          $targetUl.append(
            '<li class="w-100 m-0 mb-4 rounded-pill list-item spacer-li" style="pointer-events:none; ' + liInlineStyle + '">' +
              '<div style="height:1px; background:' + color + '; opacity:0.25; border-radius:4px; margin:14px 12px;"></div>' +
            '</li>'
          );
        }
      } else {
        const name = escapeHtml(linkData.name || '');
        const url = escapeHtml(linkData.url || '#');
        const faviconHtml = buildFaviconImg(linkData.url, sizes.favicon);

        // anchor: small left padding only (inset), right padding normal; position:relative to contain absolute favicon
        const aInlineStyle = 'display:block;position:relative;padding:' + sizes.rowPaddingY + 'px ' + sizes.rowPaddingX + 'px ' + sizes.rowPaddingY + 'px ' + sizes.rowPaddingX + 'px;width:100%;box-sizing:border-box;';

        // favicon absolute at the inner inset (left edge inside rounded button)
        const faviconWrapperStyle = 'position:absolute;left:' + sizes.rowPaddingX + 'px;top:50%;transform:translateY(-50%);width:' + sizes.favicon + 'px;height:' + sizes.favicon + 'px;display:flex;align-items:center;justify-content:center;';

        // text is offset to the right of the icon (icon width + gap)
        const textOffset = sizes.favicon + sizes.gap;
        const linkLabelStyle = 'flex:1;min-width:0;margin-left:' + textOffset + 'px;';

        const rowHtml =
          '<li class="w-100 position-relative m-0 mb-4 rounded-pill border border-secondary list-item" style="' + liInlineStyle + '">' +
            '<a target="_blank" rel="noopener noreferrer" class="link text-decoration-none" href="' + url + '" style="' + aInlineStyle + '">' +
              '<div class="favicon-wrapper" style="' + faviconWrapperStyle + '">' + faviconHtml + '</div>' +
              '<div class="link-label" style="' + linkLabelStyle + '">' +
                '<div class="text-truncate" style="font-size:' + sizes.textPx + 'px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + name + '</div>' +
              '</div>' +
            '</a>' +
          '</li>';

        $targetUl.append(rowHtml);
      }
    });

    if (cachedGitHubData) {
      renderGitHubProfile(cachedGitHubData);
    }
  }

  function createLinks() {
    $.ajax({
      url: 'user.json?t=' + Date.now(),
      cache: false,
      error: () => { alert('Error fetching user data'); },
      success: (userData) => {
        cachedUserData = userData || null;
        renderLinks(cachedUserData);

        if (cachedUserData && cachedUserData.githubUsername && !cachedGitHubData) {
          $.ajax({
            url: 'https://api.github.com/users/' + encodeURIComponent(cachedUserData.githubUsername),
            error: () => { console.warn('GitHub API request failed'); },
            success: (data) => {
              cachedGitHubData = data;
              renderGitHubProfile(data);
            }
          });
        }
      }
    });
  }

  const handleResize = debounce(() => {
    if (cachedUserData) renderLinks(cachedUserData);
  }, 160);

  $(document).ready(() => {
    createLinks();
    window.addEventListener('resize', handleResize, { passive: true });
  });
})();