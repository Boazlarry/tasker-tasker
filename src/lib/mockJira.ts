export interface MockJiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    issuetype: { name: string; iconUrl: string };
    reporter: { displayName: string };
    assignee?: { displayName: string };
    status: { name: string };
    priority?: { name: string };
    labels?: string[];
    comment?: {
      comments: Array<{
        id: string;
        author: { displayName: string };
        body: string;
        created: string;
      }>;
    };
  };
  renderedFields?: {
    description: string;
  };
  changelog?: {
    histories: Array<{
      id: string;
      author: { displayName: string };
      created: string;
      items: Array<{ field: string; fromString?: string; toString?: string }>;
    }>;
  };
}

export const MOCK_JIRA_URL = 'mock://jira-7';

export function isMockJiraUrl(jiraUrl: string | null) {
  return jiraUrl === MOCK_JIRA_URL || jiraUrl?.startsWith('mock://');
}

export const mockProjects = [
  { id: '10000', key: 'TASK', name: 'Tasker MVP' },
  { id: '10001', key: 'OPS', name: 'Operations Board' },
  { id: '10002', key: 'LAB', name: 'Integration Lab' },
];

const issueTypeIcon =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Crect width=%2224%22 height=%2224%22 rx=%224%22 fill=%22%230052CC%22/%3E%3Cpath d=%22M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z%22 fill=%22white%22/%3E%3C/svg%3E';

function demoIssue(input: {
  id: string;
  key: string;
  summary: string;
  status: string;
  reporter: string;
  assignee?: string;
  type?: string;
  priority?: string;
  labels?: string[];
}): MockJiraIssue {
  return {
    id: input.id,
    key: input.key,
    fields: {
      summary: input.summary,
      description: `${input.summary} 항목의 mock 설명입니다.`,
      issuetype: { name: input.type || 'Task', iconUrl: issueTypeIcon },
      reporter: { displayName: input.reporter },
      assignee: { displayName: input.assignee || 'Unassigned' },
      status: { name: input.status },
      priority: { name: input.priority || 'Medium' },
      labels: input.labels || ['demo'],
      comment: { comments: [] },
    },
    renderedFields: {
      description: `<p>${escapeHtml(input.summary)} 항목의 mock 설명입니다.</p>`,
    },
    changelog: { histories: [] },
  };
}

export const mockIssues: MockJiraIssue[] = [
  {
    id: '20000',
    key: 'TASK-1',
    fields: {
      summary: 'Jira 7.x 프로젝트와 이슈 목록을 안정적으로 조회한다',
      description: 'MVP의 기본 흐름인 프로젝트 목록, 프로젝트별 이슈 목록, 이슈 상세 조회를 검증한다.',
      issuetype: { name: 'Story', iconUrl: issueTypeIcon },
      reporter: { displayName: 'Demo Planner' },
      assignee: { displayName: 'Frontend Agent' },
      status: { name: 'In Progress' },
      priority: { name: 'High' },
      labels: ['mvp', 'jira7'],
      comment: {
        comments: [
          {
            id: 'c-1',
            author: { displayName: 'Demo Reviewer' },
            body: 'Jira comment source example: this should be shown separately from changelog activity.',
            created: '2026-07-01T09:00:00.000+0000',
          },
        ],
      },
    },
    renderedFields: {
      description: '<p>MVP의 기본 흐름인 <strong>프로젝트 목록</strong>, 프로젝트별 이슈 목록, 이슈 상세 조회를 검증한다.</p>',
    },
    changelog: {
      histories: [
        {
          id: 'h-1',
          author: { displayName: 'Workflow Bot' },
          created: '2026-07-01T09:30:00.000+0000',
          items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
        },
      ],
    },
  },
  {
    id: '20001',
    key: 'TASK-2',
    fields: {
      summary: 'Mock Jira demo를 Vercel에서 확인할 수 있게 만든다',
      description: '실제 Jira 서버 없이도 프로젝트, 이슈, 상세, 생성, 편집 흐름을 확인할 수 있어야 한다.',
      issuetype: { name: 'Task', iconUrl: issueTypeIcon },
      reporter: { displayName: 'Demo Planner' },
      assignee: { displayName: 'QA Agent' },
      status: { name: 'To Do' },
      priority: { name: 'Medium' },
      labels: ['vercel', 'mock'],
      comment: { comments: [] },
    },
    renderedFields: {
      description: '<p>실제 Jira 서버 없이도 Vercel 배포본에서 주요 흐름을 확인할 수 있게 한다.</p>',
    },
    changelog: { histories: [] },
  },
  demoIssue({
    id: '20003',
    key: 'TASK-3',
    summary: '프로젝트 목록 화면에 페이지네이션과 로딩 스켈레톤을 적용한다',
    status: 'In Progress',
    reporter: 'Design Lead',
    assignee: 'Frontend Agent',
    type: 'Story',
    labels: ['ui', 'pagination'],
  }),
  demoIssue({
    id: '20004',
    key: 'TASK-4',
    summary: '하단 quick dock로 주요 Jira 뷰 전환을 복구한다',
    status: 'To Do',
    reporter: 'Product Owner',
    assignee: 'Frontend Agent',
    labels: ['navigation'],
  }),
  demoIssue({
    id: '20005',
    key: 'TASK-5',
    summary: '검색 결과 테이블을 고정 높이와 페이지 단위로 정리한다',
    status: 'Done',
    reporter: 'Demo Reviewer',
    assignee: 'QA Agent',
    priority: 'High',
    labels: ['search', 'table'],
  }),
  demoIssue({
    id: '20006',
    key: 'TASK-6',
    summary: '팀 뷰를 담당자 통계 테이블로 개선한다',
    status: 'In Progress',
    reporter: 'Demo Planner',
    assignee: 'Data Agent',
    labels: ['team'],
  }),
  demoIssue({
    id: '20007',
    key: 'TASK-7',
    summary: '칸반 컬럼 내부 스크롤과 상태 카운트를 추가한다',
    status: 'To Do',
    reporter: 'Workflow Bot',
    assignee: 'Frontend Agent',
    labels: ['kanban'],
  }),
  demoIssue({
    id: '20008',
    key: 'TASK-8',
    summary: '브랜드 파비콘과 다채로운 인터랙션 톤을 정리한다',
    status: 'Done',
    reporter: 'Design Lead',
    assignee: 'Frontend Agent',
    type: 'Story',
    labels: ['brand'],
  }),
  {
    id: '20002',
    key: 'OPS-1',
    fields: {
      summary: '팀, 칸반, 검색을 MVP 범위로 확정한다',
      description: '문서와 도메인 맵에 MVP 확정 범위를 반영한다.',
      issuetype: { name: 'Task', iconUrl: issueTypeIcon },
      reporter: { displayName: 'Product Owner' },
      status: { name: 'Done' },
      priority: { name: 'Medium' },
      labels: ['sdd'],
      comment: { comments: [] },
    },
    renderedFields: {
      description: '<p>팀, 칸반, 검색은 placeholder가 아니라 MVP 기능이다.</p>',
    },
    changelog: {
      histories: [
        {
          id: 'h-2',
          author: { displayName: 'Spec Steward' },
          created: '2026-07-01T10:00:00.000+0000',
          items: [{ field: 'status', fromString: 'In Review', toString: 'Done' }],
        },
      ],
    },
  },
  demoIssue({
    id: '20009',
    key: 'OPS-2',
    summary: '운영 보드에서 반복 업무를 상태별로 확인한다',
    status: 'To Do',
    reporter: 'Ops Manager',
    assignee: 'QA Agent',
    labels: ['ops'],
  }),
  demoIssue({
    id: '20010',
    key: 'LAB-1',
    summary: 'Jira 7.x API 응답 호환성 샘플을 확장한다',
    status: 'In Progress',
    reporter: 'Integration Engineer',
    assignee: 'Data Agent',
    type: 'Story',
    labels: ['jira7', 'api'],
  }),
];

export function getMockIssues(projectKey?: string | null, query?: string | null) {
  const normalizedQuery = query?.trim().toLowerCase();

  return mockIssues.filter((issue) => {
    const matchesProject = projectKey ? issue.key.startsWith(`${projectKey}-`) : true;
    const matchesQuery = normalizedQuery
      ? issue.key.toLowerCase().includes(normalizedQuery) ||
        issue.fields.summary.toLowerCase().includes(normalizedQuery)
      : true;

    return matchesProject && matchesQuery;
  });
}

export function getMockIssue(issueKey: string) {
  return mockIssues.find((issue) => issue.key === issueKey) || createFallbackMockIssue(issueKey);
}

export function createMockIssue(input: {
  projectKey: string;
  summary: string;
  description?: string;
  issueType?: string;
}) {
  const issueNumber = Math.floor(Date.now() / 1000) % 100000;
  const key = `${input.projectKey}-${issueNumber}`;
  const description = input.description || '';

  return {
    id: String(Date.now()),
    key,
    fields: {
      summary: input.summary,
      description,
      issuetype: { name: input.issueType || 'Task', iconUrl: issueTypeIcon },
      reporter: { displayName: 'Demo User' },
      assignee: { displayName: 'Unassigned' },
      status: { name: 'To Do' },
      priority: { name: 'Medium' },
      labels: ['demo-created'],
      comment: { comments: [] },
    },
    renderedFields: {
      description: `<p>${escapeHtml(description)}</p>`,
    },
    changelog: { histories: [] },
  };
}

export function updateMockIssue(issueKey: string, input: { summary?: string; description?: string }) {
  const existing = getMockIssue(issueKey);
  const description = input.description ?? existing?.fields.description ?? '';

  return {
    ...(existing || createMockIssue({ projectKey: issueKey.split('-')[0], summary: input.summary || issueKey })),
    fields: {
      ...(existing?.fields || {}),
      summary: input.summary || existing?.fields.summary || issueKey,
      description,
    },
    renderedFields: {
      description: `<p>${escapeHtml(description)}</p>`,
    },
  };
}

function createFallbackMockIssue(issueKey: string): MockJiraIssue {
  return {
    id: issueKey,
    key: issueKey,
    fields: {
      summary: `Demo issue ${issueKey}`,
      description: '이 mock 이슈는 Vercel 서버리스 demo에서 동적으로 표시되는 fallback 이슈입니다.',
      issuetype: { name: 'Task', iconUrl: issueTypeIcon },
      reporter: { displayName: 'Demo User' },
      assignee: { displayName: 'Demo User' },
      status: { name: 'To Do' },
      priority: { name: 'Medium' },
      labels: ['demo-fallback'],
      comment: { comments: [] },
    },
    renderedFields: {
      description: '<p>이 mock 이슈는 Vercel 서버리스 demo에서 동적으로 표시되는 fallback 이슈입니다.</p>',
    },
    changelog: { histories: [] },
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
