function toggleInfo(card) {
  card.classList.toggle("active");

  // wait for animation then recalc height
  setTimeout(sendHeight, 350);
}
function sendHeight() {
  const height = document.body.scrollHeight;

  window.parent.postMessage({
    type: "setHeight",
    height: height
  }, "*");
}