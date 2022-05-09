import * as d3 from 'd3';
import * as helper from "./helper.js";


/** Update the linechart elements
 * 
 * @param {*} data 
 * @param {*} params 
 * @returns 
 */
export function lineChartUpdate(data, params, tooltip, metric, interval) {

    params.svg.selectAll('path#curve').remove()
    params.svg.selectAll('.points').remove()
    params.svg.select('rect.dev').attr('height', 0)

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

