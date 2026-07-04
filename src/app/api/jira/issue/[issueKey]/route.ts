import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMockIssue, updateMockIssue } from '@/lib/mockJira';
import {
  getJiraRequestContext,
  jiraApiUrl,
  jiraErrorData,
  jiraErrorStatus,
  logJiraProxyError,
} from '@/lib/jiraProxy';

const ISSUE_EXPAND = 'renderedFields,changelog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  const { issueKey } = await params;
  const jira = getJiraRequestContext(request);

  if (!jira) {
    return NextResponse.json(
      { error: 'Jira URL or Authorization header is missing' },
      { status: 400 }
    );
  }

  if (jira.isMock) {
    const issue = getMockIssue(issueKey);

    if (!issue) {
      return NextResponse.json(
        { error: `Failed to fetch issue ${issueKey}` },
        { status: 404 }
      );
    }

    return NextResponse.json(issue);
  }

  try {
    const response = await axios.get(jiraApiUrl(jira.jiraUrl, `/rest/api/2/issue/${encodeURIComponent(issueKey)}`), {
      headers: jira.headers,
      params: { expand: ISSUE_EXPAND },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    logJiraProxyError(`Jira issue fetch failed: ${issueKey}`, error);
    return NextResponse.json(
      { error: `Failed to fetch issue ${issueKey}` },
      { status: jiraErrorStatus(error) }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  const { issueKey } = await params;
  const jira = getJiraRequestContext(request);

  if (!jira) {
    return NextResponse.json(
      { error: 'Jira URL or Authorization header is missing' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { summary, description } = body;

  if (!summary && description === undefined) {
    return NextResponse.json(
      { error: '수정할 필드가 필요합니다.' },
      { status: 400 }
    );
  }

  if (jira.isMock) {
    return NextResponse.json(updateMockIssue(issueKey, { summary, description }));
  }

  try {
    await axios.put(
      jiraApiUrl(jira.jiraUrl, `/rest/api/2/issue/${encodeURIComponent(issueKey)}`),
      {
        fields: {
          ...(summary ? { summary } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      },
      {
        headers: jira.headers,
      }
    );

    const response = await axios.get(jiraApiUrl(jira.jiraUrl, `/rest/api/2/issue/${encodeURIComponent(issueKey)}`), {
      headers: jira.headers,
      params: { expand: ISSUE_EXPAND },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    logJiraProxyError(`Jira issue update failed: ${issueKey}`, error);
    return NextResponse.json(
      {
        error: `Failed to update issue ${issueKey}`,
        details: jiraErrorData(error),
      },
      { status: jiraErrorStatus(error) }
    );
  }
}
