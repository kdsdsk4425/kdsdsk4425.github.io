// .env 파일에서 환경 변수를 로드합니다.
require('dotenv').config();

// 필요한 모듈들을 불러옵니다.
const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');

// Express 앱을 초기화합니다.
const app = express();
const PORT = process.env.PORT || 3000;

// Notion 클라이언트와 데이터베이스 ID를 환경 변수에서 가져와 설정합니다.
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

// CORS 미들웨어를 사용하여 모든 출처에서의 요청을 허용합니다.
app.use(cors());
// `public` 폴더에 있는 정적 파일(HTML, CSS, JS)을 제공합니다.
app.use(express.static('public'));

// Notion 데이터베이스의 페이지 목록을 가져오는 API 엔드포인트
app.get('/api/notion-pages', async (req, res) => {
    try {
        const response = await notion.databases.query({
            database_id: notionDatabaseId,
            filter: {
                property: "공개 여부",
                checkbox: {
                    equals: true,
                },
            },
        });
        res.status(200).json(response.results);
    } catch (error) {
        console.error('Error fetching Notion pages:', error);
        res.status(500).json({ error: 'Failed to fetch Notion pages from Notion API.' });
    }
});

// 특정 Notion 페이지의 상세 내용(블록)을 가져오는 API 엔드포인트
app.get('/api/notion-page/:pageId', async (req, res) => {
    const pageId = req.params.pageId;
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 50,
        });
        res.status(200).json(response.results);
    } catch (error) {
        console.error(`Error fetching page blocks for ID ${pageId}:`, error);
        res.status(500).json({ error: 'Failed to fetch page blocks from Notion.' });
    }
});

// 서버를 시작하고 지정된 포트에서 요청을 받기 시작합니다.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
