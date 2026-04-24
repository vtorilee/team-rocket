export function initSidebar() {
  const sidebarToggle = document.getElementById("toggle-button");
  const sidebar = document.getElementById("sidebar");

  //toggle listener
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    sidebarToggle.classList.toggle("rotate");

    //close submenus on close (only one in this case)
    if (sidebar.classList.contains("close")) {
      Array.from(sidebar.getElementsByClassName("show")).forEach((ul) => {
        ul.classList.remove("show");
        ul.previousElementSibling.classList.remove("rotate");
      });
    }
  });

  const dropdownButton = document.querySelectorAll(".dropdown-button");

  dropdownButton.forEach((button) => {
    button.addEventListener("click", () => {
      const subMenu = button.nextElementSibling;
      subMenu.classList.toggle("show");
      button.classList.toggle("rotate");

      //open sidebar when submenu is opened
      if (sidebar.classList.contains("close")) {
        sidebar.classList.remove("close");
        sidebarToggle.classList.add("rotate");
      }
    });
  });
}
