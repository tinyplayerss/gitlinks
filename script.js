// Function to dynamically create links and fetch GitHub user data
function createLinks() {
  $.ajax({
    url: 'user.json',
    error: () => {
      alert('Error fetching user data');
    },
    success: (userData) => {
      userData.links.forEach(linkData => {
        $('#linkContainer ul').append(
          '<li class="w-75 position-relative start-50 translate-middle m-0 mb-4 ps-4 pt-2 pb-2 rounded-pill border border-secondary list-item">'+
            '<a target="_blank" class="row link text-decoration-none" href="' + linkData.url + '">' +
              '<img alt="Favicon" class="favicon col-1 p-0 rounded-circle" src="https://www.google.com/s2/favicons?domain=' + linkData.url + '" />' +
              '<span class="col-10 p-0 ps-2 overflow-x-hidden text-nowrap fs-3">' + linkData.name + '</span>' +
            '</a>'+
          '</li>'
        );
      });

      $.ajax({
        url: 'https://api.github.com/users/' + userData.githubUsername,
        error: () => {
          alert('GitHub API request failed');
        },
        success: (data) => {
          $('#githubProfileContainer').append(
            '<img alt="GitHub Profile" class="rounded-circle w-25 border border-danger border-4 p-2" src="' + data.avatar_url + '"/>' +
            '<div class="text-light fs-3">' + data.login + '</div>'
          );
        }
      });
    }
  });
}

$(document).ready(() => {
  createLinks();
});
