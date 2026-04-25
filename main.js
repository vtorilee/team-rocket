import { initSidebar } from "./sidebar.js"; // Adjust path as needed
initSidebar();

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function drawStartup(group) {
  const speechBubble = group.append("g");

  speechBubble
    .append("image")
    .attr("href", "./assets/3-speech-bubble.png")
    .attr("x", -240)
    .attr("y", -280)
    .attr("transform", "scale(1.05,0.73)");

  const introSpeech = [
    "Team Rocket 2.0 here!",
    "Happy 30th Anni! The Pokéworld is so vast...",
    "Let's explore it through data!",
  ];

  function drawSpeechText() {
    const textGroup = group.append("g").attr("class", "dialogue-layer");
    let currentLine = 0;

    //y-pos offsets for each text line
    const yOffsets = [-155, -30, 85];
    const xOffsets = [150, 230, 180];

    function playNext() {
      if (currentLine >= introSpeech.length) return;
      const line = textGroup
        .append("text")
        .attr("class", "team-rocket-speech")
        .attr("x", -30)
        .attr("y", yOffsets[currentLine])
        .text(introSpeech[currentLine]);

      line.transition().duration(500).style("opacity", 1);

      textGroup.selectAll(".speech-button-group").remove();

      const playButtons = textGroup
        .append("g")
        .attr("class", "speech-button-group")
        .attr(
          "transform",
          `translate(${xOffsets[currentLine]}, ${yOffsets[currentLine]})`,
        )
        .style("cursor", "pointer")
        .style("opacity", 0);

      playButtons
        .append("circle")
        .attr("fill", currentLine === 2 ? "#651712" : "#2c5b9a");

      playButtons
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#fff")
        .style("font-size", "12px")
        .text(currentLine === 2 ? "GO!" : "▶");

      playButtons.transition().delay(600).duration(300).style("opacity", 1);

      playButtons.on("click", () => {
        if (currentLine < 2) {
          currentLine++;
          playNext();
        } else {
          drawHomepage(layoutContainer, true);
        }
      });
    }

    function launchProject() {
      console.log("Blast off at the speed of light!");
      // Add your transition to the map or next screen here
      d3.select("#startup-overlay")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();
    }

    // Start the first line
    playNext();
  }

  drawSpeechText();

  const teamIcons = group.append("g").attr("transform", `translate(0, 175)`);
  teamIcons
    .append("image")
    .attr("href", "./assets/icons/zorua-shuffle.png")
    .attr("x", -62.5 - 130)
    .attr("y", -62.5 + 80)
    .attr("width", 125)
    .attr("height", 125);

  teamIcons
    .append("image")
    .attr("href", "./assets/icons/pachirisu-shuffle.png")
    .attr("x", -62.5)
    .attr("y", -62.5 + 80)
    .attr("width", 150)
    .attr("height", 150);

  teamIcons
    .append("image")
    .attr("href", "./assets/icons/lucario-shuffle.png")
    .attr("x", -62.5 + 145)
    .attr("y", -62.5 + 85)
    .attr("width", 120)
    .attr("height", 120);
}

function drawIntro(group) {
  //meowth section
  const meowth = group
    .append("image")
    .attr("href", "./assets/meowth.png")
    .attr("x", -500)
    .attr("y", -105)
    .attr("width", 500);

  //intro speech section
  const meowthSpeech = [
    "Hiya! It's Meowth, and I'll be your host today!",
    "Ever wondered how much the Pokédex has grown?",
    "How the nine different generations compare?",
    "...How about how beloved your favourite starter is!?",
    "Answer those questions with me here on PokéScope!",
  ];

  const speechBubble = group
    .append("image")
    .attr("href", "./assets/speech-bubble.png")
    .attr("x", -185)
    .attr("y", -235)
    .attr("transform", "scale(1.2, 0.75)");

  const textLayer = group.append("g").attr("class", "meowth-intro-layer");

  function playIntroSequence() {
    let currentLine = 0;

    function playNext() {
      textLayer.selectAll(".meowth-intro-text").remove();

      const text = textLayer
        .append("foreignObject")
        .attr("class", "meowth-intro-text")
        .attr("x", -190)
        .attr("y", -147)
        .attr("width", 395)
        .attr("height", 90);

      text.append("xhtml:div").html(meowthSpeech[currentLine]);

      //fade in-out sequence animation

      let transition = text.transition().duration(500).style("opacity", 1);
      // do not fade out last line
      if (currentLine < meowthSpeech.length - 1) {
        transition.transition().delay(1500).duration(300).style("opacity", 0);
      }

      currentLine++;

      if (currentLine < meowthSpeech.length) {
        //line after 2 seconds (total)
        d3.timeout(playNext, 2300);
      } else {
        // after speech sequence, show body text
        d3.timeout(displayProjectStatement, 1000);
      }
    }
    //recursive call, precise triggering
    playNext();
  }

  function displayProjectStatement() {
    const text = group
      .append("foreignObject")
      .attr("x", -50)
      .attr("y", -10)
      .attr("width", 450)
      .attr("height", 300)
      .style("opacity", 0);

    text.append("xhtml:div").attr("class", "meowth-body-text").html(`
        
          The purpose of this project is to showcase the growth and longevity of the Pokémon franchise, and its world that we all know and love,
          through data visualizations.<br/>
          <br/>
          Dive in and discover patterns, investigate history, and maybe even learn a thing or two through charts, diagrams, and fun interactions!<br/>
          <br/>
          Whether you're a Pokémon veteran, a fledgling trainer, or just passing by, there's something here for you.
      `);

    text.transition().duration(800).style("opacity", 1);

    //
    d3.timeout(displayStartingButtons, 600);
  }

  function displayStartingButtons() {
    const buttonGroup = group
      .append("g")
      .attr("transform", "translate(-5, 250)")
      .style("opacity", 0);

    // Example Button
    const button1 = buttonGroup
      .append("g")
      .attr("class", "starting-button")
      .style("cursor", "pointer")
      .on("click", () => (window.location.href = "./pages/quiz/quiz.html"));

    button1
      .append("rect")
      .attr("width", 350)
      .attr("height", 50)
      .attr("stroke-width", 3);

    button1
      .append("text")
      .attr("x", 175)
      .attr("y", 30)
      .style("font-size", "16px")
      .text("Take the quiz for your Trainer Profile!");

    const button2 = buttonGroup
      .append("g")
      .attr("class", "starting-button")
      .style("cursor", "pointer")
      .on("click", () => (window.location.href = "./pages/map/map.html"));

    button2
      .append("rect")
      .attr("x", 40)
      .attr("y", 62.5)
      .attr("width", 275)
      .attr("height", 40)
      .attr("stroke-width", 2);

    button2
      .append("text")
      .attr("x", 177.5)
      .attr("y", 85.5)
      .style("font-size", "12px")
      .text("Explore the world map and timeline!");

    buttonGroup.transition().duration(500).style("opacity", 1);
  }

  playIntroSequence();
}

function drawHomepage(container, launchStatus = false) {
  const layoutWidth = 1200;
  const layoutHeight = 600;

  //reset
  container.select("svg").remove();

  //create homepage svg
  const homepageSVG = container
    .append("svg")
    .attr("viewBox", `0,0,${layoutWidth}, ${layoutHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("width", "100%")
    .style("height", "auto");

  const startupDisplay = homepageSVG
    .append("g")
    .attr("transform", `translate(600, 225)`);

  const introDisplay = homepageSVG
    .append("g")
    .attr("transform", `translate(600, 225)`);

  if (!launchStatus) {
    drawStartup(startupDisplay);
  } else {
    drawIntro(introDisplay);
  }
}

const layoutContainer = d3.select("#intro-container");

drawHomepage(layoutContainer);
