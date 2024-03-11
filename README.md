# Prisma

## 과제

이 두개를 하신 뒤에 아래 과제를 수행해주세요

1. 프리즈마 튜토리얼 : [https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-node-mysql](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-node-mysql)
2. 프리즈마 스키마 문법: [https://www.prisma.io/docs/orm/prisma-schema](https://www.prisma.io/docs/orm/prisma-schema)

자유주제로 API를 만듭니다. 다만 아래 조건을 충족해주세요

1. MySQL
2. 1:1, 1:N 관계 하나 이상 + 테이블 3개 혹은 그 이상
3. Unique Index Constraint 1개 혹은 그 이상
4. 3 Layer Architecture 구조

프리즈마를 이용해 테이블 3개 이상에서 unique index constraint 넣어서 관계 테이블 만들고 자바스크립트로 쿼리 해오고 웹에서 입출력 가능하게

# Prisma란

Prisma는 개선된 현대식 ORM이다

### ORM이란?

ORM(Object-Realational Mapping)은 DB의 Schema를 Object로 매핑해 주는 역할. 즉 ,모델링 된 객체와 관계를 바탕으로 SQL을 자동으로 생성해주는 도구

그러므로 직접 sql문을 작성 할 필요 없이 객체 지향적으로 코드를 작성할 수 있게 됨

---

## 프리즈마 튜토리얼 실습

```python
mkdir hello-prisma 
cd hello-prisma

# node.js에 prisma 의존성 추가하고
npm init -y 
npm install prisma --save-dev
# prisma 파일들 생성
npx prisma init
```

---

mysql설치

```python
brew install mysql
```

mysql 서버 설정

```python
mysql.server start
mysql_secure_installation
	#(n pw n n y y)
```

실수로 validate password component를 y를 눌렀을 시 mysql에서 실행

```python
UNINSTALL COMPONENT 'file://component_validate_password';
```

mysql 실행

```python
mysql -u root -p
```

---

schema.prisma 파일에 mysql db 연결

```python
datasource db {
  provider = "mysql"
  url      = "mysql://root:pw@localhost:3306/my_db"
	#url      = env("DATABASE_URL")
}
```

schema.prisma 파일에 아래 코드를 추가하고 prisma migrate 기능을 이용해 db에 테이블 생성

```python
# schema.prisma 파일에 아래 코드를 추가
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String   @db.VarChar(255)
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  user   User    @relation(fields: [userId], references: [id])
  userId Int     @unique
}

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
  profile Profile?
}
```

```python
# prisma migrate 기능을 이용해 db에 테이블 생성
npx prisma migrate dev --name init
```

프리즈마 클라이언트 설치

```python
npm install @prisma/client
```

![스크린샷 2023-12-28 오후 5.43.06.png](img/%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-28_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_5.43.06.png)

prisma generate를 호출함으로 prisma client를 prima schema를 통해 생성

그러므로 나중에도 prisma schema를 계속 업데이트 해주어야 클라이언트에서 적절한 버전으로 재생성 됨

index.js를 생성해서 node.js를 통해 prisma client의 기능을 확인

```jsx
//index.js

// npm install로 설치한 모듈
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
// 데이터베이스 쿼리 문을 main으로 선언
async function main() {
	// 유저 생성
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      posts: {
        create: { title: 'Hello World' },
      },
      profile: {
        create: { bio: 'I like turtles' },
      },
    },
  })
	// 포스트와 프로파일을 포함해 유저 전부 조회하는 함수 선언
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  })
  console.dir(allUsers, { depth: null })
}

// main 호출 후 끝나면 연결 종료
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

//생성은 sql developer처럼 업로드 하고 끝인 것처럼 여러번 실행 불가
```

main문을 아래와 같이 수정하면 update를 통해 방금 생성한 post 데이터를 변경

```jsx
async function main() {
    const post = await prisma.post.update({
			// id가 1 인 row의 published를 true로 변경
      where: { id: 1 },
      data: { published: true },
    })
		// Post 테이블 출력
    console.log(post)
}
```

---

# 자유 주제 API

### 헬스장 기구 조회 시스템

유저와 헬스기구, 헬스장 을 관계 테이블을 통해 기구가 어떤 헬스장에서 누구한테 사용되고 있는지 조회하는 API를 제작

## ERD

![스크린샷 2023-12-28 오후 7.38.15.png](img/%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-28_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_7.38.15.png)

ㄴmysql은 boolean을 지원하지 않지만 자동으로 TYNYINT(1) 타입으로 변경됨

schema.prisma로 sql문 생성후 mysql db에 테이블 생성

```jsx
//schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id   Int       @id @default(autoincrement())
  name      String
  id_number String    @unique
  using_mac Machine   @relation(fields: [macId], references: [id], onDelete: Cascade)
  macId     Int       @unique
}

model Machine {
  id   Int       @id @default(autoincrement())
  user      User?
  in_gym    Gym       @relation(fields: [gymId], references: [id], onDelete: Cascade)
  gymId     Int       @unique
  is_using  Boolean   @default(false)
}

model Gym {
  id    Int       @id @default(autoincrement())
  name      String?
  machines  Machine[]
}
```

```sql
npx prisma migrate dev --name init
```

```sql
//migrate로 생성된 sql문(자동으로 mysql db에 적용)

//migration.sql

-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `id_number` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_id_number_key`(`id_number`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Machine` (
    `mach_id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `gymId` INTEGER NOT NULL,
    `is_using` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Machine_userId_key`(`userId`),
    PRIMARY KEY (`mach_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gym` (
    `gym_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`gym_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Machine` ADD CONSTRAINT `Machine_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Machine` ADD CONSTRAINT `Machine_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym`(`gym_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

아래로 미완성

---

sql등록문

```sql
insert into gym (id,name) values (1,"hongdae");
insert into gym (id,name) values (2,"kongdae");

INSERT INTO machine (id, gymId, is_using) VALUES (1, 1, 0);
INSERT INTO machine (id, gymId, is_using) VALUES (2, 1, 0);
INSERT INTO machine (id, gymId, is_using) VALUES (3, 2, 0);
INSERT INTO machine (id, gymId, is_using) VALUES (4, 2, 0);
INSERT INTO machine (id, gymId, is_using) VALUES (5, 2, 0);

insert into user (id,name,id_number,macId) values (1,'none',111,NULL);
insert into user (id,name,id_number,macId) values (2,'none',112,NULL);
insert into user (id,name,id_number,macId) values (3,'none',113,NULL);
insert into user (id,name,id_number,macId) values (4,'none',114,NULL);
insert into user (id,name,id_number,macId) values (5,'none',115,NULL);
insert into user (id,name,id_number,macId) values (6,'yoon',513,NULL);
insert into user (id,name,id_number,macId) values (7,'joon',412,NULL);
insert into user (id,name,id_number,macId) values (8,'ho',231,NULL);
```

원래 구현하고 싶은 내용은 15분정도 시간 제한이 있고 기구를 사용한다 하면 사용하는 사람이 있는지에 따라 확인하고 사용할 수 있고 다른사람은 그 남은 시간을 조회할 수 있는 시스템을 생각해서 만들었는데

만들다 보니 가장 잘못된 점이

사용되지 않은 기구를 설정할 수가 없다는 것이다 외래키로 지정되어 있으므로 무결성에 위배되지 않으려면 유저를 지정해줘야하기때문에

그래서 일단은 더미유저를 만듬으로서 해결했지만 이런식으로 1:0~1 관계?는 어떻게 구성해야하는지 궁금

db를 쿼리해서 웹서버에 보여주는 코드

```jsx
//index.js

var express = require('express');
var app = express();
var db_config = require(__dirname + '/config/database.js');
var conn = db_config.init();
var bodyParser = require('body-parser');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.get('/', function (req, res) {
    res.redirect('/machine_use');
});

app.get('/machine_use', function (req, res) {
    var sql = 'select name,mach_id,is_using from gym join machine on gym.gym_id=machine.gymid'; 
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('machine_use.ejs', {list : rows});
    });
});

app.post('/machineSel', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'UPDATE machine SET userid=?,is_using=1 where mech_id=?';
    var params = [body.user_id, body.mach_id];
    console.log(sql);
    conn.query(sql, params, function(err) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else res.redirect('/machine_use');
    });
});

app.listen(3000, () => console.log('Server is running on port 3000...'));
```

```html
// machine_use.ejs

<html>
    <head>
        <meta charset="utf-8">
        <title>기구현황</title>
    </head>
    <body>
        <h2>기구 사용 현황</h2>
        <table border='1'>
            <colgroup>
                <col width='60'><col width='200'><col width='100'>
            </colgroup>
            <thead>
                <tr>
                    <th>헬스장</th>
                    <th>기구 번호</th>
                    <th>사용 여부</th>
                </tr>
            </thead>
            <tbody>
                <% for(i = 0; i < list.length; i++) { %>
                <tr>
                    <td><%=list[i].Gym.name %></td>
                    <td><%=list[i].Machine.mach_id %></td>
                    <td><%=list[i].Machine.using %></td>
                </tr>
                <% } %>
            </tbody>
        </table boader='1'>
        <h2>게시글 작성</h2>
        <form action='/machineSel' method='post'>
            사용자 id : <input type='text' name='user_id'><br>
            사용할 기구 번호 : <input type='text' name='mach_id'><br>
            <button type='submit'>사용</button>
        </form>
    </body>
</html>
```

위는 nodejs를 직접 mysql에 연결해서 출력하는 코드이고 아래코드처럼 prismaclient를 이용해 만들려 했지만 완성 못함

```sql
const express = require('express');
const bodyParser = require('body-parser');
const {prisma} = require('./generated/prisma-client');

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/machine_use', async (req, res) => {
    const allMachines = await prisma.machine();
    res.render('machine_use.ejs', {allMachines});
});

app.post('/machineSel', async (req, res) => {
    const post = await prisma.post.update({
        where: { id: 1 },
        data: { published: true },
    })
    console.log(post)

    var sql = 'UPDATE machine SET userid=?,is_using=1 where mech_id=?';
    var params = [body.user_id, body.mach_id];
    console.log(sql);
    conn.query(sql, params, function(err) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else res.redirect('/machine_use');
    });
});
```

1. 1:0~1 관계는 어떻게 만들어야 하는지
    
    ㄴ ?를 통해 nullish한 값으로 참조하므로 ?를 사용
    
2. 라우터간 연결을 어떻게 해야하는지 좀더 이해 필요
    
    ㄴ next는 미들웨어로 보내는것 아닌이상 지양
    
3. ORM에서 ?가 무엇인지
    
    ㄴ 1번에서 해결
    
4. 3 레이어 아키텍쳐가 라우터를 이용해 쿼리 과정을 숨기라는 의미인지?
    
    ㄴ cotroller / service / repository 로 js파일들을 구성해서 코딩
    

---

### 헬스장 기구 사용법

헬스장에 어떤 기구가 있는지 조회할 수 있고 그 기구를 사용하는 방법을 출력하는 API

머신 id를 적으면 운동방법이 출력되는 홈페이지

만약에 발전시킨다면 qr을 찍어서 qr코드를 통해 id를 가져와서 운동방법을 출력시키는 방법

![스크린샷 2024-01-13 오전 12.42.14.png](img/%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2024-01-13_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_12.42.14.png)

schema.prisma로 sql문 생성후 mysql db에 테이블 생성

```html
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Gym {
  id       Int      @id @default(autoincrement())
  name     String
  machines Machine[]
}

model Machine {
  id       Int     @id @default(autoincrement())
  gymID    Int
  in_gym   Gym     @relation(fields: [gymID], references: [id], onDelete: Cascade)
  methodID Method?
}

model Method {
  id        Int     @id @default(autoincrement())
  method    String
  machineID Int     @unique
  machine   Machine @relation(fields: [machineID], references: [id], onDelete: Cascade)
}
```

```html
npx prisma migrate dev --name init
```

```html
//migrate로 생성된 sql문(자동으로 mysql db에 적용)

//migration.sql

-- CreateTable
CREATE TABLE `Gym` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Machine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gymID` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Method` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `method` VARCHAR(191) NOT NULL,
    `machineID` INTEGER NOT NULL,

    UNIQUE INDEX `Method_machineID_key`(`machineID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Machine` ADD CONSTRAINT `Machine_gymID_fkey` FOREIGN KEY (`gymID`) REFERENCES `Gym`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Method` ADD CONSTRAINT `Method_machineID_fkey` FOREIGN KEY (`machineID`) REFERENCES `Machine`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
```

sql 등록문

```sql
insert into gym (id,name) values (1,"hongdae");
insert into gym (id,name) values (2,"kongdae");

INSERT INTO machine (id, gymID) VALUES (1, 1);
INSERT INTO machine (id, gymID) VALUES (2, 1);
INSERT INTO machine (id, gymID) VALUES (3, 2);
INSERT INTO machine (id, gymID) VALUES (4, 2);
INSERT INTO machine (id, gymID) VALUES (5, 2);

INSERT INTO method (id, method, machineID) VALUES (1, "chest", 1);
INSERT INTO method (id, method, machineID) VALUES (2, "shoulder", 2);
INSERT INTO method (id, method, machineID) VALUES (3, "leg", 3);
INSERT INTO method (id, method, machineID) VALUES (4, "back", 4);
INSERT INTO method (id, method, machineID) VALUES (5, "running", 5);
```

index.js

```sql

```

controller.js

```sql

```

service.js

```sql

```

repository.js

```sql

```