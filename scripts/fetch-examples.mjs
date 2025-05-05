#!/usr/bin/env node
/**
 * GitHub Example Functions JSON Fetcher
 *
 * This script fetches the example_functions.json file from the GitHub repository
 * and saves it to the assets folder in the workspace.
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

console.log('==== EXAMPLE FUNCTIONS FETCHER STARTED ====');

// Configuration
const GITHUB_API_URL = 'https://api.github.com';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(path.resolve(__dirname, '..'), 'assets', 'example_functions.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'boardflare/python-functions';
const BRANCH = 'main';
const FILE_PATH = 'examples/example_functions.json';

// Display configuration
console.log('\n===== CONFIGURATION =====');
console.log(`GitHub Token: ${GITHUB_TOKEN ? 'Set ✓' : 'Not set ✗'}`);
console.log(`Repository: ${REPO}`);
console.log(`File Path: ${FILE_PATH}`);
console.log(`Output File: ${OUTPUT_FILE}`);

/**
 * Makes a simple HTTP request to the GitHub API
 */
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        console.log(`Requesting: ${url}`);

        const options = {
            headers: {
                'User-Agent': 'Node.js GitHub JSON Fetcher',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        if (GITHUB_TOKEN) {
            console.log('Using GitHub token for authentication');
            options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        } else {
            console.log('WARNING: No GitHub token provided. API rate limits may apply.');
        }

        const req = https.get(url, options, (res) => {
            console.log(`Response status: ${res.statusCode}`);

            // Log GitHub rate limit info
            const rateLimit = res.headers['x-ratelimit-remaining'];
            if (rateLimit) {
                console.log(`Rate limit remaining: ${rateLimit}`);
            }

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
                console.log(`Received chunk: ${chunk.length} bytes`);
            });

            res.on('end', () => {
                console.log(`Request complete: ${data.length} bytes received`);

                if (res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log('Successfully parsed JSON response');
                        resolve(parsed);
                    } catch (err) {
                        console.error(`JSON parse error: ${err.message}`);
                        reject(err);
                    }
                } else {
                    console.error(`Error response (${res.statusCode}): ${data}`);
                    reject(new Error(`HTTP error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error(`Request error: ${err.message}`);
            reject(err);
        });

        // Set a timeout to detect hanging requests
        req.setTimeout(30000, () => {
            console.error('Request timed out after 30 seconds');
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

/**
 * Fetch JSON file content from GitHub
 */
async function getJsonFileContent(repo, filePath, branch = 'main') {
    console.log(`\nFetching JSON file: ${filePath}`);
    const url = `${GITHUB_API_URL}/repos/${repo}/contents/${filePath}?ref=${branch}`;

    try {
        const data = await makeRequest(url);

        if (data && data.content) {
            console.log(`Successfully fetched JSON data (encoded length: ${data.content.length})`);

            // GitHub API returns content as base64 encoded
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            console.log(`Decoded content length: ${content.length} characters`);

            // Verify it's valid JSON
            try {
                JSON.parse(content);
                console.log('Content is valid JSON');
                return content;
            } catch (jsonError) {
                console.error(`Error parsing JSON content: ${jsonError.message}`);
                return null;
            }
        } else {
            console.error('No content found in response');
            return null;
        }
    } catch (error) {
        console.error(`Error fetching JSON file: ${error.message}`);
        return null;
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log(`\n===== STARTING JSON IMPORT =====`);

        // Fetch JSON content from GitHub
        const content = await getJsonFileContent(REPO, FILE_PATH, BRANCH);

        if (!content) {
            console.error('Failed to fetch example_functions.json content');
            return 1;
        }

        // Create parent directory if it doesn't exist
        const outputDir = path.dirname(OUTPUT_FILE);
        try {
            await fs.mkdir(outputDir, { recursive: true });
            console.log(`Ensured output directory exists: ${outputDir}`);
        } catch (err) {
            console.error(`Error creating output directory: ${err.message}`);
            return 1;
        }

        // Write the JSON file
        try {
            await fs.writeFile(OUTPUT_FILE, content, 'utf-8');
            console.log(`✅ Successfully wrote ${OUTPUT_FILE}`);

            // Verify file was created
            const stats = await fs.stat(OUTPUT_FILE);
            console.log(`File created: ${stats.size} bytes`);
        } catch (fileError) {
            console.error(`Error writing file: ${fileError.message}`);
            return 1;
        }

        console.log('\n===== JSON IMPORT COMPLETE =====');
        return 0;
    } catch (error) {
        console.error(`Fatal error: ${error.message}`);
        console.error(error.stack);
        return 1;
    }
}

// Run the script
console.log('Starting example_functions.json import process...');

// Use explicit promise chain instead of top-level await
main()
    .then(exitCode => {
        console.log(`Process completed with exit code: ${exitCode}`);
    })
    .catch(err => {
        console.error('Unhandled error:', err);
        process.exit(1);
    });

console.log('Main process initiated, waiting for completion...');