#!/usr/bin/env node

import { readFileSync, appendFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';

const PROJECT_ROOT = process.cwd();
const DEFAULT_SESSIONS_PATH = join(PROJECT_ROOT, 'ai/progress_sessions.json');
const DEFAULT_OUT_PATH = join(PROJECT_ROOT, 'ai/progress.jsonl');

function usage() {
    console.error('Usage: node ai/scripts/progress_snapshot.mjs [--sessions <file>] [--out <file>]');
}

function loadSessions(path) {
    const raw = readFileSync(path, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.some(s => typeof s !== 'string')) {
        throw new Error('Session list must be a JSON array of strings.');
    }
    return data;
}

function runFirstMismatch(sessionPath) {
    const result = spawnSync('node', ['ai/scripts/first_mismatch.mjs', sessionPath], {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (result.status !== 0) {
        return {
            session: sessionPath,
            error: result.stderr.trim() || `first_mismatch exited with code ${result.status}`,
        };
    }
    try {
        return JSON.parse(result.stdout);
    } catch (err) {
        return {
            session: sessionPath,
            error: `Failed to parse first_mismatch output: ${err}`,
            raw: result.stdout.trim(),
        };
    }
}

function summarize(result) {
    if (result.error) {
        return { session: result.session, error: result.error };
    }
    return {
        session: result.session,
        rng: `${result.rng.matchedPrefix}/${result.rng.total}`,
        screen: `${result.screen.matchedPrefix}/${result.screen.total}`,
        rngMismatch: result.rng.firstMismatchIndex,
        screenMismatch: result.screen.firstMismatchIndex,
    };
}

function main() {
    const args = process.argv.slice(2);
    let sessionsPath = null;
    let outPath = DEFAULT_OUT_PATH;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--sessions') {
            sessionsPath = args[i + 1];
            i++;
        } else if (arg === '--out') {
            outPath = args[i + 1];
            i++;
        } else if (arg === '--help' || arg === '-h') {
            usage();
            process.exit(0);
        } else {
            usage();
            process.exit(2);
        }
    }

    const resolvedSessionsPath = sessionsPath
        ? resolve(PROJECT_ROOT, sessionsPath)
        : (existsSync(DEFAULT_SESSIONS_PATH) ? DEFAULT_SESSIONS_PATH : null);

    if (!resolvedSessionsPath) {
        console.error('No session list found. Provide --sessions or create ai/progress_sessions.json.');
        process.exit(2);
    }

    const sessions = loadSessions(resolvedSessionsPath);
    const results = sessions.map(runFirstMismatch);

    const snapshot = {
        timestamp: new Date().toISOString(),
        sessions: results,
        summary: results.map(summarize),
    };

    appendFileSync(outPath, JSON.stringify(snapshot) + '\n');
    console.log(JSON.stringify(snapshot, null, 2));
}

main();
