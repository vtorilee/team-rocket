import { initSidebar } from "../../sidebar.js"; // Adjust path as needed
initSidebar();

// layout d3

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
    defaultImage: "../../assets/pokedex-device.png",
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
    defaultImage: "../../assets/all.starters.png",
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

const generations = [
  {
    number: 1,
    region: "Kanto",
    years: "1996-1999",
    main_games: "Pokémon Red, Green, & Blue",
  },
  {
    number: 2,
    region: "Johto",
    years: "1999-2001",
    main_games: "Pokémon Gold & Silver",
  },
  {
    number: 3,
    region: "Hoenn",
    years: "2002-2006",
    main_games: "Pokémon Ruby & Sapphire",
  },
  {
    number: 4,
    region: "Sinnoh",
    years: "2006-2010",
    main_games: "Pokémon Diamond & Pearl",
  },
  {
    number: 5,
    region: "Unova",
    years: "2010-2013",
    main_games: "Pokémon Black & White",
  },
  {
    number: 6,
    region: "Kalos",
    years: "2013-2016",
    main_games: "Pokémon Black & White",
  },
  {
    number: 7,
    region: "Alola",
    years: "2016-2019",
    main_games: "Pokémon Sun & Moon",
  },
  {
    number: 8,
    region: "Galar",
    years: "2019-2022",
    main_games: "Pokémon Sword & Shield",
  },
  {
    number: 9,
    region: "Paldea",
    years: "2022-Present",
    main_games: "Pokémon Scarlet & Violet",
  },
];

const genTrainers = {
  1: { names: "Red and Leaf", game: "Pokémon FireRed & LeafGreen" },
  2: { names: "Ethan and Lyra", game: "Pokémon HeartGold & SoulSilver" },
  3: { names: "Brendan and May", game: "Pokémon Omega Ruby Alpha Sapphire" },
  4: { names: "Lucas and Dawn", game: "Pokémon Diamond & Pearl" },
  5: { names: "Hilbert and Hilda", game: "Pokémon Black & White" },
  6: { names: "Calem and Serena", game: "Pokémon X & Y" },
  7: { names: "Elio and Selene", game: "Pokémon Sun & Moon" },
  8: { names: "Victor and Gloria", game: "Pokémon Sword & Shield" },
  9: { names: "Florian and Juliana", game: "Pokémon Scarlet & Violet" },
};

const romanMap = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

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

  if (userResult[currentKey] === choice) {
    userResult[currentKey] = null;
  } else if (userResult[currentKey] !== choice) {
    userResult[currentKey] = choice;
  } else {
    userResult[currentKey] = choice;
  }

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
    .text(`${data.number}.) ${data.question}`);

  //button layout constants
  const buttonsPerRow = 5;
  const buttonWidth = 115;
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
      .attr("class", "button-group")
      .attr("transform", `translate(${xPos}, ${60 + yPos})`)
      .style("cursor", "pointer")
      .on("click", (event) => {
        handleSelection(option);
      });

    if (selectedValue && selectedValue === option) {
      buttonGroup
        .append("rect")
        .attr("class", "option-button selected-button")
        .attr("width", buttonWidth)
        .attr("height", buttonHeight)
        .attr("fill", buttonFill);

      buttonGroup
        .append("text")
        .attr("class", "option-text selected-button-text")
        .attr("x", buttonWidth / 2)
        .attr("y", buttonHeight / 2)
        .text(option);
    } else if (selectedValue && selectedValue !== option) {
      buttonGroup
        .append("rect")
        .attr("class", "option-button unselected-button")
        .attr("width", buttonWidth)
        .attr("height", buttonHeight)
        .attr("fill", buttonFill);

      buttonGroup
        .append("text")
        .attr("class", "option-text unselected-button-text")
        .attr("x", buttonWidth / 2)
        .attr("y", buttonHeight / 2)
        .text(option);
    } else {
      buttonGroup
        .append("rect")
        .attr("class", "option-button")
        .attr("width", buttonWidth)
        .attr("height", buttonHeight)
        .attr("fill", buttonFill);

      buttonGroup
        .append("text")
        .attr("class", "option-text")
        .attr("x", buttonWidth / 2)
        .attr("y", buttonHeight / 2)
        .text(option);
    }
  });
}

function drawSelectedSection(group, data) {
  group.selectAll("*").remove();

  const resultKeys = ["gen", "type", "starter"];
  const currentKey = resultKeys[currentQuestion];
  const selectedValue = userResult[currentKey];

  let resultText = "Please select one.";
  let imagePath;

  // default
  if (!selectedValue) {
    imagePath = data.defaultImage;
  } else {
    //gen
    if (currentKey === "gen") {
      imagePath = `../../assets/trainers/${selectedValue}_trainers.png`;

      group
        .append("image")
        .attr("href", imagePath)
        .attr("height", 325)
        .attr("x", 235)
        .attr("y", 125)
        .attr("preserveAspectRatio", "xMidYMid meet");

      resultText = `Generation ${romanMap[selectedValue - 1]}`;
    }

    //type
    else if (currentKey === "type") {
      imagePath = `../../assets/types/${selectedValue.toLowerCase()}.png`;

      group
        .append("image")
        .attr("href", imagePath)
        .attr("height", 325)
        .attr("x", 200)
        .attr("y", 120)
        .attr("preserveAspectRatio", "xMidYMid meet");

      resultText = `I am a ${selectedValue} Type trainer.`;
    }

    //starter
    else if (currentKey === "starter") {
      imagePath = `../../assets/starters/${selectedValue}.png`;

      group
        .append("image")
        .attr("href", imagePath)
        .attr("width", 375)
        .attr("height", 325)
        .attr("x", 160)
        .attr("y", 130)
        .attr("preserveAspectRatio", "xMidYMid meet");

      resultText = `${selectedValue}, I choose you!`;
    }
  }

  const resultBox = group.append("g");

  resultBox
    .append("rect")
    .attr("class", "result-box")
    .attr("x", 160)
    .attr("y", 50)
    .attr("width", 400)
    .attr("height", 65);

  resultBox
    .append("text")
    .attr("class", "result-text")
    .attr("x", 360)
    .attr("y", 82.5)
    .text(resultText);
}

function displayResults(container) {
  const layoutWidth = 1300;
  const layoutHeight = 900;

  container.select("svg").remove();

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${layoutWidth} ${layoutHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("width", "100%")
    .style("height", "auto");

  const genNumber = userResult.gen;

  function drawResults(svg, x, y, width, height) {
    const trainerCard = svg
      .append("g")
      .attr("transform", `translate(${x}, ${y})`);
    const choicesCard = svg
      .append("g")
      .attr("transform", `translate(${x + 435}, ${y})`);

    function drawTrainerCard(group) {
      group
        .append("rect")
        .attr("class", "result-card")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 400)
        .attr("height", 450);

      const nameBox = group
        .append("g")
        .attr("transform", `translate(17.5, 15)`);

      nameBox
        .append("rect")
        .attr("class", "bg-rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 365)
        .attr("height", 90)
        .attr("rx", 5)
        .style("stroke", "#000")
        .style("stroke-width", "4px");

      nameBox
        .append("rect")
        .attr("x", 7.5)
        .attr("y", 7)
        .attr("width", 350)
        .attr("height", 76)
        .style("fill", "transparent")
        .style("stroke", "#000")
        .style("stroke-width", "2.5px");

      nameBox
        .append("text")
        .attr("class", "result-h1")
        .attr("x", 182.5)
        .attr("y", 35)
        .text(`${genTrainers[userResult.gen].names}`);

      nameBox
        .append("text")
        .attr("class", "result-caption")
        .attr("x", 182.5)
        .attr("y", 65)
        .text(`${genTrainers[userResult.gen].game}`);

      const imageBox = group
        .append("g")
        .attr("transform", `translate(17.5, 115)`);

      imageBox
        .append("rect")
        .attr("class", "bg-rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 365)
        .attr("height", 205)
        .attr("rx", "5")
        .style("stroke", "#000")
        .style("stroke-width", "4px");

      imageBox
        .append("rect")
        .attr("x", 7.5)
        .attr("y", 7)
        .attr("width", 350)
        .attr("height", 191)
        .style("fill", "transparent")
        .style("stroke", "#000")
        .style("stroke-width", "2.5px");

      const imgPath = `../../assets/trainers/${userResult.gen}_trainers.png`;

      imageBox
        .append("foreignObject")
        .attr("x", 9)
        .attr("y", 7)
        .attr("width", 352.5)
        .attr("height", 190.5)
        .append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow", "hidden").html(`
          <img 
            src= "${imgPath}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: top center;"
          />
        `);

      const dialogueBox = group
        .append("g")
        .attr("transform", `translate(15, 325)`);

      dialogueBox
        .append("rect")
        .attr("class", "bg-rect")
        .attr("x", 7)
        .attr("y", 5)
        .attr("width", 356)
        .attr("height", 105);

      dialogueBox
        .append("image")
        .attr("href", "../../assets/dialoguebox.png")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 370);

      dialogueBox
        .append("foreignObject")
        .attr("x", 22)
        .attr("y", 25)
        .attr("width", 326)
        .attr("height", 80)
        .append("xhtml:div")
        .attr("class", "result-h2")
        .style("font-size", "23px").html(`
          "Thanks Trainer, let's explore together!"
        `);
    }
    drawTrainerCard(trainerCard);

    function drawChoicesCard(group) {
      function drawButton(parent, x, y, width, height, label, link) {
        const button = parent
          .append("g")
          .attr("class", "result-button")
          .attr("transform", `translate(${x}, ${y})`)
          .style("cursor", "pointer")
          .on("click", () => {
            window.location.href = link;
          });

        button.append("rect").attr("width", width).attr("height", height);

        const textX = width / 2;

        button
          .append("text")
          .attr("class", "result-button-text")
          .attr("x", textX)
          .attr("y", 23)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "14px")
          .text(label);
      }

      group
        .append("rect")
        .attr("class", "result-card")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 500)
        .attr("height", 450);

      group
        //title text
        .append("text")
        .attr("class", "result-h1")
        .attr("x", 143)
        .attr("y", 27)
        .text("Trainer Profile");

      //gen results
      const genGroup = group.append("g").attr("transform", `translate(0, 52)`);
      const roman = romanMap[userResult.gen - 1] || userResult.gen;

      genGroup
        .append("rect")
        .attr("class", "bg-rect")
        .attr("x", 22.5)
        .attr("y", 89)
        .attr("width", 455)
        .attr("height", 65)
        .attr("rx", 5)
        .style("stroke", "#000")
        .style("stroke-width", "2px");

      genGroup
        .append("rect")
        .attr("class", "bg-rect")
        .attr("x", 22)
        .attr("y", -5)
        .attr("width", 456)
        .attr("height", 100)
        .attr("rx", 5)
        .style("stroke", "#000")
        .style("stroke-width", "2px");

      genGroup
        .append("text")
        .attr("class", "result-h2")
        .attr("x", 125)
        .attr("y", 55)
        .style("font-size", "32px")
        .style("text-decoration", "underline")
        .text(`Gen ${roman}`);

      switch (Number(userResult.gen)) {
        case 1:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen1/red.png")
            .attr("x", 225)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen1/green-jp.png")
            .attr("x", 309)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen1/blue.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          break;

        case 2:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen2/gold.png")
            .attr("x", 304)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen2/silver.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          break;

        case 3:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen3/ruby.png")
            .attr("x", 304)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen3/sapphire.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          break;

        case 4:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen4/diamond.png")
            .attr("x", 304)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen4/pearl.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          break;

        case 5:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen5/black.png")
            .attr("x", 304)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen5/white.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          break;

        case 6:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen6/x.png")
            .attr("x", 304)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen6/y.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          break;

        case 7:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen7/sun.png")
            .attr("x", 304)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen7/moon.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("width", 75)
            .attr("height", 75);

          break;

        case 8:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen8/sword.png")
            .attr("x", 314)
            .attr("y", 10)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen8/shield.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("height", 75);

          break;

        case 9:
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen9/scarlet.png")
            .attr("x", 314)
            .attr("y", 10)
            .attr("height", 75);
          genGroup
            .append("image")
            .attr("href", "../../assets/games/gen9/violet.png")
            .attr("x", 387)
            .attr("y", 10)
            .attr("height", 75);
          break;

        default:
          break;
      }

      genGroup
        .append("foreignObject")
        .attr("x", 29.5)
        .attr("y", 100)
        .attr("width", 450)
        .attr("height", 75)
        .append("xhtml:div")
        .attr("class", "result-body").html(`
            Each generation introduced a new region with many new Pokémon to catch and collect during your adventures through the main series games.
            <br>
            <span style="text-decoration: underline"}> Gen ${roman} took players to the ${generations[userResult.gen - 1].region} Region in ${generations[userResult.gen - 1].main_games}!</span>
          `);

      drawButton(
        genGroup,
        22,
        160,
        456,
        35,
        "Explore the whole Pokémon world through the years!",
        "../map/map.html",
      );

      //type results
      const typeGroup = choicesCard
        .append("g")
        .attr("transform", `translate(22, 260.5)`);

      typeGroup
        .append("rect")
        .attr("class", "bg-rect")
        .attr("y", 0)
        .attr("width", 223)
        .attr("height", 135)
        .attr("rx", 5)
        .style("stroke", "#000")
        .style("stroke-width", "2px");

      typeGroup
        .append("text")
        .attr("class", "result-h2")
        .attr("x", 111.5)
        .attr("y", 25)
        .style("font-size", "18px")
        .style("text-decoration", "underline")
        .text(`${userResult.type} Type`);

      typeGroup
        .append("image")
        .attr("href", `../../assets/types/${userResult.type.toLowerCase()}.png`)
        .attr("x", 60)
        .attr("y", 25)
        .attr("width", 100)
        .attr("height", 100);

      drawButton(
        typeGroup,
        0,
        140,
        223,
        35,
        "Explore Type Combos!",
        "../visualizations.html#types",
      );

      //starter results
      const starterGroup = group
        .append("g")
        .attr("transform", `translate(256, 260.5)`);

      starterGroup
        .append("rect")
        .attr("class", "bg-rect")
        .attr("width", 223)
        .attr("height", 135)
        .attr("rx", 5)
        .style("stroke", "#000")
        .style("stroke-width", "2px");

      starterGroup
        .append("text")
        .attr("class", "result-h2")
        .attr("x", 111.5)
        .attr("y", 25)
        .style("font-size", "18px")
        .style("text-decoration", "underline")
        .text(`Starter: ${userResult.starter}`);

      starterGroup
        .append("image")
        .attr("href", `../../assets/starters/${userResult.starter}.png`)
        .attr("x", 55)
        .attr("y", 30)
        .attr("width", 100)
        .attr("height", 100);

      drawButton(
        starterGroup,
        0,
        140,
        223,
        35,
        "Check Popularity!",
        "../visualizations.html#starters",
      );
    }
    drawChoicesCard(choicesCard);

    // restart button
    const restart = svg
      .append("g")
      .attr("class", "result-button")
      .style("cursor", "pointer")
      .on("click", () => {
        userResult = { gen: null, type: null, starter: null };
        currentQuestion = 0;
        displayQuiz(layoutContainer);
      });

    restart
      .append("rect")
      .attr("x", 75)
      .attr("y", 40)
      .attr("width", 100)
      .attr("height", 45)
      .style("rx", 6)
      .style("fill", "#1f1f1f")
      .style("stroke", "#ffffffab")
      .style("stroke-width", "2.5px");

    restart
      .append("text")
      .attr("class", "result-button-text")
      .attr("x", 125)
      .attr("y", 68)
      .text("Restart");
  }

  drawResults(svg, 200, 40, layoutWidth - 100, layoutHeight - 100);
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
    .attr("id", "images-section")
    .attr("transform", "translate(700, 0)");
  const optionsGroup = quizLayoutSVG
    .append("g")
    .attr("id", "options-section")
    .attr("transform", "translate(50, 50)");

  const currentData = quizData[currentQuestion];

  drawOptionsSection(optionsGroup, currentData);
  drawSelectedSection(selectedGroup, currentData);

  function drawNavButtons(svg, width, height) {
    const navGroup = svg.append("g").attr("transform", `translate(945, 460)`);

    const resultKeys = ["gen", "type", "starter"];
    const hasSelection = userResult[resultKeys[currentQuestion]] !== null;

    //prev
    if (currentQuestion > 0) {
      const prev = navGroup
        .append("g")
        .attr("class", "result-button")
        .style("cursor", "pointer")
        .on("click", prevQuestion);

      prev
        .append("rect")
        .attr("width", 120)
        .attr("height", 40)
        .attr("rx", 6)
        .style("fill", "#1f1f1f")
        .style("stroke", "#ffffffab")
        .style("stroke-width", "2.5px");

      prev
        .append("text")
        .attr("class", "result-button-text")
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
        .attr("class", "result-button")
        .attr("transform", "translate(140, 0)")
        .style("cursor", "pointer")
        .on("click", nextQuestion);

      next
        .append("rect")
        .attr("width", 120)
        .attr("height", 40)
        .attr("rx", 6)
        .style("fill", "#1f1f1f")
        .style("stroke", "#ffffffab")
        .style("stroke-width", "2.5px");

      next
        .append("text")
        .attr("class", "result-button-text")
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
        .attr("class", "result-button")
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
        .attr("fill", "#1b4a1e")
        .style("stroke", "#ffffffab")
        .style("stroke-width", "2.5px");

      finish
        .append("text")
        .attr("class", "result-button-text")
        .attr("x", 60)
        .attr("y", 25)
        .text("Finish");
    }
  }
  drawNavButtons(quizLayoutSVG, layoutWidth, layoutHeight);
}

const layoutContainer = d3.select("#quiz-layout");

displayQuiz(layoutContainer);
