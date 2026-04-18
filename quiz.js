const buttons = document.querySelectorAll(".genButton");
const resultBox = document.getElementById("result");
const mainImage = document.getElementById("mainImage");

const defaultImage = "../images/all.starters.png";

let selectedGen = null;
let locked = false;

// Hover + image preview
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

  // Click selection
  button.addEventListener("click", () => {
    selectedGen = gen;
    locked = true;

    localStorage.setItem("selectedGen", gen);

    mainImage.src = hoverImage;

    // ✅ ALWAYS UPDATE TEXT (no display toggle)
    resultBox.innerHTML = `
      <h2>Your favourite gen is Generation ${gen}</h2>
    `;
  });
});