const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

const headers = {
  "Authorization": `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json"
};

async function loadPost() {
  const container = document.getElementById("post-detail");
  container.innerHTML = `<p class="text-center text-gray-500">Loading...</p>`;

  try {
    if (!postId) throw new Error("게시글 ID가 없어요.");

    const res = await fetch(`https://api.notion.com/v1/pages/${postId}`, {
      method: "GET",
      headers
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    const props = data.properties || {};

    const title = props.Title?.title?.[0]?.plain_text || "제목 없음";
    const img = props.ImageURL?.url || "";
    const content = props.Content?.rich_text?.map(t => t.plain_text).join("\n") || "내용 없음";
    const date = props.Date?.date?.start || "";

    container.innerHTML = `
      <h1 class="text-3xl font-bold mb-2">${title}</h1>
      <p class="text-sm text-gray-600 mb-4">${date}</p>
      ${img ? `<img src="${img}" alt="${title}" class="rounded-xl shadow mb-4 w-full object-cover">` : ""}
      <div class="text-gray-800 whitespace-pre-line leading-relaxed">${content}</div>
    `;
  } catch (err) {
    console.error("❌ 상세 글 로딩 오류:", err);
    container.innerHTML = `<p class="text-center text-red-500">데이터를 불러오는 중 오류가 발생했어요 😥<br>${err.message}</p>`;
  }
}

loadPost();
