# 추억달력 (Memory Site)

## 실행 방법 (아주 간단)
```bash
npm install
npm start
```
- 브라우저: http://localhost:5173

## 기능 개요
- 좌측 세로 3개월 달력(초기 2025-08/09/10, 상단 화살표는 2025-08에서 숨김)
- 날짜 클릭 → 우측에 해당 날짜의 글 목록
- 미래 날짜(및 2025-08의 9일 이전)는 회색/비활성
- 우측 하단 고정 + 버튼 → 글쓰기 모달(이름/제목/본문, 사진 첨부, 완료 검증)
- 게시물: 미리보기(이름/제목/좋아요), 전체 보기 모달, 좋아요 토글
- 첫 화면: '08 대화방', '일반인으로 입장하기' / '클릭하지 마시오'(관리자 비번: shinwjdgusrla!)
- 삭제는 관리자만 가능, 수정 불가
- 정렬: 작성 시간 순(작성 먼저가 앞쪽)
- 로컬스토리지에 글/좋아요 저장

## GitHub 업로드
```bash
git init
git branch -M main
git remote add origin https://github.com/<YOUR_ID>/memory-site.git
git add .
git commit -m "init"
git push -u origin main
```
