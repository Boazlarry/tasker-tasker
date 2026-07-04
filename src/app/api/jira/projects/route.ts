import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mockProjects } from '@/lib/mockJira';
import { getJiraRequestContext, jiraApiUrl, jiraErrorStatus, logJiraProxyError } from '@/lib/jiraProxy';

export async function GET(request: NextRequest) {
  // MVP 단계에서는 헤더에서 직접 인증 정보를 받습니다.
  // 추후에는 암호화된 세션/쿠키에서 안전하게 가져와야 합니다.
  const jira = getJiraRequestContext(request);

  if (!jira) {
    return NextResponse.json(
      { error: 'Jira URL과 인증 정보가 필요합니다.' },
      { status: 401 }
    );
  }

  if (jira.isMock) {
    return NextResponse.json(mockProjects);
  }

  try {
    const response = await axios.get(jiraApiUrl(jira.jiraUrl, '/rest/api/2/project'), {
      headers: jira.headers,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    logJiraProxyError('Jira project list failed', error);
    return NextResponse.json(
      { error: 'Jira 서버에서 데이터를 가져오는 데 실패했습니다.' },
      { status: jiraErrorStatus(error) }
    );
  }
}
