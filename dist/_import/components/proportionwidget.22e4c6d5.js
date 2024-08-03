import * as d3 from "../../_npm/d3@7.9.0/_esm.js";
export {proportionWidget};

function proportionWidget(options = {}) {
    const {
      width = 800,
      height = 100,
      color = (i) => "gray",
      minPart = 0.01
    } = options;
    let { parts = [0.1, 0.1, 0.3, 0.5], selected = 0 } = options;
    const minSize = minPart * width;
    const selectedCursorHeight = 15;
    const display = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height + selectedCursorHeight)
      .attr("class", "proportion");
    const theSvg = display.node();
    theSvg.value = { parts, selected };
    let size, start;
    const computeSizes = () => {
      let sum = parts.reduce((a, b) => a + b, 0);
      parts = parts.map((p) => p / sum);
      size = parts.map((p) => p * width);
      start = [0];
      for (let i = 1; i < size.length; i++) start[i] = start[i - 1] + size[i - 1];
    };
    computeSizes();
    const sizesToParts = () => {
      let sum = size.reduce((a, b) => a + b, 0);
      parts = size.map((s) => s / sum);
      computeSizes();
    };
    sizesToParts();
  
    const updateSelected = function (sel) {
      const x = size[selected] / 2 + start[selected];
      sel.attr("transform", `translate(${x},${height})`);
    };
    const h = selectedCursorHeight * 0.6;
    const m = selectedCursorHeight * 0.2;
    const selectedCursor = display
      .append("path")
      .attr("d", `M 0,${m} l${h},${h} l${-2 * h},0 Z`)
      .attr("fill", "white")
      .attr("stroke", "black")
      .call(updateSelected);
  
    const updateRects = function (sel) {
      sel
        .attr("x", (d, i) => start[i])
        .attr("width", (d, i) => size[i])
        .attr("height", height)
        .attr("fill", (d, i) => color(i))
        .attr("stroke", "white")
        .on("click", function (e, d) {
          selected = d;
          selectedCursor.call(updateSelected);
          theSvg.value = { parts, selected };
          theSvg.dispatchEvent(new CustomEvent("input"));
        });
    };
  
    const partRects = display
      .append("g")
      .attr("class", "parts")
      .selectAll("rect.part")
      .data(d3.range(parts.length))
      .join("rect")
      .call(updateRects);
  
      const updatePercentages = function (sel) {
        sel
          .attr("x", (d, i) => start[i] + size[i] / 2)
          .attr("y", height / 2 + 5)
          .attr("font-family", "arial")
          .attr("text-anchor", "middle")
          .style("user-select", "none")
          .text((d, i) => (parts[i] * 100).toFixed(0))
          .on("click", function (e, d) {
            selected = d;
            selectedCursor.call(updateSelected);
            theSvg.value = { parts, selected };
            theSvg.dispatchEvent(new CustomEvent("input"));
          });
      };
    
      const partPercentages = display
        .append("g")
        .attr("class", "percentages")
        .selectAll("text")
        .data(d3.range(parts.length))
        .join("text")
        .call(updatePercentages);
        
    const handleWidth = 10;
    const handleHeight = height * 0.5;
    const handleRadius = handleWidth / 2;
    const updateHandles = function (sel) {
      sel
        .attr("x", (i) => start[i + 1] - handleWidth / 2)
        .attr("y", height / 2 - handleHeight / 2)
        .attr("width", handleWidth)
        .attr("height", handleHeight)
        .attr("rx", handleRadius)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.1);
    };
    const drag = d3
      .drag()
      .on("start", function (e) {
        d3.select(this).classed("dragging", true);
      })
      .on("end", function (e) {
        d3.select(this).classed("dragging", false);
      })
      .on("drag", function (e) {
        const { dx, subject } = e;
        const i = subject;
        if (dx != 0) {
          const newSizei = size[i] + dx;
          const newSizej = size[i + 1] - dx;
          if (newSizei >= minSize && newSizej >= minSize) {
            size[i] = newSizei;
            size[i + 1] = newSizej;
            sizesToParts();
            update();
            theSvg.value = { parts, selected };
            theSvg.dispatchEvent(new CustomEvent("input"));
          }
        }
      });
    const partHandles = display
      .append("g")
      .attr("class", "handles")
      .selectAll("rect")
      .data(d3.range(parts.length - 1))
      .join("rect")
      .call(drag)
      .call(updateHandles);
  
    const update = function () {
      partRects.call(updateRects);
      partPercentages.call(updatePercentages);
      partHandles.call(updateHandles);
      selectedCursor.call(updateSelected);
    };
  
    theSvg.update = update;
  
    return theSvg;
  }