import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//for tracking generations
let selectedGen = null;
const generations = [
  { region: "Kanto", number: 1 },
  { region: "Johto", number: 2 },
  { region: "Hoenn", number: 3 },
  { region: "Sinnoh", number: 4 },
  { region: "Unova", number: 5 },
  { region: "Kalos", number: 6 },
  { region: "Alola", number: 7 },
  { region: "Galar", number: 8 },
  { region: "Paldea", number: 9 },
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
      selectedGen = selected;
      updateUI(selected);
    }
  });

  d3.select("#reset-button").on("click", function () {
    element.transition().duration(750).call(zoom.transform, d3.zoomIdentity);

    svgElement.classed("focus-mode", false);
    sections.classed("selected-path", false);

    //get rid of button and reset displays
    d3.select(this).style("display", "none");
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
    0.5 / Math.max(bounds.width / width, bounds.height / height),
  );
  const x = bounds.x + bounds.width / 5;
  const y = bounds.y + bounds.height / 2;

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

function updateUI(gen) {
  if (!gen) {
    //no data --> reset to default map view
    svgElement.classed("focus-mode", false);
    svgElement.selectAll("path").classed("selected-path", false);

    svgElement.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    d3.select("#reset-button").style("display", "none");
  } else {
    //set selected region state, while all other paths are unselected
    const regionID = gen.region;
    const regionPath = d3.select(`path#${regionID}`);

    svgElement.classed("focus-mode", true);
    svgElement.selectAll("path").classed("selected-path", false);
    regionPath.classed("selected-path", true);

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

//drawing function for custom timeline
function drawTimeline() {
  //select container, define dimensions of timeline
  const timelineContainer = d3.select("#timeline-container");
  const width = window.innerWidth - 100;
  const height = 100;

  //add svg into container, define svg dimensions
  const timelineSVG = timelineContainer
    .append("svg")
    .attr("width", "100%")
    .attr("height", height);

  //define mapping for the marks positions
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

drawTimeline();
