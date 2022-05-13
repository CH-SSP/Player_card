import * as d3 from 'd3';
import * as helper from './helper.js'

export function updateTable(data, teams) {

    if (data.vald_data.length > 0) {
        let weights = getWeight(data.vald_data),
            currentWeight = weights.shift(),
            weightChange = getWeightChange(currentWeight, weights),
            jump_height = data.vald_data.filter(d => d.JUMP_HEIGHT_IMP_MOM != undefined).map(d => d.JUMP_HEIGHT_IMP_MOM)[0],
            rsi_mod = data.vald_data.filter(d => d.RSI_MODIFIED != undefined).map(d => d.RSI_MODIFIED)[0],
            concentric_impulse = data.vald_data.filter(d => d.CONCENTRIC_IMPULSE != undefined).map(d => d.CONCENTRIC_IMPULSE)[0]

        if (weights.length > 0) {
            d3.select("td#bodyweight").text(currentWeight.toFixed(1) + ' kg (' + (weightChange > 0 ? '+ ' : '- ') + Math.abs(weightChange.toFixed(1)) + ')')
        } else if (weights.length == 0) {
            d3.select("td#bodyweight").text(currentWeight.toFixed(1) + ' kg')
        }
        
        d3.select("td#jump_height").text(jump_height.toFixed(2) + ' cm')
        d3.select("td#rsi_mod").text(rsi_mod.toFixed(2))
        d3.select("td#concentric_impulse").text(concentric_impulse.toFixed(1) + ' N s')

    } else {
        d3.select("td#bodyweight").text('No data')
        d3.select("td#jump_height").text('No data')
        d3.select("td#rsi_mod").text('No data')
        d3.select("td#concentric_impulse").text('No data')
    }

    if (data.catapult_data.length > 0) {
        let average_practice_load = d3.mean(data.catapult_data.filter(d => helper.getOpponent(teams, d.activity_name) === 'Practice'), d => d.total_player_load),
            average_game_load = d3.mean(data.catapult_data.filter(d => (helper.getOpponent(teams, d.activity_name) !== 'Practice') & (helper.getOpponent(teams, d.activity_name) !== 'Other')), d => d.total_player_load),
            practice_max_vel = d3.max(data.catapult_data.filter(d => helper.getOpponent(teams, d.activity_name) === 'Practice'), d => d.max_vel),
            game_max_vel = d3.max(data.catapult_data.filter(d => (helper.getOpponent(teams, d.activity_name) !== 'Practice') & (helper.getOpponent(teams, d.activity_name) !== 'Other')), d => d.max_vel)

        d3.select("td#average_practice_load").text(average_practice_load.toFixed(1))
        d3.select("td#average_game_load").text(average_game_load.toFixed(1))
        d3.select("td#practice_max_vel").text(practice_max_vel.toFixed(2) + ' m/s')
        d3.select("td#game_max_vel").text(game_max_vel.toFixed(2) + ' m/s')

    } else {
        d3.select("td#average_practice_load").text('No data')
        d3.select("td#average_game_load").text('No data')
        d3.select("td#practice_max_vel").text('No data')
        d3.select("td#game_max_vel").text('No data')
    }


}

function getWeight(d) {

    let weight = d.reduce((a, d) => {
        if (d.weight !== -1) {
            a.push(d.weight)
        } else if ('BODY_MASS' in d) {
            a.push(d.BODY_MASS)
        }
        return a
    }, [])

    return weight

}

function getWeightChange(currentWeight, passedWeights) {

    if (passedWeights.length > 3) {
        let average = d3.mean(passedWeights.slice(0, 3), d => d)
        return currentWeight - average
    } else if (passedWeights.length > 0) {
        let average = d3.mean(passedWeights, d => d)
        return currentWeight - average
    }
}


export function updateLastGamesTable(data) {

    let g = d3.select('#on-ice'),
        features = [
        { name: '5v5 TOI', id: 'TOI' },
        { name: '5v5 ixG', id: 'ixG' },
        { name: '5v5 xGF%', id: 'xGF' },
        { name: '5v5 OGPs', id: 'OGP' },
        { name: '5v5 Contested LPR win%', id: 'LPR' },
        { name: '5v5 Entry Success %', id: 'Entry' },
        { name: '5v5 Exit Success %', id: 'Exit' }]


    g.selectAll('th').remove()
    g.selectAll('tr').remove()
    g.append('tr').attr('id', 'header').append('th').html('Last 5 games').attr('class', 'title')
    features.forEach(d => g.append('tr').attr('id', d.id).append('td').html(d.name))


    let gamesToShow = []

    if (data.player_ratings.length > 5) {
        gamesToShow = data.player_ratings.slice(-5)
    } else {
        gamesToShow = data.player_ratings
    }

    gamesToShow.forEach(d => updateValues(g, d, features))

}

function updateValues(svg, dict, features) {
    svg.select('#header').append('th').attr('class', 'value').html(dict.opponent)
    features.forEach(d => {
        svg.select('#' + d.id).append('td').attr('class', 'value').html(dict[d.name])
    })


}

export function lastGamesTableBuilder() {


}