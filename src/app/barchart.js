import * as d3 from 'd3';
import * as helper from "./helper.js";


/** Update the barchart elements
 * 
 * @param {*} data 
 * @param {*} params 
 * @returns 
 */
export function barChartUpdate(data, params, tooltip, metric, interval, teamLogo = false) {

    params.svg.selectAll('g.label').remove()
    params.svg.selectAll('.bar').remove()
    params.svg.select('rect.dev').attr('height', 0)

    if (data.length == 0) { return; }

    let numberOfDays = d3.timeDay.count(interval[0], interval[1])
    let barWidth = 0.9 * params.width / numberOfDays

    let x = updateXAxis(params.svg, params.x, interval),
        y = helper.updateYAxis(data, params.svg, params.y, metric)

    helper.updateDeviationBand(data, params.svg, x, y, metric)
    appendBars(params.id, data, params.svg, x, y, tooltip, metric, barWidth)

    teamLogo ? teamLabel(data, params.svg, x, y, metric, numberOfDays) : appendLabel(data, params.svg, x, y, metric, numberOfDays)

}

function teamLabel(data, g, x, y, metric, numberOfDays) {

    g.selectAll('g.label').remove()

    if (numberOfDays < 90) {

        data.forEach(d => { d.x = x(d.date); d.y = y(d[metric]) - 10 })

        g.append('g')
            .attr('class', 'label')
            .selectAll('label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.date))
            .attr('y', d => y(d[metric]))
            .text(d => d.type)

        let simulation = getSimulation(data,x,y,metric)
        simulate(simulation, g)

    }
}

function getSimulation(data,x,y,metric) {
    return d3.forceSimulation(data)
        .alphaDecay(0.4)
        .velocityDecay(0.8)
        .force('y', d3.forceY((d) => {
            return y(d[metric]) - 10;
        }).strength(3))
        .force('x', d3.forceX((d) => {
            return x(d.date);
        }).strength(1))
        .force('collision',
            d3.forceCollide(15)
                .strength(2)
        )
}


function simulate(simulation, g) {
    simulation.on('tick', () => {
        g.selectAll('text.label')
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
    })
}

/**
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @returns {Function} modified x
 */
export function updateXAxis(g, x, interval) {

    //x.domain(d3.extent(data, function (d) { return d.date; }))
    x.domain([d3.timeDay.offset(interval[0], -1), d3.timeDay.offset(interval[1], 1)])

    g.selectAll(".x-axis")
        .transition()
        .duration(50)
        .call(d3.axisBottom(x).ticks(5));

    return x
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
            .attr('y', d => y(d[metric]) - 5)
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

            d3.select(id).select('g.bar').selectAll('rect').attr('opacity', 0.5)
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