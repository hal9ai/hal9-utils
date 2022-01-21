const idGenerator = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return "a" + S4() + S4();
}

const hover = (tip, pos, text) => {
  const side_padding = 10;
  const vertical_padding = 5;
  const vertical_offset = 15;

  tip.selectAll("*").remove();

  tip
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("transform", `translate(${pos[0]}, ${pos[1] + 7})`)
    .selectAll("text")
    .data(text)
    .join("text")
    .style("dominant-baseline", "ideographic")
    .text((d) => d)
    .attr("y", (d, i) => (i - (text.length - 1)) * 15 - vertical_offset)
    .style("font-weight", (d, i) => (i === 0 ? "bold" : "normal"));

  const bbox = tip.node().getBBox();

  tip
    .append("rect")
    .attr("y", bbox.y - vertical_padding)
    .attr("x", bbox.x - side_padding)
    .attr("width", bbox.width + side_padding * 2)
    .attr("height", bbox.height + vertical_padding * 2)
    .style("fill", "white")
    .style("stroke", "#d3d3d3")
    .lower();
}

export const addTooltips = (chart, hover_styles = { fill: "blue", opacity: 0.5 }, d3) => {
  let styles = hover_styles;
  const line_styles = {
    stroke: "blue",
    "stroke-width": 3
  };
  
  const type = d3.select(chart).node().tagName;
  const wrapper =
    type === "FIGURE" ? d3.select(chart).select("svg") : d3.select(chart);

  wrapper.style("overflow", "visible");

  wrapper.selectAll("path").each(function (data, index, nodes) {
    if (
      d3.select(this).attr("fill") === null ||
      d3.select(this).attr("fill") === "none"
    ) {
      d3.select(this).style("pointer-events", "visibleStroke");
      styles = hover_styles.fill === "blue" &&  hover_styles.opacity === 0.5
        ? line_styles
        : hover_styles;
    }
  });

  const tip = wrapper
    .selectAll(".hover-tip")
    .data([""])
    .join("g")
    .attr("class", "hover")
    .style("pointer-events", "none")
    .style("text-anchor", "middle");

  const id = idGenerator();

  d3.select(chart)
    .classed(id, true)
    .selectAll("title")
    .each(function () {
      const title = d3.select(this);
      const parent = d3.select(this.parentNode);
      const t = title.text();
      if (t) {
        parent.attr("__title", t).classed("has-title", true);
        title.remove();
      }
      parent
        .on("mousemove", function (event) {
          const text = d3.select(this).attr("__title");
          const pointer = d3.pointer(event, wrapper.node());
          if (text) tip.call(hover, pointer, text.split("\n"));
          else tip.selectAll("*").remove();

          d3.select(this).raise();
          const tipSize = tip.node().getBBox();
          if (pointer[0] + tipSize.x < 0)
            tip.attr(
              "transform",
              `translate(${tipSize.width / 2}, ${pointer[1] + 7})`
            );
          else if (pointer[0] + tipSize.width / 2 > wrapper.attr("width"))
            tip.attr(
              "transform",
              `translate(${wrapper.attr("width") - tipSize.width / 2}, ${
                pointer[1] + 7
              })`
            );
        })
        .on("mouseout", function (event) {
          tip.selectAll("*").remove();
          d3.select(this).lower();
        });
    });

  wrapper.on("touchstart", () => tip.selectAll("*").remove());
  const style_string = Object.keys(styles)
    .map((d) => {
      return `${d}:${styles[d]};`;
    })
    .join("");


  const style = document.createElement('style');
  
  style.innerHTML = `
      .${id} .has-title {
       cursor: pointer; 
       pointer-events: all;
      }
      .${id} .has-title:hover {
        ${style_string}
    }
    </style>`;
  chart.appendChild(style);
  return chart;
}