import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const mapContainer = d3.select("#map-container");

//load map svg image: https://stackoverflow.com/questions/12975929/how-to-use-svg-file-for-image-source-in-d3#:~:text=Sorted%20by:,%2C%20100)
d3.xml("../images/world-map-by-nstav13.svg")
  .then((xml) => {
    const mapSVG = xml.documentElement;
    mapContainer.node().appendChild(mapSVG);

    mapSVG.setAttribute("width", "100%");
    mapSVG.setAttribute("height", "100%");

    const svgElement = d3.select("#map-container svg");
    const regions = svgElement.selectAll("path");

    //selecting region zones with cursor
    regions
      .on("mouseenter", function () {
        d3.select(this).style("fill", "red");
        console.log("Currently on:", d3.select(this).attr("id"));
      })
      .on("mouseleave", function () {
        d3.select(this).style("fill", "transparent");
      });

    //zooming and panning using d3: https://d3js.org/d3-zoom
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svgElement
          .selectAll("g#map-regions")
          .attr("transform", event.transform);
      });
    svgElement.call(zoom);

    //zoom event listener
    regions.on("click", function (event) {
      //upon click, set selected svg region path as bounding box
      const bounds = this.getBBox();

      //zoom in and center selected region
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      const scale = 4; //zoom scale

      svgElement
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(window.innerWidth / 2, window.innerHeight / 2)
            .scale(scale)
            .translate(-x, -y),
        );

      d3.select("#reset-button").style("display", "block");
    });

    //reset map zoom
    d3.select("#reset-button").on("click", function () {
      svgElement
        .transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

      //get rid of button
      d3.select(this).style("display", "none");
    });
  })
  .catch((error) => {
    console.error("Loading error:", error);
  });

//drawing function for custom timeline
function drawTimeline() {
  const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
    .attr("stroke", "#fff")
    .attr("stroke-width", 9);

  //create the container groups for each mark's components
  const genMarks = timelineSVG
    .selectAll(".gen-mark")
    .data(generations)
    .enter()
    .append("g")
    .attr("class", "gen-mark")
    .attr("transform", (d) => `translate(${x(d)}, ${height / 2})`);

  //draw the circles and mouse hover handling
  genMarks
    .append("circle")
    .attr("r", 25)
    .attr("fill", "#ffffff")
    .attr("stroke", "#000")
    .attr("stroke-width", 3)
    .on("mouseenter", function () {
      d3.select(this).attr("fill", "yellow").attr("r", 30);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("fill", "#fff").attr("r", 25);
    });

  genMarks
    .append("text")
    .attr("class", "mark-text")
    .text((d) => `${d}`)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-family", "Rubik, sans-serif")
    .style("font-size", "20px");
}

drawTimeline();
