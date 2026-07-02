import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createMockIssue, getMockIssues, isMockJiraUrl } from '@/lib/mockJira';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectKey = searchParams.get('projectKey');
  const query = searchParams.get('query');

  if (!projectKey && !query) {
    return NextResponse.json(
      { error: 'projectKey 또는 query 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  const jiraUrl = request.headers.get('X-Jira-Url');

  if (!authHeader || !jiraUrl) {
    return NextResponse.json(
      { error: 'Jira URL과 인증 정보가 필요합니다.' },
      { status: 401 }
    );
  }

  if (isMockJiraUrl(jiraUrl)) {
    const issues = getMockIssues(projectKey, query);
    return NextResponse.json({
      startAt: 0,
      maxResults: issues.length,
      total: issues.length,
      issues,
    });
  }

  try {
    const response = await axios.get(
      `${jiraUrl}/rest/api/2/search?jql=${encodeURIComponent(
        query ? `text ~ "${query}"` : `project=${projectKey}`
      )}`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Jira API Error:', error);
    return NextResponse.json(
      { error: 'Jira 서버에서 데이터를 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const jiraUrl = request.headers.get('X-Jira-Url');

  if (!authHeader || !jiraUrl) {
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

  if (isMockJiraUrl(jiraUrl)) {
    return NextResponse.json(
      createMockIssue({ projectKey, summary, description, issueType }),
      { status: 201 }
    );
  }

  try {
    const response = await axios.post(
      `${jiraUrl}/rest/api/2/issue`,
      {
        fields: {
          project: { key: projectKey },
          summary,
          description,
          issuetype: { name: issueType || 'Task' },
        },
      },
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error('Jira API Error:', error.response?.data || error);
    return NextResponse.json(
      {
        error: 'Jira 이슈 생성에 실패했습니다.',
        details: error.response?.data,
      },
      { status: error.response?.status || 500 }
    );
  }
}
