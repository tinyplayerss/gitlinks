// Function to dynamically create links and fetch GitHub user data
function createLinks() {
  $.ajax({
    url: 'user.json',
    error: () => {
      alert('Error fetching user data');
    },
    success: (userData) => {
      // choose a single target list to render into; preserves JSON order
      const $targetUl = $('#buttonContainer').length ? $('#buttonContainer ul') : $('#linkContainer ul');

      // clear previous contents to avoid duplicates
      $targetUl.empty();

      // helper to escape HTML to avoid accidental XSS when inserting user-provided strings
      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      // helper to extract hostname from a URL or domain-like string
      function extractHostname(link) {
        if (!link) return '';
        try {
          // If link is something like "example.com" the URL constructor needs a protocol
          let u;
          if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(link)) {
            u = new URL(link);
          } else if (link.startsWith('//')) {
            u = new URL(window.location.protocol + link);
          } else {
            // assume http if no protocol present
            u = new URL('https://' + link);
          }
          return u.hostname;
        } catch (e) {
          // fallback: strip protocol/path and return first segment
          return link.replace(/(^\w+:|^)\/\//, '').split('/')[0];
        }
      }

      // build an <img> string for a high-quality favicon using srcset
      function buildFaviconImg(linkUrl, displaySize = 48) {
        const hostname = extractHostname(linkUrl);
        if (!hostname) {
          // empty placeholder if we can't determine domain
          return '<div class="favicon-placeholder rounded-circle" style="width:' + displaySize + 'px; height:' + displaySize + 'px; background:rgba(255,255,255,0.06)"></div>';
        }

        // Use Google's s2 favicon service with size parameter and provide a 2x option
        // sz=64 for 1x, sz=128 for 2x (so it remains sharp on high-DPI)
        const g1 = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(hostname) + '&sz=64';
        const g2 = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(hostname) + '&sz=128';

        // Use inline styles to ensure image uses the requested display size but can use higher-res source
        // object-fit: cover keeps shape when using rounded-circle CSS
        return '<img alt="Favicon" class="favicon mt-2 mb-2 p-0 rounded-circle float-left" ' +
               'src="' + g1 + '" ' +
               'srcset="' + g2 + ' 2x" ' +
               'width="' + displaySize + '" height="' + displaySize + '" ' +
               'style="object-fit:cover;" ' +
               '/>';
      }

      userData.links.forEach(linkData => {
        // robust spacer detection
        const isSpacer = !!(linkData && (
          (linkData.type && String(linkData.type).toLowerCase() === 'spacer') ||
          (linkData.item && String(linkData.item).toLowerCase() === 'spacer') ||
          (String(linkData.name).toLowerCase() === 'spacer' && !linkData.url)
        ));

        if (isSpacer) {
          const color = escapeHtml(linkData.color || '#ffffff');
          const title = linkData.title ? escapeHtml(linkData.title) : '';

          if (title) {
            // Render divider with centered title and lines at both sides
            $targetUl.append(
              '<li class="w-100 m-0 mb-4 ps-4 rounded-pill list-item spacer-li" style="pointer-events:none;">' +
                '<div style="display:flex; align-items:center; gap:12px; margin:14px 12px;">' +
                  '<div style="flex:1; height:1px; background:' + color + '; opacity:0.25; border-radius:4px;"></div>' +
                  '<span style="white-space:nowrap; padding:0 12px; color:' + color + '; opacity:0.95; font-weight:600; font-size:0.95rem;">' + title + '</span>' +
                  '<div style="flex:1; height:1px; background:' + color + '; opacity:0.25; border-radius:4px;"></div>' +
                '</div>' +
              '</li>'
            );
          } else {
            // fallback: single line divider (existing behavior)
            $targetUl.append(
              '<li class="w-100 m-0 mb-4 ps-4 rounded-pill list-item spacer-li" style="pointer-events:none;">' +
                '<div style="height:1px; background:' + color + '; opacity:0.25; border-radius:4px; margin:14px 12px;"></div>' +
              '</li>'
            );
          }
        } else {
          const name = escapeHtml(linkData.name || '');
          const url = escapeHtml(linkData.url || '#');

          // build a crisp favicon image (48px display size by default)
          const faviconImgHtml = buildFaviconImg(linkData.url, 48);

          $targetUl.append(
            '<li class="w-100 position-relative start-50 translate-middle m-0 mb-4 ps-4 rounded-pill border border-secondary list-item">' +
              '<a target="_blank" rel="noopener noreferrer" class="row link text-decoration-none" href="' + url + '">' +
                faviconImgHtml +
                '<span class="w-75 d-flex align-items-center overflow-x-hidden text-nowrap fs-5 float-left"><div class="text-truncate">' + name + '</div></span>' +
              '</a>' +
            '</li>'
          );
        }
      });

      // fetch GitHub profile info (cleared before append)
      $.ajax({
        url: 'https://api.github.com/users/' + encodeURIComponent(userData.githubUsername),
        error: () => {
          alert('GitHub API request failed');
        },
        success: (data) => {
          $('#githubProfileContainer').empty().append(
            '<img alt="GitHub Profile" class="rounded-circle w-25 border border-danger border-4 p-2" src="' + data.avatar_url + '"/>' +
            '<span class="github-name fs-3" style="margin-left:12px; font-size:1.25rem; vertical-align:middle; color:var(--username-color);">' + escapeHtml(data.login) + '</span>'
          );
        }
      });
    }
  });
}

$(document).ready(() => {
  // Single call that renders each JSON entry exactly once, in order.
  createLinks();
});