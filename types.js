const typeButtons = document.querySelectorAll(".type");
const resultBox = document.getElementById("typeResult");
const nextBtn = document.getElementById("typeNextBtn");

let selectedType = null;



typeButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedType = button.innerText;

    
    resultBox.innerHTML = `
      <h2>You chose ${selectedType} type!</h2>
      
    `;

   
    localStorage.setItem("selectedType", selectedType);

    
    nextBtn.style.display = "inline-block";
  });
});