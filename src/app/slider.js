import * as d3 from 'd3';

import { getDatesWithData } from "./helper.js"

export function makeSlider() {

    let fullWidth = 500
    let fullHeight = 50

    d3.select("#dates").append('svg').attr('id', 'slider').attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid');

    var svg = d3.select("#slider"),
        margin = { top: 10, right: 10, bottom: 20, left: 10 },
        width = fullWidth - margin.right - margin.left,
        height = fullHeight - margin.top - margin.bottom;

    var x = d3.scaleTime().range([0, width]);

    var xAxis = d3.axisBottom(x).ticks(5);
    var box = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return { 'svg': svg, 'margin': margin, 'width': width, 'height': height, 'x': x, 'xAxis': xAxis, 'box': box }
}


export function dateSlider(data, player, params, whenBrushed) {

    let dates = getDatesWithData(data, player)

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
        .attr('x', d => params.x(d.date)-barWidth/2)
        .attr('y', 0)
        .attr('height', params.height)
        .attr('width', 2)
        .attr('fill', 'blue')
        .attr('opacity', 0.3)

    params.box.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + params.height + ")")
        .call(params.xAxis);


    var brush = d3.brushX()
        .extent([[0, 0], [params.width, params.height]])
        .on("brush end", (event) => {whenBrushed(event.selection.map(d => params.x.invert(d)))});

    params.box.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, params.x.range());



}