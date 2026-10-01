const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const repoDir = __dirname;

async function pushToGithub(remoteUrl, token, branch = 'main') {
  console.log('🚀 Initializing Git repository...');
  
  if (!fs.existsSync(path.join(repoDir, '.git'))) {
    await git.init({ fs, dir: repoDir, defaultBranch: branch });
  }

  console.log('📁 Staging files...');
  const files = await git.listFiles({ fs, dir: repoDir });
  
  // Recursively add all files respecting .gitignore
  async function addFilesRecursively(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(repoDir, fullPath).replace(/\\/g, '/');
      
      if (relPath.startsWith('node_modules') || 
          relPath.startsWith('.git') || 
          relPath.startsWith('android-app/build') || 
          relPath.endsWith('.keystore')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await addFilesRecursively(fullPath);
      } else {
        await git.add({ fs, dir: repoDir, filepath: relPath });
      }
    }
  }

  await addFilesRecursively(repoDir);

  console.log('💾 Creating initial commit...');
  let sha;
  try {
    sha = await git.commit({
      fs,
      dir: repoDir,
      author: {
        name: 'MoTA Developer',
        email: 'developer@tribal.gov.in',
      },
      message: 'feat: Initial release of MoTA Unified Scholarship Platform (NTSP)',
    });
    console.log(`✅ Commit created: ${sha}`);
  } catch (err) {
    console.log('ℹ️ Commit already exists or no new changes:', err.message);
  }

  console.log(`🌐 Pushing to GitHub remote: ${remoteUrl} (branch: ${branch})...`);
  
  await git.addRemote({
    fs,
    dir: repoDir,
    remote: 'origin',
    url: remoteUrl,
    force: true,
  });

  const pushResult = await git.push({
    fs,
    http,
    dir: repoDir,
    remote: 'origin',
    ref: branch,
    onAuth: () => ({ username: token, password: '' }),
    force: true,
  });

  console.log('====================================================');
  console.log('🎉 SUCCESS! Entire codebase pushed to GitHub repository!');
  console.log('====================================================');
  return pushResult;
}

// Check arguments from command line: node push_to_github.js <remote_url> <github_token> [branch]
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [remoteUrl, token, branch] = args;
  pushToGithub(remoteUrl, token, branch || 'main')
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Push failed:', err);
      process.exit(1);
    });
} else {
  console.log('Usage: node push_to_github.js <https://github.com/USER/REPO.git> <GITHUB_TOKEN> [branch]');
}

module.exports = { pushToGithub };
