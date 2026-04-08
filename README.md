# 마린시티 식당 돌림판 🎡

마린시티 식당 목록을 기반으로 오늘 점심/저녁을 골라주는 돌림판 웹 앱입니다.

## 기능

- **돌림판 애니메이션**: 자연스러운 감속 효과로 회전
- **3순위 추천**: 1~3순위 식당을 한번에 결정
- **중복 방지**: 오늘 선택된 1순위 메뉴는 자동으로 제외 (다음날 자동 초기화)
- **카테고리 필터**: 한식 / 분식 / 양식 / 아시아 별도 선택 가능
- **다크모드 지원**: 시스템 설정 자동 감지
- **오늘 기록 저장**: `localStorage`에 날짜 기반으로 저장 (다음날 자동 초기화)

## 파일 구조

```
marina-spinner/
├── index.html        # 메인 HTML + 스타일
├── restaurants.js    # 식당 데이터 (RESTAURANTS 배열)
├── spinner.js        # 돌림판 로직
└── README.md
```

## 실행 방법

### 로컬 실행
`index.html` 파일을 브라우저에서 바로 열면 됩니다.

> ⚠️ `localStorage`는 `file://` 프로토콜에서도 동작하지만, 일부 브라우저는 제한할 수 있습니다.  
> 완전한 동작을 위해 로컬 서버 사용을 권장합니다.

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

### GitHub Pages 배포
1. 이 저장소를 GitHub에 push
2. Settings → Pages → Branch: `main` / `(root)` 선택
3. `https://{username}.github.io/{repo-name}/` 으로 접속

## 식당 데이터 수정

`restaurants.js` 파일의 `RESTAURANTS` 배열을 편집하세요.

```js
{ name: "식당이름", loc: "위치(건물명)", type: "한식|분식|양식|아시아", menu: "대표메뉴", price: 1.5 },
```

| 필드    | 설명                              |
|---------|-----------------------------------|
| `name`  | 상호명                            |
| `loc`   | 위치 (건물/상가명)                |
| `type`  | 구분: `한식` `분식` `양식` `아시아` |
| `menu`  | 대표 메뉴                         |
| `price` | 가격대 (만원 단위)                |

## 데이터 출처

2025년 11월 18일 기준 마린시티 식당리스트 (단위: 만원)
