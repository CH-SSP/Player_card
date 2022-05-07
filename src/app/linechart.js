import * as d3 from 'd3';
import * as helper from "./helper.js";


/** Update the linechart elements
 * 
 * @param {*} data 
 * @param {*} params 
 * @returns 
 */
export function lineChartUpdate(data, params, tooltip, metric, interval) {

    if (data.length == 0) { return; }

    let x = helper.updateXAxis(data, params.svg, params.x, interval),
        y = helper.updateYAxis(data, params.svg, params.y, metric)

        helper.updateDeviationBand(data, params.svg, x, y, metric)
    updateLine(data, params.svg, x, y, metric)
    updatePoints(data, params.svg, x, y, tooltip, metric)

}



/**
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
export function updateLine(data, g, x, y, metric) {

    g.selectAll('path#curve').remove()

    g.append("path")
        .attr('id', 'curve')
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "url(#line-gradient)")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date) })
            .y(function (d) { return y(d[metric]) })
            .curve(d3.curveMonotoneX)
        )
}

/**
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
export function updatePoints(data, g, x, y, tooltip, metric) {

    g.selectAll('.points').remove()

    g.append('g')
        .attr('class', 'points')
        .selectAll('points')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d[metric]))
        .attr('r', 5)
        .attr('fill', 'white')
        .attr('stroke-width', 2)
        .attr('stroke', "url(#line-gradient)")
        .on("mouseover", function () {
            d3.select(this).attr('fill', "url(#line-gradient)")
            let formatTime = d3.timeFormat('%b %d, %Y')
            let d = d3.select(this).data()[0]
            let text = 'Name : ' + d.name + '\n'
                + 'Date : ' + formatTime(d.date) + '\n'
                + 'Opponent : ' + d.type + '\n'
                + 'Value : ' + d[metric].toFixed(2)

            return tooltip.html(text)
                .style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr('fill', "white")
            return tooltip.style("visibility", "hidden");
        });
}



// svg.append('g')
// .attr('class', 'label')
// .selectAll('labels')
// .data(data)
// .enter()
// .append('text')
// .attr('class', 'label')
// .attr('x', d => x(d.date))
// .attr('y', d => y(d.pace))
// .text(d => d.type)

// data.forEach(d => {d.x = x(d.date)+10; d.y = y(d.pace)-10})

// function getSimulation(data) {
//     return d3.forceSimulation(data)
//         .alphaDecay(0)
//         .velocityDecay(0.75)
//         .force("y", d3.forceY((d) => {
//             return y(d.pace)-10;
//             }).strength(0.5))
//         .force("x", d3.forceX((d) => {
//             return x(d.date)+10;
//             }).strength(0.5))
//         .force('collision',
//             d3.forceCollide(20)
//                 .strength(1)
//         )
// }


// function simulate(simulation) {
//     simulation.on('tick', () => {
//         d3.selectAll('text.label')
//             .attr('x', (d) => d.x)
//             .attr('y', (d) => d.y)
//     })
// }

// var simulation = getSimulation(data)
// simulate(simulation)

