# 급구 유령의 집 👻

니더 할로윈용 3D 유령 테스트 + 동료들과 Trick or Treat.

## 구현된 경험

- 질문 5개 → 캐릭터 6종. 모든 캐릭터가 실제 답안 조합으로 도달 가능합니다.
- Three.js 3D 사무실: 드래그 회전, 확대, 공간 필터, 이름 검색, 유령 선택.
- WebGL을 사용할 수 없으면 같은 모형을 SVGRenderer로 렌더링합니다.
- 사탕과 메시지, 30분간 호박 변신 / 말풍선 / 반짝임 표시.
- 내 유령 결과 공유, 받은 메시지함, 로컬 체험 기록.
- GitHub Pages용 상대 경로 빌드와 GitHub Actions 배포 워크플로우.
- 별도 Cloudflare Worker + D1: Slack OAuth, 세션, 직원 데이터, 슬랙 DM 전송.

## 현재 연결 상태

기본 실행은 **체험 모드**입니다. 가상의 유령 6명과 이 브라우저의 localStorage만 사용합니다. 실제 직원 데이터 공유와 슬랙 전송은 일어나지 않습니다. 실서비스 서버와 Slack 앱 자격증명은 제공되지 않았으므로 라이브 통합은 아직 검증하지 않았습니다.

`VITE_API_URL`을 구성하고 빌드하면 **직원 운영 모드**로 전환됩니다. 접속 페이지 자체는 GitHub Pages에 공개되고, 직원 목록과 메시지 API는 지정한 Slack 워크스페이스 로그인 뒤에만 조회할 수 있습니다. 인증 전 공개 페이지에는 실제 직원 이름이나 메시지가 포함되지 않습니다.

## 로컬 실행

Node.js 24 사용.

```bash
npm ci
npm run dev
npm test
npm run build
```

## GitHub Pages 배포

1. GitHub에 `gubgoo-haunted-house` 저장소를 만듭니다. 무료 개인 계정이면 공개 저장소를 사용합니다.
2. 이 소스를 `main` 브랜치에 push합니다.
3. 저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions**로 설정합니다.
4. **Actions → Deploy ghost house to GitHub Pages → Run workflow**를 실행합니다.
5. 워크플로우의 `github-pages` deployment URL로 접속합니다.

환경변수가 없으면 체험 모드로 배포됩니다. 운영 모드는 아래 서버를 연결한 뒤 저장소 **Settings → Secrets and variables → Actions → Variables**에 `VITE_API_URL`을 서버의 HTTPS origin으로 추가하고 다시 배포합니다. 프런트 변수에는 Slack 토큰이나 Client Secret을 절대 넣지 않습니다.

## 실제 직원·Slack 연결

GitHub Pages는 정적 화면을 호스팅합니다. 데이터 및 Slack 자격증명은 별도 Worker가 관리합니다.

### 1. Cloudflare D1

Cloudflare 계정에서 Workers와 D1을 사용할 수 있어야 합니다. 리소스 및 요금제 선택은 운영 계정에서 확인합니다.

```bash
cd server
npx wrangler login
npx wrangler d1 create gubgoo-haunted-house
```

반환된 DB ID를 `wrangler.jsonc`의 `database_id`에 입력합니다. `APP_URL`에는 정확한 GitHub Pages 주소(끝의 `/` 포함), `SLACK_TEAM_ID`에는 니더 워크스페이스 ID, `SLACK_CLIENT_ID`에는 앱 Client ID를 입력합니다. 입력란의 `REPLACE_...`는 실제 값으로 바꿔야 합니다.

```bash
npx wrangler d1 execute gubgoo-haunted-house --remote --file=schema.sql
```

### 2. Slack 앱

관리 권한이 있는 사람이 `server/slack-manifest.json`으로 Slack 앱을 만듭니다. Redirect URL의 placeholder는 실제 Worker의 `/auth/callback` 주소로 바꿉니다. 워크스페이스 정책에 따라 관리자 승인이 필요할 수 있습니다.

Bot scopes: `chat:write`, `im:write`, `users:read`. User scope: `users:read` (OAuth 참여자 식별). 앱을 니더 워크스페이스에 설치합니다. Client Secret과 Bot User OAuth Token은 아래 명령이 여는 비밀 입력 프롬프트에만 입력합니다.

```bash
npx wrangler secret put SLACK_CLIENT_SECRET
npx wrangler secret put SLACK_BOT_TOKEN
npx wrangler deploy
```

직원 로그인은 설정된 워크스페이스의 활성 일반 사용자만 허용하고 게스트·봇 계정은 제외합니다. 계정 비활성화는 새 로그인 시 확인하며, 이미 발급된 세션은 최대 24시간 유지됩니다.

### 3. 프런트 연결 및 수동 확인

GitHub Actions 변수 `VITE_API_URL`을 Worker URL로 설정하고 프런트를 다시 배포합니다. 최소 두 명의 실제 직원 계정으로 아래를 확인합니다.

- Slack 로그인 후 다른 워크스페이스 및 게스트 계정이 차단되는지
- 각자 테스트를 마친 뒤 같은 유령 목록이 보이는지
- 사탕 수가 새로고침 뒤 유지되는지 (자동 목록 갱신 30초)
- 받는 사람에게만 메시지가 보이고, Slack DM이 정확한 수신자에게 도착하는지
- 같은 행동 30초 제한, 하루 100회 제한, 30분 장난 만료
- DM 전송 실패 시 성공으로 오인하지 않고 앱에 실패가 표시되는지
- 로그아웃 및 24시간 세션 만료

## 데이터·오류 처리

- 인증 토큰은 브라우저 sessionStorage, 서버에는 SHA-256 해시만 저장합니다.
- OAuth state는 일회용이며 10분 만료입니다. 리디렉션 nonce를 원래 로그인 탭에서 대조합니다.
- 참여자 이름은 동료들에게 공개되므로 실명 대신 회사 닉네임을 권장합니다.
- 받은 메시지 내용은 해당 수신자 API에서만 반환합니다. 집 소식에는 발신/수신 닉네임 및 행동 종류만 표시합니다.
- Slack 메시지의 사용자 입력은 `plain_text`로 보내 멘션 및 링크 주입을 방지합니다.
- 사탕 증가·장난 적용·제한은 SQLite 트리거로 원자 처리합니다. 요청 ID로 재전송 중복을 방지합니다.
- 사탕 저장과 Slack API 호출은 분산 트랜잭션이 아닙니다. DM 실패는 `notification=failed`로 남고 앱에서 알려줍니다. 서버 중단 시 `pending` 기록이 남을 수 있으며 자동 재발송은 구현하지 않았습니다.
- 행사 종료 뒤 D1 데이터 보관 기간과 삭제는 운영자가 결정해야 합니다. 관리자 대시보드와 자동 데이터 삭제는 이번 범위에 없습니다.

## 파일 구조

- `src/main.js`: 화면, 테스트, 참여 흐름
- `src/scene.js`: 3D 모형과 렌더러
- `src/data.js`: 캐릭터, 질문, 판정
- `src/api.js`: 체험/운영 데이터 연결
- `server/worker.js`: 로그인·데이터·Slack API
- `server/schema.sql`: 데이터베이스 및 원자적 제한
- `.github/workflows/pages.yml`: Pages 빌드 및 배포
- `tests/`: 캐릭터 도달성, 입력 검증, 인증 경계 및 DB 트리거 검사

## 검증 범위

프런트 프로덕션 빌드, 로컬 논리/인증 경계 테스트, SQLite 원자성 검사를 실행합니다. 브라우저에서 체험 모드의 테스트 → 입주 → 사탕/장난 흐름을 확인합니다. Slack OAuth와 DM은 실제 운영 자격증명이 있어야 최종 검증할 수 있습니다.
