import * as d3 from 'd3';

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



