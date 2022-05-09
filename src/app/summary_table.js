import * as d3 from 'd3';
import * as helper from './helper.js'

export function updateTable(data, teams) {

    let weights = getWeight(data.vald_data)
    let currentWeight = weights.shift()
    let weightChange = getWeightChange(currentWeight, weights)

    if (weights.length>1) {
        d3.select("td#bodyweight").text(currentWeight.toFixed(1) + ' kg (' + (weightChange > 0 ? '+ ' : '- ') + Math.abs(weightChange*100).toFixed(1)+' %)')
    } else if (weights.length>0) {
        d3.select("td#bodyweight").text(currentWeight.toFixed(1) + ' kg')
    } else {
        d3.select("td#bodyweight").text('No data')
    }

    let average_practice_load = d3.mean(data.catapult_data.filter(d => helper.getOpponent(teams, d.activity_name) === 'Practice'), d=> d.total_player_load)
    d3.select("td#average_practice_load").text(average_practice_load.toFixed(1))

    let average_game_load = d3.mean(data.catapult_data.filter(d => (helper.getOpponent(teams, d.activity_name) !== 'Practice') & (helper.getOpponent(teams, d.activity_name) !== 'Other')), d=> d.total_player_load)
    d3.select("td#average_game_load").text(average_game_load.toFixed(1))

    let practice_max_vel = d3.max(data.catapult_data.filter(d => helper.getOpponent(teams, d.activity_name) === 'Practice'), d=> d.max_vel)
    d3.select("td#practice_max_vel").text(practice_max_vel.toFixed(2))

    let game_max_vel = d3.max(data.catapult_data.filter(d => (helper.getOpponent(teams, d.activity_name) !== 'Practice') & (helper.getOpponent(teams, d.activity_name) !== 'Other')), d=> d.max_vel)
    d3.select("td#game_max_vel").text(game_max_vel.toFixed(2))

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
        let average = d3.mean(passedWeights.slice(0,3), d => d)
        return (currentWeight-average)/average
    } else if (passedWeights.length>0) { 
        let average = d3.mean(passedWeights, d => d)
        return (currentWeight - average)/average
    }
}