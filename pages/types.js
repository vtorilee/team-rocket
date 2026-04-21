const width = 800;
const radius = width / 8;
let currentRoot;
let path;
let arc;

const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", [-width / 2, -width / 2, width, width]);

const tooltip = d3.select("#tooltip");

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  none: "#999999"
};

const typeMap = {};
const spriteCache = {};

const fallbackSprite =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

function formatNameForAPI(name) {
  return name
    .toLowerCase()
    .replace(/\. /g, "-")
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/ /g, "-")
}


async function getSprite(name) {
  const key = formatNameForAPI(name);

  if (spriteCache[key]) return spriteCache[key];

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
    const data = await res.json();

    const sprite =
      data.sprites.front_default ||
      data.sprites.other?.["official-artwork"]?.front_default ||
      fallbackSprite;

    spriteCache[key] = sprite;
    return sprite;

  } catch {
    spriteCache[key] = fallbackSprite;
    return fallbackSprite;
  }
}

d3.csv("../datasets/Pokemon_Types.csv").then(data => {

  data.forEach(d => {
    const type1 = (d.type1 || "none").toLowerCase();
    const type2 = (d.type2 || "none").toLowerCase();

    if (!typeMap[type1]) typeMap[type1] = {};
    if (!typeMap[type1][type2]) {
      typeMap[type1][type2] = {
        pokemon: []
      };
    }

    typeMap[type1][type2].pokemon.push(d.name);
  });

  render();
  const legendData = Object.keys(typeColors);


const cols = 6; 
const boxSize = 14;
const spacingX = 110;
const spacingY = 25;


const legendWidth = (cols - 1) * spacingX;
const startX = -legendWidth / 2;
const startY = radius + 230;

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
    .attr("y", boxSize - 2)
    .text(capitalize(type))
    .attr("fill", "white")
    .style("font-size", "12px")
    .style("alignment-baseline", "middle");
});
});

function buildHierarchy() {
  return {
    name: "pokemon",
    children: Object.entries(typeMap).map(([type1, second]) => ({
      name: type1,
      children: Object.entries(second).map(([type2, obj]) => ({
        name: type2,
        children: obj.pokemon.map(p => ({
          name: p,
          value: 1
        }))
      }))
    }))
  };
}

function render() {

  const root = d3.hierarchy(buildHierarchy())
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);
    currentRoot = root;

  const partition = d3.partition()
    .size([2 * Math.PI, root.height + 1]);

  partition(root);

   arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => d.y1 * radius);

  svg.selectAll("*").remove();

  path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth <= 2))
    .join("path")
    .attr("fill", d => {
      if (d.depth === 1) return typeColors[d.data.name] || "#999";
      if (d.depth === 2) return typeColors[d.parent.data.name] || "#666";
      if (d.depth === 3) return typeColors[d.parent.parent.data.name] || "#444";
    })
    .attr("stroke", "#111")
    .attr("d", arc)
    .style("cursor", "pointer")
    .on("click", clicked)
    .on("mouseover", async (event, d) => {

      let pokemonList = [];

      if (d.depth === 2) {
        pokemonList = d.children.map(c => c.data.name);
      } else if (d.depth === 1) {
        pokemonList = d.children.flatMap(c =>
          c.children.map(p => p.data.name)
        );
      } else if (d.depth === 3) {
        pokemonList = [d.data.name];
      }

      const firstPokemon = pokemonList[0];

      const spriteURL = firstPokemon
        ? await getSprite(firstPokemon)
        : null;

      tooltip
        .style("opacity", 1)
        .style("display", "block")
        .html(`
          <div class="tooltip-card">
            
            ${spriteURL ? `<img src="${spriteURL}" class="tooltip-sprite" />` : ""}

            <div class="tooltip-text">
              <div class="tooltip-title">${capitalize(d.data.name)}</div>
              <div class="tooltip-sub">
                ${pokemonList.slice(0, 10).join(", ")}
                ${pokemonList.length > 10 ? "..." : ""}
              </div>
            </div>

          </div>
        `);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY + 12) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");

      svg.selectAll(".center-hit").remove();

svg.append("circle")
  .attr("class", "center-hit")
  .attr("r", radius * 1.2)
  .attr("fill", "transparent")
  .style("pointer-events", "all")
  .style("cursor", "pointer")

  .on("mouseover", (event) => {
    tooltip
      .style("display", "block")
      .html(`
        <div class="tooltip-card">
          <div class="tooltip-text">
            <div class="tooltip-title">Return to Full View</div>
            <div class="tooltip-sub">
            </div>
          </div>
        </div>
      `);
  })

  .on("mousemove", (event) => {
    tooltip
      .style("left", (event.pageX + 12) + "px")
      .style("top", (event.pageY + 12) + "px");
  })

  .on("mouseout", () => {
    tooltip.style("display", "none");
  })

  .on("click", zoomToRoot);
    });

function clicked(event, p) {

  
  const label = p.depth === 0
    ? "All Types"
    : capitalize(p.data.name);

  d3.select("#currentType")
    .text("Type: " + label);

  const transition = svg.transition().duration(750);

  currentRoot.each(d => {
    d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    };
  });

  path.transition(transition)
    .tween("data", d => {
      const i = d3.interpolate(d.current || d, d.target);
      d.current = i(1);
      return t => d.current = i(t);
    })
    .attrTween("d", d => () => arc(d.current))
    .attr("opacity", d => d.y1 <= 3 ? 1 : 0);
}

}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function zoomToRoot() {

  
  d3.select("#currentType")
    .text("Type: All Types");

  const transition = svg.transition().duration(750);

  currentRoot.each(d => {
    d.target = {
      x0: d.x0,
      x1: d.x1,
      y0: d.y0,
      y1: d.y1
    };
  });

  path.transition(transition)
    .tween("data", d => {
      const i = d3.interpolate(d.current || d, d.target);
      d.current = i(1);
      return t => d.current = i(t);
    })
    .attrTween("d", d => () => arc(d.current))
    .attr("opacity", 1);
}

function sendHeight() {
  const height = document.body.scrollHeight;

  window.parent.postMessage({
    type: "setHeight",
    height: height-100
  }, "*");
}

window.addEventListener("load", sendHeight);
window.addEventListener("resize", sendHeight);

function sendHeight() {
  const height = document.body.scrollHeight;

  window.parent.postMessage({
    type: "setHeight",
    height: height
  }, "*");
}