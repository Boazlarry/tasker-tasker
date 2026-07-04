import { NextRequest } from 'next/server';
import { isMockJiraUrl } from './mockJira';

export interface JiraRequestContext {
  authorization: string;
  headers: {
    Authorization: string;
    'Content-Type': string;
  };
  isMock: boolean;
  jiraUrl: string;
}

export function getJiraRequestContext(request: NextRequest): JiraRequestContext | null {
  const authorization = request.headers.get('Authorization');
  const jiraUrl = request.headers.get('X-Jira-Url');

  if (!authorization || !jiraUrl) {
    return null;
  }

  return {
    authorization,
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    isMock: Boolean(isMockJiraUrl(jiraUrl)),
    jiraUrl: normalizeJiraUrl(jiraUrl),
  };
}

export function jiraApiUrl(jiraUrl: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizeJiraUrl(jiraUrl)}${normalizedPath}`;
}

export function jiraErrorStatus(error: unknown, fallback = 500) {
  const status = jiraErrorResponse(error)?.status;

  return typeof status === 'number' ? status : fallback;
}

export function jiraErrorData(error: unknown) {
  return jiraErrorResponse(error)?.data;
}

export function logJiraProxyError(message: string, error: unknown) {
  console.error(message, {
    status: jiraErrorStatus(error),
    data: jiraErrorData(error),
  });
}

function normalizeJiraUrl(jiraUrl: string) {
  return jiraUrl.replace(/\/+$/, '');
}

function jiraErrorResponse(error: unknown): { status?: number; data?: unknown } | undefined {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return undefined;
  }

  const response = (error as { response?: unknown }).response;

  if (!response || typeof response !== 'object') {
    return undefined;
  }

  return response as { status?: number; data?: unknown };
}
