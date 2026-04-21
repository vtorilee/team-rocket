const data = [
  { Gen: 1, Count: 151, Region: "Kanto" },
  { Gen: 2, Count: 251, Region: "Johto" },
  { Gen: 3, Count: 386, Region: "Hoenn" },
  { Gen: 4, Count: 493, Region: "Sinnoh" },
  { Gen: 5, Count: 649, Region: "Unova" },
  { Gen: 6, Count: 721, Region: "Kalos" },
  { Gen: 7, Count: 809, Region: "Alola" },
  { Gen: 8, Count: 905, Region: "Galar" },
  { Gen: 9, Count: 1025, Region: "Paldea" }
];

const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",

  width: 1000,
  height: 550,

  background: "#2b2b2b",

  config: {
    style: {
      "guide-label": { fill: "white" },
      "guide-title": { fill: "white" }
    },
    axis: {
      domainColor: "white",
      tickColor: "white",
      gridColor: "#555",
      labelColor: "white",
      titleColor: "white"
    },
    legend: {
      labelColor: "white",
      titleColor: "white"
    }
  },

  data: {
    values: data
  },

  transform: [
    { sort: [{ field: "Gen" }] },
    {
      window: [
        {
          op: "lag",
          field: "Count",
          as: "prevCount"
        }
      ]
    },
    {
      calculate: "isValid(datum.prevCount) ? datum.Count - datum.prevCount : 0",
      as: "increase"
    }
  ],

  mark: {
    type: "line",
    stroke: "red",
    strokeWidth: 4,
    point: {
      size: 140,
      filled: true,
      fill: "red",
      stroke: "white",
      strokeWidth: 1.5
    }
  },

  encoding: {
    x: {
      field: "Gen",
      type: "ordinal",
      title: "Generation",
      axis: {
        labelExpr: "'Gen ' + datum.value",
        labelAngle: -45,
        labelPadding: 10,
        grid: true,
        gridColor: "#555",
        gridOpacity: 0.3
      }
    },

    y: {
      field: "Count",
      type: "quantitative",
      title: "Amount of Pokémon",
      axis: {
        grid: true,
        gridColor: "#555",
        gridOpacity: 0.3
      }
    },

    tooltip: [
      { field: "Gen", type: "ordinal", title: "Generation" },
      { field: "Region", type: "nominal" },
      { field: "Count", type: "quantitative", title: "Total Amount of Pokemon" },
      { field: "increase", type: "quantitative", title: "Added # of Pokemon" }
    ]
  }
};

vegaEmbed("#vis", spec, { actions: false });

function sendHeight() {
  window.parent.postMessage(
    {
      type: "setHeight",
      height: 650
    },
    "*"
  );
}

window.addEventListener("load", sendHeight);
window.addEventListener("resize", sendHeight);