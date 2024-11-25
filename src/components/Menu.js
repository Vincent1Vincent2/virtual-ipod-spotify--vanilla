export function Menu() {
  const menuContainer = document.createElement("nav");
  const menuList = document.createElement("ul");

  menuContainer.append(menuList);

  const menuItems = ["tracks", "playlists", "albums", "artists"];

  menuItems.forEach((menuItem) => {
    let li = document.createElement("li");
    let link = document.createElement("a");

    li.appendChild(link);
    link.innerHTML = menuItem;
    link.href = `/pages/${menuItem}.html`;
    menuList.append(li);
  });

  return menuContainer;
}
