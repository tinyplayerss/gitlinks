// Responsive GitLinks engine — adds support for bio "tags" rendered before the bio text.
// Tags are small rounded labels with customizable colors. Bio remains textContent (no Twemoji parsing).
(function () {
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Cached data
  let cachedUserData = null;
  let cachedGitHubData = null;

  // Responsive sizing
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

  // --- Simple helpers ---
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function decodeHtmlEntities(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  // reuse the shortcode map (small) if desired — you can expand later
  const SHORTCODE_MAP = {
    smile: '😄', heart: '❤️', rocket: '🚀', flag_za: '🇿🇦'
  };
  function replaceShortcodes(s) {
    if (!s) return s;
    return s.replace(/:([a-z0-9_+-]+):/gi, (match, name) => {
      const key = name.toLowerCase();
      return SHORTCODE_MAP[key] || match;
    });
  }

  function sanitizeInlineText(raw) {
    if (!raw) return '';
    return replaceShortcodes(decodeHtmlEntities(raw));
  }

  // Validate hex color (#rgb or #rrggbb)
  function isHexColor(value) {
    return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
  }

  // Compute readable text color (#000 or #fff) for a hex background using YIQ-like formula
  function readableTextColorForHex(hex) {
    if (!isHexColor(hex)) return '#ffffff';
    const h = hex.replace('#', '');
    const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0,2), 16);
    const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2,4), 16);
    const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4,6), 16);
    // YIQ / perceived brightness
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
  }

  // --- Hostname / favicon building (unchanged) ---
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

  // --- Tags rendering ---
  // Accepts either userData.tags (array) or userData.tag (single object).
  // Tag object accepted fields: title (string), color (css color string, hex recommended).
  function getTagsFromUserData(userData) {
    if (!userData) return [];
    if (Array.isArray(userData.tags)) return userData.tags;
    if (userData.tag && typeof userData.tag === 'object') return [userData.tag];
    // Also support a simple shorthand: userData.tagsCSV or userData.tagString (comma separated)
    if (typeof userData.tagsCSV === 'string') {
      return userData.tagsCSV.split(',').map(s => ({ title: s.trim() })).filter(t => t.title);
    }
    return [];
  }

  function renderTags(userData) {
    // remove existing to avoid duplicates
    $('#bioTags').remove();

    const tags = getTagsFromUserData(userData);
    if (!tags || tags.length === 0) return;

    const sizes = computeResponsiveSizes();
    const tagFontPx = Math.max(11, sizes.textPx - 2);

    // Build container
    const container = document.createElement('div');
    container.id = 'bioTags';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.gap = '8px';
    container.style.flexWrap = 'wrap';
    container.style.maxWidth = '90%';
    container.style.marginLeft = 'auto';
    container.style.marginRight = 'auto';
    container.style.marginTop = '6px';
    container.style.marginBottom = '6px';

    // Create each tag
    tags.forEach(t => {
      if (!t) return;
      const rawTitle = String(t.title || t.name || '').trim();
      if (!rawTitle) return;

      const titleNormalized = sanitizeInlineText(rawTitle);
      const span = document.createElement('span');
      // textContent is safe and preserves any unicode (no HTML)
      span.textContent = titleNormalized;
      span.style.display = 'inline-block';
      span.style.padding = '6px 10px';
      span.style.borderRadius = '999px';
      span.style.fontSize = tagFontPx + 'px';
      span.style.lineHeight = '1';
      span.style.fontWeight = '600';
      span.style.letterSpacing = '0.1px';
      span.style.boxSizing = 'border-box';
      span.style.whiteSpace = 'nowrap';
      span.style.margin = '2px';

      // color/background
      const colorVal = (t.color || '').trim();
      if (isHexColor(colorVal)) {
        span.style.background = colorVal;
        span.style.color = readableTextColorForHex(colorVal);
      } else if (colorVal) {
        // accept arbitrary css color strings (named colors or rgb); try to use it but fallback to white text
        span.style.background = colorVal;
        span.style.color = '#ffffff';
      } else {
        // default subtle pill
        span.style.background = 'rgba(255,255,255,0.06)';
        span.style.color = 'var(--item-text-color)';
      }

      container.appendChild(span);
    });

    // Insert tags before the bio (right after githubProfileContainer)
    const profileContainer = document.getElementById('githubProfileContainer');
    if (profileContainer && profileContainer.parentNode) {
      profileContainer.parentNode.insertBefore(container, profileContainer.nextSibling);
    } else {
      $('#githubProfileContainer').after(container);
    }
  }

  // --- Bio rendering (textContent; no Twemoji parsing here) ---
  function renderBio(userData) {
    if (!userData) return;
    const raw = typeof userData.bio === 'string' ? userData.bio.trim() : '';
    $('#bioContainer').remove();
    if (!raw) return;

    // normalize shortcodes/entities to unicode (if you want)
    const normalized = sanitizeInlineText(raw);

    const sizes = computeResponsiveSizes();
    const bioFontPx = Math.max(13, sizes.textPx);

    const maxDisplayChars = 240;
    const truncated = normalized.length > maxDisplayChars ? normalized.slice(0, maxDisplayChars).trim() + '…' : normalized;

    const bioEl = document.createElement('div');
    bioEl.id = 'bioContainer';
    bioEl.className = 'text-center';
    bioEl.style.marginTop = '6px';
    bioEl.style.marginBottom = '8px';
    bioEl.style.color = 'var(--item-text-color)';
    bioEl.style.fontSize = bioFontPx + 'px';
    bioEl.style.lineHeight = '1.35';
    bioEl.style.maxWidth = '90%';
    bioEl.style.marginLeft = 'auto';
    bioEl.style.marginRight = 'auto';
    bioEl.title = normalized;
    bioEl.textContent = truncated; // use textContent so characters + emojis remain inline and safe

    const profileContainer = document.getElementById('githubProfileContainer');
    if (profileContainer && profileContainer.parentNode) {
      // Try to insert after tags if they exist. If #bioTags exists, insert after it; else after profile.
      const tagsEl = document.getElementById('bioTags');
      if (tagsEl && tagsEl.parentNode) tagsEl.parentNode.insertBefore(bioEl, tagsEl.nextSibling);
      else profileContainer.parentNode.insertBefore(bioEl, profileContainer.nextSibling);
    } else {
      $('#githubProfileContainer').after(bioEl);
    }
  }

  // --- Links & profile rendering unchanged (keeps earlier responsive logic) ---
  function renderGitHubProfile(data) {
    if (!data) return;
    const username = escapeHtml(sanitizeInlineText(data.login || ''));
    $('#githubProfileContainer').empty().append(
      '<img alt="GitHub Profile" class="rounded-circle" style="width:96px;height:96px;border:6px solid rgba(194,43,61,0.9);padding:4px;object-fit:cover;border-radius:9999px;" src="' + data.avatar_url + '"/>' +
      '<span class="github-name fs-3" style="margin-left:12px; font-size:1.25rem; vertical-align:middle; color:var(--username-color);">' + username + '</span>'
    );
    // profile area may contain emoji shortcodes converted to unicode already; no special handling needed here
  }

  function renderLinks(userData) {
    if (!userData) return;
    const sizes = computeResponsiveSizes();
    const $targetUl = $('#buttonContainer').length ? $('#buttonContainer ul') : $('#linkContainer ul');
    $targetUl.empty();

    const baseLiInline = w => 'width:100%;max-width:' + w + ';margin-left:auto;margin-right:auto;box-sizing:border-box;';

    userData.links.forEach(linkData => {
      const isSpacer = !!(linkData && (
        (linkData.type && String(linkData.type).toLowerCase() === 'spacer') ||
        (linkData.item && String(linkData.item).toLowerCase() === 'spacer') ||
        (String(linkData.name).toLowerCase() === 'spacer' && !linkData.url)
      ));

      const liInlineStyle = baseLiInline(sizes.buttonMaxWidth);

      if (isSpacer) {
        const rawColor = linkData.color || '#ffffff';
        const color = escapeHtml(rawColor);
        const rawTitle = linkData.title ? String(linkData.title) : '';
        const title = escapeHtml(sanitizeInlineText(rawTitle));

        if (rawTitle) {
          $targetUl.append(
            '<li class="w-100 m-0 mb-4 rounded-pill list-item spacer-li" style="pointer-events:none; ' + liInlineStyle + '">' +
              '<div style="display:flex; align-items:center; gap:12px; margin:14px ' + (sizes.rowPaddingX || 12) + 'px;">' +
                '<div style="flex:1; height:1px; background:' + color + '; opacity:0.25; border-radius:4px;"></div>' +
                '<span style="white-space:nowrap; padding:0 12px; color:' + color + '; opacity:0.95; font-weight:600; font-size:0.95rem;">' + title + '</span>' +
                '<div style="flex:1; height:1px; background:' + color + '; opacity:0.25; border-radius:4px;"></div>' +
              '</div>' +
            '</li>'
          );
        } else {
          $targetUl.append(
            '<li class="w-100 m-0 mb-4 rounded-pill list-item spacer-li" style="pointer-events:none; ' + liInlineStyle + '">' +
              '<div style="height:1px; background:' + color + '; opacity:0.25; border-radius:4px; margin:14px ' + (sizes.rowPaddingX || 12) + 'px;"></div>' +
            '</li>'
          );
        }
      } else {
        const rawName = linkData.name || '';
        const displayName = escapeHtml(sanitizeInlineText(rawName));
        const url = escapeHtml(linkData.url || '#');
        const faviconHtml = buildFaviconImg(linkData.url, sizes.favicon);

        const aInlineStyle = 'display:block;position:relative;padding:' + sizes.rowPaddingY + 'px ' + sizes.rowPaddingX + 'px ' + sizes.rowPaddingY + 'px ' + sizes.rowPaddingX + 'px;width:100%;box-sizing:border-box;';
        const faviconWrapperStyle = 'position:absolute;left:' + sizes.rowPaddingX + 'px;top:50%;transform:translateY(-50%);width:' + sizes.favicon + 'px;height:' + sizes.favicon + 'px;display:flex;align-items:center;justify-content:center;';
        const textOffset = sizes.favicon + sizes.gap;
        const linkLabelStyle = 'flex:1;min-width:0;margin-left:' + textOffset + 'px;';

        const rowHtml =
          '<li class="w-100 position-relative m-0 mb-4 rounded-pill border border-secondary list-item" style="' + liInlineStyle + '">' +
            '<a target="_blank" rel="noopener noreferrer" class="link text-decoration-none" href="' + url + '" style="' + aInlineStyle + '">' +
              '<div class="favicon-wrapper" style="' + faviconWrapperStyle + '">' + faviconHtml + '</div>' +
              '<div class="link-label" style="' + linkLabelStyle + '">' +
                '<div class="text-truncate" style="font-size:' + sizes.textPx + 'px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + displayName + '</div>' +
              '</div>' +
            '</a>' +
          '</li>';

        $targetUl.append(rowHtml);
      }
    });
  }

  // --- Main fetch + render flow ---
  function createLinks() {
    $.ajax({
      url: 'user.json?t=' + Date.now(),
      cache: false,
      error: () => { alert('Error fetching user data'); },
      success: (userData) => {
        cachedUserData = userData || null;

        // Render tags first, then bio, then links
        renderTags(cachedUserData);
        renderBio(cachedUserData);
        renderLinks(cachedUserData);

        if (cachedUserData && cachedUserData.githubUsername && !cachedGitHubData) {
          $.ajax({
            url: 'https://api.github.com/users/' + encodeURIComponent(cachedUserData.githubUsername),
            error: () => { console.warn('GitHub API request failed'); },
            success: (data) => {
              cachedGitHubData = data;
              renderGitHubProfile(data);
              // re-insert tags & bio after profile in case profile rendering changed layout
              renderTags(cachedUserData);
              renderBio(cachedUserData);
            }
          });
        }
      }
    });
  }

  // Re-render links + tags + bio on resize
  const handleResize = debounce(() => {
    if (cachedUserData) {
      renderTags(cachedUserData);
      renderBio(cachedUserData);
      renderLinks(cachedUserData);
    }
  }, 160);

  $(document).ready(() => {
    createLinks();
    window.addEventListener('resize', handleResize, { passive: true });
  });
})();