const gen = localStorage.getItem("selectedGen");
const type = localStorage.getItem("selectedType");

document.getElementById("genResult").innerText =
  `Generation ${gen}`;

document.getElementById("typeResult").innerText =
  `${type}`;


const starterImage = document.getElementById("starterImage");

if (gen) {
  starterImage.src = `../images/starters/gen${gen}.png`;
}