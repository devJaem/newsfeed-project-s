# 내배캠 Node.JS 4조
### 뉴스피드 프로젝트
---
### Setting
1. 코드 복사하기
```bash
git clone https://github.com/devJaem/marketplace.git .
```

2. Node 의존성 다운로드
```bash
yarn install
```

3. <br>
```bash
.env 파일 생성하기 (https://github.com/devJaem/newsfeed-project-s/blob/main/.env.example) 참고
```

4. 서버 실행하기
```bash
# nodemon 으로 실행하기
yarn run dev
```
#### 폴더구조
---
```
├── node_modules
├── prisma
│   └── schema.prisma
├── src
│   ├── constants
│   │   ├── auth.constant.js
│   │   ├── env.constant.js
│   │   ├── review.constant.js
│   │   └── user.constant.js
│   ├── middlewares
│   │   ├── error-handling.middleware.js
│   │   ├── log.middleware.js
│   │   ├── require-access-token.middleware.js
│   │   ├── require-refresh-token.middleware.js
│   │   ├── require-roles.middleware.js
│   │   └── validations
│   │       ├── review.validtation.middleware.js
│   │       └── sign.validation.middleware.js
│   ├── routers
│   │   ├── auth.router.js
│   │   ├── route.js
│   │   ├── review.router.js
│   │   └── user.router.js
│   ├── utils
│   │   ├── jwt.util.js
│   │   └── prisma.util.js
│   └── app.js
├── .env 
├── .env.example 
├── .gitignore
├── .prettierrc
├── package.json
├── README.md
└── yarn.lock // npm을 사용하면 package-lock.json
```
- `app.js`
    - **전체 어플리케이션의 시작점**입니다.
    - **미들웨어(Middleware)**와 **라우터(Router)**를 등록하며, 서버를 시작하는 역할을 담당합니다.
- `constants`
    - 에러, 성공 메시지의 문구를 관리합니다. 이곳에서 관리시 유지보수가 편리합니다.
    - 환경 변수(ENV value)를 dotenv를 통해 조회하고 관리합니다. 여러 곳에서 dotenv()를 활성화할 필요가 없어집니다.
- `middlewares`
    - 다양한 미들웨어를 정의하고 관리합니다.
    - 에러 핸들러 미들웨어:
        - 모든 에러를 고차함수를 통해 캐치하여 next()로 보내는 함수.
        - 받은 에러를 메시지와 함께 처리하는 미들웨어로 구성됩니다.
    - 입력값 유효성 검증 미들웨어:
        - 이력서 관련, 회원 관련 유효성 검증을 위한 Joi 미들웨어를 관리합니다.
        - 라우트 테이블에서 사용됩니다.
    - 토큰 관리 미들웨어:
        - Access Token과 Refresh Token을 검증하고 관리하는 미들웨어를 포함합니다.
- `routes`
    - Express.js의 **라우터(Router)**를 관리합니다.
    - 각 API 경로를 정의하고, 해당 경로에서 실행될 함수를 관리하는 역할을 담당합니다.
- `utils`
    - Prisma와 관련된 로그를 처리합니다.
    - JWT를 분해하여 payload를 반환합니다. 이는 단순히 분해 작업만 진행하기 때문에 util 폴더에서 관리됩니다.
#### API 명세
---
https://devjeam.notion.site/Node-js-API-6024911b8cfb477cb106b290770cf9d4

#### ERD
---
https://drawsql.app/teams/recruit-hub/diagrams/recruit-hub
