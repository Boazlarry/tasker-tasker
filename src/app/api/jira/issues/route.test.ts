import { NextRequest } from 'next/server';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

function request(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, { headers });
}

describe('GET /api/jira/issues', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it('requires projectKey or query', async () => {
    const response = await GET(request('http://localhost/api/jira/issues'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'projectKey, query 또는 jql 파라미터가 필요합니다.' });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('proxies the Jira search request for a project', async () => {
    const issues = { issues: [{ id: '1', key: 'TASK-1' }] };
    mockedAxios.get.mockResolvedValueOnce({ data: issues });

    const response = await GET(
      request('http://localhost/api/jira/issues?projectKey=TASK', {
        Authorization: 'Basic abc',
        'X-Jira-Url': 'https://jira.example.com',
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(issues);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://jira.example.com/rest/api/2/search', {
      headers: {
        Authorization: 'Basic abc',
        'Content-Type': 'application/json',
      },
      params: {
        jql: 'project = "TASK" ORDER BY updated DESC',
        startAt: 0,
        maxResults: 25,
      },
    });
  });

  it('passes bounded pagination and sparse fields to Jira', async () => {
    const issues = { startAt: 8, maxResults: 8, total: 42, issues: [{ id: '1', key: 'TASK-1' }] };
    mockedAxios.get.mockResolvedValueOnce({ data: issues });

    const response = await GET(
      request('http://localhost/api/jira/issues?projectKey=TASK&startAt=8&maxResults=500&fields=summary,status', {
        Authorization: 'Basic abc',
        'X-Jira-Url': 'https://jira.example.com/',
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(issues);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://jira.example.com/rest/api/2/search', {
      headers: {
        Authorization: 'Basic abc',
        'Content-Type': 'application/json',
      },
      params: {
        jql: 'project = "TASK" ORDER BY updated DESC',
        startAt: 8,
        maxResults: 100,
        fields: 'summary,status',
      },
    });
  });
});
