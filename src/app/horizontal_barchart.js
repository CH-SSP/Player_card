import * as d3 from 'd3';
import * as d3hexbin from 'd3-hexbin';
import * as helper from './helper.js';

export function getLastestAsymmetry(data) {

}

/** Update the barchart elements
 * 
 * @param {*} data 
 * @param {*} params 
 * @returns 
 */
export function horizontalBarChartUpdate(data, params, tooltip) {

    params.svg.selectAll('.bar').remove()

    let x = updateXAxis(data, params.svg, params.x)

    appendBars(params.id, data, params.svg, x, params.y, tooltip)


}

/** Adds the elements for the chart
 * 
 * @param {*} id 
 * @returns 
 */
export function horizontalBarchartBuilder(id, dim) {

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

    //appendGradient(svg, height)

    return {
        'id': id,
        'svg': svg,
        'width': width,
        'height': height,
        'x': appendXAxis(svg, width, height),
        'y': appendYAxis(svg, width, height)
    }


}

/**
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
        .data(['Peak Landing Force Asymmetry', 'Landing RFD Asymmetry', 'Landing Impulse Asymmetry'])
        .enter()
        .append('rect')
        .attr('x', d => x(data[d]) < x(0) ? x(data[d]) : x(0))
        .attr('y', d => y(d))
        .attr('height', y.bandwidth())
        .attr('width', d => Math.abs(x(0) - x(data[d])))
    // .attr('fill', d => d.type == 'Practice' | d.type == 'Other' ? 'url(#practice-gradient)' : 'url(#line-gradient)')
    // .on("mouseover", function () {

    //     d3.select(id).select('g.bar').selectAll('rect').attr('opacity', 0.5)
    //     d3.select(this).attr('opacity', 1)
    //     let formatTime = d3.timeFormat('%b %d, %Y')
    //     let d = d3.select(this).data()[0]
    //     let text = 'Name : ' + d.name + '\n'
    //         + 'Date : ' + formatTime(d.date) + '\n'
    //         + 'Opponent : ' + d.type + '\n'
    //         + 'Value : ' + d[metric].toFixed(2)

    //     return tooltip.html(text)
    //         .style("visibility", "visible")
    //         .style("top", (event.pageY - 10) + "px")
    //         .style("left", (event.pageX + 20) + "px");
    // })
    // .on("mouseout", function () {
    //     d3.select(id).select('g.bar').selectAll('rect').attr('opacity', 1)
    //     return tooltip.style("visibility", "hidden");
    // });
}

function appendXAxis(g, width, height) {

    let x = d3.scaleLinear().range([0, width]);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5))
        .attr("class", "x-axis");

    return x;

}

/**
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @returns {Function} modified x
 */
function updateXAxis(data, g, x) {

    //x.domain(d3.extent(data, function (d) { return d.date; }))
    let max = Math.max(Math.abs(data['Peak Landing Force Asymmetry']),
        Math.abs(data['Landing RFD Asymmetry']),
        Math.abs(data['Landing Impulse Asymmetry']))

    x.domain([-max, max])

    console.log(data)

    g.selectAll(".x-axis")
        .transition()
        .duration(50)
        .call(d3.axisBottom(x).ticks(5));

    return x
}

/**
 * 
 * @param {*} g 
 * @param {*} height 
 * @returns 
 */
function appendYAxis(g, width, height) {

    let y = d3.scaleBand()
        .range([height, 0])
        .domain(['Peak Landing Force Asymmetry', 'Landing RFD Asymmetry', 'Landing Impulse Asymmetry'])
        .padding(0.4);

    g.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis")
        .attr('transform', 'translate(' + width / 2 + ',0)');

    return y;

}