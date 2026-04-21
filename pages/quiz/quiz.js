import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const types = [
  { name: "Bug", color: "#a8b820", path: `../../assets/types/bug.png` },
  {
    name: "Dark",
    color: "#705848",
    path: `../../assets/types/dark.png`,
  },
  { name: "Dragon", color: "#7038f8", path: `../../assets/types/dragon.png` },
  {
    name: "Electric",
    color: "#f8d030",
    path: `../../assets/types/electric.png`,
  },
  {
    name: "Fairy",
    color: "#ee99ac",
    path: `../../assets/types/fairy.png`,
  },
  {
    name: "Fighting",
    color: "#c03028",
    path: `../../assets/types/fighting.png`,
  },
  {
    name: "Fire",
    color: "#f08030",
    path: `../../assets/types/fire.png`,
  },
  {
    name: "Flying",
    color: "#a890f0",
    path: `../../assets/types/flying.png`,
  },
  {
    name: "Ghost",
    color: "#705898",
    path: `../../assets/types/ghost.png`,
  },
  {
    name: "Grass",
    color: "#78c850",
    path: `../../assets/types/grass.png`,
  },
  {
    name: "Ground",
    color: "#e0c068",
    path: `../../assets/types/ground.png`,
  },
  {
    name: "Ice",
    color: "#98d8d8",
    path: `../../assets/types/ice.png`,
  },
  {
    name: "Normal",
    color: "#a8a878",
    path: `../../assets/types/normal.png`,
  },
  {
    name: "Poison",
    color: "#a040a0",
    path: `../../assets/types/poison.png`,
  },
  {
    name: "Psychic",
    color: "#f85888",
    path: `../../assets/types/psychic.png`,
  },
  {
    name: "Rock",
    color: "#b8a038",
    path: `../../assets/types/rock.png`,
  },
  {
    name: "Steel",
    color: "#b8b8d0",
    path: `../../assets/types/steel.png`,
  },
  {
    name: "Water",
    color: "#6890f0",
    path: `../../assets/types/water.png`,
  },
];

const quizData = [
  {
    number: 1,
    question: "Which Pokémon generation is your favourite?",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    defaultImage: "../../assets/all.starters.png",
  },

  {
    number: 2,
    question: "Which Pokémon type do you prefer?",
    options: [
      "Bug",
      "Dark",
      "Dragon",
      "Electric",
      "Fairy",
      "Fighting",
      "Fire",
      "Flying",
      "Ghost",
      "Grass",
      "Ground",
      "Ice",
      "Normal",
      "Poison",
      "Psychic",
      "Rock",
      "Steel",
      "Water",
    ],
    defaultImage: "../../assets/types.png",
  },
  {
    number: 3,
    question: "Which starter Pokémon is your favourite?",
    options: [
      "Bulbasaur",
      "Charmander",
      "Squirtle",
      "Chikorita",
      "Cyndaquil",
      "Totodile",
      "Treecko",
      "Torchic",
      "Mudkip",
      "Turtwig",
      "Chimchar",
      "Piplup",
      "Snivy",
      "Tepig",
      "Oshawott",
      "Chespin",
      "Fennekin",
      "Froakie",
      "Rowlet",
      "Litten",
      "Popplio",
      "Grookey",
      "Scorbunny",
      "Sobble",
      "Sprigatito",
      "Fuecoco",
      "Quaxly",
    ],
    defaultImage: "../../assets/pokedex-device.png",
  },
];

const starterTypePair = {
  Bulbasaur: "Grass",
  Charmander: "Fire",
  Squirtle: "Water",
  Chikorita: "Grass",
  Cyndaquil: "Fire",
  Totodile: "Water",
  Treecko: "Grass",
  Torchic: "Fire",
  Mudkip: "Water",
  Turtwig: "Grass",
  Chimchar: "Fire",
  Piplup: "Water",
  Snivy: "Grass",
  Tepig: "Fire",
  Oshawott: "Water",
  Chespin: "Grass",
  Fennekin: "Fire",
  Froakie: "Water",
  Rowlet: "Grass",
  Litten: "Fire",
  Popplio: "Water",
  Grookey: "Grass",
  Scorbunny: "Fire",
  Sobble: "Water",
  Sprigatito: "Grass",
  Fuecoco: "Fire",
  Quaxly: "Water",
};

let userResult = { gen: null, type: null, starter: null };

let currentQuestion = 0;
let selection = null;

function getTypeColor(name) {
  //if a type name is passed:
  const typeMatch = types.find((item) => item.name === name);
  if (typeMatch) return typeMatch.color;

  //if a pokemon name is passed, search based on index order
  const typeName = starterTypePair[name];
  if (typeName) {
    const foundType = types.find((item) => item.name === typeName);
    return foundType ? foundType.color : "#461111";
  }
  return "#e3d0ce";
}

function handleSelection(choice) {
  //assign selection string to corresponding userResult key depending on what question we are currently on
  const resultKeys = ["gen", "type", "starter"];
  const currentKey = resultKeys[currentQuestion];

  userResult[currentKey] = choice;

  displayQuiz(layoutContainer);
}

function nextQuestion() {
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    displayQuiz(layoutContainer);
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    displayQuiz(layoutContainer);
  }
}

function drawIntro(container, x, y, width, height) {}

function drawOptionsSection(group, data) {
  const resultKeys = ["gen", "type", "starter"];
  const currentKey = resultKeys[currentQuestion];
  const selectedValue = userResult[currentKey];

  //reset
  group.selectAll("*").remove();

  //display the question first
  group
    .append("text")
    .attr("class", "quiz-h1")
    .attr("y", 20)
    .style("fill", "#ffffff")
    .style("font-size", "32px")
    .style("font-weight", "bold")
    .text(`${data.number}.) ${data.question}`);

  const buttonsPerRow = 5;
  const buttonWidth = 125;
  const buttonHeight = 50;
  const gap = 15;

  data.options.forEach((option, i) => {
    //grid pos calcs
    const column = i % buttonsPerRow;
    const row = Math.floor(i / buttonsPerRow);
    const xPos = column * (buttonWidth + gap);
    const yPos = row * (buttonHeight + gap);

    let buttonFill = getTypeColor(option);

    const buttonGroup = group
      .append("g")
      .attr("transform", `translate(${xPos}, ${60 + yPos})`)
      .style("cursor", "pointer")
      .on("click", (event) => {
        console.log("CLICKED:", option);
        handleSelection(option);
      });

    buttonGroup
      .append("rect")
      .attr("width", buttonWidth)
      .attr("height", buttonHeight)
      .attr("rx", 8)
      .attr("fill", buttonFill)
      .attr("opacity", selectedValue && selectedValue !== option ? 0.4 : 1)
      .attr("stroke", selectedValue === option ? "#ffffff" : "#1f1f1f")
      .attr("stroke-width", selectedValue === option ? 4 : 2);

    buttonGroup
      .append("text")
      .attr("x", buttonWidth / 2)
      .attr("y", buttonHeight / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "16px")
      .text(option);
  });
}
function drawSelectedSection(container, x, y, width, height) {}

function drawImagesSection(group, data) {
  group.selectAll("*").remove();

  const resultKeys = ["gen", "type", "starter"];
  const currentKey = resultKeys[currentQuestion];
  const selectedValue = userResult[currentKey];

  let imagePath;

  // default
  if (!selectedValue) {
    imagePath = data.defaultImage;
  } else {
    //gen
    if (currentKey === "gen") {
      imagePath = `../../assets/starters/gen${selectedValue}.png`;
    }

    //type
    else if (currentKey === "type") {
      imagePath = `../../assets/types/${selectedValue.toLowerCase()}.png`;
    }

    //starter
    else if (currentKey === "starter") {
      imagePath = `../../assets/starters/${selectedValue}.png`;
    }
  }
  group
    .append("image")
    .attr("href", imagePath)
    .attr("width", 375)
    .attr("height", 325)
    .attr("x", 160)
    .attr("y", 0)
    .attr("preserveAspectRatio", "xMidYMid meet");
}

function displayResults(container) {
  const layoutWidth = 1300;
  const layoutHeight = 1000;

  container.select("svg").remove();

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${layoutWidth} ${layoutHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("width", "100%")
    .style("height", "auto");

  function drawResults(svg, x, y, width, height) {
    const group = svg.append("g").attr("transform", `translate(${x}, ${y})`);

    //title text
    group
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "white")
      .style("font-size", "42px")
      .style("font-weight", "bold")
      .text("Your Trainer Profile");

    const romanMap = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

    function drawButton(parent, x, y, label, link) {
      const button = parent
        .append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", "pointer")
        .on("click", () => {
          window.location.href = link;
        });

      button
        .append("rect")
        .attr("width", 200)
        .attr("height", 35)
        .attr("rx", 6)
        .attr("fill", "#1f1f1f");

      button
        .append("text")
        .attr("x", 100)
        .attr("y", 23)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "14px")
        .text(label);
    }

    //layout start coords
    const startY = 65;
    const rowGap = 120;

    //gen results
    const genGroup = group
      .append("g")
      .attr("transform", `translate(0, ${startY})`);

    const roman = romanMap[userResult.gen - 1] || userResult.gen;

    genGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "white")
      .style("font-size", "32px")
      .style("font-weight", "bold")
      .style("text-shadow", "0 0 2px black, 0 0 7px white")
      .text(`Gen ${roman}`);

    drawButton(
      genGroup,
      0,
      25,
      "View Generation Data",
      "../visualizations.html",
    );

    //type results
    const typeGroup = group
      .append("g")
      .attr("transform", `translate(0, ${startY + rowGap})`);

    typeGroup
      .append("image")
      .attr("href", `../../assets/types/${userResult.type.toLowerCase()}.png`)
      .attr("x", 95)
      .attr("y", -45)
      .attr("width", 60)
      .attr("height", 60);

    typeGroup
      .append("text")
      .attr("y", -5)
      .style("fill", "white")
      .style("font-size", "28px")
      .text(userResult.type);

    drawButton(typeGroup, 0, 15, "View Type Data", "../visualizations.html");

    //starter results
    const starterGroup = group
      .append("g")
      .attr("transform", `translate(0, ${startY + rowGap * 1.5})`);

    starterGroup
      .append("image")
      .attr("href", `../../assets/starters/${userResult.starter}.png`)
      .attr("x", 130)
      .attr("y", -10)
      .attr("width", 65)
      .attr("height", 65);

    starterGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 45)
      .style("fill", "white")
      .style("font-size", "26px")
      .text(userResult.starter);

    drawButton(
      starterGroup,
      0,
      60,
      "View Starter Data",
      "../visualizations.html",
    );

    //trainer image
    group
      .append("image")
      .attr("href", "../../assets/trainer.png")
      .attr("x", 500)
      .attr("y", 35)
      .attr("width", 300)
      .attr("height", 400);

    // restart button
    const restart = group
      .append("g")
      .attr("transform", "translate(0, 375)")
      .style("cursor", "pointer")
      .on("click", () => {
        userResult = { gen: null, type: null, starter: null };
        currentQuestion = 0;
        displayQuiz(layoutContainer);
      });

    restart
      .append("rect")
      .attr("width", 180)
      .attr("height", 45)
      .attr("rx", 8)
      .attr("fill", "#461111");

    restart
      .append("text")
      .attr("x", 90)
      .attr("y", 28)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text("Restart Quiz");
  }

  drawResults(svg, 120, 80, layoutWidth - 100, layoutHeight - 100);
}

function displayQuiz(container) {
  //coords for scaling view
  const layoutWidth = 1300;
  const layoutHeight = 1000;

  //clear reset for next render
  container.select("svg").remove();

  //create quiz svg
  const quizLayoutSVG = container
    .append("svg")
    .attr("viewBox", `0,0,${layoutWidth}, ${layoutHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("width", "100%")
    .style("height", "auto");

  //create groups for each section
  const selectedGroup = quizLayoutSVG
    .append("g")
    .attr("id", "selected-section")
    .attr("transform", "translate(50, 600)");
  const imagesGroup = quizLayoutSVG
    .append("g")
    .attr("id", "images-section")
    .attr("transform", "translate(700, 50)");
  const optionsGroup = quizLayoutSVG
    .append("g")
    .attr("id", "options-section")
    .attr("transform", "translate(50, 50)");

  const currentData = quizData[currentQuestion];

  drawOptionsSection(optionsGroup, currentData);
  drawImagesSection(imagesGroup, currentData);

  function drawNavButtons(svg, width, height) {
    const navGroup = svg.append("g").attr("transform", `translate(1000, 400)`);

    const resultKeys = ["gen", "type", "starter"];
    const hasSelection = userResult[resultKeys[currentQuestion]] !== null;

    //prev
    if (currentQuestion > 0) {
      const prev = navGroup
        .append("g")
        .style("cursor", "pointer")
        .on("click", prevQuestion);

      prev
        .append("rect")
        .attr("width", 120)
        .attr("height", 40)
        .attr("rx", 6)
        .attr("fill", "#1f1f1f");

      prev
        .append("text")
        .attr("x", 60)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("← Previous");
    }

    // next
    if (hasSelection && currentQuestion < quizData.length - 1) {
      const next = navGroup
        .append("g")
        .attr("transform", "translate(140, 0)")
        .style("cursor", "pointer")
        .on("click", nextQuestion);

      next
        .append("rect")
        .attr("width", 120)
        .attr("height", 40)
        .attr("rx", 6)
        .attr("fill", "#461111");

      next
        .append("text")
        .attr("x", 60)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Next →");
    }

    //finish
    if (hasSelection && currentQuestion === quizData.length - 1) {
      const finish = navGroup
        .append("g")
        .attr("transform", "translate(140, 0)")
        .style("cursor", "pointer")
        .on("click", () => {
          displayResults(layoutContainer);
        });

      finish
        .append("rect")
        .attr("width", 120)
        .attr("height", 40)
        .attr("rx", 6)
        .attr("fill", "#2e7d32");

      finish
        .append("text")
        .attr("x", 60)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Finish");
    }
  }
  drawNavButtons(quizLayoutSVG, layoutWidth, layoutHeight);
}

const layoutContainer = d3.select("#quiz-layout");

displayQuiz(layoutContainer);
