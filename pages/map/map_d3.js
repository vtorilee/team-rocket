import { initSidebar } from "../../sidebar.js";
initSidebar();

const attrBox = document.getElementById("attribution-box");
const attrButton = document.getElementById("attr-icon");

attrButton.addEventListener("click", (e) => {
  // Prevent the click from triggering map zoom/pan if necessary
  e.stopPropagation();
  attrBox.classList.toggle("attr-collapsed");
});

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//for tracking generations
let selectedGen = null;
const generations = [
  {
    region: "Kanto",
    number: 1,
    years: "1996-1999",
    starters: "Charmander, Bulbasaur, Squirtle",
    color_1: "#d12828",
    color_2: "#1676d6",
    mascot: { name: "Gengar", dexNum: "0094", votes: 270 },
    count: 151,
  },
  {
    region: "Johto",
    number: 2,
    years: "1999-2001",
    starters: "Cyndaquil, Totodile, Chikorita",
    color_1: "#d4a642",
    color_2: "#c5cdd5",
    mascot: { name: "Umbreon", dexNum: "0197", votes: 190 },
    count: 100,
  },
  {
    region: "Hoenn",
    number: 3,
    years: "2002-2006",
    starters: "Treecko, Torchic, Mudkip",
    color_1: "#b02036",
    color_2: "#3559a8",
    mascot: { name: "Mudkip", dexNum: "0258", votes: 236 },
    count: 135,
  },
  {
    region: "Sinnoh",
    number: 4,
    years: "2006-2010",
    starters: "Piplup, Turtwig, Chimchar",
    color_1: "#2c355b",
    color_2: "#eccfcf",
    mascot: { name: "Lucario", dexNum: "0448", votes: 202 },
    count: 107,
  },
  {
    region: "Unova",
    number: 5,
    years: "2010-2013",
    starters: "Snivy, Oshawott, Tepig",
    color_1: "#202020",
    color_2: "#ebebeb",
    mascot: { name: "Oshawott", dexNum: "0501", votes: 181 },
    count: 156,
  },
  {
    region: "Kalos",
    number: 6,
    years: "2013-2016",
    starters: "Chespin, Fennekin, Froakie",
    color_1: "#094976",
    color_2: "#b11d38",
    mascot: { name: "Sylveon", dexNum: "0700", votes: 296 },
    count: 72,
  },
  {
    region: "Alola",
    number: 7,
    years: "2016-2019",
    starters: "Litten, Rowlet, Popplio",
    color_1: "#e69034",
    color_2: "#32297a",
    mascot: { name: "Mimikyu", dexNum: "0778", votes: 434 },
    count: 88,
  },
  {
    region: "Galar",
    number: 8,
    years: "2019-2022",
    starters: "Scorbunny, Sobble, Grookey",
    color_1: "#0d63aa",
    color_2: "#e42971",
    mascot: { name: "Dragapult", dexNum: "0887", votes: 110 },
    count: 96,
  },
  {
    region: "Paldea",
    number: 9,
    years: "2022-Present",
    starters: "Sprigatito, Fuecoco, Quaxly",
    color_1: "#ad1a0f",
    color_2: "#9a16ba",
    mascot: { name: "Tinkaton", dexNum: "0959", votes: 120 },
    count: 120,
  },
];
let genMarks;

//variables for handling zoom with selected regions
let zoom;
let svgElement;

//handle region highlight when viewer hovers over
function hoverRegion(element, sections) {
  sections
    .on("mouseenter", function (event) {
      if (selectedGen !== null) return;

      //animating is asynchronous, interrupt any ongoing transition code so nothing gets stuck
      d3.selectAll(".hover-group").interrupt().remove();

      const hovered = d3.select(this);
      const regionID = hovered.attr("id");

      hovered.interrupt().classed("highlighted", true);

      //hide location icon
      d3.select(`#icon-${regionID}`).style("opacity", 0);

      //get selected region area
      const bounds = this.getBBox();
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;

      ////region-name pop-up fade
      const hoverArea = element
        .append("g")
        .attr("class", "hover-group")
        .style("opacity", 0)
        .style("pointer-events", "none");

      hoverArea
        .append("text")
        .attr("class", "hover-label")
        .attr("x", centerX)
        .attr("y", centerY)
        .text(regionID);

      hoverArea.transition().duration(300).style("opacity", 1);
    })
    .on("mouseleave", function () {
      const hovered = d3.select(this);
      const regionID = hovered.attr("id");

      hovered.classed("highlighted", false);

      //check if currently in zoom mode via reset button
      const isZoomed = d3.select("#reset-button").style("display") === "block";

      if (!isZoomed) {
        d3.select(`#icon-${regionID}`).style("opacity", 1);
      }

      d3.selectAll(".hover-group")
        .transition()
        .duration(200)
        .style("opacity", 0)
        .remove();
    });
}

//zoom action to a specific region
function zoomToRegion(regionID) {
  const regionPath = d3.select(`path#${regionID}`);
  if (regionPath.empty()) return;

  //hide location icons
  d3.selectAll(".location-icon").transition().duration(400).style("opacity", 0);

  //upon click, set selected svg region path as bounding box
  const bounds = regionPath.node().getBBox();
  const container = d3.select("#map-container").node();

  const width = container.clientWidth;
  const height = container.clientHeight;

  //calculate values to zoom in on center of region and offset selected region to the right

  const scale =
    Math.min(3.5, (width * 0.45) / bounds.width, height / bounds.height) * 0.8;

  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  const targetX = width * 0.6;
  const targetY = height / 2;

  //zoom in map
  svgElement
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(targetX, targetY)
        .scale(scale)
        .translate(-centerX, -centerY),
    );

  //display reset button
  d3.select("#reset-button").style("display", "block");
}

//function for handling map zooming
function handleZoom(element, sections) {
  //zooming and panning using d3: https://d3js.org/d3-zoom
  svgElement = element;

  zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      element.select("g").attr("transform", event.transform);
    });
  element.call(zoom);

  //zoom event listener
  sections.on("click", function (event, d) {
    //fetch the correct gen object based on the one clicked
    const regionID = d3.select(this).attr("id");
    const selected = generations.find((g) => g.region === regionID);

    //assign selected gen globally and update the UI with it
    if (selected) {
      d3.selectAll(".hover-group").interrupt().remove();

      selectedGen = selected;
      updateUI(selected);
      displayDataBox();
    }
  });

  d3.select("#reset-button").on("click", function () {
    element.transition().duration(750).call(zoom.transform, d3.zoomIdentity);

    svgElement.classed("focus-mode", false);
    sections.classed("selected-path", false);

    selectedGen = null;
    updateUI();
  });
}

//function to draw the circles based on different states:
//https://d3js.org/d3-selection/events
function renderMarks() {
  if (!genMarks) return;

  genMarks.html("");
  genMarks.each(function (d) {
    const g = d3.select(this);

    const genYears = g
      .append("text")
      .attr("class", "hover-years-text")
      .attr("y", 48)
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .style("font-family", `"Galindo", sans-serif`)
      .style("font-size", "12px")
      .style("fill", "white")
      .style(
        "text-shadow",
        "0px 0px 8px rgba(0, 0, 0, 1),0px 0px 4px rgba(0, 0, 0, 1)",
      )
      .style("pointer-events", "none")
      .style("transition", "opacity 0.2s ease")
      .text(d.years);

    if (selectedGen === d) {
      // https://stackoverflow.com/questions/20086884/add-image-inside-a-circle-d3
      g.append("image")
        .attr("xlink:href", "../../assets/pokeball-pixel.png")
        .attr("class", "pb-icon");
    } else if (selectedGen !== null) {
      g.append("circle").attr("r", 25).attr("class", "bg-circle unselected");
      g.append("text")
        .attr("class", "mark-text")
        .text(d.number)
        .style("opacity", 0.5);
    } else {
      g.append("circle").attr("r", 25).attr("class", "bg-circle");
      g.append("text").attr("class", "mark-text").text(d.number);
    }

    g.on("mouseenter", () => {
      genYears.style("opacity", 1);
    }).on("mouseleave", () => {
      genYears.style("opacity", 0);
    });
  });
}

//drawing function for custom timeline
function drawTimeline() {
  //select container, define dimensions of timeline
  const timelineContainer = d3.select("#timeline-container");
  const width = 1500;
  const height = 120;

  timelineContainer.html("");

  //add svg into container, define svg dimensions
  const timelineSVG = timelineContainer
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`) // This is the magic line
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%");

  //define mapping for the marks positions, domain and range for start-end of line
  //https://d3js.org/d3-scale/linear
  const x = d3
    .scaleLinear()
    .domain([1, 9])
    .range([80, width - 80]);

  //draw the Line
  timelineSVG
    .append("line")
    .attr("x1", x(1))
    .attr("y1", height / 2)
    .attr("x2", x(9))
    .attr("y2", height / 2)
    .attr("stroke", "#000000ae")
    .attr("stroke-width", 9);

  //create the container groups for each mark's components
  genMarks = timelineSVG
    .selectAll(".gen-mark")
    .data(generations)
    .enter()
    .append("g")
    .attr("class", "gen-mark")
    .attr("transform", (d) => `translate(${x(d.number)}, ${height / 2})`)
    .on("click", function (event, d) {
      //revert to default view if currently in focus state,
      //otherwise display zoomed into newly selected gen region
      selectedGen = selectedGen === d ? null : d;
      updateUI(selectedGen);
    });

  //remove selection and revert UI
  d3.select("#reset-button").on("click", function () {
    selectedGen = null;
    updateUI(null);
  });

  renderMarks();
}

function renderGameCover(container, x, y, height, globalSrc, jpSrc = null) {
  let isJP = false;

  const group = container
    .append("g")
    .attr("transform", `translate(${x}, ${y})`)
    .style("cursor", "pointer")
    .style("pointer-events", "all");

  //add images and toggle label
  //for alignment: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio
  const img = group
    .append("image")
    .attr("href", globalSrc)
    .attr("height", height)
    .attr("width", height)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("transition", "opacity 0.2s ease");

  const toggle = group
    .append("text")
    .attr("class", "toggle-text")
    .attr("x", height / 2)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .style("opacity", 0)
    .text("Toggle Cover");

  //handle hover display states
  group
    .on("mouseenter", () => {
      if (jpSrc === null) return;
      img.style("opacity", 0.4);
      toggle.style("opacity", 1);
    })
    .on("mouseleave", () => {
      img.style("opacity", 1);
      toggle.style("opacity", 0);
    });

  group.on(
    "click",
    (event) => {
      //if no JP cover available
      if (jpSrc === null) return;

      const jpX = height / 8.5;
      //change display image state and update img src accordingly
      isJP = !isJP;
      img.attr("href", isJP ? jpSrc : globalSrc);
      img.style("opacity", 0.4);
    },
    100,
  );
}

function renderFactBox(
  container,
  x,
  y,
  width,
  height,
  funFact,
  factDetails,
  imgSrc = null,
) {
  let isRevealed = false;

  const group = container
    .append("g")
    .attr("transform", `translate(${x}, ${y})`)
    .style("cursor", "pointer")
    .style("pointer-events", "all")
    .style("transition", "opacity 0.2s ease");

  const textGroup = group
    .append("g")
    .attr("transform", `translate(-10,-20)`)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("transition", "opacity 0.2s ease");

  textGroup
    .append("foreignObject")
    .attr("class", "data-section-detail")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", "60px")
    .style("font-size", "19px")
    .style("font-weight", "bold")
    .style("text-align", "center")
    .style("text-anchor", "center")
    .append("xhtml:div")
    .html(funFact);

  textGroup
    .append("foreignObject")
    .attr("class", "data-section-detail")
    .attr("x", 20)
    .attr("y", 65)
    .attr("width", imgSrc ? width * 0.66 : width)
    .attr("height", height)
    .style("font-size", "18px")
    .style("text-align", "left")
    .append("xhtml:div")
    .html(factDetails);

  textGroup
    .append("image")
    .attr("href", imgSrc)
    .attr("x", width * 0.66)
    .attr("y", 65)
    .attr("width", width * 0.33);

  const boxGroup = group
    .append("g")
    .style("opacity", 1)
    .style("transition", "opacity 0.4s ease");

  const revealBox = boxGroup
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 10)
    .style("fill", "transparent")
    .style("transition", "fill 0.2s ease");

  const revealText = boxGroup
    .append("text")
    .attr("class", "toggle-text")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .text("Click for a fun fact!");

  //handle hover display states
  group
    .on("mouseenter", () => {
      if (!isRevealed) {
        revealText.style("fill", "#ffc011");
      } else {
        textGroup.style("opacity", 0.6);
      }
    })
    .on("mouseleave", () => {
      if (!isRevealed) {
        revealText.style("fill", "#ffffff");
      } else {
        textGroup.style("opacity", 1);
      }
    });

  //toggle opacities of both groups to determine which is visible
  group.on("click", (event) => {
    isRevealed = !isRevealed;

    boxGroup
      .style("opacity", isRevealed ? 0 : 1)
      .style("pointer-events", isRevealed ? "none" : "all");

    textGroup
      .style("opacity", isRevealed ? 1 : 0)
      .style("pointer-events", isRevealed ? "all" : "none");
  });
}

function renderSpoilerBox(container, x, y, width, height) {
  let isRevealed = false;

  const group = container
    .append("g")
    .attr("transform", `translate(${x}, ${y})`)
    .style("cursor", "pointer")
    .style("pointer-events", "all")
    .style("transition", "opacity 0.2s ease");

  const textGroup = group
    .append("g")
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("transition", "opacity 0.2s ease");

  textGroup
    .append("text")
    .attr("class", "data-section-h1")
    .attr("y", 35)
    .text("Generation 10: Coming in 2027");

  textGroup
    .append("text")
    .attr("class", "data-section-h2")
    .attr("y", 190)
    .style("text-decoration-line", "underline")
    .text("Pokémon Winds & Pokémon Waves");

  textGroup
    .append("foreignObject")
    .attr("class", "data-section-detail")
    .attr("x", 0)
    .attr("y", 210)
    .attr("width", width)
    .attr("height", "80px")
    .style("font-size", "20px")
    .style("text-anchor", "center")
    .append("xhtml:div").html(`
     > Revealed in the February 27, 2026 <span style="font-style: italic">Pokémon Presents</span> 
     <br>
     for Nintendo Switch 2 
     <br>
     >
     `);

  const link = group
    .append("foreignObject")
    .attr("x", 20)
    .attr("y", 270)
    .attr("width", width)
    .attr("height", 40)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("transition", "opacity 0.2s ease");

  link
    .append("xhtml:div")
    .html(
      `<a href="https://windswaves.pokemon.com/en-ca/" target="_blank" class="data-section-hyperlink" style="font-size: 20px">(EN) Official Winds & Waves Website</a>
     `,
    )
    .on("click", (event) => event.stopPropagation());

  const imageGroup = group
    .append("g")
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("transition", "opacity 0.2s ease");

  imageGroup
    .append("image")
    .attr("href", "../../assets/games/gen9/winds.png")
    .attr("x", -90)
    .attr("y", 55)
    .attr("width", width * 0.5)
    .attr("height", height * 0.35);

  imageGroup
    .append("image")
    .attr("href", "../../assets/games/gen9/winds-jp.png")
    .attr("x", 70)
    .attr("y", 55)
    .attr("width", width * 0.5)
    .attr("height", height * 0.3);

  imageGroup
    .append("image")
    .attr("href", "../../assets/games/gen9/waves.png")
    .attr("x", 260)
    .attr("y", 55)
    .attr("width", width * 0.5)
    .attr("height", height * 0.33);

  imageGroup
    .append("image")
    .attr("href", "../../assets/games/gen9/waves-jp.png")
    .attr("x", 430)
    .attr("y", 55)
    .attr("width", width * 0.5)
    .attr("height", height * 0.3);

  const boxGroup = group
    .append("g")
    .style("opacity", 1)
    .style("transition", "opacity 0.4s ease");

  const revealBox = boxGroup
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 20)
    .style("fill", "transparent")
    .style("transition", "fill 0.4s ease");

  const spoilerText = boxGroup
    .append("text")
    .attr("x", width / 2)
    .attr("y", height * 0.37)
    .style("font-size", "24px")
    .style("font-family", `"Galindo", sans-serif`)
    .style("text-anchor", "middle")
    .style("fill", "#171717")
    .style("transition", "all 0.4s ease")
    .text("Spoilers Ahead!");

  const revealText = boxGroup
    .append("text")
    .attr("class", "toggle-text")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .style("font-size", "32px")
    .style("transition", "all 0.4s ease")
    .text("Reveal Upcoming");

  //handle hover display states
  group
    .on("mouseenter", () => {
      if (!isRevealed) {
        spoilerText.style(
          "text-shadow",
          `0px 0px 12px rgb(248, 180, 78),
           0px 0px 12px rgb(224, 149, 28)`,
        );
        spoilerText.style("fill", "#b10a0a");
        revealText.style("fill", "#ffc011");
        revealText.style("text-decoration-line", "underline");
        revealBox.style("fill", "#dbcdcd");
      } else {
        textGroup.style("opacity", 0.6);
        imageGroup.style("opacity", 0.6);
      }
    })
    .on("mouseleave", () => {
      if (!isRevealed) {
        spoilerText.style("text-shadow", "none");
        spoilerText.style("fill", "#171717");
        revealText.style("fill", "#ffffff");
        revealText.style("text-decoration-line", "none");
        revealBox.style("fill", "transparent");
      } else {
        textGroup.style("opacity", 1);
        imageGroup.style("opacity", 1);
        link.style("opacity", 1);
      }
    });

  //toggle opacities of both groups to determine which is visible
  group.on("click", (event) => {
    isRevealed = !isRevealed;

    boxGroup
      .style("opacity", isRevealed ? 0 : 1)
      .style("pointer-events", isRevealed ? "none" : "all");

    textGroup
      .style("opacity", isRevealed ? 1 : 0)
      .style("pointer-events", isRevealed ? "all" : "none");

    imageGroup
      .style("opacity", isRevealed ? 1 : 0)
      .style("pointer-events", isRevealed ? "all" : "none");

    link
      .style("opacity", isRevealed ? 1 : 0)
      .style("pointer-events", isRevealed ? "all" : "none");
  });
}

function gameInfo(gen, container, dim) {
  const gamesGroup = container.append("g").attr("class", "games-layout");
  const imgSize = dim * 0.18;
  const imgSizeSmall = dim * 0.15;
  const imgSizeTall = dim * 0.21;

  switch (Number(gen)) {
    case 1:
      const redGreenHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const redGreenContent = gamesGroup.append("g");

      handleCollapse(redGreenHeader, redGreenContent, "Pokémon Red & Green", {
        centerX: dim * 0.25,
        centerY: dim * 0.15,
      });

      renderGameCover(
        redGreenContent,
        0,
        30,
        imgSize,
        "../../assets/games/gen1/red.png",
        "../../assets/games/gen1/red-jp.png",
      );

      renderGameCover(
        redGreenContent,
        imgSize,
        30,
        imgSize,
        "../../assets/games/gen1/green-jp.png",
      );

      redGreenContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">27/02/96</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy</span> 
        <br>
        > Sales (Units): <span class="data-section-body">31.38 mil</span> 
    `);

      const blueHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.33)
        .style("text-decoration-line", "underline");

      const blueContent = gamesGroup.append("g");

      handleCollapse(blueHeader, blueContent, "Pokémon Blue", {
        centerX: dim * 0.1,
        centerY: dim * 0.48,
      });

      renderGameCover(
        blueContent,
        0,
        dim * 0.33 + 20,
        imgSize,
        "../../assets/games/gen1/blue.png",
        "../../assets/games/gen1/blue-jp.png",
      );

      blueContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.54)
        .attr("width", dim * 0.3)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">15/10/96</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy</span> 
        <br>
        > Sales (Units): <span class="data-section-body">31.38 mil (with Red/Green)</span> 
        <br>
        
    `);

      const yellowHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", dim * 0.33)
        .attr("y", dim * 0.33)
        .style("text-decoration-line", "underline");

      const yellowContent = gamesGroup.append("g");

      handleCollapse(yellowHeader, yellowContent, "Pokémon Yellow", {
        centerX: dim * 0.43,
        centerY: dim * 0.48,
      });

      renderGameCover(
        yellowContent,
        dim * 0.33,
        dim * 0.33 + 20,
        imgSize,
        "../../assets/games/gen1/yellow.png",
        "../../assets/games/gen1/yellow-jp.png",
      );

      yellowContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", dim * 0.33)
        .attr("y", dim * 0.54)
        .attr("width", dim * 0.3)
        .attr("height", dim * 0.1)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">12/09/98</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy</span> 
        <br>
        > Sales (Units): <span class="data-section-body">14.64 mil</span> 
        <br>
        
    `);

      //fun fact box
      const factGroup = redGreenContent
        .append("g")
        .attr("transform", `translate(${imgSize * 2}, 40)`);

      renderFactBox(
        factGroup,
        10,
        -10,
        dim * 0.23,
        dim * 0.13,
        "Pokémon Green was a Japan-only release!",
        `> These two games were remade into Pokémon Red and Blue for global releases.
        <br>
        > JP audiences also got Pokémon Blue (see below) as a remake.`,
      );

      return;

    case 2:
      const goldSilverHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const goldSilverContent = gamesGroup.append("g");

      handleCollapse(
        goldSilverHeader,
        goldSilverContent,
        "Pokémon Gold & Silver",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.15,
        },
      );

      renderGameCover(
        goldSilverContent,
        0,
        30,
        imgSize,
        "../../assets/games/gen2/gold.png",
        "../../assets/games/gen2/gold-jp.png",
      );

      renderGameCover(
        goldSilverContent,
        imgSize + 20,
        30,
        imgSize,
        "../../assets/games/gen2/silver.png",
        "../../assets/games/gen2/silver-jp.png",
      );

      goldSilverContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">21/11/99</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy Color</span> 
        <br>
        > Sales (Units): <span class="data-section-body">23.7 mil</span> 
        
    `);

      const crystalHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.355)
        .style("text-decoration-line", "underline");

      const crystalContent = gamesGroup.append("g");

      handleCollapse(crystalHeader, crystalContent, "Pokémon Crystal", {
        centerX: dim * 0.25,
        centerY: dim * 0.5,
      });

      renderGameCover(
        crystalContent,
        0,
        dim * 0.355 + 20,
        imgSize,
        "../../assets/games/gen2/crystal.png",
        "../../assets/games/gen2/crystal-jp.png",
      );

      crystalContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.565)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.1)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">14/12/00</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy</span> 
        <br>
        > Sales (Units): <span class="data-section-body">6.3 mil</span> 
        
      `);

      const factGroup2 = crystalContent
        .append("g")
        .attr("transform", `translate(${imgSize * 1.35},${dim * 0.35})`);

      renderFactBox(
        factGroup2,
        0,
        0,
        dim * 0.365,
        dim * 0.2,
        "Pokémon Crystal was the first game to let you play as a girl!",
        `> Players could only venture as one of the male protagonists, Red (Gen 1) or Ethan (Gold/Silver), prior
        <br>
        <br>
        > Crystal gave an option to play as Kris, the first female protagonist of the series! `,
        "../../assets/games/gen2/kris.png",
      );

      return;

    case 3:
      const rubySapphireHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const rubySapphireContent = gamesGroup.append("g");

      handleCollapse(
        rubySapphireHeader,
        rubySapphireContent,
        "Pokémon Ruby & Sapphire",
        {
          centerX: dim * 0.15,
          centerY: dim * 0.15,
        },
      );

      renderGameCover(
        rubySapphireContent,
        0,
        30,
        imgSize,
        "../../assets/games/gen3/ruby.png",
        "../../assets/games/gen3/ruby-jp.png",
      );

      renderGameCover(
        rubySapphireContent,
        imgSize + 20,
        30,
        imgSize,
        "../../assets/games/gen3/sapphire.png",
        "../../assets/games/gen3/sapphire-jp.png",
      );

      rubySapphireContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">21/11/02</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy Advance</span> 
        <br>
        > Sales (Units): <span class="data-section-body">16.22 mil</span> 
        <br>
        
    `);

      const emeraldHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", imgSize * 2.2) // Maintain your right-side alignment
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const emeraldContent = gamesGroup.append("g");

      handleCollapse(emeraldHeader, emeraldContent, "Pokémon Emerald", {
        centerX: imgSize * 2.8,
        centerY: dim * 0.15,
      });

      renderGameCover(
        emeraldContent,
        imgSize * 2.2,
        30,
        imgSize,
        "../../assets/games/gen3/emerald.png",
        "../../assets/games/gen3/emerald-jp.png",
      );

      emeraldContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", imgSize * 2.2)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.25)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">16/09/04</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy Advance</span> 
        <br>
        > Sales (Units): <span class="data-section-body">7.06 mil</span> 
        <br>
        
      `);

      const fireRedLeafGreenHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline");

      const fireRedLeafGreenContent = gamesGroup.append("g");

      handleCollapse(
        fireRedLeafGreenHeader,
        fireRedLeafGreenContent,
        "Pokémon FireRed & LeafGreen",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.52,
        },
      );

      renderGameCover(
        fireRedLeafGreenContent,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen3/firered.png",
        "../../assets/games/gen3/firered-jp.png",
      );

      renderGameCover(
        fireRedLeafGreenContent,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen3/leafgreen.png",
        "../../assets/games/gen3/leafgreen-jp.png",
      );

      fireRedLeafGreenContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">29/01/04</span> 
        <br>
        > Platform: <span class="data-section-body">Game Boy Advance</span> 
        <br>
        > Sales (Units): <span class="data-section-body">12 mil</span> 
        
    `);

      fireRedLeafGreenContent
        .append("foreignObject")
        .attr("class", "data-section-body")
        .attr("x", imgSize * 2.25)
        .attr("y", dim * 0.41)
        .attr("width", imgSize + 20)
        .attr("height", imgSize)
        .append("xhtml:div")
        .style("font-size", "20px").html(`
        Note: 
        <br>
        FireRed & LeafGreen are both remakes of the Gen 1 games, Pokémon Red & Green
        `);

      return;

    case 4:
      const diamondPearlHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const diamondPearlContent = gamesGroup.append("g");

      handleCollapse(
        diamondPearlHeader,
        diamondPearlContent,
        "Pokémon Diamond & Pearl",
        {
          centerX: dim * 0.15,
          centerY: dim * 0.15,
        },
      );

      renderGameCover(
        diamondPearlContent,
        0,
        30,
        imgSize,
        "../../assets/games/gen4/diamond.png",
        "../../assets/games/gen4/diamond-jp.png",
      );

      renderGameCover(
        diamondPearlContent,
        imgSize + 20,
        30,
        imgSize,
        "../../assets/games/gen4/pearl.png",
        "../../assets/games/gen4/pearl-jp.png",
      );

      diamondPearlContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">28/09/06</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">17.67 mil</span> 
        <br>
        
    `);

      const platinumHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", imgSize * 2.2)
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const platinumContent = gamesGroup.append("g");

      handleCollapse(platinumHeader, platinumContent, "Pokémon Platinum", {
        centerX: imgSize * 2.8,
        centerY: dim * 0.15,
      });

      renderGameCover(
        platinumContent,
        imgSize * 2.2,
        30,
        imgSize,
        "../../assets/games/gen4/platinum.png",
        "../../assets/games/gen4/platinum-jp.png",
      );

      platinumContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", imgSize * 2.2)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.3)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">13/09/08</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">7.69 mil</span> 
        <br>
        
      `);

      const heartGoldSoulSilverHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline");

      const heartGoldSoulSilverContent = gamesGroup.append("g");

      handleCollapse(
        heartGoldSoulSilverHeader,
        heartGoldSoulSilverContent,
        "Pokémon HeartGold & SoulSilver",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.52,
        },
      );

      renderGameCover(
        heartGoldSoulSilverContent,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen4/heartgold.png",
        "../../assets/games/gen4/heartgold-jp.png",
      );

      renderGameCover(
        heartGoldSoulSilverContent,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen4/soulsilver.png",
        "../../assets/games/gen4/soulsilver-jp.png",
      );

      heartGoldSoulSilverContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">12/09/09</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">12.72 mil</span> 
        
    `);

      heartGoldSoulSilverContent
        .append("foreignObject")
        .attr("class", "data-section-body")
        .attr("x", imgSize * 2.25)
        .attr("y", dim * 0.41)
        .attr("width", imgSize + 30)
        .attr("height", imgSize)
        .append("xhtml:div")
        .style("font-size", "20px").html(`
        Note: 
        <br>
        HeartGold & SoulSilver are both remakes of the Gen 2 games, Pokémon Gold & Silver
        `);
      return;

    case 5:
      const blackWhiteHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const blackWhiteContent = gamesGroup.append("g");

      handleCollapse(
        blackWhiteHeader,
        blackWhiteContent,
        "Pokémon Black & White",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.15,
        },
      );

      renderGameCover(
        blackWhiteContent,
        0,
        30,
        imgSize,
        "../../assets/games/gen5/black.png",
        "../../assets/games/gen5/black-jp.png",
      );

      renderGameCover(
        blackWhiteContent,
        imgSize + 20,
        30,
        imgSize,
        "../../assets/games/gen5/white.png",
        "../../assets/games/gen5/white-jp.png",
      );

      blackWhiteContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">18/09/10</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">15.64 mil</span> 
        
    `);

      const blackWhite2Header = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline");

      const blackWhite2Content = gamesGroup.append("g");

      handleCollapse(
        blackWhite2Header,
        blackWhite2Content,
        "Pokémon Black 2 & White 2",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.52,
        },
      );

      renderGameCover(
        blackWhite2Content,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen5/black2.png",
        "../../assets/games/gen5/black2-jp.png",
      );

      renderGameCover(
        blackWhite2Content,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen5/white2.png",
        "../../assets/games/gen5/white2-jp.png",
      );

      blackWhite2Content
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">23/06/12</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">8.25 mil</span> 
        
    `);

      renderFactBox(
        blackWhite2Content,
        imgSize * 2.2,
        dim * 0.37,
        imgSize + 30,
        imgSize + 75,
        "Black 2 & White 2 are direct sequels!",
        `> Unlike the Gen 1 & 2 remake games, both games are narratively unique from their original counterpart
        <br>
        > They feature a different storyline with different protagonist options, taking place some years after the events of Black & White.
        `,
      );

      return;

    case 6:
      const xYHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const xYContent = gamesGroup.append("g");

      handleCollapse(xYHeader, xYContent, "Pokémon X & Y", {
        centerX: dim * 0.25,
        centerY: dim * 0.15,
      });

      renderGameCover(
        xYContent,
        0,
        30,
        imgSize,
        "../../assets/games/gen6/x.png",
        "../../assets/games/gen6/x-jp.png",
      );

      renderGameCover(
        xYContent,
        imgSize + 20,
        30,
        imgSize,
        "../../assets/games/gen6/y.png",
        "../../assets/games/gen6/y-jp.png",
      );

      xYContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">12/10/13</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo 3DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">16.72 mil</span> 
        
    `);

      const orasHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline");

      const orasContent = gamesGroup.append("g");

      handleCollapse(
        orasHeader,
        orasContent,
        "Pokémon Omega Ruby & Alpha Sapphire",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.52,
        },
      );

      renderGameCover(
        orasContent,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen6/omegaruby.png",
        "../../assets/games/gen6/omegaruby-jp.png",
      );

      renderGameCover(
        orasContent,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../../assets/games/gen6/alphasapphire.png",
        "../../assets/games/gen6/alphasapphire-jp.png",
      );

      orasContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">21/11/14</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo 3DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">14.6 mil</span> 
        
    `);

      orasContent
        .append("foreignObject")
        .attr("class", "data-section-body")
        .attr("x", imgSize * 2.25)
        .attr("y", dim * 0.41)
        .attr("width", imgSize + 20)
        .attr("height", imgSize)
        .append("xhtml:div")
        .style("font-size", "20px").html(`
        Note: 
        <br>
        Omega Ruby & Alpha Sapphire are both remakes of the Gen 3 games, Pokémon Ruby & Sapphire
        `);

      renderFactBox(
        xYContent,
        imgSize * 2.15,
        20,
        dim * 0.23,
        dim * 0.2,
        "First appearance of the Fairy Type! ",
        `> Fairy type was introduced as the 18th regular Pokémon type in this generation
        <br>
        > New Fairy Pokémon and Fairy-type moves were introduced, as well its addition to an existing 22 Pokémon and 3 moves`,
      );

      return;

    case 7:
      const sunMoonHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const sunMoonContent = gamesGroup.append("g");

      handleCollapse(
        sunMoonHeader,
        sunMoonContent,
        "Pokémon Sun/Moon & Ultra Sun/Ultra Moon",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.15,
        },
      );

      renderGameCover(
        sunMoonContent,
        0,
        30,
        imgSizeSmall,
        "../../assets/games/gen7/sun.png",
        "../../assets/games/gen7/sun-jp.png",
      );

      renderGameCover(
        sunMoonContent,
        imgSizeSmall + 7,
        30,
        imgSizeSmall,
        "../../assets/games/gen7/moon.png",
        "../../assets/games/gen7/moon-jp.png",
      );

      renderGameCover(
        sunMoonContent,
        imgSizeSmall * 2 + 14,
        30,
        imgSizeSmall,
        "../../assets/games/gen7/ultrasun.png",
        "../../assets/games/gen7/ultrasun-jp.png",
      );

      renderGameCover(
        sunMoonContent,
        imgSizeSmall * 3 + 21,
        30,
        imgSizeSmall,
        "../../assets/games/gen7/ultramoon.png",
        "../../assets/games/gen7/ultramoon-jp.png",
      );

      sunMoonContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.18)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Platform: <span class="data-section-body">Nintendo 3DS</span> 
        <br>
        > [SM] Release (WW): <span class="data-section-body">18/11/16</span> 
        <br>
        >> Sales (Units): <span class="data-section-body">16.32 mil</span> 
        <br>
        > [USUM] Release (WW): <span class="data-section-body">17/11/17</span> 
        <br>
        >> Sales (Units): <span class="data-section-body">9.19 mil</span> 
    `);

      sunMoonContent
        .append("foreignObject")
        .attr("class", "data-section-body")
        .attr("x", imgSizeSmall * 2 + imgSizeSmall / 1.5)
        .attr("y", dim * 0.2)
        .attr("width", imgSize + 30)
        .attr("height", imgSize)
        .append("xhtml:div")
        .style("font-size", "20px").html(`
        Note:
        <br>
        Ultra Sun & Ultra Moon are akin to enhanced editions/extended cuts
        `);

      const pikachuEeveeHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.34)
        .style("text-decoration-line", "underline");

      const pikachuEeveeContent = gamesGroup.append("g");

      renderGameCover(
        pikachuEeveeContent,
        0,
        dim * 0.34 + 30,
        imgSizeTall,
        "../../assets/games/gen7/lgpikachu.png",
        "../../assets/games/gen7/lgpikachu-jp.png",
      );

      renderGameCover(
        pikachuEeveeContent,
        imgSizeSmall,
        dim * 0.34 + 30,
        imgSizeTall,
        "../../assets/games/gen7/lgeevee.png",
        "../../assets/games/gen7/lgeevee-jp.png",
      );

      pikachuEeveeContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">16/11/18</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo Switch</span> 
        <br>
        > Sales (Units): <span class="data-section-body">15.07 mil</span> 
        
    `);

      const pikachuEeveeBounds = {
        centerX: dim * 0.25,
        centerY: dim * 0.5,
      };

      handleCollapse(
        pikachuEeveeHeader,
        pikachuEeveeContent,
        "Pokémon Let's Go Pikachu & Let's Go Eevee",
        pikachuEeveeBounds,
      );

      renderFactBox(
        pikachuEeveeContent,
        imgSizeTall * 1.6,
        dim * 0.34 + 50,
        imgSize * 1.5,
        imgSizeTall,
        "A first generation throwback with a modern twist!",
        `> Let's Go is a Pokémon Yellow remake, taking place in Kanto Region, but including gameplay elements from hit mobile game, Pokémon Go
        <br> 
        <br>
        > It contains Gen I pokémon, some with Alolan forms, and a new mythical pokémon—Meltan—who first debuted in Pokémon Go
        `,
      );

      return;

    case 8:
      const swordShieldHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const swordShieldContent = gamesGroup.append("g");

      handleCollapse(
        swordShieldHeader,
        swordShieldContent,
        "Pokémon Sword & Shield",
        {
          centerX: dim * 0.145,
          centerY: dim * 0.15,
        },
      );

      renderGameCover(
        swordShieldContent,
        -10,
        30,
        imgSizeTall * 0.85,
        "../../assets/games/gen8/sword.png",
        "../../assets/games/gen8/sword-jp.png",
      );

      renderGameCover(
        swordShieldContent,
        imgSizeSmall * 0.8,
        30,
        imgSizeTall * 0.85,
        "../../assets/games/gen8/shield.png",
        "../../assets/games/gen8/shield-jp.png",
      );

      swordShieldContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.21)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">15/11/19</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo Switch</span> 
        <br>
        > Sales (Units): <span class="data-section-body">26.17 mil</span> 
        <br>
        
    `);

      const legendsArceusHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", dim * 0.315)
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const legendsArceusContent = gamesGroup.append("g");

      handleCollapse(
        legendsArceusHeader,
        legendsArceusContent,
        "Pokémon Legends: Arceus",
        {
          centerX: dim * 0.46,
          centerY: dim * 0.15,
        },
      );

      renderGameCover(
        legendsArceusContent,
        dim * 0.38,
        30,
        imgSizeTall * 0.85,
        "../../assets/games/gen8/legendsarceus.png",
        "../../assets/games/gen8/legendsarceus-jp.png",
      );

      legendsArceusContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", dim * 0.33)
        .attr("y", dim * 0.21)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">28/01/22</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo Switch</span> 
        <br>
        > Sales (Units): <span class="data-section-body">14.83 mil</span> 
        <br>
        
    `);

      const brilliantDiamondShiningPearlHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.35)
        .style("text-decoration-line", "underline");

      const brilliantDiamondShiningPearlContent = gamesGroup.append("g");

      handleCollapse(
        brilliantDiamondShiningPearlHeader,
        brilliantDiamondShiningPearlContent,
        "Pokémon Brilliant Diamond & Shining Pearl",
        {
          centerX: dim * 0.25,
          centerY: dim * 0.52,
        },
      );
      renderGameCover(
        brilliantDiamondShiningPearlContent,
        0,
        dim * 0.34 + 30,
        imgSizeTall,
        "../../assets/games/gen8/brilliantdiamond.png",
        "../../assets/games/gen8/brilliantdiamond-jp.png",
      );

      renderGameCover(
        brilliantDiamondShiningPearlContent,
        imgSizeSmall,
        dim * 0.34 + 30,
        imgSizeTall,
        "../../assets/games/gen8/shiningpearl.png",
        "../../assets/games/gen8/shiningpearl-jp.png",
      );

      brilliantDiamondShiningPearlContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">19/11/21</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo Switch</span> 
        <br>
        > Sales (Units): <span class="data-section-body">15.06 mil</span> 
        
    `);

      renderFactBox(
        brilliantDiamondShiningPearlContent,
        imgSizeTall * 1.6,
        dim * 0.34 + 65,
        imgSize * 1.5,
        imgSizeTall,
        "Adventures in the past and present of Sinnoh!",
        `> Brilliant Diamond & Shining Pearl are enhanced remakes of Gen IV's Pokémon Diamond & Pearl
        <br> 
        > Pokémon Legends: Arceus on the other hand, is the first of the subseries and takes place in a past era, when Sinnoh Region was still known as the Hisui Region
        `,
      );
      return;

    case 9:
      const scarletVioletHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const scarletVioletContent = gamesGroup.append("g");

      handleCollapse(
        scarletVioletHeader,
        scarletVioletContent,
        "Pokémon Scarlet & Violet",
        {
          centerX: dim * 0.145,
          centerY: dim * 0.18,
        },
      );

      renderGameCover(
        scarletVioletContent,
        -50,
        30,
        imgSizeTall,
        "../../assets/games/gen9/scarlet.png",
        "../../assets/games/gen9/scarlet-jp.png",
      );

      renderGameCover(
        scarletVioletContent,
        imgSizeSmall * 0.65,
        30,
        imgSizeTall,
        "../../assets/games/gen9/violet.png",
        "../../assets/games/gen9/violet-jp.png",
      );

      scarletVioletContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.25)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">18/11/22</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo Switch</span> 
        <br>
        > Sales (Units): <span class="data-section-body">24.36 mil</span> 
        <br>
        
    `);

      const legendsZAHeader = gamesGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", dim * 0.335)
        .attr("y", 10)
        .style("text-decoration-line", "underline");

      const legendsZAContent = gamesGroup.append("g");

      handleCollapse(
        legendsZAHeader,
        legendsZAContent,
        "Pokémon Legends: Z-A",
        {
          centerX: dim * 0.47,
          centerY: dim * 0.18,
        },
      );

      renderGameCover(
        legendsZAContent,
        dim * 0.35,
        30,
        imgSizeTall,
        "../../assets/games/gen9/legendsza.png",
        "../../assets/games/gen9/legendsza-ns2.png",
      );

      legendsZAContent
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", dim * 0.33)
        .attr("y", dim * 0.25)
        .attr("width", dim * 0.3)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (WW): <span class="data-section-body">16/10/25</span> 
        <br>
        > Platforms: <span class="data-section-body">Nintendo Switch, Nintendo Switch 2</span> 
        <br>
        > Sales (Units): <span class="data-section-body">5.8 mil</span> 
        <br>
        
    `);

      const upcomingGen = gamesGroup.append("g");

      renderSpoilerBox(upcomingGen, 0, dim * 0.4, dim * 0.6, dim * 0.25);
      return;

    default:
      return;
  }
}

function handleCollapse(headerElement, contentGroup, sectionName, bounds) {
  //default state
  let isVisible = false;
  contentGroup.style("opacity", 0).style("pointer-events", "none");

  const placeholder = d3
    .select(contentGroup.node().parentNode)
    .append("text")
    .attr("class", "collapsed-placeholder")
    .attr("x", bounds.centerX)
    .attr("y", bounds.centerY)
    .text("— Content Collapsed —");

  headerElement
    .style("cursor", "pointer")
    .style("user-select", "none")
    .on("mouseenter", function () {
      d3.select(this).style("fill", "#f27a71");
    })
    .on("mouseleave", function () {
      d3.select(this).style("fill", null);
    });

  headerElement.on("click", function () {
    isVisible = !isVisible;

    // Toggle the actual content
    contentGroup
      .transition()
      .duration(400)
      .style("opacity", isVisible ? 1 : 0)
      .style("pointer-events", isVisible ? "all" : "none");

    placeholder
      .transition()
      .duration(400)
      .style("opacity", isVisible ? 0 : 0.5);

    // Update the text to show status
    const prefix = isVisible ? "[-] " : "[+] ";
    // This assumes the header is a d3 text element
    d3.select(this).text(prefix + sectionName);
  });

  headerElement.text("[-] " + sectionName);
}

function displayDataBox() {
  const dataBoxContainer = d3.select("#data-container");
  console.log("Data Container found:", !dataBoxContainer.empty());

  //clear old data box info each time
  dataBoxContainer.html("");

  if (selectedGen === null) {
    return;
  }

  //coords dimensions for scaling
  const dataBoxWidth = 1200;
  const dataBoxHeight = 1000;

  //create box svg object
  const dataBoxSVG = dataBoxContainer
    .append("svg")
    .attr("viewBox", `0,0,${dataBoxWidth}, ${dataBoxHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", "100%")
    .attr("height", "100%");

  //add the visible box itself
  dataBoxSVG
    .append("rect")
    .attr("class", "data-box")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", dataBoxWidth)
    .attr("height", dataBoxHeight);

  //variables for dimensions and tracking "current location" as we place box elements
  let currentX = dataBoxWidth * 0.04;
  let currentY = dataBoxHeight * 0.07;

  //main title + divider
  const titleGroup = dataBoxSVG
    .append("g")
    .attr("transform", `translate(${currentX}, ${currentY})`);

  const titleText = titleGroup.append("text").attr("id", "data-gen-title");

  titleText.append("tspan").text(`Generation ${selectedGen.number}: `);

  titleText
    .append("tspan")
    .style("fill", selectedGen.color_1)
    .text(` ${selectedGen.region} Region `);

  titleText
    .append("tspan")
    .style("fill", selectedGen.color_2)
    .text(`(${selectedGen.years})`);

  dataBoxSVG
    .append("line")
    .attr("x1", dataBoxWidth * 0.67)
    .attr("y1", dataBoxHeight * 0.15)
    .attr("x2", dataBoxWidth * 0.67)
    .attr("y2", dataBoxHeight * 0.85)
    .style("stroke", "#757575")
    .style("stroke-width", 3)
    .style("stroke-linecap", "round");

  //game releases section
  currentY += 40;

  const releaseGroup = dataBoxSVG
    .append("g")
    .attr("transform", `translate(${currentX}, ${currentY})`);

  releaseGroup
    .append("foreignObject")
    .attr("class", "data-section-h1")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", dataBoxWidth * 0.3)
    .attr("height", 45)
    .style("dominant-baseline", "hanging")
    .append("xhtml:div")
    .html(
      `<a class="data-section-hyperlink" href="../../pages/visualizations.html#timeline">Main Series Releases:</a>`,
    );

  currentY += 70;

  const gamesDisplay = gameInfo(
    selectedGen.number,
    dataBoxSVG
      .append("g")
      .attr("transform", `translate(${currentX}, ${currentY})`),
    dataBoxWidth,
  );

  //mascot section
  currentY = dataBoxHeight * 0.12;
  currentX = dataBoxWidth * 0.73;

  const mascotGroup = dataBoxSVG
    .append("g")
    .attr("transform", `translate(${currentX}, ${currentY})`);

  mascotGroup
    .append("text")
    .attr("class", "data-section-h2")
    .style("dominant-baseline", "hanging")
    .text(`#${selectedGen.mascot.dexNum}: ${selectedGen.mascot.name}`);

  mascotGroup
    .append("image")
    .attr("xlink:href", `../../assets/mascots/${selectedGen.mascot.name}.png`)
    .attr("width", dataBoxWidth * 0.2)
    .attr("x", 0)
    .attr("y", 40);

  //https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/foreignObject
  mascotGroup
    .append("foreignObject")
    .attr("x", -dataBoxWidth * 0.04)
    .attr("y", dataBoxWidth * 0.25)
    .attr("width", dataBoxWidth * 0.28)
    .attr("height", dataBoxWidth * 0.075)
    .append("xhtml:div")
    .attr("class", "data-section-body")
    .style("font-size", "19px").html(`
        Ranked #1 ${selectedGen.region} Pokémon in 
        <br>
        <a href="https://www.reddit.com/r/pokemon/comments/1o7nb3l/results_is_every_pok%C3%A9mon_someones_favourite/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button" 
        target="_blank">
            u/Jawnysparklez's 2025 Survey
        </a>
        <br>
        with ${selectedGen.mascot.votes} / 26,407 Votes!
    `);

  //starters section
  currentY += dataBoxHeight * 0.4;

  const startersGroup = dataBoxSVG
    .append("g")
    .attr("transform", `translate(${currentX}, ${currentY})`);

  startersGroup
    .append("image")
    .attr("xlink:href", `../../assets/starters/gen${selectedGen.number}.png`)
    .attr("width", dataBoxWidth * 0.25)
    .attr("height", dataBoxHeight * 0.15)
    .attr("x", -dataBoxWidth * 0.02)
    .attr("y", 20);

  startersGroup
    .append("foreignObject")
    .attr("x", -dataBoxWidth * 0.04)
    .attr("y", dataBoxHeight * 0.18)
    .attr("width", dataBoxWidth * 0.28)
    .attr("height", "90px")
    .append("xhtml:div")
    .attr("class", "data-section-body")
    .style("font-size", "22px").html(`
        <a href="../../pages/visualizations.html#starters">
            Starter Pokémon:
        </a>
        <br>
        ${selectedGen.starters}
    `);

  //pokedex count section
  currentY += dataBoxHeight * 0.25;

  const dexStats = dataBoxSVG
    .append("g")
    .attr("transform", `translate(${currentX}, ${currentY})`);

  dexStats
    .append("foreignObject")
    .attr("x", -dataBoxWidth * 0.04)
    .attr("y", dataBoxWidth * 0.05)
    .attr("width", dataBoxWidth * 0.28)
    .attr("height", "90px")
    .append("xhtml:div")
    .attr("class", "data-section-body")
    .style("font-size", "22px").html(`
        <a href="../../pages/visualizations.html#total">
            Pokédex Count:
        </a>
        <br>
        ${selectedGen.count} / 1025 Total Pokémon
        <br>
        were added in Generation ${selectedGen.number}
    `);

  //load in box before transitioning in
  //https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
  requestAnimationFrame(() => {
    dataBoxContainer.classed("visible", true);
  });
}

//map state handler
function updateUI(gen) {
  const dataBox = d3.select("#data-container");

  //clear existing zoomed region labels upon state update
  svgElement.selectAll(".focus-label-group").remove();

  if (!gen) {
    //no data --> reset to default map view
    svgElement.classed("focus-mode", false);
    svgElement.selectAll("path").classed("selected-path", false);
    svgElement.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    d3.select("#reset-button").style("display", "none");

    //trigger smooth transition out and allow time for elements to fade out
    dataBox.classed("visible", false);
    setTimeout(() => {
      if (!selectedGen) dataBox.html("");
    }, 500);

    d3.selectAll(".location-icon")
      .transition()
      .duration(750)
      .style("opacity", 1);
  } else {
    //set selected region state, while all other paths are unselected
    const regionID = gen.region;
    const regionPath = d3.select(`path#${regionID}`);

    svgElement.classed("focus-mode", true);
    svgElement.selectAll("path").classed("selected-path", false);
    regionPath.classed("selected-path", true);

    //display the fixed region label
    const bounds = regionPath.node().getBBox();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const labelGroup = svgElement
      .select("g")
      .append("g")
      .attr("class", "focus-label-group")
      .style("opacity", 0);

    labelGroup
      .append("text")
      .attr("x", centerX)
      .attr("y", centerY)
      .attr("id", "focus-label")
      .attr("text-anchor", "middle")
      .text(regionID);

    labelGroup.transition().delay(300).duration(500).style("opacity", 1);

    displayDataBox();
    zoomToRegion(regionID);
  }
  renderMarks();
}

//actual container + ui rendering
const mapContainer = d3.select("#map-container");

//load map svg image: https://stackoverflow.com/questions/12975929/how-to-use-svg-file-for-image-source-in-d3#:~:text=Sorted%20by:,%2C%20100)
d3.xml("../../assets/world-map-by-nstav13.svg")
  .then((xml) => {
    const mapSVG = xml.documentElement;
    mapContainer.node().appendChild(mapSVG);

    mapSVG.setAttribute("width", "100%");
    mapSVG.setAttribute("height", "100%");

    const mapElement = d3.select("#map-container svg");
    const regionString = generations.map((g) => `#${g.region}`).join(", ");

    const regions = mapElement.selectAll(regionString);

    //svg attributes fix for consistency
    regions
      .attr("style", null)
      .attr("stroke", "rgba(0,0,0,0)")
      .attr("stroke-width", "0px");

    regions.each(function () {
      const regionID = d3.select(this).attr("id");
      const bounds = this.getBBox();
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;

      d3.select(this.parentNode)
        .append("image")
        .attr("class", "location-icon")
        .attr("id", `icon-${regionID}`) // link ID to region
        .attr("href", "../../assets/icons/location-icon.png")
        .attr("x", centerX - 20)
        .attr("y", centerY - 40)
        .attr("height", 60)
        .style("pointer-events", "none")
        .style("transition", "opacity 0.3s ease");
    });

    //selecting region zones with cursor
    hoverRegion(mapElement, regions);
    handleZoom(mapElement, regions);
  })
  .catch((error) => {
    console.error("Loading error:", error);
  });

drawTimeline();

window.addEventListener("resize", () => {
  drawTimeline();
});
