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
  return new NextRequest('http://localhost/api/jira/projects', { headers });
}

describe('GET /api/jira/projects', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it('requires Jira URL and authorization headers', async () => {
    const response = await GET(request());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Jira URL과 인증 정보가 필요합니다.' });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('proxies the Jira project list request', async () => {
    const projects = [{ id: '10000', key: 'TASK', name: 'Tasker' }];
    mockedAxios.get.mockResolvedValueOnce({ data: projects });

    const response = await GET(
      request({
        Authorization: 'Basic abc',
        'X-Jira-Url': 'https://jira.example.com/',
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(projects);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://jira.example.com/rest/api/2/project', {
      headers: {
        Authorization: 'Basic abc',
        'Content-Type': 'application/json',
      },
    });
  });
});

