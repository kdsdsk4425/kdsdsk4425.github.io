const headers = {
  "Authorization": `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json"
};

async function loadPosts() {
  const container = document.getElementById("post-container");
  container.innerHTML = `<p class="text-center text-gray-500 col-span-full">Loading posts...</p>`;

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST", headers
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    const posts = data.results || [];

    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-400 col-span-full">아직 게시글이 없어요 😅</p>`;
      return;
    }

    posts.forEach(page => {
      const id = page.id?.replace(/-/g, "") || "";
      const props = page.properties || {};

      const title = props.Title?.title?.[0]?.plain_text || "제목 없음";
      const img = props.ImageURL?.url || "https://placehold.co/600x400?text=No+Image";
      const content = props.Content?.rich_text?.[0]?.plain_text || "내용 없음";
      const date = props.Date?.date?.start || "";

      const card = document.createElement("a");
      card.href = id ? `post.html?id=${id}` : "#";
      card.className = "bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition duration-300 transform hover:-translate-y-1";
      card.innerHTML = `
        <img loading="lazy" src="${img}" alt="${title}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h2 class="font-semibold text-lg mb-1">${title}</h2>
          <p class="text-sm text-gray-600 mb-2">${date}</p>
          <p class="text-gray-700 text-sm line-clamp-3">${content}</p>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Notion 데이터 불러오기 오류:", err);
    container.innerHTML = `<p class="text-center text-red-500 col-span-full">데이터를 불러오는 중 오류가 발생했어요 😥<br>${err.message}</p>`;
  }
}

loadPosts();
