/**
 * File with the function used to create and change the date slider
 */

import * as d3 from 'd3';
import * as helper from './helper.js'


/** Create the slider
 * 
 * @returns 
 */
export function makeSlider() {

    let fullWidth = 700
    let fullHeight = 80

    d3.select("#dates").select('#viz').append('svg').attr('id', 'slider').attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid');

    var svg = d3.select("#slider"),
        margin = { top: 25, right: 30, bottom: 20, left: 30 },
        width = fullWidth - margin.right - margin.left,
        height = fullHeight - margin.top - margin.bottom;

    var x = d3.scaleTime().range([0, width]);

    var xAxis = d3.axisBottom(x).ticks(5);
    var box = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")



    return { 'svg': svg, 'margin': margin, 'width': width, 'height': height, 'x': x, 'xAxis': xAxis, 'box': box }
}

/** Updates the slider when a new player is selected, operates the brush and runs whenBrushed when the dates change
 * 
 * @param {*} data 
 * @param {*} params 
 * @param {*} whenBrushed 
 */
export function dateSlider(data, params, whenBrushed) {

    let dates = helper.getDatesWithDataEntry(data)

    params.x.domain(d3.extent(dates, function (d) { return d.date; }));

    params.box.selectAll('g').remove()

    let barWidth = 2

    params.box.append('g')
        .attr('class', 'datapoints')
        .selectAll('rects')
        .data(dates)
        .enter()
        .append('rect')
        .attr('x', d => params.x(d.date))
        .attr('y', 0)
        .attr('height', params.height)
        .attr('width', 0)
        .transition()
        .duration(500)
        .attr('x', d => params.x(d.date) - barWidth / 2)
        .attr('y', 0)
        .attr('height', params.height)
        .attr('width', 2)
        .attr('fill', 'blue')
        .attr('opacity', 0.3)

    params.box.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + params.height + ")")
        .call(params.xAxis);

    params.box.append('g')
        .attr('class', 'limits')
        .append('text')
        .attr('id', 'limits')
        .attr('transform', 'translate('+params.width/2+',-5)')
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')

    var brush = d3.brushX()
        .extent([[0, 0], [params.width, params.height]])
        .on("brush end", (event) => {
            let interval = event.selection || params.x.range()
            updateLimits(params.box, interval.map(d => params.x.invert(d)))
            whenBrushed(data, interval.map(d => params.x.invert(d)))
        });

    params.box.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, params.x.range());



}

/** Prints the limits of the time range above the slider
 * 
 * @param {*} g 
 * @param {*} interval 
 */
function updateLimits(g, interval) { 

    let formatTime = d3.timeFormat('%b %Y')
    g.selectAll('#limits').text(formatTime(interval[0]) + ' - '+ formatTime(interval[1]))
}