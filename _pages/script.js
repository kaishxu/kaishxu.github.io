document.addEventListener('DOMContentLoaded', () => {
  // Define repositories and corresponding entry keys
  const repositories = {
      'organ': 'wjhou/ORGan',
      'recap': 'wjhou/Recap',
      'icon': 'wjhou/ICon',
      'dfmed': 'kaishxu/DFMed',
      'emulation': 'kaishxu/Emulation',
      'IntegrativeDecoding': 'YiCheng98/IntegrativeDecoding',
      'rise': 'kaishxu/RISE',
      'arjudge': 'kaishxu/ARJudge'
      // Add more entries as needed
  };

  // Fetch and display stars for each repository
  Object.keys(repositories).forEach(async (key) => {
      const repo = repositories[key];
      const stars = await getGitHubStars(repo);
      document.getElementById(`star-count-${key}`).innerText = `⭐️ ${stars} stars`;
  });
});

async function getGitHubStars(repo) {
    const response = await fetch(`https://api.github.com/repos/${repo}`);
    const data = await response.json();
    return data.stargazers_count;
}
