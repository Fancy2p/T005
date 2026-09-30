const scatterSvg = d3.select("#scatter-chart");
const scatterStatus = d3.select("#scatter-status");

d3.csv("Ex5/Ex5_TV_energy.csv", d3.autoType).then((rows) => {
    const data = rows.filter((row) => Number.isFinite(row.energy_consumpt) && Number.isFinite(row.star2));
    const color = "#dd684e";

    function render() {
        const width = Math.max(300, scatterSvg.node().parentElement.clientWidth - 34);
        const height = 300;
        const margin = { top: 15, right: 17, bottom: 48, left: 54 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const xExtent = d3.extent(data, (row) => row.energy_consumpt);
        const yExtent = d3.extent(data, (row) => row.star2);
        const x = d3.scaleLinear().domain([Math.max(0, xExtent[0] - 15), xExtent[1] + 20]).nice().range([0, plotWidth]);
        const y = d3.scaleLinear().domain([Math.max(0, yExtent[0] - 0.3), yExtent[1] + 0.3]).nice().range([plotHeight, 0]);
        const radius = d3.scaleSqrt().domain([1, d3.max(data, (row) => row.count) || 1]).range([2.2, 7]);

        scatterSvg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height).selectAll("*").remove();
        const plot = scatterSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        plot.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth).tickFormat(""));
        plot.append("g").attr("class", "axis").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(x).ticks(5));
        plot.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5));
        plot.selectAll(".point")
            .data(data)
            .join("circle")
            .attr("class", "point")
            .attr("cx", (row) => x(row.energy_consumpt))
            .attr("cy", (row) => y(row.star2))
            .attr("r", (row) => radius(row.count || 1))
            .attr("fill", color)
            .attr("fill-opacity", 0.48)
            .attr("stroke", color)
            .attr("stroke-width", 0.6)
            .append("title")
            .text((row) => `${row.brand} · ${row.screen_tech}\n${row.energy_consumpt} kWh/year · ${row.star2} stars · ${row.count} TVs`);
        plot.append("text").attr("class", "axis-label").attr("x", plotWidth / 2).attr("y", plotHeight + 39).attr("text-anchor", "middle").text("Energy consumption (kWh/year)");
        plot.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("x", -plotHeight / 2).attr("y", -40).attr("text-anchor", "middle").text("Star rating");
    }

    render();
    new ResizeObserver(render).observe(scatterSvg.node().parentElement);
    scatterStatus.text(`${data.length} grouped TV listings · marker size reflects listing count`);
}).catch((error) => {
    scatterStatus.text(`Could not load TV data: ${error.message}`);
});