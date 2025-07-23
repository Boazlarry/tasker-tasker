import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { issueKey: string } }
) {
  const { issueKey } = params;
  const jiraUrl = request.headers.get('X-Jira-Url');
  const authorization = request.headers.get('Authorization');

  if (!jiraUrl || !authorization) {
    return NextResponse.json(
      { error: 'Jira URL or Authorization header is missing' },
      { status: 400 }
    );
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
