import { Router } from 'express';
import { Octokit } from 'octokit';
import { query } from '../database/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Parse GitHub URL and extract owner/repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\.]+)/,
    /github\.com\/([^\/]+)\/([^\/\.]+)\.git/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }

  return null;
}

// Analyze GitHub repository
router.post('/analyze', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { url, candidate_id } = req.body;

    if (!url || !candidate_id) {
      throw new ValidationError('GitHub URL and candidate ID are required');
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      throw new ValidationError('Invalid GitHub URL format');
    }

    const { owner, repo } = parsed;

    // Try to fetch repository data (public access without token)
    let repoData;
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || undefined
      });

      const response = await octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo
      });

      repoData = response.data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw new ValidationError('Could not fetch repository data. Repository may be private or invalid.');
    }

    // Extract useful information
    const languages = repoData.language ? [repoData.language] : [];
    const description = repoData.description || '';
    const topics = repoData.topics || [];
    const size = repoData.size;
    const stargazers = repoData.stargazers_count;
    const forks = repoData.forks_count;
    const updatedAt = repoData.updated_at;

    // Create evidence record
    const evidenceResult = await query(
      `INSERT INTO evidence (
        candidate_id, filename, source, evidence_type, file_size, file_type,
        extraction_snippet, raw_content, status, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        candidate_id,
        `${owner}/${repo}`,
        'GitHub API',
        'Source Code',
        size,
        'application/json',
        `GitHub repository: ${owner}/${repo}. Languages: ${languages.join(', ')}. Stars: ${stargazers}, Forks: ${forks}`,
        JSON.stringify({
          name: repoData.full_name,
          description,
          languages,
          topics,
          size,
          stargazers,
          forks,
          updatedAt
        }),
        'SUPPORTED',
        95
      ]
    ];

    // Update candidate's GitHub URL if not set
    await query(
      `UPDATE candidates SET github_url = $1 WHERE id = $2 AND github_url IS NULL`,
      [url, candidate_id]
    );

    // Create verification event
    await query(
      `INSERT INTO verification_events (candidate_id, event_type, actor, details, source_ref)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        candidate_id,
        'GitHub Evidence Retrieved',
        'GitHub Integration',
        `Successfully analyzed repository ${owner}/${repo} with ${languages.length} detected languages`,
        evidenceResult.rows[0].id
      ]
    );

    res.json({
      success: true,
      data: {
        repository: {
          name: repoData.full_name,
          description,
          languages,
          topics,
          size,
          stargazers,
          forks,
          updatedAt
        },
        evidence: evidenceResult.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Validate GitHub URL format
router.post('/validate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      throw new ValidationError('GitHub URL is required');
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return res.json({
        success: false,
        valid: false,
        error: 'Invalid GitHub URL format'
      });
    }

    // Try to validate by fetching repository info
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || undefined
      });

      await octokit.request('GET /repos/{owner}/{repo}', {
        owner: parsed.owner,
        repo: parsed.repo
      });

      res.json({
        success: true,
        valid: true,
        data: {
          owner: parsed.owner,
          repo: parsed.repo
        }
      });
    } catch (error) {
      res.json({
        success: false,
        valid: false,
        error: 'Repository not found or not accessible'
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as githubRouter };
