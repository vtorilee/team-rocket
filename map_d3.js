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
        .attr("xlink:href", "../images/pokeball-pixel.png")
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

function renderFactBox(container, x, y, width, height, funFact, factDetails) {
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
    .attr("height", "50px")
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
    .attr("width", width)
    .attr("height", height)
    .style("font-size", "18px")
    .style("text-align", "left")
    .append("xhtml:div")
    .html(factDetails);

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
        "../images/games/gen1/red.png",
        "../images/games/gen1/red-jp.png",
      );

      renderGameCover(
        redGreenGroup,
        imgSize,
        30,
        imgSize,
        "../images/games/gen1/green-jp.png",
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
        > Release (JP): <span class="data-section-body">Feb 27, 1996</span> 
        <br>
        > Platform(s): <span class="data-section-body">Game Boy</span> 
        <br>
        > Total Sales: <span class="data-section-body">[INSERT # HERE]</span> 
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
        "../images/games/gen1/blue.png",
        "../images/games/gen1/blue-jp.png",
      );

      blueGroup
        .append("foreignObject")
        .attr("class", "data-section-stats")
        .attr("x", 0)
        .attr("y", dim * 0.54)
        .attr("width", dim * 0.3)
        .attr("height", dim * 0.1)
        .append("xhtml:div")
        .style("font-size", "21px").html(`
        > Release (JP): <span class="data-section-body">Oct 15, 1996</span> 
        <br>
        > Platform(s): <span class="data-section-body">Game Boy</span> 
        <br>
        > Total Sales: <span class="data-section-body">[INSERT # HERE]</span> 
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
        "../images/games/gen1/yellow.png",
        "../images/games/gen1/yellow-jp.png",
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
        > Release (JP): <span class="data-section-body">Sept 12, 1998</span> 
        <br>
        > Platform(s): <span class="data-section-body">Game Boy</span> 
        <br>
        > Total Sales: <span class="data-section-body">[INSERT # HERE]</span> 
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
  // const dataBoxWidth = dataBoxContainer.node().clientWidth;
  // const dataBoxHeight = dataBoxContainer.node().clientHeight;
  // console.log("width: ", dataBoxWidth, " height: ", dataBoxHeight);

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
    .attr("xlink:href", `../images/mascots/${selectedGen.mascot.name}.png`)
    .attr("width", dataBoxWidth * 0.2)
    .attr("x", 0)
    .attr("y", 20);

  //https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/foreignObject
  mascotGroup
    .append("foreignObject")
    .attr("x", -dataBoxWidth * 0.04)
    .attr("y", dataBoxWidth * 0.25)
    .attr("width", dataBoxWidth * 0.28)
    .attr("height", dataBoxWidth * 0.075)
    .append("xhtml:div")
    .attr("class", "data-section-body")
    .style("font-size", "22px").html(`
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
    .attr("xlink:href", `../images/starters/gen${selectedGen.number}.png`)
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
d3.xml("../images/world-map-by-nstav13.svg")
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
