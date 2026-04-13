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

    //selecting region zones
    regions
      .on("mouseenter", function () {
        d3.select(this).style("fill", "red");
        console.log("Currently on:", d3.select(this).attr("id"));
      })
      .on("mouseleave", function () {
        d3.select(this).style("fill", "transparent");
      });
  })
  .catch((error) => {
    console.error("Loading error:", error);
  });
