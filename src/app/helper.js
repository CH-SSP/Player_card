/**
 * File for functions to process data or used in multiple viz
 */

import * as d3 from 'd3';

/** Creates the drop down list for team selection
 * 
 * @param {*} data 
 */
export function teamList() {

    let teams = [{
        'name': "Montréal Canadiens",
        'value': "75054b55-9900-11e3-b9b6-22000af8166b"
    },
    {
        'name': "Laval Rocket",
        'value': "79418ce3-92a6-4d84-b5b9-6d829f179942"
    }]

    for (let team of teams) {
        d3.select('#team-select').append("option").html(team.name).attr("value", team.value);
    }



}

/** Creates the drop down list for player selection
 * 
 * @param {*} data 
 */
export function playerList(data) {

    let players = getPlayersInfo(data)

    d3.select('#player-select').selectAll('option').remove()
    d3.select('#player-select').append("option").html("Select a player").attr("value", "None");

    for (let player of players) {
        d3.select('#player-select').append("option").html(player.last_name + ', ' + player.first_name + ' (' + player.jersey + ')').attr("value", player.first_name + ' ' + player.last_name);
    }
}


/** Gets the info for every player
 * 
 * @param {*} data 
 * @returns 
 */
function getPlayersInfo(data) {

    return data.map(d => {
        return {
            'first_name': d.first_name,
            'last_name': d.last_name,
            'jersey': d.catapult_info.jersey,
            'position': d.catapult_info.position_name,
            'team': d.catapult_info.current_team_id
        }
    }).sort((a, b) => d3.ascending(a.last_name, b.last_name))

}

/** Gets every date with a data entry for the slider viz
 * 
 * @param {*} data 
 * @returns 
 */
export function getDatesWithDataEntry(data) {

    let slashParser = d3.timeParse('%m/%d/%Y')
    let dashParser = d3.timeParse('%Y-%m-%d')
    let formatTime = d3.timeFormat('%m/%d/%Y')

    let catapultDates = data.catapult_data.map(d => slashParser(d.date_name))
    let ratingsDates = data.player_ratings.map(d => dashParser(d.date))
    let valdDates = data.vald_data.map(d => dashParser(d.date))

    let dates = valdDates.concat(catapultDates, ratingsDates, valdDates)
        .sort((a, b) => d3.ascending(a, b))
        .map(d => formatTime(d))

    dates = [...new Set(dates)].map(d => {
        return {
            'date': slashParser(d),
            'number': 1
        }
    })

    return (dates)
}

/** Gets every opponent team
 * 
 * @param {*} data 
 * @returns 
 */
export function getTeams(data) {

    return [
        ...new Set(data.map(d => d.player_ratings.map(d => d.opponent)).flat()),
        ...new Set(data.map(d => d.catapult_data.map(d => {
            let splitted = d.activity_name.split(' ')
            if (splitted[0] == 'LR' && splitted[1] == 'vs') {
                return splitted[2]
            }
        })).flat())
    ]
}


/** Gets the name of the opponent or the type of activity if the opponent is not specified
 * 
 * @param {Array} teams 
 * @param {String} string 
 * @returns 
 */
export function getOpponent(teams, string) {

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

/** Obtains the data for the catapult viz
 * 
 * @param {Array} data 
 * @param {Array} dates 
 * @param {Array} teams 
 * @returns 
 */
export function getCatapultData(data, dates, teams) {

    let slashParser = d3.timeParse('%m/%d/%Y')
    let filteredData = data.catapult_data.map(d => {
        return {
            'date': slashParser(d.date_name),
            'name': d.activity_name,
            'type': getOpponent(teams, d.activity_name),
            'pace': d['pace_(>80%_max_vel)'],
            'maxvel': d.max_vel,
            'load': d.total_player_load
        }
    })
        .sort((a, b) => d3.ascending(a.date, b.date))
        .filter(d => d.date >= dates[0] && d.date <= dates[1])

    return filteredData

}

/** Obtains the data from the player ratings
 * 
 * @param {Array} data 
 * @param {Array} dates
 * @returns 
 */
export function getPlayerRatingsData(data, dates) {

    let dashParser = d3.timeParse('%Y-%m-%d')
    let filteredData = data.player_ratings.map(d => {
        return {
            'date': dashParser(d.date),
            'name': null,
            'type': d.opponent,
            'ogp': parseInt(d['5v5 OGPs']),
            'pbw': parseFloat(d['5v5 Contested LPR win%'].slice(0, -1)),
        }
    })
        .sort((a, b) => d3.ascending(a.date, b.date))
        .filter(d => d.date >= dates[0] && d.date <= dates[1])

    return filteredData

}

/** Obtains the data for the jump metrics viz (from Vald API)
 * 
 * @param {Array} data 
 * @param {Array} dates
 * @returns 
 */
export function getValdData(data, dates) {

    let dashParser = d3.timeParse('%Y-%m-%d')
    let filteredData = data.vald_data.filter(d => d.JUMP_HEIGHT_IMP_MOM != undefined).map(d => {
        return {
            'date': dashParser(d.date),
            'name': null,
            'type': null,
            'jump_height': d.JUMP_HEIGHT_IMP_MOM,
            'rsi_mod': d.RSI_MODIFIED *0.01 , // cm/s to m/s
            'concentric_impulse': d.CONCENTRIC_IMPULSE,
            'Landing Impulse': d.LANDING_IMPULSE,
            'Landing RFD': d.LANDING_RFD,
            'Peak Landing Force': d.PEAK_LANDING_FORCE,
        }
    })
        .sort((a, b) => d3.ascending(a.date, b.date))
        .filter(d => d.date >= dates[0] && d.date <= dates[1])

    return filteredData

}


/** Adds the elements for the chart
 * 
 * @param {*} id 
 * @returns 
 */
export function chartBuilder(id, dim, yLabel, legend) {

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

    appendGradient(svg, height)
    appendDeviationBand(svg)

    if (legend == 'Team Legend') {
        teamLegend(svg, width)
    }

    return {
        'id': id,
        'svg': svg,
        'width': width,
        'height': height,
        'x': appendXAxis(svg, width, height),
        'y': appendYAxis(svg, height, dim.margin.left, yLabel)
    }


}

/**
 * 
 * @param {*} g 
 * @param {*} width 
 */
function teamLegend(g, width) {

    let size = 13
    let legend = g.append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + (-20) + ')')
        .attr('class', 'legend')

    legend.append('rect')
        .attr('width', size)
        .attr('height', size)
        .attr('x', 0 + 5)
        .attr('y', -size + 2)
        .attr('fill', "#0061ff")

    legend.append('text')
        .attr('x', size + 5 + 5)
        .attr('y', 0)
        .attr('font-size', 12)
        .text('Practice')

    legend.append('rect')
        .attr('width', size)
        .attr('height', size)
        .attr('x', 0 - 60)
        .attr('y', -size + 2)
        .attr('fill', "rgb(18,27,104)")

    legend.append('text')
        .attr('x', size + 5 - 60)
        .attr('y', 0)
        .attr('font-size', 12)
        .text('Game')

}

/** Initializes the x scale and appends the x axis
 * 
 * @param {*} g 
 * @param {*} width 
 * @param {*} height 
 * @param {*} x 
 * @returns 
 */
export function appendXAxis(g, width, height) {

    let x = d3.scaleTime().range([0, width]);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5))
        .attr("class", "x-axis");

    return x;

}

/** Updates the x scale and the x axis
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @returns {Function} modified x
 */
export function updateXAxis(data, g, x, interval) {

    x.domain(interval)

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
export function appendYAxis(g, height, marginLeft, yLabel) {

    let y = d3.scaleLinear().range([height, 0]);


    g.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis")
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", -20)
            .attr("text-anchor", "start")
            .attr('fill', 'currentColor')
            .attr('font-size', 12)
            .text(yLabel));

    return y;

}

/** Updates the y scale and the y axis
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} y 
 * @returns {Object} modified y and max value of data
 */
export function updateYAxis(data, g, y, metric) {

    y.domain([0, d3.max(data, d => d[metric])])

    g.selectAll(".y-axis")
        .transition()
        .duration(50)
        .call(d3.axisLeft(y));

    return y
}

/** Appends two gradients, one for the dates with a game and one for the dates with a practice
 * 
 * @param {*} g 
 * @param {*} height 
 */
export function appendGradient(g, height) {

    g.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", height)
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
        .attr("id", "practice-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", height)
        .attr("y2", 0)
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#0061ff" },
            { offset: "100%", color: "#60efff" }
        ])
        .enter().append("stop")
        .attr("offset", function (d) { return d.offset; })
        .attr("stop-color", function (d) { return d.color; });

}

/** Appends a band from -1 standard deviation to +1 standard deviation
 * 
 * @param {*} g 
 */
export function appendDeviationBand(g) {
    g.append('rect')
        .attr('class', 'dev')
        .attr('fill', 'grey')
        .attr('opacity', 0.1)
}

/** Updates the deviation band
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
export function updateDeviationBand(data, g, x, y, metric) {

    let bandData = data.filter(d => d[metric] != undefined & !isNaN(d[metric]))
    let dev = d3.deviation(bandData, d => d[metric]),
        mean = d3.mean(bandData, d => d[metric])

    g.select('rect.dev')
        .attr('x', x.range()[0])
        .attr('y', Math.max(y(mean + dev), y.range()[1]))
        .attr('width', x.range()[1])
        .attr('height', Math.min(y(mean - dev) - y(mean + dev), y.range()[0] - y(mean + dev)))

}