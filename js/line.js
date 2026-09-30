const lineSvg = d3.select("#line-chart");
const lineStatus = d3.select("#line-status");
const averageKey = "Average Price (notTas-Snowy)";

d3.csv("Ex5/Ex5_ARE_Spot_Prices.csv", d3.autoType).then((rows) => {
    const data = rows.filter((row) => Number.isFinite(row.Year) && Number.isFinite(row[averageKey]));

    function render() {
        const width = Math.max(300, lineSvg.node().parentElement.clientWidth - 34);
        const height = 300;
        const margin = { top: 15, right: 20, bottom: 42, left: 54 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const x = d3.scaleLinear().domain(d3.extent(data, (row) => row.Year)).range([0, plotWidth]);
        const y = d3.scaleLinear().domain([0, d3.max(data, (row) => row[averageKey]) * 1.12]).nice().range([plotHeight, 0]);
        const line = d3.line().x((row) => x(row.Year)).y((row) => y(row[averageKey])).curve(d3.curveMonotoneX);

        lineSvg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height).selectAll("*").remove();
        const plot = lineSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        plot.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth).tickFormat(""));
        plot.append("g").attr("class", "axis").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(x).ticks(Math.min(7, data.length)).tickFormat(d3.format("d")));
        plot.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat((value) => `$${value}`));
        plot.append("path").datum(data).attr("fill", "none").attr("stroke", "#4f88a5").attr("stroke-width", 3).attr("stroke-linecap", "round").attr("stroke-linejoin", "round").attr("d", line);
        plot.selectAll(".price-point")
            .data(data)
            .join("circle")
            .attr("class", "price-point")
            .attr("cx", (row) => x(row.Year))
            .attr("cy", (row) => y(row[averageKey]))
            .attr("r", 3)
            .attr("fill", "#fbfcf8")
            .attr("stroke", "#4f88a5")
            .attr("stroke-width", 2)
            .append("title")
            .text((row) => `${row.Year}: $${d3.format(",.1f")(row[averageKey])} / MWh`);
        plot.append("text").attr("class", "axis-label").attr("x", plotWidth / 2).attr("y", plotHeight + 37).attr("text-anchor", "middle").text("Year");
    }

    render();
    new ResizeObserver(render).observe(lineSvg.node().parentElement);
    lineStatus.text(`${data.length} annual averages · average price (excluding Tasmania and Snowy)`);
}).catch((error) => {
    lineStatus.text(`Could not load spot prices: ${error.message}`);
});