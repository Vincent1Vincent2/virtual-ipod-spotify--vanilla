// Media
// items: array
// - index: array
//    - external_urls: array
//    - href: string
//    - id: string
//    - images: array
//    - name: string
//    - owner: array
//    - tracks: array
//    - type: string
//    - uri: string

export function Media_list(items) {
  const container = document.createElement("div");

  items.forEach((item) => {
    const card = document.createElement("div");

    const img = document.createElement("img");
    img.src = item.images[0]?.url || "/placeholder.jpg";
    img.alt = item.name;

    const title = document.createElement("h3");
    title.textContent = item.name;

    const trackCount = document.createElement("p");
    trackCount.textContent = `${item.tracks.total} tracks`;

    card.append(img, title, trackCount);
    container.appendChild(card);
  });

  return container;
}
