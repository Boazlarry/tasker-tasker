import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { isMockJiraUrl, mockProjects } from '@/lib/mockJira';

export async function GET(request: NextRequest) {
  // MVP 단계에서는 헤더에서 직접 인증 정보를 받습니다.
  // 추후에는 암호화된 세션/쿠키에서 안전하게 가져와야 합니다.
  const authHeader = request.headers.get('Authorization');
  const jiraUrl = request.headers.get('X-Jira-Url');

  if (!authHeader || !jiraUrl) {
    return NextResponse.json(
      { error: 'Jira URL과 인증 정보가 필요합니다.' },
      { status: 401 }
    );
  }

  if (isMockJiraUrl(jiraUrl)) {
    return NextResponse.json(mockProjects);
  }

  try {
    const response = await axios.get(`${jiraUrl}/rest/api/2/project`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Jira API Error:', error);
    return NextResponse.json(
      { error: 'Jira 서버에서 데이터를 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}
