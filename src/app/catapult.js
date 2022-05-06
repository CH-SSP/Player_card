import * as d3 from 'd3';

function getOpponent(teams, string) {

    let opp = teams.filter(x => string.includes(x))

    if (opp.length > 0) {
        return opp[0]
        //} else if (string.includes('Game') | string.includes('GAME') | string.includes('game')) {
        //   return 'Game'
    } else if (string.includes('Practice') | string.includes('PRACTICE') | string.includes('practice')) {
        return 'Practice'
    } else {
        return 'Other'
    }

}

export function getCatapultData(data, dates, teams) {

    let slashParser = d3.timeParse('%m/%d/%Y')
    let filteredData = data.catapult_data.map(d => {
        return {
            'date': slashParser(d.date_name),
            'name': d.activity_name,
            'type': getOpponent(teams, d.activity_name),
            'pace': d['pace_(>80%_max_vel)']
        }
    })
        .sort((a, b) => d3.ascending(a.date, b.date))
        .filter(d => d.date >= dates[0] && d.date <= dates[1])

    return filteredData

}

export function lineChartBuilder(id) {

    let fullWidth = 700
    let fullHeight = 400

    var margin = { top: 30, right: 60, bottom: 30, left: 60 },
        width = fullWidth - margin.left - margin.right,
        height = fullHeight - margin.top - margin.bottom;

    // append the svg object to the body of the page
    d3.select(id)
        .append("svg")
        .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid')
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr('id', 'container')

    var svg = d3.select(id).select("#container")

    var x = d3.scaleTime()
        .range([0, width]);

    var xAxis = d3.axisBottom(x).ticks(5);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .attr("class", "x-axis");

    var y = d3.scaleLinear()
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis");


    var tooltip = d3.select("body").append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    return { 'svg': svg, 'width': width, 'height': height, 'x': x, 'xAxis': xAxis, 'y': y, 'div': tooltip }


}

export function lineChartUpdate(data, params) {

    let svg = params.svg

    deleteElements(svg)

    if (data.length == 0) { return; }

    // Add X axis --> it is a date format
    let x = params.x.domain(d3.extent(data, function (d) { return d.date; }))

    svg.selectAll(".x-axis")
        .transition()
        .duration(50)
        .call(d3.axisBottom(x).ticks(5));

    // Max value observed:
    const max = d3.max(data, d => d.pace)

    // Add Y axis
    let y = params.y.domain([0, max])

    svg.selectAll(".y-axis")
        .transition()
        .duration(50)
        .call(d3.axisLeft(y));

    let dev = d3.deviation(data, d => d.pace)
    let mean = d3.mean(data, d => d.pace)

    svg.append('rect')
        .attr('class', 'dev')
        .attr('x', x.range()[0])
        .attr('y', Math.max(y(mean + dev), y.range()[1]))
        .attr('width', x.range()[1])
        .attr('height', Math.min(y(mean - dev) - y(mean + dev), y.range()[0] - y(mean + dev)))
        .attr('fill', 'grey')
        .attr('opacity', 0.1)

    // Set the gradient
    svg.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", y(0))
        .attr("x2", 0)
        .attr("y2", y(max))
        .selectAll("stop")
        .data([
            { offset: "0%", color: 'rgb(18,27,104)' },
            { offset: "100%", color: "blue" }
        ])
        .enter().append("stop")
        .attr("offset", function (d) { return d.offset; })
        .attr("stop-color", function (d) { return d.color; });


    // Add the line
    svg.append("path")
        .attr('id', 'curve')
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "url(#line-gradient)")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date) })
            .y(function (d) { return y(d.pace) })
            .curve(d3.curveMonotoneX)
        )

    svg.append('g')
        .attr('class', 'points')
        .selectAll('points')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.pace))
        .attr('r', 5)
        .attr('fill', 'white')
        .attr('stroke-width', 2)
        .attr('stroke', "url(#line-gradient)")
        .on("mouseover", function () {

            let formatTime = d3.timeFormat('%b %d, %Y')
            let d = d3.select(this).data()[0]
            let text = 'Name : ' + d.name + '\n'
                +'Date : ' + formatTime(d.date) + '\n'
                + 'Opponent : ' + d.type + '\n'
                + 'Value : ' + Math.round(d.pace)

            return params.div.html(text)
                .style("visibility", "visible")
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", function () {
            return params.div.style("visibility", "hidden");
        });

}


function deleteElements(svg) {
    svg.selectAll('linearGradient').remove()
    svg.selectAll('path#curve').remove()
    svg.selectAll('.points').remove()
    svg.selectAll('.dev').remove()
    //svg.selectAll('.label').remove()
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

