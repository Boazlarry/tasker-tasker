# Tasker

## 개요

Tasker는 Trello, Notion, Jira 등 여러 이슈 관리 플랫폼을 하나의 인터페이스에서 통합하여 관리할 수 있는 애플리케이션입니다. 이 프로젝트는 오래된 버전의 플랫폼에 현대적인 스킨을 적용하여 사용성과 생산성을 높이는 것을 목표로 합니다. 사용자는 각 플랫폼의 서버 정보와 인증 정보를 등록하여 여러 플랫폼의 이슈들을 통합 또는 개별적으로 조회하고 관리할 수 있습니다.

## MVP (Minimum Viable Product)

MVP 버전에서는 **Jira 7.x 버전** 연동에 집중합니다.

- **인증 방식:** Basic Authentication (사용자 ID/비밀번호 또는 API 토큰)
- **핵심 기능:**
    1.  **Jira 서버 연결 설정:** 사용자가 Jira 서버 URL, 계정 정보를 입력하여 연결을 설정합니다.
    2.  **프로젝트 목록 조회:** 연결된 Jira 서버의 모든 프로젝트 목록을 불러옵니다.
    3.  **이슈 조회:** 특정 프로젝트를 선택하여 해당 프로젝트의 이슈들을 조회합니다.
    4.  **이슈 상세 정보 확인:** 특정 이슈를 선택하여 상세 내용과 댓글 등을 확인할 수 있습니다.

## 기술 스택

- **코어 프레임워크:** Next.js (TypeScript, React, SSR)
- **UI 라이브러리:** Material-UI (MUI)
- **HTTP 클라이언트:** Axios
- **데스크톱 앱 패키징:** Tauri (MVP 이후)

## 개발 계획

1.  **프로젝트 초기 설정:** Next.js + TypeScript 프로젝트 생성 및 필요 라이브러리(MUI, Axios) 설치.
2.  **UI 구조 설계:**
    -   연결 설정 페이지 (`/settings`)
    -   Jira 뷰어 페이지 (`/jira`) - 프로젝트 사이드바, 이슈 메인 영역
3.  **Jira API 연동 (백엔드):**
    -   Next.js API Routes를 사용하여 Jira 서버와 통신하는 백엔드 로직 구현.
    -   사용자 인증 정보는 서버 사이드에서 안전하게 처리.
4.  **데이터 시각화 (프론트엔드):**
    -   API를 통해 가져온 프로젝트 및 이슈 데이터를 화면에 렌더링.
5.  **데스크톱 앱 패키징:** MVP 웹 개발 완료 후 Tauri를 이용해 데스크톱 앱으로 빌드.

## 개발 하네스

- SDD 문서: `docs/sdd/`
- 현재 구현 현황: `docs/current-implementation.md`
- 도메인 구성도: `docs/domain-map.md`
- 병렬 작업용 에이전트 역할: `docs/agents/`
- 전체 검증: `npm run verify`
- 개별 검증: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`

## 배포

- Vercel: https://taskertasker.vercel.app
- 실제 Jira 서버 없이 확인하려면 첫 화면에서 `데모 Jira로 바로 시작`을 누릅니다.
- 데모는 `mock://jira-7` 로컬 전용 플랫폼을 브라우저 저장소에 추가하고, mock Jira API로 프로젝트/이슈/상세/검색/팀/칸반/생성/편집 흐름을 확인합니다.
- Vercel 배포본에는 실제 Jira 크레덴셜을 입력하지 않습니다. 저장은 브라우저 로컬이지만 API 요청은 Vercel route를 통과하므로, 실제 Jira 연결은 로컬 실행 또는 이후 Tauri 보안 저장소 흐름에서 다룹니다.

## 라이선스 및 준수

- 라이선스: proprietary, all rights reserved. 자세한 내용은 `LICENSE.md`를 확인하세요.
- Atlassian/Jira 관련 준수 메모는 `docs/compliance/atlassian.md`를 확인하세요.
- Tasker Tasker는 Atlassian과 무관한 독립 프로젝트입니다.
