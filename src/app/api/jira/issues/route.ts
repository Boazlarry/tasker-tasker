import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createMockIssue, getMockIssues } from '@/lib/mockJira';
import {
  getJiraRequestContext,
  jiraApiUrl,
  jiraErrorData,
  jiraErrorStatus,
  logJiraProxyError,
} from '@/lib/jiraProxy';

const DEFAULT_MAX_RESULTS = 25;
const MAX_ALLOWED_RESULTS = 100;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectKey = searchParams.get('projectKey');
  const query = searchParams.get('query');
  const explicitJql = searchParams.get('jql');
  const hasProjectKey = Boolean(projectKey?.trim());
  const hasQuery = Boolean(query?.trim());
  const hasExplicitJql = Boolean(explicitJql?.trim());
  const startAt = parseBoundedInteger(searchParams.get('startAt'), 0, 0, 100000);
  const maxResults = parseBoundedInteger(
    searchParams.get('maxResults'),
    DEFAULT_MAX_RESULTS,
    1,
    MAX_ALLOWED_RESULTS
  );
  const fields = normalizeFields(searchParams.get('fields'));

  if (!hasProjectKey && !hasQuery && !hasExplicitJql) {
    return NextResponse.json(
      { error: 'projectKey, query 또는 jql 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  const jira = getJiraRequestContext(request);

  if (!jira) {
    return NextResponse.json(
      { error: 'Jira URL과 인증 정보가 필요합니다.' },
      { status: 401 }
    );
  }

  if (jira.isMock) {
    const allIssues = getMockIssues(projectKey, query);
    const issues = allIssues.slice(startAt, startAt + maxResults);

    return NextResponse.json({
      startAt,
      maxResults,
      total: allIssues.length,
      issues,
    });
  }

  const jql = buildJql({ projectKey, query, explicitJql });

  try {
    const response = await axios.get(jiraApiUrl(jira.jiraUrl, '/rest/api/2/search'), {
      headers: jira.headers,
      params: {
        jql,
        startAt,
        maxResults,
        ...(fields ? { fields } : {}),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    logJiraProxyError('Jira issue search failed', error);
    return NextResponse.json(
      { error: 'Jira 서버에서 데이터를 가져오는 데 실패했습니다.' },
      { status: jiraErrorStatus(error) }
    );
  }
}

export async function POST(request: NextRequest) {
  const jira = getJiraRequestContext(request);

  if (!jira) {
    return NextResponse.json(
      { error: 'Jira URL과 인증 정보가 필요합니다.' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { projectKey, summary, description, issueType } = body;

  if (!projectKey || !summary) {
    return NextResponse.json(
      { error: 'projectKey와 summary가 필요합니다.' },
      { status: 400 }
    );
  }

  if (jira.isMock) {
    return NextResponse.json(
      createMockIssue({ projectKey, summary, description, issueType }),
      { status: 201 }
    );
  }

  try {
    const response = await axios.post(
      jiraApiUrl(jira.jiraUrl, '/rest/api/2/issue'),
      {
        fields: {
          project: { key: projectKey },
          summary,
          description,
          issuetype: { name: issueType || 'Task' },
        },
      },
      {
        headers: jira.headers,
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    logJiraProxyError('Jira issue creation failed', error);
    return NextResponse.json(
      {
        error: 'Jira 이슈 생성에 실패했습니다.',
        details: jiraErrorData(error),
      },
      { status: jiraErrorStatus(error) }
    );
  }
}

function parseBoundedInteger(value: string | null, fallback: number, min: number, max: number) {
  if (value === null) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function buildJql({
  projectKey,
  query,
  explicitJql,
}: {
  projectKey: string | null;
  query: string | null;
  explicitJql: string | null;
}) {
  const trimmedJql = explicitJql?.trim();

  if (trimmedJql) {
    return trimmedJql;
  }

  const trimmedQuery = query?.trim();

  if (trimmedQuery) {
    return `text ~ "${escapeJqlString(trimmedQuery)}" ORDER BY updated DESC`;
  }

  return `project = "${escapeJqlString(projectKey?.trim() || '')}" ORDER BY updated DESC`;
}

function normalizeFields(fields: string | null) {
  return fields
    ?.split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .join(',');
}

function escapeJqlString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
