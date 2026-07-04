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

function request(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/jira/issue/TASK-1', { headers });
}

describe('GET /api/jira/issue/[issueKey]', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it('requires Jira URL and authorization headers', async () => {
    const response = await GET(request(), { params: Promise.resolve({ issueKey: 'TASK-1' }) });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Jira URL or Authorization header is missing' });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('proxies the Jira issue detail request', async () => {
    const issue = { id: '1', key: 'TASK-1' };
    mockedAxios.get.mockResolvedValueOnce({ data: issue });

    const response = await GET(
      request({
        Authorization: 'Basic abc',
        'X-Jira-Url': 'https://jira.example.com/',
      }),
      { params: Promise.resolve({ issueKey: 'TASK-1' }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(issue);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://jira.example.com/rest/api/2/issue/TASK-1',
      {
        headers: {
          Authorization: 'Basic abc',
          'Content-Type': 'application/json',
        },
        params: { expand: 'renderedFields,changelog' },
      }
    );
  });
});

