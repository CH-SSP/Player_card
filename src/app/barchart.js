import * as d3 from 'd3';
import * as helper from "./helper.js";


/** Update the barchart elements
 * 
 * @param {*} data 
 * @param {*} params 
 * @returns 
 */
export function barChartUpdate(data, params, tooltip, metric, interval) {

    if (data.length == 0) { return; }

    let numberOfDays = d3.timeDay.count(interval[0], interval[1])
    let barWidth = 0.9 * params.width / numberOfDays

    let x = helper.updateXAxis(data, params.svg, params.x, interval, barWidth, params.width),
        y = helper.updateYAxis(data, params.svg, params.y, metric)

    helper.updateDeviationBand(data, params.svg, x, y, metric)
    appendBars(params.id, data, params.svg, x, y, tooltip, metric, barWidth)
    appendLabel(data, params.svg, x, y, metric, numberOfDays)


}

function appendLabel(data, g, x, y, metric, numberOfDays) {

    g.selectAll('.label').remove()

    if (numberOfDays < 90) {

        g.append('g')
            .attr('class', 'label')
            .selectAll('labels')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.date))
            .attr('y', d => y(d[metric])-5)
            .text(d => Math.round(d[metric]))
    }

}

/**
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
export function appendBars(id, data, g, x, y, tooltip, metric, barWidth) {

    g.selectAll('.bar').remove()



    g.append('g')
        .attr('class', 'bar')
        .selectAll('bars')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.date) - barWidth / 2)
        .attr('y', d => y(d[metric]))
        .attr('height', d => y.range()[0] - y(d[metric]))
        .attr('width', barWidth)
        .attr('fill', d => d.type == 'Practice' | d.type == 'Other' ? 'url(#practice-gradient)' : 'url(#line-gradient)')
        .on("mouseover", function () {

            d3.select(id).select('g.bar').selectAll('rect').attr('opacity', 0.6)
            d3.select(this).attr('opacity', 1)
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
            d3.select(id).select('g.bar').selectAll('rect').attr('opacity', 1)
            return tooltip.style("visibility", "hidden");
        });
}


// function fillData(data, dates, teams) {

//     let sparsedData = helper.getCatapultData(data, dates, teams)
//     let len = sparsedData.length

//     let filledData = d3.timeDay.range(dates[0], sparsedData[0].date).map(d => {
//         return {
//             'date': d,
//             'name': null,
//             'type': null,
//             'pace': null,
//             'maxvel': null,
//             'load': 0

//         }
//     })

//     sparsedData.forEach((d, i) => {
//         filledData.push(d)
//         if (i < len - 1 && d3.timeDay.count(d.date, sparsedData[i + 1].date) > 1) {

//             let newDates = d3.timeDay.range(d.date, sparsedData[i + 1].date)
//             newDates.shift()

//             filledData = [...filledData,
//             ...newDates.map(d => {
//                 return {
//                     'date': d,
//                     'name': 'fill',
//                     'type': null,
//                     'pace': null,
//                     'maxvel': null,
//                     'load': 0

//                 }
//             })]
//         }
//     })

//     return filledData



// }