const buttons = document.querySelectorAll(".genButton");
const resultBox = document.getElementById("result");
const mainImage = document.getElementById("mainImage");

const defaultImage = "../images/all.starters.png";

buttons.forEach((button, index) => {
  const gen = index + 1;

  const hoverImage = `../images/starters/gen${gen}.png`;

  button.addEventListener("mouseenter", () => {
    mainImage.src = hoverImage;
  });

  button.addEventListener("mouseleave", () => {
    mainImage.src = defaultImage;
  });

  button.addEventListener("click", () => {
    localStorage.setItem("selectedGen", gen);

    resultBox.style.display = "block";
    resultBox.innerHTML = `
      <h2>You chose Generation ${gen}!</h2>
    `;
  });
});