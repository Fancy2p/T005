const donutSvg = d3.select("#donut-chart");
const donutStatus = d3.select("#donut-status");
const donutLegend = d3.select("#donut-legend");
const donutColors = ["#157866", "#dd684e", "#bacb48", "#4f88a5"];

d3.csv("Ex5/Ex5_TV_energy_Allsizes_byScreenType.csv", d3.autoType).then((rows) => {
    const valueKey = "Mean(Labelled energy consumption (kWh/year))";
    const data = rows.filter((row) => Number.isFinite(row[valueKey]));
    const color = d3.scaleOrdinal(data.map((row) => row.Screen_Tech), donutColors);
    const pie = d3.pie().sort(null).value((row) => row[valueKey]);
    const arc = d3.arc().innerRadius(57).outerRadius(99).cornerRadius(3);

    function render() {
        const width = Math.max(280, donutSvg.node().parentElement.clientWidth - 34);
        const height = 250;
        const radius = Math.min(99, height * 0.4, width * 0.38);
        arc.innerRadius(radius * 0.58).outerRadius(radius);
        donutSvg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height).selectAll("*").remove();
        const group = donutSvg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
        const slices = pie(data);
        group.selectAll("path")
            .data(slices)
            .join("path")
            .attr("d", arc)
            .attr("fill", (slice) => color(slice.data.Screen_Tech))
            .attr("stroke", "#fbfcf8")
            .attr("stroke-width", 3)
            .append("title")
            .text((slice) => `${slice.data.Screen_Tech}: ${d3.format(",.1f")(slice.data[valueKey])} kWh/year average`);
        group.append("text").attr("text-anchor", "middle").attr("y", -2).attr("fill", "#202e2b").attr("font-size", 20).attr("font-weight", 700).text(`${data.length}`);
        group.append("text").attr("text-anchor", "middle").attr("y", 16).attr("fill", "#66736e").attr("font-size", 9).text("TECH TYPES");
    }

    const total = d3.sum(data, (row) => row[valueKey]);
    donutLegend.selectAll(".legend-item")
        .data(data)
        .join("div")
        .attr("class", "legend-item")
        .html((row) => `<span class="legend-swatch" style="background:${color(row.Screen_Tech)}"></span><span><span class="legend-name">${row.Screen_Tech}</span><span class="legend-value">${d3.format(",.0f")(row[valueKey])} kWh/year · ${d3.format(".0%")(row[valueKey] / total)}</span></span>`);

    render();
    new ResizeObserver(render).observe(donutSvg.node().parentElement);
    donutStatus.text("Slice proportions compare the supplied mean values; they are not market-share estimates.");
}).catch((error) => {
    donutStatus.text(`Could not load all-size averages: ${error.message}`);
});