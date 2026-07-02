import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMockIssue, isMockJiraUrl, updateMockIssue } from '@/lib/mockJira';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  const { issueKey } = await params;
  const jiraUrl = request.headers.get('X-Jira-Url');
  const authorization = request.headers.get('Authorization');

  if (!jiraUrl || !authorization) {
    return NextResponse.json(
      { error: 'Jira URL or Authorization header is missing' },
      { status: 400 }
    );
  }

  if (isMockJiraUrl(jiraUrl)) {
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
    const response = await axios.get(
      `${jiraUrl}/rest/api/2/issue/${issueKey}?expand=renderedFields,changelog`,
      {
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching issue ${issueKey}:`, error.response?.data);
    return NextResponse.json(
      { error: `Failed to fetch issue ${issueKey}` },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ issueKey: string }> }
) {
  const { issueKey } = await params;
  const jiraUrl = request.headers.get('X-Jira-Url');
  const authorization = request.headers.get('Authorization');

  if (!jiraUrl || !authorization) {
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

  if (isMockJiraUrl(jiraUrl)) {
    return NextResponse.json(updateMockIssue(issueKey, { summary, description }));
  }

  try {
    await axios.put(
      `${jiraUrl}/rest/api/2/issue/${issueKey}`,
      {
        fields: {
          ...(summary ? { summary } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      },
      {
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
      }
    );

    const response = await axios.get(
      `${jiraUrl}/rest/api/2/issue/${issueKey}?expand=renderedFields,changelog`,
      {
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error updating issue ${issueKey}:`, error.response?.data || error);
    return NextResponse.json(
      {
        error: `Failed to update issue ${issueKey}`,
        details: error.response?.data,
      },
      { status: error.response?.status || 500 }
    );
  }
}
