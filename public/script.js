// public/script.js 파일

document.addEventListener('DOMContentLoaded', () => {
    // 웹 페이지의 모든 DOM 콘텐츠가 로드된 후 이 함수가 실행됩니다.
    // 이는 스크립트가 HTML 요소를 찾기 전에 모든 요소가 준비되도록 보장합니다.

    const contentArea = document.getElementById('content-area');
    // HTML에서 'content-area'라는 ID를 가진 요소를 가져옵니다.
    // 이곳에 Notion에서 가져온 콘텐츠들을 표시할 것입니다.

    async function fetchNotionPages() {
        // Notion 데이터를 비동기적으로(async/await) 가져오는 함수를 정의합니다.
        try {
            // 우리가 만든 Node.js 서버의 '/api/notion-pages' 엔드포인트로 요청을 보냅니다.
            // 로컬 환경에서는 'http://localhost:3000'이 서버 주소입니다.
            const response = await fetch('http://localhost:3000/api/notion-pages');

            // 응답이 성공적인지 확인합니다. (HTTP 상태 코드 200번대)
            if (!response.ok) {
                // 응답이 성공적이지 않다면 에러를 발생시킵니다.
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 응답 본문을 JSON 형태로 파싱합니다.
            const pages = await response.json();
            // 'pages' 변수에는 Notion 데이터베이스의 각 항목(페이지) 정보가 배열 형태로 담겨 있습니다.

            // 데이터를 성공적으로 가져왔으니, "콘텐츠를 불러오는 중..." 메시지를 지웁니다.
            contentArea.innerHTML = ''; 

            // 가져온 페이지 데이터를 순회하며 HTML 요소를 생성합니다.
            if (pages.length === 0) {
                contentArea.innerHTML = '<p>아직 공개된 Notion 콘텐츠가 없습니다.</p>';
                return;
            }

            pages.forEach(page => {
                // 각 Notion 페이지 항목에서 필요한 속성들을 추출합니다.
                // Notion API 응답 구조에 따라 경로가 다를 수 있으니 주의 깊게 확인해야 합니다.
                // 여기서는 Notion 데이터베이스 속성 이름을 한국어 기준으로 가정합니다.
                
                // 페이지 제목 (Title 속성)
                const title = page.properties['이름']?.title?.[0]?.plain_text || '제목 없음';
                // '이름' 속성의 'title' 배열의 첫 번째 요소의 'plain_text' 값을 가져옵니다. 없으면 '제목 없음'.

                // 키워드 (Multi-select 속성)
                const keywords = page.properties['키워드']?.multi_select.map(tag => tag.name) || [];
                // '키워드' 속성의 'multi_select' 배열을 순회하며 각 태그의 'name'을 가져옵니다.
                // console.log(keywords)
                // console.log(page.properties['키워드'])
                // console.log(multi_select.map(tag => tag.name))
                
                // 타입 (Select 속성)
                const type = page.properties['타입']?.select?.name || '분류 없음';
                // '타입' 속성의 'select' 객체에서 'name'을 가져옵니다. 없으면 '분류 없음'.

                // 공개 여부 (Checkbox 속성) - true인 경우만 표시하도록 필터링할 수도 있습니다.
                // 현재 server.js에서 필터링하지 않으므로, 여기서 체크합니다.
                const isPublished = page.properties['공개 여부']?.checkbox || false;

                // Notion 페이지 자체의 ID (상세 페이지 링크에 사용될 수 있습니다.)
                const pageId = page.id; 

                // '공개 여부'가 체크된 페이지들만 표시합니다.
                if (isPublished) {
                    // 각 Notion 페이지를 표시할 HTML 카드 요소를 생성합니다.
                    const card = document.createElement('div');
                    card.classList.add('page-card'); // 'page-card' CSS 클래스 추가

                    // 카드 내부에 HTML 콘텐츠를 설정합니다.
                    card.innerHTML = `
                        <h3>${title}</h3>
                        <p class="page-type">유형: ${type}</p>
                        <div class="keywords">
                            ${keywords.map(keyword => `<span>${keyword}</span>`).join('')}
                        </div>
                    `;
                    // ${keywords.map(...).join('')} 는 배열의 각 키워드를 <span> 태그로 만들고, 이들을 하나의 문자열로 합칩니다.
                    card.dataset.pageId = pageId;
                    // 생성된 카드 요소를 'content-area'에 추가합니다.
                    contentArea.appendChild(card);
                }
            });

            // 'page-card' 클래스를 가진 모든 요소에 클릭 이벤트를 추가합니다.
            document.querySelectorAll('.page-card').forEach(card => {
                card.addEventListener('click', () => {
                    // 클릭한 카드 요소의 data-page-id 속성 값을 가져옵니다.
                    const pageId = card.dataset.pageId;
                    // 가져온 ID로 상세 페이지 내용을 가져오는 함수를 호출합니다.
                    fetchPageContent(pageId);
                });
            });

        } catch (error) {
            // API 호출 중 에러가 발생하면 콘솔에 에러 메시지를 기록하고 사용자에게도 표시합니다.
            console.error('Notion 페이지를 가져오는 중 오류 발생:', error);
            contentArea.innerHTML = '<p style="color: red;">콘텐츠를 불러오는 데 실패했습니다. 서버가 실행 중인지 확인하고 Notion API 설정(토큰, ID, 권한)을 점검해주세요.</p>';
        }
    }

    // 함수 호출: 웹 페이지가 로드되면 Notion 데이터를 가져오기 시작합니다.
    fetchNotionPages();
    
});


// server.js 파일

// ... (기존 Notion 클라이언트 및 포트 설정 코드) ...
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

// ... (기존 CORS 설정 및 `app.use` 코드) ...

// 기존 /api/notion-pages 엔드포인트
app.get("/api/notion-pages", async (req, res) => {
  // ... (기존 데이터베이스 목록 가져오는 코드) ...
});

// 새로운 API 엔드포인트: 특정 페이지의 본문 내용을 가져옵니다.
app.get("/api/notion-page/:pageId", async (req, res) => {
  const pageId = req.params.pageId; // URL 파라미터에서 pageId를 가져옵니다.

  try {
    // 페이지의 모든 블록(본문 내용)을 가져옵니다.
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 50, // 한 번에 가져올 블록의 최대 개수
    });

    res.json(response.results); // 가져온 블록 목록을 JSON 형태로 응답합니다.
  } catch (error) {
    console.error(`Error fetching page blocks for ID ${pageId}:`, error);
    res.status(500).json({ error: "Failed to fetch page blocks from Notion." });
  }
});