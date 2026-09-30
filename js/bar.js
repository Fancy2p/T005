const barSvg = d3.select("#bar-chart");
const barStatus = d3.select("#bar-status");

d3.csv("Ex5/Ex5_TV_energy_55inchtv_byScreenType.csv", d3.autoType).then((rows) => {
    const valueKey = "Mean(Labelled energy consumption (kWh/year))";
    const data = rows.filter((row) => Number.isFinite(row[valueKey]));
    const colors = d3.scaleOrdinal(data.map((row) => row.Screen_Tech), ["#157866", "#4f88a5", "#dd684e"]);

    function render() {
        const width = Math.max(300, barSvg.node().parentElement.clientWidth - 34);
        const height = 260;
        const margin = { top: 12, right: 58, bottom: 35, left: 86 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const x = d3.scaleLinear().domain([0, d3.max(data, (row) => row[valueKey]) * 1.22]).nice().range([0, plotWidth]);
        const y = d3.scaleBand().domain(data.map((row) => row.Screen_Tech)).range([0, plotHeight]).padding(0.36);

        barSvg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height).selectAll("*").remove();
        const plot = barSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        plot.append("g").attr("class", "grid").call(d3.axisBottom(x).ticks(5).tickSize(plotHeight).tickFormat(""));
        plot.append("g").attr("class", "axis").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(x).ticks(5));
        plot.append("g").attr("class", "axis").call(d3.axisLeft(y).tickSize(0).tickPadding(10));
        plot.selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", (row) => y(row.Screen_Tech))
            .attr("width", (row) => x(row[valueKey]))
            .attr("height", y.bandwidth())
            .attr("rx", 3)
            .attr("fill", (row) => colors(row.Screen_Tech))
            .append("title")
            .text((row) => `${row.Screen_Tech}: ${d3.format(",.1f")(row[valueKey])} kWh/year`);
        plot.selectAll(".value-label")
            .data(data)
            .join("text")
            .attr("class", "value-label")
            .attr("x", (row) => x(row[valueKey]) + 7)
            .attr("y", (row) => y(row.Screen_Tech) + y.bandwidth() / 2 + 3.5)
            .text((row) => d3.format(",.0f")(row[valueKey]));
        plot.append("text").attr("class", "axis-label").attr("x", plotWidth / 2).attr("y", plotHeight + 32).attr("text-anchor", "middle").text("Mean energy consumption (kWh/year)");
    }

    render();
    new ResizeObserver(render).observe(barSvg.node().parentElement);
    barStatus.text(`${data.length} screen technologies · mean labelled consumption for 55-inch TVs`);
}).catch((error) => {
    barStatus.text(`Could not load 55-inch averages: ${error.message}`);
});