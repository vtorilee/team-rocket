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
      d3.select(this).classed("highlighted", false);
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

  //upon click, set selected svg region path as bounding box
  const bounds = regionPath.node().getBBox();
  const container = d3.select("#map-container").node();

  //calculate values to zoom in and offset selected region to the right
  const width = container.clientWidth;
  const height = container.clientHeight;
  const scale = Math.min(
    8,
    0.75 / Math.max(bounds.width / width, bounds.height / height),
  );
  const x = bounds.x + bounds.width / 6;
  const y = bounds.y + bounds.height / 3.5;

  //zoom in map
  svgElement
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-x, -y),
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

    //get rid of button and reset displays
    svgElement.selectAll(".focus-label-group").remove();
    d3.select(this).style("display", "none");
    d3.select("#data-container").html("");

    selectedGen = null;
    renderMarks();
  });
}

//function to draw the circles based on different states:
//https://d3js.org/d3-selection/events
function renderMarks() {
  if (!genMarks) return;

  genMarks.html("");
  genMarks.each(function (d) {
    const g = d3.select(this);

    if (selectedGen === d) {
      // https://stackoverflow.com/questions/20086884/add-image-inside-a-circle-d3
      g.append("image")
        .attr("xlink:href", "../assets/pokeball-pixel.png")
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
  });
}

//drawing function for custom timeline
function drawTimeline() {
  //select container, define dimensions of timeline
  const timelineContainer = d3.select("#timeline-container");
  const width = window.innerWidth - 100;
  const height = 100;

  //add svg into container, define svg dimensions
  const timelineSVG = timelineContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  //define mapping for the marks positions, domain and range for start-end of line
  //https://d3js.org/d3-scale/linear
  const x = d3.scaleLinear().domain([1, 9]).range([100, width]);

  //draw the Line
  timelineSVG
    .append("line")
    .attr("x1", x(1))
    .attr("y1", height / 2)
    .attr("x2", x(9))
    .attr("y2", height / 2)
    .attr("stroke", "#ffffffc3")
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

function gameInfo(gen, container, dim) {
  const gamesGroup = container.append("g").attr("class", "games-layout");
  const imgSize = dim * 0.18;
  const imgSizeSmall = dim * 0.15;
  const imgSizeTall = dim * 0.21;

  switch (Number(gen)) {
    case 1:
      const redGreenGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      redGreenGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Red & Pokémon Green");

      renderGameCover(
        redGreenGroup,
        0,
        30,
        imgSize,
        "../assets/games/gen1/red.png",
        "../assets/games/gen1/red-jp.png",
      );

      renderGameCover(
        redGreenGroup,
        imgSize,
        30,
        imgSize,
        "../assets/games/gen1/green-jp.png",
      );

      redGreenGroup
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
        <a href="">(## Bestselling)</a>
    `);

      const blueGroup = gamesGroup.append("g").attr("class", "games-display");

      blueGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.33)
        .style("text-decoration-line", "underline")
        .text("Pokémon Blue");

      renderGameCover(
        blueGroup,
        0,
        dim * 0.33 + 20,
        imgSize,
        "../assets/games/gen1/blue.png",
        "../assets/games/gen1/blue-jp.png",
      );

      blueGroup
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
        <a href="">(## Bestselling)</a>
    `);

      const yellowGroup = gamesGroup.append("g").attr("class", "games-display");

      yellowGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", dim * 0.33)
        .attr("y", dim * 0.33)
        .style("text-decoration-line", "underline")
        .text("Pokémon Yellow");

      renderGameCover(
        yellowGroup,
        dim * 0.33,
        dim * 0.33 + 20,
        imgSize,
        "../assets/games/gen1/yellow.png",
        "../assets/games/gen1/yellow-jp.png",
      );

      yellowGroup
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
        <a href="">(## Bestselling)</a>
    `);

      //fun fact box
      const factGroup = redGreenGroup
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
      const goldSilverGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      goldSilverGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Gold & Pokémon Silver");

      renderGameCover(
        goldSilverGroup,
        0,
        30,
        imgSize,
        "../assets/games/gen2/gold.png",
        "../assets/games/gen2/gold-jp.png",
      );

      renderGameCover(
        goldSilverGroup,
        imgSize + 20,
        30,
        imgSize,
        "../assets/games/gen2/silver.png",
        "../assets/games/gen2/silver-jp.png",
      );

      goldSilverGroup
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
        <a href="">(## Bestselling)</a>
    `);

      const crystalGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      crystalGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.355)
        .style("text-decoration-line", "underline")
        .text("Pokémon Crystal");

      renderGameCover(
        crystalGroup,
        0,
        dim * 0.355 + 20,
        imgSize,
        "../assets/games/gen2/crystal.png",
        "../assets/games/gen2/crystal-jp.png",
      );

      crystalGroup
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
        <a href="">(## Bestselling)</a>
      `);

      const factGroup2 = crystalGroup
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
        > Crystal gave an option to play as Kris, the first female protagonist of the series! `,
        "../assets/games/gen2/kris.png",
      );

      return;

    case 3:
      const rubySapphireGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      rubySapphireGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Ruby & Pokémon Sapphire");

      renderGameCover(
        rubySapphireGroup,
        0,
        30,
        imgSize,
        "../assets/games/gen3/ruby.png",
        "../assets/games/gen3/ruby-jp.png",
      );

      renderGameCover(
        rubySapphireGroup,
        imgSize + 20,
        30,
        imgSize,
        "../assets/games/gen3/sapphire.png",
        "../assets/games/gen3/sapphire-jp.png",
      );

      rubySapphireGroup
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
        <a href="">(## Bestselling)</a>
    `);

      const emeraldGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      emeraldGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", imgSize * 2.2)
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Emerald");

      renderGameCover(
        emeraldGroup,
        imgSize * 2.2,
        30,
        imgSize,
        "../assets/games/gen3/emerald.png",
        "../assets/games/gen3/emerald-jp.png",
      );

      emeraldGroup
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
        <a href="">(## Bestselling)</a>
      `);

      const fireRedLeafGreenGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      fireRedLeafGreenGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline")
        .text("Pokémon FireRed & Pokémon LeafGreen");

      renderGameCover(
        fireRedLeafGreenGroup,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen3/firered.png",
        "../assets/games/gen3/firered-jp.png",
      );

      renderGameCover(
        fireRedLeafGreenGroup,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen3/leafgreen.png",
        "../assets/games/gen3/leafgreen-jp.png",
      );

      fireRedLeafGreenGroup
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
        <a href="">(## Bestselling)</a>
    `);

      fireRedLeafGreenGroup
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
      const diamondPearlGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      diamondPearlGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Diamond & Pokémon Pearl");

      renderGameCover(
        diamondPearlGroup,
        0,
        30,
        imgSize,
        "../assets/games/gen4/diamond.png",
        "../assets/games/gen4/diamond-jp.png",
      );

      renderGameCover(
        diamondPearlGroup,
        imgSize + 20,
        30,
        imgSize,
        "../assets/games/gen4/pearl.png",
        "../assets/games/gen4/pearl-jp.png",
      );

      diamondPearlGroup
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
        <a href="">(## Bestselling)</a>
    `);

      const platinumGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      platinumGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("x", imgSize * 2.2)
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Platinum");

      renderGameCover(
        platinumGroup,
        imgSize * 2.2,
        30,
        imgSize,
        "../assets/games/gen4/platinum.png",
        "../assets/games/gen4/platinum-jp.png",
      );

      platinumGroup
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
        <a href="">(## Bestselling)</a>
      `);

      const heartGoldSoulSilverGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      heartGoldSoulSilverGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline")
        .text("Pokémon HeartGold & Pokémon SoulSilver");

      renderGameCover(
        heartGoldSoulSilverGroup,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen4/heartgold.png",
        "../assets/games/gen4/heartgold-jp.png",
      );

      renderGameCover(
        heartGoldSoulSilverGroup,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen4/soulsilver.png",
        "../assets/games/gen4/soulsilver-jp.png",
      );

      heartGoldSoulSilverGroup
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
        <a href="">(## Bestselling)</a>
    `);

      heartGoldSoulSilverGroup
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
      const blackWhiteGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      blackWhiteGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Black & Pokémon White");

      renderGameCover(
        blackWhiteGroup,
        0,
        30,
        imgSize,
        "../assets/games/gen5/black.png",
        "../assets/games/gen5/black-jp.png",
      );

      renderGameCover(
        blackWhiteGroup,
        imgSize + 20,
        30,
        imgSize,
        "../assets/games/gen5/white.png",
        "../assets/games/gen5/white-jp.png",
      );

      blackWhiteGroup
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
        <a href="">(## Bestselling)</a>
    `);

      const blackWhite2Group = gamesGroup
        .append("g")
        .attr("class", "games-display");

      blackWhite2Group
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline")
        .text("Pokémon Black 2 & Pokémon White 2");

      renderGameCover(
        blackWhite2Group,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen5/black2.png",
        "../assets/games/gen5/black2-jp.png",
      );

      renderGameCover(
        blackWhite2Group,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen5/white2.png",
        "../assets/games/gen5/white2-jp.png",
      );

      blackWhite2Group
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
        <a href="">(## Bestselling)</a>
    `);

      renderFactBox(
        blackWhite2Group,
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
      const xYGroup = gamesGroup.append("g").attr("class", "games-display");

      xYGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon X & Pokémon Y");

      renderGameCover(
        xYGroup,
        0,
        30,
        imgSize,
        "../assets/games/gen6/x.png",
        "../assets/games/gen6/x-jp.png",
      );

      renderGameCover(
        xYGroup,
        imgSize + 20,
        30,
        imgSize,
        "../assets/games/gen6/y.png",
        "../assets/games/gen6/y-jp.png",
      );

      xYGroup
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.22)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (Worldwide): <span class="data-section-body">12/10/13</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo 3DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">16.72 mil</span> 
        <a href="">(## Bestselling)</a>
    `);

      const orasGroup = gamesGroup.append("g").attr("class", "games-display");

      orasGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.375)
        .style("text-decoration-line", "underline")
        .text("Pokémon Omega Ruby & Pokémon Alpha Sapphire");

      renderGameCover(
        orasGroup,
        0,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen6/omegaruby.png",
        "../assets/games/gen6/omegaruby-jp.png",
      );

      renderGameCover(
        orasGroup,
        imgSize + 20,
        dim * 0.375 + 20,
        imgSize,
        "../assets/games/gen6/alphasapphire.png",
        "../assets/games/gen6/alphasapphire-jp.png",
      );

      orasGroup
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (Worldwide): <span class="data-section-body">21/11/14</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo 3DS</span> 
        <br>
        > Sales (Units): <span class="data-section-body">14.6 mil</span> 
        <a href="">(## Bestselling)</a>
    `);

      orasGroup
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
        orasGroup,
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
      const sunMoonGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      sunMoonGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", 10)
        .style("text-decoration-line", "underline")
        .text("Pokémon Sun & Pokémon Moon / Ultra Sun & Ultra Moon");

      renderGameCover(
        sunMoonGroup,
        0,
        30,
        imgSizeSmall,
        "../assets/games/gen7/sun.png",
        "../assets/games/gen7/sun-jp.png",
      );

      renderGameCover(
        sunMoonGroup,
        imgSizeSmall + 7,
        30,
        imgSizeSmall,
        "../assets/games/gen7/moon.png",
        "../assets/games/gen7/moon-jp.png",
      );

      renderGameCover(
        sunMoonGroup,
        imgSizeSmall * 2 + 14,
        30,
        imgSizeSmall,
        "../assets/games/gen7/ultrasun.png",
        "../assets/games/gen7/ultrasun-jp.png",
      );

      renderGameCover(
        sunMoonGroup,
        imgSizeSmall * 3 + 21,
        30,
        imgSizeSmall,
        "../assets/games/gen7/ultramoon.png",
        "../assets/games/gen7/ultramoon-jp.png",
      );

      sunMoonGroup
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
        > [SM] Release (Worldwide): <span class="data-section-body">18/11/16</span> 
        <br>
        >> Sales (Units): <span class="data-section-body">16.32 mil</span> 
        <a href="">(## Bestselling)</a>
        <br>
        > [USUM] Release (Worldwide): <span class="data-section-body">17/11/17</span> 
        <br>
        >> Sales (Units): <span class="data-section-body">9.19 mil</span> 
        <a href="">(## Bestselling)</a>
    `);

      sunMoonGroup
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
        Ultra Sun & Ultra Moon are revisions, akin to extended cuts
        `);

      const pikachuEeveeGroup = gamesGroup
        .append("g")
        .attr("class", "games-display");

      pikachuEeveeGroup
        .append("text")
        .attr("class", "data-section-h2")
        .attr("y", dim * 0.34)
        .style("text-decoration-line", "underline")
        .text("Pokémon Let's Go Pikachu & Pokémon Let's Go Eevee");

      renderGameCover(
        pikachuEeveeGroup,
        0,
        dim * 0.34 + 30,
        imgSizeTall,
        "../assets/games/gen7/lgpikachu.png",
        "../assets/games/gen7/lgpikachu-jp.png",
      );

      renderGameCover(
        pikachuEeveeGroup,
        imgSizeSmall,
        dim * 0.34 + 30,
        imgSizeTall,
        "../assets/games/gen7/lgeevee.png",
        "../assets/games/gen7/lgeevee-jp.png",
      );

      pikachuEeveeGroup
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.585)
        .attr("width", dim * 0.5)
        .attr("height", dim * 0.2)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (Worldwide): <span class="data-section-body">16/11/18</span> 
        <br>
        > Platform: <span class="data-section-body">Nintendo Switch</span> 
        <br>
        > Sales (Units): <span class="data-section-body">15.07 mil</span> 
        <a href="">(## Bestselling)</a>
    `);

      renderFactBox(
        pikachuEeveeGroup,
        imgSizeTall * 1.6,
        dim * 0.34 + 50,
        imgSize * 1.5,
        imgSizeTall,
        "A first generation throwback with a modern twist!",
        `> Let's Go is a Pokémon Yellow remake, taking place in Kanto Region, but including gameplay elements from hit mobile game, Pokémon Go
        <br> 
        > It contains Gen I pokémon, some with Alolan forms, and a new mythical pokémon—Meltan—who first debuted in Pokémon Go
        `,
      );

      return;
    default:
      return;
  }
}

function displayDataBox() {
  const dataBoxContainer = d3.select("#data-container");

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
    .append("text")
    .attr("class", "data-section-h1")
    .style("dominant-baseline", "hanging")
    .text("Main Series Releases:");

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
    .attr("xlink:href", `../assets/mascots/${selectedGen.mascot.name}.png`)
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
    .attr("xlink:href", `../assets/starters/gen${selectedGen.number}.png`)
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
        <a href="">
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
        <a href="">
            Pokédex Count:
        </a>
        <br>
        ${selectedGen.count} / 1025 Total Pokémon
        <br>
        were added in Generation ${selectedGen.number}
    `);
}

//map state handler
function updateUI(gen) {
  //clear existing zoomed region labels upon state update
  svgElement.selectAll(".focus-label-group").remove();

  if (!gen) {
    //no data --> reset to default map view
    svgElement.classed("focus-mode", false);
    svgElement.selectAll("path").classed("selected-path", false);

    svgElement.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    d3.select("#data-container").html("");
    d3.select("#reset-button").style("display", "none");
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

    //zoom to the selected region
    zoomToRegion(regionID);
  }
  renderMarks();
}

//actual container + ui rendering
const mapContainer = d3.select("#map-container");

//load map svg image: https://stackoverflow.com/questions/12975929/how-to-use-svg-file-for-image-source-in-d3#:~:text=Sorted%20by:,%2C%20100)
d3.xml("../assets/world-map-by-nstav13.svg")
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

    //selecting region zones with cursor
    hoverRegion(mapElement, regions);
    handleZoom(mapElement, regions);
  })
  .catch((error) => {
    console.error("Loading error:", error);
  });

drawTimeline();
