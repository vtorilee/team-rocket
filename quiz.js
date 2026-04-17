const buttons = document.querySelectorAll(".genButton");
const resultBox = document.getElementById("result");
const mainImage = document.getElementById("mainImage");

const defaultImage = "../images/all.starters.png";

let selectedGen = null;
let locked = false;

buttons.forEach((button, index) => {
  const gen = index + 1;
  const hoverImage = `../images/starters/gen${gen}.png`;

  button.addEventListener("mouseenter", () => {
    if (!locked) {
      mainImage.src = hoverImage;
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!locked) {
      mainImage.src = defaultImage;
    }
  });

  button.addEventListener("click", () => {
    selectedGen = gen;
    locked = true; // 🔒 freeze image state

    localStorage.setItem("selectedGen", gen);

    mainImage.src = hoverImage; // keep selected image showing

    resultBox.style.display = "block";
    resultBox.innerHTML = `
      <h2>You chose Generation ${gen}!</h2>
    `;
  });
});

function goToTypes() {
  if (!selectedGen) {
    alert("Please choose a generation first!");
    return;
  }

  window.location.href = "types.html";
}