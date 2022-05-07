import * as d3 from 'd3';



/**
 * 
 * @param {*} data 
 */
export function playerList(data) {
        
    let players = getPlayersInfo(data)

    for (let player of players) {
        d3.select('#player-select').append("option").html(player.last_name + ', ' + player.first_name + ' (' + player.jersey + ')').attr("value", player.first_name + ' ' + player.last_name);
    }

    //d3.select('#player-info').select('h1')

    d3.select("#player-select").on("input.1", function () {
        d3.select("#player-info").select('h1').text(this.value)
    })

}

/**
 * 
 * @param {*} data 
 * @returns 
 */
function getPlayersInfo(data){
    
    return data.map(d => {
        return {
            'first_name' : d.first_name, 
            'last_name' : d.last_name, 
            'jersey' : d.catapult_info.jersey, 
            'position' : d.catapult_info.position_name
        }
    }).sort((a, b) => d3.ascending(a.last_name, b.last_name))

}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export function getDatesWithDataEntry(data){

    let slashParser = d3.timeParse('%m/%d/%Y')
    let dashParser = d3.timeParse('%Y-%m-%d')
    let formatTime = d3.timeFormat('%m/%d/%Y')

    let catapultDates = data.catapult_data.map(d => slashParser(d.date_name))
    let ratingsDates = data.player_ratings.map(d => dashParser(d.date))
    let valdDates = data.vald_data.map(d => dashParser(d.date))

    let dates = valdDates.concat(catapultDates, ratingsDates, valdDates)
        .sort((a,b) => d3.ascending(a,b))
        .map(d => formatTime(d))
        
    dates = [...new Set(dates)].map(d => {
        return {
            'date' : slashParser(d),
            'number' : 1
        }
    })

    return(dates)
}

/**
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
                return splitted[2]//.slice(0,3)
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
            'maxvel' : d.max_vel,
            'load' : d.total_player_load
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
 export function chartBuilder(id, dim) {

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

    return {
        'svg': svg,
        'width': width,
        'height': height,
        'x': appendXAxis(svg, width, height),
        'y': appendYAxis(svg, height)
    }


}

/**
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

/**
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @returns {Function} modified x
 */
export function updateXAxis(data, g, x, interval) {

    //x.domain(d3.extent(data, function (d) { return d.date; }))
    x.domain(interval)

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
export function appendYAxis(g, height) {

    let y = d3.scaleLinear().range([height, 0]);

    g.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis");

    return y;

}

/**
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

/**
 * 
 * @param {*} g 
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

/**
 * 
 * @param {*} g 
 */
export function appendDeviationBand(g) {
    g.append('rect')
        .attr('class', 'dev')
        .attr('fill', 'grey')
        .attr('opacity', 0.1)
}

/**
 * 
 * @param {*} data 
 * @param {*} g 
 * @param {*} x 
 * @param {*} y 
 */
export function updateDeviationBand(data, g, x, y, metric) {

    let dev = d3.deviation(data, d => d[metric])
    let mean = d3.mean(data, d => d[metric])

    g.select('rect.dev')
        .attr('x', x.range()[0])
        .attr('y', Math.max(y(mean + dev), y.range()[1]))
        .attr('width', x.range()[1])
        .attr('height', Math.min(y(mean - dev) - y(mean + dev), y.range()[0] - y(mean + dev)))

}



export function addBodyWeight(data, player) {


    try {
        let playerData = data.filter(d => d.name == player)[0].data
        
        let bodyWeight = playerData.filter(d => d["BODY_MASS"])
        let mass = bodyWeight[0]["BODY_MASS"]

        if (bodyWeight.length > 3) {
            let mean = (bodyWeight[1]["BODY_MASS"] + bodyWeight[2]["BODY_MASS"] + bodyWeight[3]["BODY_MASS"])/3;
            let sign = ((mass-mean)/mean*100 > 0) ? '+' : ''
            d3.select("td#bodyweight").text(String(Math.round(mass)) + " kg (" + sign + String(Math.round((mass-mean)/mean*100)) + "%)")
        } else {
            d3.select("td#bodyweight").text(String(Math.round(bodyWeight[0]["BODY_MASS"])) + " kg")
        }
    } catch (error){
        d3.select("td#bodyweight").text("No data")
    }

    try {
        let playerData = data.filter(d => d.name == player)[0].data
        console.log(playerData)
        let jumpHeight = playerData[0]['JUMP_HEIGHT_IMP_MOM']
        let rsiMod = playerData[0]['RSI_MODIFIED']
        let concentricImpulse = playerData[0]['CONCENTRIC_IMPULSE']

        d3.select("td#jump_height").text(String(jumpHeight.toPrecision(4))+ ' cm')
        d3.select("td#rsi_mod").text(String(rsiMod.toPrecision(4)))
        d3.select("td#concentric_impulse").text(String(concentricImpulse.toPrecision(4))+' N s')

    } catch {
        
    }

}

export function addCatapultToTable(data, player) {

    let playerData = data.filter(d => d['athlete_name'] == player).sort((a,b)=> d3.descending(a.end_time, b.end_time))
    let practiceData = playerData.filter(d => d['activity_name'].slice(0,6) != "HOCKEY")[0]
    let practiceLoad = practiceData['total_player_load']
    let practiceMaxVel = practiceData['max_vel']
    let gameData = playerData.filter(d => d['activity_name'].slice(0,6) == "HOCKEY")[0]
    let gameLoad = gameData['total_player_load']
    let gameMaxVel = gameData['max_vel']


    d3.select("td#average_practice_load").text(String(Math.round(practiceLoad)))
    d3.select("td#average_game_load").text(String(Math.round(gameLoad)))
    d3.select("td#practice_max_vel").text(String(practiceMaxVel.toPrecision(3))+ " m/s")
    d3.select("td#game_max_vel").text(String(gameMaxVel.toPrecision(3))+ " m/s")

}



