// Function to dynamically create links and fetch GitHub user data
function createLinks() {
    const linkContainer = document.getElementById('linkContainer');
    const githubProfileContainer = document.getElementById('githubProfileContainer');
  
    // Fetch user information from user.json
    fetch('user.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching user data');
        }
        return response.json();
      })
      .then(userData => {
        // Display links dynamically
        userData.links.forEach(linkData => {
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', linkData.url);
          linkElement.setAttribute('target', '_blank');
          linkElement.classList.add('link');
  
          // Fetch the website favicon using Google's favicon service
          const faviconElement = document.createElement('img');
          faviconElement.src = `https://www.google.com/s2/favicons?domain=${linkData.url}`;
          faviconElement.alt = 'Favicon';
          faviconElement.classList.add('favicon');
          linkElement.appendChild(faviconElement);
  
          // Display link name
          const linkNameElement = document.createElement('span');
          linkNameElement.innerText = linkData.name;
          linkElement.appendChild(linkNameElement);
  
          linkContainer.appendChild(linkElement);
        });
  
        // Display GitHub profile image and username from user.json
        const githubUsername = userData.githubUsername; // Assuming you have "githubUsername" in user.json
        const githubApiUrl = `https://api.github.com/users/${githubUsername}`;
  
        fetch(githubApiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('GitHub API request failed');
            }
            return response.json();
          })
          .then(data => {
            // Display GitHub profile image using GitHub API
            const profileImage = document.createElement('img');
            profileImage.src = data.avatar_url;
            profileImage.alt = 'GitHub Profile';
            profileImage.classList.add('github-profile-image');
            githubProfileContainer.appendChild(profileImage);
  
            // Display GitHub username beneath the profile image
            const usernameElement = document.createElement('p');
            usernameElement.innerText = data.login;
            githubProfileContainer.appendChild(usernameElement);
          })
          .catch(error => {
            console.error('Error fetching GitHub profile image:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }
  
  // Execute the function when the page is loaded
  document.addEventListener('DOMContentLoaded', createLinks);
  