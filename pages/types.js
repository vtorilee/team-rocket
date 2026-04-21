const width = 800;
const radius = width / 10; 
let currentRoot;
let path;
let arc;

const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", [-width / 2, -width / 2 + 100, width, width - 50])
  .attr("width", "100%")  
  .attr("height", "100%");

const tooltip = d3.select("#tooltip");

const typeColors = {
  // colour typing
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC", none: "#999999"
};

const typeMap = {};
const spriteCache = {};
const fallbackSprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

function formatNameForAPI(name) {
  let lowerName = name.toLowerCase().trim();

  // 1. specific form/gender fixes for API compatibility
  const specialCases = {
    "shaymin": "shaymin-land",
    "type: null": "type-null",
    "oinkologne": "oinkologne-male",
    "maushold": "maushold-family-of-four",
    "basculin": "basculin-red-striped",
    "lycanroc": "lycanroc-midday",
    "wishiwashi": "wishiwashi-solo",
    "minior": "minior-red-meteor",
    "toxtricity": "toxtricity-amped",
    "eiscue": "eiscue-ice",
    "indeedee": "indeedee-male",
    "morpeko": "morpeko-full-belly",
    "urshifu": "urshifu-single-strike",
    "basculegion": "basculegion-male",
    "enamorus": "enamorus-incarnate",
    "dudunsparce": "dudunsparce-two-segment",
    "palafin": "palafin-zero",
    "tatsugiri": "tatsugiri-curly",
    "gimmighoul": "gimmighoul-chest",
    "gourgeist": "gourgeist-average",
    "pumpkaboo": "pumpkaboo-average",
    "keldeo" : "keldeo-ordinary",
    "meowstic" :"meowstic-female",
    "deoxys": "deoxys-normal",
    "wormadam": "wormadam-plant",
    "darmanitan" : "darmanitan-standard",
    "tornadus": "tornadus-incarnate",
    "thundurus": "thundurus-incarnate",
    "landorus": "landorus-incarnate",
    "meloetta": "meloetta-aria",
    "aegislash": "aegislash-blade",
    "zygarde" : "zygarde-50",
    "oricorio": "oricorio-baile",
    "mimikyu": "mimikyu-disguised",
    "squawkabilly": "squawkabilly-blue",
  };

  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }

  // 2. name cleaning
  return lowerName
    .replace(/\(female\)/g, "-f")
    .replace(/\(male\)/g, "-m")
    .replace(/\. /g, "-")   // e.g., Mr. Mime -> mr-mime
    .replace(/:/g, "")      // remove colons
    .replace(/\./g, "")     // remove periods
    .replace(/'/g, "")      // e.g., Farfetch'd -> farfetchd
    .replace(/\s+/g, "-")   // spaces to dashes
    .replace(/♀/g, "-f")    // handle Nidoran female symbol if present
    .replace(/♂/g, "-m");   // handle Nidoran male symbol if present
}

// fetch sprites from PokeAPI
async function getSprite(name) {
  const key = formatNameForAPI(name);
  if (spriteCache[key]) return spriteCache[key];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
    const data = await res.json();
    const sprite = data.sprites.front_default || data.sprites.other?.["official-artwork"]?.front_default || fallbackSprite;
    spriteCache[key] = sprite;
    return sprite;
  } catch {
    spriteCache[key] = fallbackSprite;
    return fallbackSprite;
  }
}

// load and process data
d3.csv("../datasets/Pokemon_Types.csv").then(data => {
  data.forEach(d => {
    const type1 = (d.type1 || "none").toLowerCase();
    const type2 = (d.type2 || "none").toLowerCase();
    if (!typeMap[type1]) typeMap[type1] = {};
    if (!typeMap[type1][type2]) typeMap[type1][type2] = { pokemon: [] };
    typeMap[type1][type2].pokemon.push(d.name);
  });
  render();
});

// legend data
function drawLegend() {
  const legendData = Object.keys(typeColors);
  const cols = 6; 
  const boxSize = 14;
  const spacingX = 110;
  const spacingY = 25;

  const legendWidth = (cols - 1) * spacingX;
  const startX = -legendWidth / 2;
  const startY = (3 * radius) + 50;

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${startX}, ${startY})`);

  legendData.forEach((type, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const g = legend.append("g")
      .attr("transform", `translate(${col * spacingX}, ${row * spacingY})`);

    g.append("rect")
      .attr("width", boxSize)
      .attr("height", boxSize)
      .attr("fill", typeColors[type] || "#999");

    g.append("text")
      .attr("x", boxSize + 8)
      .attr("y", boxSize / 2) // Centered vertically relative to box
      .text(capitalize(type))
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("alignment-baseline", "middle");
  });
}

// build hierarchical data structure for D3
function buildHierarchy() {
  return {
    name: "pokemon",
    children: Object.entries(typeMap).map(([type1, second]) => ({
      name: type1,
      children: Object.entries(second).map(([type2, obj]) => ({
        name: type2,
        children: obj.pokemon.map(p => ({ name: p, value: 1 }))
      }))
    }))
  };
}

// render the sunburst chart
function render() {
  const root = d3.hierarchy(buildHierarchy())
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);
  
  currentRoot = root;

  const partition = d3.partition().size([2 * Math.PI, root.height + 1]);
  partition(root);

  arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => d.y1 * radius - 1);

  // Clears the SVG
  svg.selectAll("*").remove();

  // Re-draw the legend
  drawLegend();

  // Create paths for ALL levels
  path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth > 0))
    .join("path")
    .attr("fill", d => {
      if (d.depth === 1) return typeColors[d.data.name] || "#999";
      if (d.depth === 2) return typeColors[d.data.name] === "none" ? typeColors[d.parent.data.name] : (typeColors[d.data.name] || "#777");
      return typeColors[d.parent.parent.data.name] || "#555";
    })
    .attr("fill-opacity", d => d.depth === 3 ? 0.6 : 1)
    .attr("stroke", "#fff")
    .attr("stroke-width", "0.5px")
    .attr("d", arc)
    .style("cursor", "pointer")
    .style("visibility", d => d.depth <= 2 ? "visible" : "hidden")
    .on("click", clicked)
    .on("mouseover", handleMouseOver)
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY + 15) + "px");
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  // Center button
  svg.append("circle")
    .attr("r", radius)
    .attr("fill", "white")
    .style("cursor", "pointer")
    .on("click", (event) => clicked(event, root))
    .on("mouseover", () => {
        tooltip.style("display", "block").html("<b>Center:</b> Click to zoom out");
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  setTimeout(() => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({
      type: "setHeight",
      height: height
    }, "*");
  }, 500); 
}

// tooltip content based on hovered segment
async function handleMouseOver(event, d) {
  let pokemonList = [];
  let title = capitalize(d.data.name);

  if (d.depth === 1) {
    pokemonList = d.children.flatMap(c => c.children.map(p => p.data.name));
  } else if (d.depth === 2) {
    pokemonList = d.children.map(c => c.data.name);
    title = `${capitalize(d.parent.data.name)} / ${capitalize(d.data.name)}`;
  } else {
    pokemonList = [d.data.name];
  }

  const spriteURL = await getSprite(pokemonList[0]);
  tooltip.style("display", "block")
    .html(`
      <div class="tooltip-card">
        ${spriteURL ? `<img src="${spriteURL}" style="width:60px;height:60px;display:block;margin:0 auto;"/>` : ""}
        <div style="text-align:center">
          <strong>${title}</strong><br/>
          <small>${pokemonList.slice(0, 5).join(", ")}${pokemonList.length > 5 ? "..." : ""}</small>
        </div>
      </div>
    `);
}

function clicked(event, p) {
  const transition = svg.transition().duration(750);

  // transition the "target" coordinates
  currentRoot.each(d => {
    d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    };
  });

  d3.select("#currentType").text("Viewing: " + (p.depth === 0 ? "All Types" : capitalize(p.data.name)));

  path.transition(transition)
    .tween("data", d => {
      const i = d3.interpolate(d.current || d, d.target);
      return t => d.current = i(t);
    })
    .attrTween("d", d => () => arc(d.current))
    .attr("fill-opacity", d => (d.target.y1 > 0 ? 1 : 0))
    .style("visibility", d => {
      // if viewing the whole chart, show the first two rings
      if (p.depth === 0) return (d.depth > 0 && d.depth <= 2) ? "visible" : "hidden";
      // if zoomed in, show the focused ring and its immediate children
      return (d.target.y0 >= 0 && d.target.y0 < 2) ? "visible" : "hidden";
    });
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}