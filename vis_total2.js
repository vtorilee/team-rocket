// const data = [
//   { Gen: 1, Count: 151, Region: "Kanto" },
//   { Gen: 2, Count: 251, Region: "Johto" },
//   { Gen: 3, Count: 386, Region: "Hoenn" },
//   { Gen: 4, Count: 493, Region: "Sinnoh" },
//   { Gen: 5, Count: 649, Region: "Unova" },
//   { Gen: 6, Count: 721, Region: "Kalos" },
//   { Gen: 7, Count: 809, Region: "Alola" },
//   { Gen: 8, Count: 905, Region: "Galar" },
//   { Gen: 9, Count: 1025, Region: "Paldea" }
// ];

// const spec = {
//   $schema: "https://vega.github.io/schema/vega-lite/v5.json",

//   width: 1000,
//   height: 550,

//   background: "#2b2b2b",

//   config: {
//     style: {
//       "guide-label": { fill: "white" },
//       "guide-title": { fill: "white" }
//     },
//     axis: {
//       domainColor: "white",
//       tickColor: "white",
//       gridColor: "#555",
//       labelColor: "white",
//       titleColor: "white"
//     },
//     legend: {
//       labelColor: "white",
//       titleColor: "white"
//     }
//   },

//   data: {
//     values: data
//   },

//   transform: [
//     { sort: [{ field: "Gen" }] },
//     {
//       window: [
//         {
//           op: "lag",
//           field: "Count",
//           as: "prevCount"
//         }
//       ]
//     },
//     {
//       calculate: "isValid(datum.prevCount) ? datum.Count - datum.prevCount : 0",
//       as: "increase"
//     }
//   ],

//   mark: {
//     type: "line",
//     stroke: "red",
//     strokeWidth: 4,
//     point: {
//       size: 140,
//       filled: true,
//       fill: "red",
//       stroke: "white",
//       strokeWidth: 1.5
//     }
//   },

//   encoding: {
//     x: {
//       field: "Gen",
//       type: "ordinal",
//       title: "Generation",
//       axis: {
//         labelExpr: "'Gen ' + datum.value",
//         labelAngle: -45,
//         labelPadding: 10,
//         grid: true,
//         gridColor: "#555",
//         gridOpacity: 0.3
//       }
//     },

//     y: {
//       field: "Count",
//       type: "quantitative",
//       title: "Amount of Pokémon",
//       axis: {
//         grid: true,
//         gridColor: "#555",
//         gridOpacity: 0.3
//       }
//     },

//     tooltip: [
//       { field: "Gen", type: "ordinal", title: "Generation" },
//       { field: "Region", type: "nominal" },
//       { field: "Count", type: "quantitative", title: "Total Amount of Pokemon" },
//       { field: "increase", type: "quantitative", title: "Added # of Pokemon" }
//     ]
//   }
// };
/* ===================== */
/* START IN RESET STATE */
/* ===================== */
/* ===================== */
/* START IN RESET STATE */
/* ===================== */

let selected = {
  Mega: false,
  GMax: false,
  Alolan: false,
  Hisuian: false
};

/* ===================== */
/* STACK ORDER */
/* ===================== */

const stackOrder = {
  Base: 0,
  Mega: 1,
  GMax: 2,
  Alolan: 3,
  Hisuian: 4
};

/* ===================== */
/* DATA */
/* ===================== */

const base = [
  { Gen: 1, Type: "Base", Count: 151 },
  { Gen: 2, Type: "Base", Count: 100 },
  { Gen: 3, Type: "Base", Count: 135 },
  { Gen: 4, Type: "Base", Count: 107 },
  { Gen: 5, Type: "Base", Count: 156 },
  { Gen: 6, Type: "Base", Count: 72 },
  { Gen: 7, Type: "Base", Count: 88 },
  { Gen: 8, Type: "Base", Count: 96 },
  { Gen: 9, Type: "Base", Count: 120 }
];

const mega = [
  { Gen: 1, Type: "Mega", Count: 21 },
  { Gen: 2, Type: "Mega", Count: 10 },
  { Gen: 3, Type: "Mega", Count: 22 },
  { Gen: 4, Type: "Mega", Count: 12 },
  { Gen: 5, Type: "Mega", Count: 8 },
  { Gen: 6, Type: "Mega", Count: 12 },
  { Gen: 7, Type: "Mega", Count: 6 },
  { Gen: 8, Type: "Mega", Count: 1 },
  { Gen: 9, Type: "Mega", Count: 6 }
];

const gmax = [
  { Gen: 1, Type: "GMax", Count: 12 },
  { Gen: 2, Type: "GMax", Count: 0 },
  { Gen: 3, Type: "GMax", Count: 0 },
  { Gen: 4, Type: "GMax", Count: 0 },
  { Gen: 5, Type: "GMax", Count: 1 },
  { Gen: 6, Type: "GMax", Count: 0 },
  { Gen: 7, Type: "GMax", Count: 1 },
  { Gen: 8, Type: "GMax", Count: 20 },
  { Gen: 9, Type: "GMax", Count: 0 }
];

const alolan = [
  { Gen: 1, Type: "Alolan", Count: 36 },
  { Gen: 2, Type: "Alolan", Count: 0 },
  { Gen: 3, Type: "Alolan", Count: 0 },
  { Gen: 4, Type: "Alolan", Count: 0 },
  { Gen: 5, Type: "Alolan", Count: 0 },
  { Gen: 6, Type: "Alolan", Count: 0 },
  { Gen: 7, Type: "Alolan", Count: 0 },
  { Gen: 8, Type: "Alolan", Count: 0 },
  { Gen: 9, Type: "Alolan", Count: 0 }
];

const hisuian = [
  { Gen: 1, Type: "Hisuian", Count: 4 },
  { Gen: 2, Type: "Hisuian", Count: 3 },
  { Gen: 3, Type: "Hisuian", Count: 0 },
  { Gen: 4, Type: "Hisuian", Count: 2 },
  { Gen: 5, Type: "Hisuian", Count: 5 },
  { Gen: 6, Type: "Hisuian", Count: 3 },
  { Gen: 7, Type: "Hisuian", Count: 1 },
  { Gen: 8, Type: "Hisuian", Count: 9 },
  { Gen: 9, Type: "Hisuian", Count: 0 }
];

/* ===================== */
/* HELPERS */
/* ===================== */

function addRank(arr, type) {
  return arr.map(d => ({
    ...d,
    Rank: stackOrder[type]
  }));
}

function buildData() {
  let data = [...addRank(base, "Base")];

  if (selected.Mega) data = data.concat(addRank(mega, "Mega"));
  if (selected.GMax) data = data.concat(addRank(gmax, "GMax"));
  if (selected.Alolan) data = data.concat(addRank(alolan, "Alolan"));
  if (selected.Hisuian) data = data.concat(addRank(hisuian, "Hisuian"));

  return data;
}

function getTotals(data) {
  const totals = {};
  data.forEach(d => {
    totals[d.Gen] = (totals[d.Gen] || 0) + d.Count;
  });

  return Object.keys(totals).map(g => ({
    Gen: +g,
    Total: totals[g]
  }));
}

function getBreakdown(gen, data) {
  return data
    .filter(d => d.Gen === gen)
    .map(d => `${d.Type}: ${d.Count}`)
    .join("\n");
}

/* ===================== */
/* RENDER */
/* ===================== */

function render() {

  const data = buildData();
  const totals = getTotals(data);

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",

    width: 850,
    height: 500,

    config: {
      background: "#1e1e1e",
      axis: {
        labelColor: "white",
        titleColor: "white",
        domainColor: "white",
        tickColor: "white",
        grid: true,
        gridColor: "#444",
        gridOpacity: 0.3
      },
      legend: {
      labelColor: "white",
       titleColor: "white"
    }
    },

    layer: [
      {
        data: { values: data },
        mark: "bar",

        encoding: {
          x: {
            field: "Gen",
            type: "ordinal",
            axis: {
              labelExpr: "'Gen ' + datum.value",
              labelAngle: -45,
              grid: false
            }
            
          },

          y: {
            field: "Count",
            type: "quantitative",
            stack: "zero"
          },

          color: {
            field: "Type",
            type: "nominal",
            scale: {
              domain: ["Base", "Mega", "GMax", "Alolan", "Hisuian"],
              range: [
                "#4ea8ff",
                "#2f7bff",
                "#1f4fff",
                "#173bdb",
                "#0b1a66"
              ]
            }
          },

          order: {
            field: "Rank",
            type: "quantitative"
          }
        }
      },

      {
        data: { values: totals },
        mark: {
          type: "text",
          dy: -8,
          color: "white"
        },
        encoding: {
          x: { field: "Gen", type: "ordinal" },
          y: { field: "Total", type: "quantitative" },
          text: { field: "Total" }
        }
      }
    ]
  };

  vegaEmbed("#vis", spec, { actions: false }).then(result => {
    result.view.addEventListener("click", function (event, item) {
      if (!item || !item.datum) return;
      alert("Gen " + item.datum.Gen + "\n\n" + getBreakdown(item.datum.Gen, data));
    });
  });
}

/* ===================== */
/* BUTTON LOGIC */
/* ===================== */

function toggle(type) {
  selected[type] = !selected[type];

  const btn = document.getElementById("btn" + type);

  if (selected[type]) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }

  render();
}
render();
function resetChart() {
  selected = {
    Mega: false,
    GMax: false,
    Alolan: false,
    Hisuian: false
  };

  ["Mega", "GMax", "Alolan", "Hisuian"].forEach(t => {
    document.getElementById("btn" + t).classList.remove("active");
  });

  render();
}

/* INIT */

vegaEmbed("#vis", spec, { actions: true });

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