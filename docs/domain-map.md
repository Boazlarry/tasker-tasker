# 도메인 구성도

이 문서는 현재 Tasker Tasker의 도메인 구성을 설명하고, 확정된 MVP에서 어떤 영역이 확장되어야 하는지 보여줍니다.

![Tasker Tasker domain map](assets/domain-map.svg)

## 현재 도메인

| 도메인 | 현재 코드 | 책임 |
| --- | --- | --- |
| 앱 셸 | `src/app/page.tsx` | 플랫폼 탭, 왼쪽 내비게이션, 콘텐츠 탭, 워크스페이스 레이아웃 |
| 온보딩 | `src/app/welcome/page.tsx` | 첫 플랫폼 설정. 현재 연결 테스트는 mock |
| 설정 | `src/app/settings/page.tsx` | 플랫폼 CRUD와 테마 커스터마이징 |
| 로컬 저장 | `src/hooks/usePlatformManager.ts`, `src/context/ThemeContext.tsx` | 로컬 전용 플랫폼 정보, 크레덴셜, 테마, 최근 프로젝트 상태 |
| Jira API 프록시 | `src/app/api/jira/**` | Jira REST API 호출을 중계하는 로컬 Next.js route |
| Jira 프로젝트/이슈 브라우저 | `src/components/JiraPlatformView.tsx` | 프로젝트 목록, 이슈 목록, 이슈 상세 탭 열기 |
| Jira 이슈 상세 | `src/components/IssueDetailView.tsx` | 이슈 요약, 상태, rendered description, 현재 불완전한 활동/댓글 표시 |
| 팀 뷰 | `src/components/JiraTeamView.tsx` | Placeholder. MVP 도메인 |
| 칸반 뷰 | `src/components/JiraKanbanView.tsx` | Placeholder. MVP 도메인 |
| 이슈 검색 | `src/components/JiraIssueSearchView.tsx` | Placeholder. MVP 도메인 |
| SDD/에이전트 하네스 | `docs/sdd/**`, `docs/agents/**`, `AGENTS.md` | 개발 범위 관리, 병렬 작업 분할, 검증 기준 |

## MVP 도메인 변화

- Jira 워크스페이스는 조회 전용이 아니라 생성/편집까지 지원합니다.
- 이슈 댓글과 활동은 원천별로 모델링하고 표시합니다.
- 팀, 칸반, 검색은 placeholder에서 실제 MVP 기능으로 올라갑니다.
- 크레덴셜은 로컬에만 저장합니다. 이후 Tauri에서 보안 로컬 저장소를 사용할 수 있습니다.
- Jira API route는 조회 중심에서 metadata, 생성, 편집, 댓글, 검색, transition까지 확장됩니다.

