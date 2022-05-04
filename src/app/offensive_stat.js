import * as d3 from 'd3';

export function offensive() {

    const config = {
        height: 300,
        margin: {
            bottom: 50,
            left: 50,
            right: 50,
            top: 50
        },
        width: 500
    }
    const fullWidth = config.margin.left + config.width + config.margin.right;
    const fullHeight = config.margin.top + config.height + config.margin.bottom;

    const visContainer = d3.select("#offensive");
    const svg = visContainer.append('svg')
        .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid');
    const g = svg.append('g')
        .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);

    // Parse the Data
    d3.csv("../data/on-ice_data.csv").then(function (data) {

        const dataByPlayer = Object.fromEntries(d3.group(data, d => d.player))

        Object.keys(dataByPlayer).forEach(d => {
            let name = d.split(' ')
            dataByPlayer[d] = { "first": name[0], "last": name[1], "data": dataByPlayer[d] }
            dataByPlayer[d].data.forEach(d => { d["5v5 OGPs"] = parseInt(d["5v5 OGPs"]) })
        })

        let playerAlpha = Object.keys(dataByPlayer).sort((a, b) => d3.ascending(dataByPlayer[a].last, dataByPlayer[b].last))

        let playerData = dataByPlayer[playerAlpha[0]].data

        //INSÉRER L'INITIATION DES VIZ ICI

        const x = d3.scaleBand().domain(playerData.map(d => d.date)).range([0, config.width]).padding(0.1)

        const xAxis = d3.axisBottom(x).tickSizeOuter(0).tickValues(d3.range(x.domain().length - 1, 0, -10).map(i => x.domain()[i]))

        g.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0, ${config.height})`)
            .call(xAxis)

        const y = d3.scaleLinear()
            .domain([0, d3.max(playerData, d => d["5v5 OGPs"])])
            .range([config.height, 0]);

        const yAxis = d3.axisLeft(y)

        g.append("g").attr("class", "y-axis")
            .call(yAxis);

        g.selectAll("bars")
            .data(playerData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.date))
            .attr("y", d => y(d["5v5 OGPs"]))
            .attr("width", x.bandwidth())
            .attr("height", d => config.height - y(d["5v5 OGPs"]))
            .attr("fill", "#b1ded4")
            .attr("rx", x.bandwidth() / 8)
            .attr("ry", x.bandwidth() / 8)


        /*g.selectAll("circles")
            .data(playerData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.date) + x.bandwidth() / 2)
            .attr("cy", d => y(d["5v5 OGPs"]) - 10)
            .attr("r",10)
            .attr("fill", "#b1ded4")
            .attr("opacity", 0.2)*/

        g.selectAll("teamtag")
            .data(playerData)
            .enter()
            .append("text")
            .text(d => d.opponent)
            .attr("x", d => x(d.date) + x.bandwidth() / 2)
            .attr("y", d => y(d["5v5 OGPs"]) - 15)
            .attr("class", "teamtag")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "8px")

        //FONCTION UPDATE
        d3.select("#player-select").on("input.2", function () {
            
            update(this.value)

        })

        // A function that update the chart
        function update(selectedPlayer) {

            // Create new data with the selection?
            playerData = dataByPlayer[selectedPlayer].data

            x.domain(playerData.map(d => d.date))
            xAxis.tickValues(d3.range(x.domain().length - 1, 0, -10).map(i => x.domain()[i]))
            y.domain([0, d3.max(playerData, d => d["5v5 OGPs"])])

            g.select(".y-axis").transition().duration(1000).call(yAxis)
            g.select(".x-axis").transition().duration(1000).call(xAxis)

            var bars = g.selectAll("rect").remove()/*.data(playerData)
            bars.exit()
                .transition()
                .duration(1000)
                .attr("y", config.height).attr("height", 0)
            bars.enter().append("rect")*/
            g.selectAll("rect").data(playerData).enter().append("rect")
                .transition()
                .duration(1000)
                .attr("x", d => x(d.date))
                .attr("y", d => y(d["5v5 OGPs"]))
                .attr("width", x.bandwidth())
                .attr("height", d => config.height - y(d["5v5 OGPs"]))
                .attr("rx", x.bandwidth() / 8)
                .attr("ry", x.bandwidth() / 8)
                .attr("fill", "#b1ded4")

            var tags = g.selectAll(".teamtag").data(playerData)
            tags.exit()
                .transition()
                .duration(1000)
                .attr("opacity", 0)
            tags.enter().append("text")
            tags
                .transition()
                .duration(1000)
                .attr("x", d => x(d.date) + x.bandwidth() / 2)
                .attr("y", d => y(d["5v5 OGPs"]) - 10)
                .text(d => d.opponent)
                .attr("opacity", 1)
                .attr("class", "teamtag")
                .attr("text-anchor", "middle")

        }





    })

}