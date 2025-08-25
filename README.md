# Shorts Cleaner – 유튜브 쇼츠 제거기 (v1.0.0)
('AI 딸깍'입니다. 코드 한 줄 안 읽어보고, 작동 잘 하는 것만 테스트해봐서 파악하지 못한 문제가 있을 수 있습니다.)

YouTube 및 m.YouTube 전반에서 **Shorts(쇼츠)** 섹션, 카드, 링크를 숨기고 제거하는 크롬 확장 프로그램입니다.

## 주요 기능
- 홈/검색/영상 상세 등에서 나타나는 **`ytd-reel-shelf-renderer`(Shorts 섹션)**를 즉시 숨김/제거
- 쇼츠로 연결되는 **`/shorts` 링크**가 포함된 카드 전반 제거
- YouTube의 SPA(단일 페이지 앱) 동작에 대응: `MutationObserver` + 네비게이션 이벤트 + 초기 폴링으로 동적 생성도 지속 차단
- 데스크톱(`www.youtube.com`)과 모바일 웹(`m.youtube.com`) 모두 지원

## 설치 방법
1. 아래 ZIP을 다운로드하여 압축을 풉니다.
2. Chrome 주소창에 `chrome://extensions/` 입력 후 이동합니다.
3. 우측 상단 **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드**를 클릭하고, 압축을 푼 폴더를 선택합니다.

## 동작 방식 (기술 메모)
- **CSS**(`document_start`): 레이아웃 페인트 이전에 주요 쇼츠 컨테이너를 숨겨 초기 깜빡임 최소화
- **JS**(`document_idle`): 아래 대상들을 탐지해 DOM에서 제거
  - `ytd-reel-shelf-renderer`, `ytd-reel-video-renderer`, `ytd-reel-player-overlay-renderer`, `ytd-shorts`
  - 모바일: `ytm-shorts-lockup-view-model`, `ytm-shorts-lockup-view-model-v2`
  - `/shorts`로 시작하는 링크가 포함된 카드 컨테이너 전체
- SPA 대응: `yt-navigate-start/finish`, `yt-page-data-updated`, `spfdone` 이벤트와 `MutationObserver`로 노출 재발을 방지

## 트러블슈팅
- **여전히 보인다?**
  - YouTube UI가 변경되었을 수 있습니다. 이 저장소의 `content.js`에서 `TARGET_SELECTORS` 및 `CARD_CONTAINERS`에 새 셀렉터를 추가해보세요.
  - 다른 차단 확장과 충돌할 수 있습니다. 잠시 비활성화 후 비교해주세요.
- **일부 카드만 빈 공간처럼 보임**
  - CSS가 앵커를 숨겨 컨테이너가 남았을 수 있습니다. JS가 컨테이너까지 제거하므로 새로고침 후에도 문제가 지속되면 알려주세요.

## 개인정보/권한
- 이 확장 프로그램은 권한을 추가로 요구하지 않으며, 페이지 내 요소만 숨기거나 제거합니다.
