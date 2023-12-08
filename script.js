// Function to dynamically create links and fetch GitHub user data
function createLinks() {
  $.ajax({
    url: 'user.json',
    error: () => {
      alert('Error fetching user data');
    },
    success: (userData) => {
      userData.links.forEach(linkData => {
        $('#linkContainer').append(
            '<a target="_blank" class="link" href="' + linkData.url + '">' +
            '<img alt="Favicon" class="favicon" src="https://www.google.com/s2/favicons?domain=' + linkData.url + '" />' +
            '<span>' + linkData.name + '</span>' +
            '</a>'
        );
      });

      $.ajax({
        url: 'https://api.github.com/users/' + userData.githubUsername,
        error: () => {
          alert('GitHub API request failed');
        },
        success: (data) => {
          $('#githubProfileContainer').append(
            '<img alt="GitHub Profile" class="github-profile-image" src="' + data.avatar_url + '"/>' +
            '<p>' + data.login + '</p>'
          );
        }
      });
    }
  });
}

$(document).ready(() => {
  createLinks();
});
