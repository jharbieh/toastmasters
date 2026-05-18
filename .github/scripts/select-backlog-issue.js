#!/usr/bin/env node

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER || 'jharbieh';
const REPO_NAME = process.env.REPO_NAME || 'toastmasters';

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable not set');
  process.exit(1);
}

function makeGitHubRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'backlog-agent'
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`GitHub API error: ${res.statusCode} ${data}`));
        }
        resolve(JSON.parse(data));
      });
    }).on('error', reject).end();
  });
}

async function selectBacklogIssue() {
  try {
    // Query for open issues with "Backlog" label
    const query = `/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&labels=Backlog&per_page=100`;
    const issues = await makeGitHubRequest(query);

    if (issues.length === 0) {
      console.log('::error::No open backlog issues found');
      process.exit(1);
    }

    // Sort by priority label, then by creation date
    const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
    issues.sort((a, b) => {
      const aPriority = a.labels.find(l => l.name.startsWith('P'))?.name || 'P3';
      const bPriority = b.labels.find(l => l.name.startsWith('P'))?.name || 'P3';
      const priorityDiff = (priorityOrder[aPriority] || 3) - (priorityOrder[bPriority] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.created_at) - new Date(b.created_at);
    });

    // Pick the first one (highest priority, oldest)
    const selectedIssue = issues[0];

    console.log(`::set-output name=issue_number::${selectedIssue.number}`);
    console.log(`::set-output name=issue_title::${selectedIssue.title}`);
    console.log(`::set-output name=issue_body::${selectedIssue.body}`);
    console.log(`Selected issue #${selectedIssue.number}: ${selectedIssue.title}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

selectBacklogIssue();
