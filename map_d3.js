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

function displayDataBox() {
  const dataBoxContainer = d3.select("#data-container");

  //clear old data box info each time
  dataBoxContainer.html("");

  if (selectedGen === null) {
    return;
  }

  //create box svg object
  const dataBoxSVG = dataBoxContainer
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  //add the visible box itself
  dataBoxSVG
    .append("rect")
    .attr("class", "data-box")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%");

  //variables for dimensions and tracking "current location" as we place box elements
  const dataBoxWidth = dataBoxContainer.node().clientWidth;
  const dataBoxHeight = dataBoxContainer.node().clientHeight;
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
    .attr("y1", dataBoxHeight * 0.1)
    .attr("x2", dataBoxWidth * 0.67)
    .attr("y2", dataBoxHeight * 0.9)
    .style("stroke", "#757575")
    .style("stroke-width", 3)
    .style("stroke-linecap", "round");

  //game releases section
  currentY += 25;

  const releaseGroup = dataBoxSVG
    .append("g")
    .attr("transform", `translate(${currentX}, ${currentY})`);

  releaseGroup
    .append("text")
    .attr("class", "data-section-h1")
    .style("dominant-baseline", "hanging")
    .text("Main Series Releases:");

  //mascot section
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
    .attr("x", -dataBoxWidth * 0.1)
    .attr("y", dataBoxWidth * 0.25)
    .attr("width", dataBoxWidth * 0.4)
    .attr("height", 200)
    .append("xhtml:div")
    .attr("class", "data-section-body")
    .style("font-size", "0.75vw").html(`
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
  currentY += dataBoxWidth * 0.3;

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
    .attr("x", -dataBoxWidth * 0.1)
    .attr("y", dataBoxWidth * 0.15)
    .attr("width", dataBoxWidth * 0.4)
    .attr("height", 75)
    .append("xhtml:div")
    .attr("class", "data-section-body")
    .style("font-size", "0.75vw").html(`
        <a href="">
            Starter Pokémon:
        </a>
        <br>
        ${selectedGen.starters}
    `);

  //pokedex count section
  const dexStats = dataBoxSVG
    .append("g")
    .attr("transform", `translate(${currentX}, ${currentY})`);

  dexStats
    .append("foreignObject")
    .attr("x", -dataBoxWidth * 0.1)
    .attr("y", dataBoxWidth * 0.23)
    .attr("width", dataBoxWidth * 0.4)
    .attr("height", 75)
    .append("xhtml:div")
    .attr("class", "data-section-body")
    .style("font-size", "0.75vw").html(`
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
