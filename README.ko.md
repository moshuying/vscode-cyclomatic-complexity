# VSCode 순환 복잡도 플러그인

리소스 탐색기에서 프론트엔드 코드 파일의 순환 복잡도를 직관적으로 표시하는 VSCode 플러그인입니다. JavaScript, TypeScript, Vue, HTML, CSS 등 다양한 파일 형식을 지원합니다.

![vscode-react-complexity](https://raw.githubusercontent.com/moshuying/vscode-cyclomatic-complexity/main/screenshot/PixPin_2025-09-03_21-32-55.png)


## ✨ 주요 기능

- **📁 탐색기 통합**: 파일과 폴더 옆에 순환 복잡도 표시, 색상 코딩 (녹색≤5, 노란색≤10, 빨간색>10)
- **⚡ 자동 분석**: 시작 시 전체 프로젝트 자동 분석
- **📊 전용 뷰**: 독립적인 순환 복잡도 분석 패널, 정렬 및 빠른 파일 열기 지원
- **🚫 스마트 필터링**: `.gitignore` 자동 읽기, 구성 가능한 폴더 제외

## 🎮 사용 방법

### VSCode 플러그인

1. **자동 시작**: 프론트엔드 프로젝트를 연 후 순환 복잡도 자동 분석
2. **결과 보기**: 탐색기에서 파일 옆의 복잡도 숫자 확인
3. **패널**: 왼쪽 액티비티 바의 차트 아이콘을 클릭하여 상세 분석 보기
4. **수동 업데이트**: 폴더에 마우스 오른쪽 버튼을 클릭하고 "폴더 복잡도 재귀적 업데이트" 선택

### 구성

VSCode 설정에서 "Code Cyclomatic Complexity"를 검색하여 제외 폴더 목록을 사용자 정의할 수 있습니다.

## 📐 지원되는 파일 형식

- **JavaScript/TypeScript**: `.js`, `.ts`, `.jsx`, `.tsx`
- **Vue**: `.vue`  
- **HTML**: `.html`, `.htm`
- **CSS/전처리기**: `.css`, `.scss`, `.sass`, `.less`, `.styl`

### 복잡도 계산 규칙

기본 복잡도는 1이며, 다음 구조는 복잡도를 증가시킵니다:

- **조건문**: `if`, `for`, `while`, `case`, `catch`
- **논리 연산자**: `&&`, `||`, `? :`
- **Vue 지시문**: `v-if`, `v-for`, `v-show`
- **CSS 선택자**: 의사 클래스, 미디어 쿼리, 중첩 등

## 🛠️ 개발

```bash
npm install                       # 의존성 설치
npm run compile                   # 프로젝트 컴파일
npm run watch                     # 변경사항 감시 및 컴파일
```

## 📜 라이선스

MIT

