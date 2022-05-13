import * as d3 from 'd3';

import { addBodyWeight, getDatesWithDataEntry } from "./helper.js"

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


export function dateSlider(data, params, whenBrushed) {

    let dates = getDatesWithDataEntry(data)

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
        .attr('id', 'first')
        .attr('transform', 'translate(0,-5)')
        .attr('font-size', 12)

    params.box.select('.limits')
        .append('text')
        .attr('id', 'second')
        .attr('transform', 'translate('+params.width+',-5)')
        .attr('font-size', 12)
        .attr('text-anchor', 'end')



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

function updateLimits(g, interval) { 

    let formatTime = d3.timeFormat('%b %Y')
    g.selectAll('#first').text(formatTime(interval[0]))
    g.selectAll('#second').text(formatTime(interval[1]))
}