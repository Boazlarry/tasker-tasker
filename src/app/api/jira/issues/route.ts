import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectKey = searchParams.get('projectKey');

  if (!projectKey) {
    return NextResponse.json(
      { error: 'projectKey 파라미터가 필요합니다.' },
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

  try {
    const response = await axios.get(
      `${jiraUrl}/rest/api/2/search?jql=project=${projectKey}`,
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
