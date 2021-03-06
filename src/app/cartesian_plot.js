/**
 * File for functions specific to the cartesian plot
 */

import * as d3 from 'd3';
import * as d3hexbin from 'd3-hexbin';
import * as helper from './helper.js';



/** Gets the vald data for the whole team
 * 
 * @param {*} data 
 * @returns 
 */
export function getCompleteValdData(data) {

    let array = [];

    data.forEach(d => d.vald_data
        .filter(d => d.CONCENTRIC_IMPULSE != undefined & d.RSI_MODIFIED != undefined & d.RSI_MODIFIED < 500 & !isNaN(d.CONCENTRIC_IMPULSE) & !isNaN(d.RSI_MODIFIED))
        .forEach(d => array.push({
            'concentric_impulse': d.CONCENTRIC_IMPULSE,
            'rsi_mod': d.RSI_MODIFIED * 0.01 // conversion from cm/s to m/s
        })
        )
    )

    return array


}

/** Appends the x axis
 * 
 * @param {*} g 
 * @param {*} width 
 * @param {*} height 
 * @param {*} xLabel 
 * @returns 
 */
function appendXAxis(g, width, height, xLabel) {

    let x = d3.scaleLinear().range([0, width]);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5))
        .attr("class", "x-axis")
        .call(g => g.append("text")
            .attr("x", width)
            .attr("y", +35)
            .attr("text-anchor", "end")
            .attr('fill', 'currentColor')
            .attr('font-size', 12)
            .text(xLabel));

    return x;

}

/** Builds the cartesian plot elements and returns the parameters
 * 
 * @param {*} id 
 * @param {*} dim 
 * @param {*} xLabel 
 * @param {*} yLabel 
 * @returns 
 */
export function cartesianBuilder(id, dim, xLabel, yLabel) {

    var width = dim.fullWidth - dim.margin.left - dim.margin.right,
        height = dim.fullHeight - dim.margin.top - dim.margin.bottom;


    // append the svg object to the body of the page
    d3.select(id)
        .append("svg")
        .attr('viewBox', `0 0 ${dim.fullWidth} ${dim.fullHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid')
        .append("g")
        .attr("transform",
            "translate(" + dim.margin.left + "," + dim.margin.top + ")")
        .attr('id', 'container')

    let svg = d3.select(id).select("#container")

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr('y', -40)
        .attr("width", width)
        .attr("height", height + 40)

    let color = d3.scaleLinear().range(["transparent", "blue"]),
        hexbin = d3hexbin.hexbin().radius(10).extent([[0, 0], [width, height]])

    appendQuadrant(svg, height, width)
    appendLegend(svg, width, hexbin, color)

    return {
        'id': id,
        'svg': svg,
        'width': width,
        'height': height,
        'x': appendXAxis(svg, width, height, xLabel),
        'y': helper.appendYAxis(svg, height, dim.margin.left, yLabel),
        'color': color,
        'hexbin': hexbin
    }


}

/** Appends the legend
 * 
 * @param {*} g 
 * @param {*} width 
 * @param {*} hexbin 
 * @param {*} color 
 */
function appendLegend(g, width, hexbin, color) {

    let legend = g.append('g').attr('class', 'legend').attr('transform', 'translate(' + (width + 40) / 2 + ',' + (-20) + ')'),
        legendColor = color.domain([0, 10]),
        space = 120

    legend.append('g')
        .selectAll('text')
        .data(['Most recent', 'Jump height', 'Older data', 'Other players'])
        .enter()
        .append('text')
        .attr('x', (d, i) => space * (i - 2) + 35)
        .attr('y', 0)
        .text(d => d)
        .attr('font-size', 12)


    legend.append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll("path")
        .data([3, 10])
        .join("path")
        .attr("d", hexbin.hexagon())
        .attr("transform", (d, i) => `translate(${i == 0 ? space * (3 - 2) : space * (3 - 2) + 20}, -4)`)
        .attr("fill", d => legendColor(d))
        .attr('opacity', 0.3)


    legend.append("g")
        .selectAll("circle")
        .data([0.2, 0.9])
        .enter()
        .append('circle')
        .attr("r", 8)
        .attr("transform", (d, i) => `translate(${i == 0 ? space * (2 - 2) : space * (2 - 2) + 22}, -4)`)
        .attr("fill", 'white')
        .attr('stroke', 'rgb(18,27,104)')
        .attr('stroke-width', 2)
        .attr('opacity', d => d)

    legend.append("g")
        .selectAll("circle")
        .data([5, 10])
        .enter()
        .append('circle')
        .attr("r", d => d)
        .attr("transform", (d, i) => `translate(${i == 0 ? space * (1 - 2) : space * (1 - 2) + 20}, -4)`)
        .attr("fill", 'white')
        .attr('stroke', 'rgb(18,27,104)')
        .attr('stroke-width', 2)
        .attr('opacity', 1)

    legend.append("g")
        .append('circle')
        .attr("r", 8)
        .attr("transform", `translate(${space * (0 - 2) + 20}, -4)`)
        .attr("fill", 'rgb(18,27,104)')
        .attr('stroke', 'rgb(18,27,104)')
        .attr('stroke-width', 2)
        .attr('opacity', 1)

}

/** Appends the text element in the four quadrants
 * 
 * @param {*} g 
 * @param {*} height 
 * @param {*} width 
 */
function appendQuadrant(g, height, width) {

    let quadrants = g.append('g')

    quadrants.append('text')
        .attr('x', 30)
        .attr('y', 30)
        .attr('font-size', 12)
        .text('Low STR & High SPD')

    quadrants.append('text')
        .attr('x', width - 30)
        .attr('y', 30)
        .attr('font-size', 12)
        .attr('text-anchor', 'end')
        .text('High STR & High SPD')

    quadrants.append('text')
        .attr('x', 30)
        .attr('y', height - 30)
        .attr('font-size', 12)
        .text('Low STR & Low SPD')

    quadrants.append('text')
        .attr('x', width - 30)
        .attr('y', height - 30)
        .attr('font-size', 12)
        .attr('text-anchor', 'end')
        .text('High STR & Low SPD')
}

/**  Updates the x scale and the x axis
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @returns {Function} modified x
 */
function updateXAxis(data, g, x, metric) {

    x.domain([Math.max(0, d3.min(data, d => d[metric])), d3.max(data, d => d[metric])])

    g.selectAll(".x-axis")
        .transition()
        .duration(50)
        .call(d3.axisBottom(x).ticks(5));

    return x
}

/** Updates the color scale 
 * 
 * @param {*} data 
 * @param {*} color 
 * @returns 
 */
function updateColor(data, color) {

    return color.domain([0, d3.max(data, d => d.length) / 2])

}

/** Appends the hexagons
 * 
 * @param {*} g 
 * @param {*} hexbin 
 * @param {*} data 
 * @param {*} color 
 */
function appendHexbins(g, hexbin, data, color) {

    // Plot the hexbins

    g.selectAll('#hex').remove()

    g.append("g")
        .attr("clip-path", "url(#clip)")
        .attr('id', 'hex')
        .selectAll("path")
        .data(hexbin(data))
        .join("path")
        .attr("d", hexbin.hexagon())
        .attr("transform", function (d) { return `translate(${d.x}, ${d.y})` })
        .attr("fill", function (d) { return color(d.length); })
        .attr('opacity', 0.3)
    // .attr("stroke", "black")
    // .attr("stroke-width", "0.1")

}

/** Appends the points
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 * @param {*} tooltip 
 * @param {*} dates 
 * @param {*} xMetric 
 * @param {*} yMetric 
 */
function appendPoints(data, g, x, y, tooltip, dates, xMetric, yMetric) {

    let r = d3.scaleSqrt().domain(d3.extent(data, d => d.jump_height)).range([5, 20]),
        //color = d3.scaleTime().domain(d3.extent(data, d => d.date)).range(["transparent", "blue"])
        opacity = d3.scaleTime().domain(dates).range([0.1, 0.9])



    let len = data.length
    let lastData = data[len - 1]
    let firstData = data.slice(0, len - 1)

    g.append('g')
        .attr('class', 'points')
        .selectAll('points')
        .data(firstData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d[xMetric]))
        .attr('cy', d => y(d[yMetric]))
        .attr('r', d => r(d.jump_height))
        .attr('fill', 'white')
        .attr('stroke-width', 2)
        .attr('stroke', 'rgb(18,27,104)')
        .attr('opacity', d => opacity(d.date))
        .on("mouseover", function () {
            let formatTime = d3.timeFormat('%b %d, %Y')
            let d = d3.select(this).data()[0]
            let text = 'Date : ' + formatTime(d.date) + '\n'
                + 'Concentric impulse : ' + d[xMetric].toFixed(2) + '\n'
                + 'RSI modified : ' + d[yMetric].toFixed(2) + '\n'
                + 'Jump height : ' + d.jump_height.toFixed(2)

            d3.select(this).attr('fill', 'rgb(18,27,104)')

            return tooltip.html(text)
                .style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr('fill', "white")
            return tooltip.style("visibility", "hidden");
        });

    g.select('.points')
        .append('circle')
        .attr('cx', x(lastData[xMetric]))
        .attr('cy', y(lastData[yMetric]))
        .attr('r', r(lastData.jump_height))
        .attr('fill', 'rgb(18,27,104)')
        .attr('stroke-width', 2)
        .attr('stroke', 'rgb(18,27,104)')
        .on("mouseover", function () {
            let formatTime = d3.timeFormat('%b %d, %Y')
            let text = 'Date : ' + formatTime(lastData.date) + '\n'
                + 'Concentric impulse : ' + lastData[xMetric].toFixed(2) + '\n'
                + 'RSI modified : ' + lastData[yMetric].toFixed(2) + '\n'
                + 'Jump height : ' + lastData.jump_height.toFixed(2)

            //d3.select(this).attr('fill', color())

            return tooltip.html(text)
                .style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr('fill', "rgb(18,27,104)")
            return tooltip.style("visibility", "hidden");
        });

    let formatTime = d3.timeFormat('%b %d, %Y')



    if (lastData != undefined) {
        g.append('text')
            .attr('x', x(lastData[xMetric]) + 15)
            .attr('y', y(lastData[yMetric]) - 15)
            .attr('class', 'cartesianlabel')
            .html(formatTime(lastData.date))
    }

}

/** Updates the cartesian plot
 * 
 * @param {*} teamData 
 * @param {*} individualData 
 * @param {*} params 
 * @param {*} tooltip 
 * @param {*} dates 
 */
export function cartesianUpdate(teamData, individualData, params, tooltip, dates) {

    params.svg.selectAll('.cartesianlabel').remove()
    params.svg.selectAll('.points').remove()


    // Add X axis
    let x = updateXAxis(teamData, params.svg, params.x, 'concentric_impulse'),
        y = helper.updateYAxis(teamData, params.svg, params.y, 'rsi_mod')

    params.svg.select(".y-axis").select('path').attr('transform', 'translate(' + String(x(255)) + ',0)')
    params.svg.select(".x-axis").select('path').attr('transform', 'translate(0,' + String(-y(0)+y(0.62))+')')

    // Reformat the data: d3.hexbin() needs a specific format
    let inputForHexbinFun = []
    teamData.forEach(d => inputForHexbinFun.push([x(d.concentric_impulse), y(d.rsi_mod)]))

    // Prepare a color palette
    let color = updateColor(params.hexbin(inputForHexbinFun), params.color)

    appendHexbins(params.svg, params.hexbin, inputForHexbinFun, color)
    appendPoints(individualData, params.svg, x, y, tooltip, dates, 'concentric_impulse', 'rsi_mod')



}