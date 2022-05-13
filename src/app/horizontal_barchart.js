/**
 * File for everything related to the horizontal asymmetry barchart
 */

import * as d3 from 'd3';

/** Update the barchart elements
 * 
 * @param {*} data 
 * @param {*} params 
 * @returns 
 */
export function horizontalBarChartUpdate(data, params, tooltip) {

    params.svg.selectAll('.bar').remove()
    params.svg.selectAll('.hlabel').remove()
    params.svg.selectAll('.meanbar').remove()

    let impulse = data.filter(d => d["Landing Impulse"]).map(d => { return { 'value': d["Landing Impulse"], 'date': d.date } }),
        RFD = data.filter(d => d["Landing RFD"]).map(d => { return { 'value': d["Landing RFD"], 'date': d.date } }),
        peak = data.filter(d => d['Peak Landing Force']).map(d => { return { 'value': d['Peak Landing Force'], 'date': d.date } })

    data = {
        "Landing Impulse": impulse.pop(),
        'Landing RFD': RFD.pop(),
        'Peak Landing Force': peak.pop()
    }

    let mean = {
        "Landing Impulse": d3.mean(impulse, d => d.value),
        'Landing RFD': d3.mean(RFD, d => d.value),
        'Peak Landing Force': d3.mean(peak, d => d.value)
    }

    let x = updateXAxis(data, params.svg, params.x)

    
    appendMeanBars(mean, params.svg, x, params.y, params.height)
    appendBars(params.id, data, params.svg, x, params.y, tooltip)
    appendLabel(data, params.svg, x, params.y)
    changeTickSide(data, params.svg, x)


}

/** Appends the legend
 * 
 * @param {*} g 
 * @param {*} width 
 */
function horizontalLegend(g, width) {

    let size = 13
    let legend = g.append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + (-20) + ')')
        .attr('class', 'legend')

    legend.append('rect')
        .attr('width', size)
        .attr('height', size)
        .attr('x', 0 + 5)
        .attr('y', -size+2)
        .attr('fill', "grey")
        .attr('opacity', 0.3)

    legend.append('text')
        .attr('x', size + 5 + 5)
        .attr('y', 0)
        .attr('font-size', 12)
        .text('Player average')

    legend.append('rect')
        .attr('width', size)
        .attr('height', size)
        .attr('x', 0 - 85)
        .attr('y', -size+2)
        .attr('fill', "rgb(18,27,104)")

    legend.append('text')
        .attr('x', size + 5 - 85)
        .attr('y', 0)
        .attr('font-size', 12)
        .text('Most recent')

}

/** Adds the elements for the chart
 * 
 * @param {*} id 
 * @returns 
 */
export function horizontalBarchartBuilder(id, dim, xLabel) {

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

    appendGradient(svg, width)

    horizontalLegend(svg, width)

    return {
        'id': id,
        'svg': svg,
        'width': width,
        'height': height,
        'x': appendXAxis(svg, width, height, xLabel),
        'y': appendYAxis(svg, width, height)
    }


}

/** Changes the side of the tick when a bar is in the negatives and covers it
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 */
function changeTickSide(data, g, x) {

    let textLen = [];
    g.select("g.y-axis").selectAll('text').nodes().forEach(d => textLen.push(d.getComputedTextLength()))
    textLen = {
        'Peak Landing Force': textLen[0],
        'Landing RFD': textLen[1],
        'Landing Impulse': textLen[2]
    }

    g.select("g.y-axis")
        .selectAll('text')
        .attr('transform', d => data[d].value < 0 ? 'translate(' + (textLen[d] + 15) + ',0)' : 'translate(0,0)')


}

/** Appends the labels on top of bars
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
function appendLabel(data, g, x, y) {

    g.selectAll('.label').remove()

    g.append('g')
        .attr('class', 'hlabel')
        .selectAll('labels')
        .data(['Peak Landing Force', 'Landing RFD', 'Landing Impulse'])
        .enter()
        .append('text')
        .attr('x', d => data[d].value < 0 ? x(data[d].value) - 15 : x(data[d].value) + 15)
        .attr('y', d => y(d) + y.bandwidth() / 2)
        .text(d => Math.round(data[d].value))
        .attr('text-align', 'center')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('dominant-baseline', 'middle')


}

/** Appends the bars
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
function appendBars(id, data, g, x, y, tooltip) {

    g.selectAll('.bar').remove()

    g.append('g')
        .attr('class', 'bar')
        .selectAll('bars')
        .data(['Peak Landing Force', 'Landing RFD', 'Landing Impulse'])
        .enter()
        .append('rect')
        .attr('x', d => data[d].value < 0 ? x(data[d].value) : x(0))
        .attr('y', d => y(d))
        .attr('height', y.bandwidth())
        .attr('width', d => Math.abs(x(0) - x(data[d].value)))
        .attr('fill', d => data[d].value < 0 ? "url(#line-gradient-negative)" : "url(#line-gradient-positive)")
        .on("mouseover", function () {

            d3.select(id).select('g.bar').selectAll('rect').attr('opacity', 0.5)
            d3.select(this).attr('opacity', 1)
            let formatTime = d3.timeFormat('%b %d, %Y')
            let d = d3.select(this).data()
            let text = 'Date : ' + formatTime(data[d].date) + '\n'
                + 'Value : ' + data[d].value.toFixed(2)

            return tooltip.html(text)
                .style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", function () {
            d3.select(id).select('g.bar').selectAll('rect').attr('opacity', 1)
            return tooltip.style("visibility", "hidden");
        });
}

/** Appends the bars for the player average
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
function appendMeanBars(data, g, x, y) {

    g.selectAll('.meanbar').remove()

    g.append('g')
        .attr('class', 'meanbar')
        .selectAll('bars')
        .data(['Peak Landing Force', 'Landing RFD', 'Landing Impulse'])
        .enter()
        .append('rect')
        .attr('x', d => data[d] < 0 ? x(data[d]) : x(0))
        .attr('y', d => y(d) - 0.2 * y.bandwidth())
        .attr('height', y.bandwidth() * 1.4)
        .attr('width', d => Math.abs(x(0) - x(data[d])))
        .attr('fill', "grey")
        .attr('opacity', 0.2)

}

/** Initializes the x scale and appends the x axis 
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
            .attr("x", width / 2)
            .attr("y", +35)
            .attr("text-anchor", "middle")
            .attr('fill', 'currentColor')
            .attr('font-size', 12)
            .text(xLabel))
        .call(g => g.append("text")
            .attr("x", width)
            .attr("y", +35)
            .attr("text-anchor", "end")
            .attr('fill', 'currentColor')
            .attr('font-size', 12)
            .text('Right →'))
        .call(g => g.append("text")
            .attr("x", 0)
            .attr("y", +35)
            .attr("text-anchor", "start")
            .attr('fill', 'currentColor')
            .attr('font-size', 12)
            .text('← Left'));


    return x;

}

/** Updates the x scale and the x axis
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @returns {Function} modified x
 */
function updateXAxis(data, g, x) {

    //x.domain(d3.extent(data, function (d) { return d.date; }))
    let max = Math.max(Math.abs(data['Peak Landing Force'].value),
        Math.abs(data['Landing RFD'].value),
        Math.abs(data['Landing Impulse'].value))

    x.domain([-max, max])

    g.selectAll(".x-axis")
        .transition()
        .duration(50)
        .call(d3.axisBottom(x).ticks(5));

    return x
}

/** Initializes the y scale and appends the y axis
 * 
 * @param {*} g 
 * @param {*} height 
 * @returns 
 */
function appendYAxis(g, width, height) {

    let y = d3.scaleBand()
        .range([height, 0])
        .domain(['Peak Landing Force', 'Landing RFD', 'Landing Impulse'])
        .padding(0.4);

    g.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis")
        .attr('transform', 'translate(' + width / 2 + ',0)');

    return y;

}

/** Appends the horizontal gradient for the bars
 * 
 * @param {*} g 
 */
export function appendGradient(g, width) {

    g.append("linearGradient")
        .attr("id", "line-gradient-positive")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", width / 2)
        .attr("x2", width)
        .attr("y1", 0)
        .attr("y2", 0)
        .selectAll("stop")
        .data([
            { offset: "0%", color: 'rgb(18,27,104)' },
            { offset: "100%", color: "blue" }
        ])
        .enter().append("stop")
        .attr("offset", function (d) { return d.offset; })
        .attr("stop-color", function (d) { return d.color; });

    g.append("linearGradient")
        .attr("id", "line-gradient-negative")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", width / 2)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", 0)
        .selectAll("stop")
        .data([
            { offset: "0%", color: 'rgb(18,27,104)' },
            { offset: "100%", color: "blue" }
        ])
        .enter().append("stop")
        .attr("offset", function (d) { return d.offset; })
        .attr("stop-color", function (d) { return d.color; });
}