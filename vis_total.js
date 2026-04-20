let selected = {
  base: true,
  mega: true,
  gmax: true,
  alola: true
};

/* ================= DATA ================= */

const base = [
  { Gen: 1, Count: 151 },
  { Gen: 2, Count: 100 },
  { Gen: 3, Count: 135 },
  { Gen: 4, Count: 107 },
  { Gen: 5, Count: 156 },
  { Gen: 6, Count: 72 },
  { Gen: 7, Count: 88 },
  { Gen: 8, Count: 96 },
  { Gen: 9, Count: 120 }
];

const mega = [
  { Gen: 1, Count: 152+21 },
  { Gen: 2, Count: 101+10 },
  { Gen: 3, Count: 136+22 },
  { Gen: 4, Count: 108+12 },
  { Gen: 5, Count: 157+8 },
  { Gen: 6, Count: 73+12 },
  { Gen: 7, Count: 89+6 },
  { Gen: 8, Count: 97+1 },
  { Gen: 9, Count: 121+6 }
];

const gmax = [
  { Gen: 1, Count: 153+12 },
  { Gen: 2, Count: 102 },
  { Gen: 3, Count: 137 },
  { Gen: 4, Count: 109 },
  { Gen: 5, Count: 158+1 },
  { Gen: 6, Count: 74 },
  { Gen: 7, Count: 90+1 },
  { Gen: 8, Count: 98+20 },
  { Gen: 9, Count: 122 }
];

const alola = [
  { Gen: 1, Count: 154+36 },
  { Gen: 2, Count: 103 },
  { Gen: 3, Count: 138 },
  { Gen: 4, Count: 110 },
  { Gen: 5, Count: 159 },
  { Gen: 6, Count: 75 },
  { Gen: 7, Count: 91 },
  { Gen: 8, Count: 99 },
  { Gen: 9, Count: 123 }
];

/* ================= DATA BUILDER ================= */

function buildData() {
  let data = [];

  if (selected.base) {
    data = data.concat(base.map(d => ({ ...d, Series: "Base" })));
  }

  if (selected.mega) {
    data = data.concat(mega.map(d => ({ ...d, Series: "Megas" })));
  }

  if (selected.gmax) {
    data = data.concat(gmax.map(d => ({ ...d, Series: "GMax" })));
  }

  if (selected.alola) {
    data = data.concat(alola.map(d => ({ ...d, Series: "Alola" })));
  }

  return data;
}

/* ================= RENDER ================= */

function render() {
  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",

    "width": 1000,
    "height": 450,

    "data": {
      "values": buildData()
    },

    "transform": [
      {
        "filter": "datum.Count > 60"
      }
    ],

    "mark": {
      "type": "line",
      "point": true
    },

    "encoding": {

      "x": {
        "field": "Gen",
        "type": "ordinal",
        "sort": "ascending",
        "title": "Generation",
        "axis": { "grid": true }
      },

      "y": {
  "field": "Count",
  "type": "quantitative",
  "title": "Pokémon Count",
  "scale": {
    "domainMin": 60
  },
  "axis": { "grid": true }
},

      "color": {
        "field": "Series",
        "type": "nominal",
        "scale": {
          "domain": ["Base", "Megas", "GMax", "Alola"],
          "range": ["steelblue", "hotpink", "gold", "green"]
        }
      },

      "tooltip": [
        { "field": "Gen" },
        { "field": "Series" },
        { "field": "Count" }
      ]
    }
  };

  vegaEmbed("#vis", spec);
}

/* ================= CONTROLS ================= */

function toggleSeries(name) {
  selected[name] = !selected[name];
  render();
}

function showAll() {
  selected = {
    base: true,
    mega: true,
    gmax: true,
    alola: true
  };
  render();
}

function hideAll() {
  selected = {
    base: false,
    mega: false,
    gmax: false,
    alola: false
  };
  render();
}

render();