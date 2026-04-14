import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svgContainer = d3.select("#map-container");

//load map svg image: https://stackoverflow.com/questions/12975929/how-to-use-svg-file-for-image-source-in-d3#:~:text=Sorted%20by:,%2C%20100)
d3.xml("../images/world-map-by-nstav13.svg")
  .then((xml) => {
    const mapSVG = xml.documentElement;
    svgContainer.node().appendChild(mapSVG);

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
