/**
 * app.js
 * ======
 * Main file of the application. This file is used to initialize the scroller and imports the visualizations used.
 */

'use strict';
import * as d3 from 'd3';
import '../assets/styles/style.scss';
import * as helper from "./helper.js"
import { makeSlider, dateSlider } from "./slider.js"
import * as linechart from './linechart.js';
import * as barchart from './barchart.js'
import * as table from './summary_table.js'
import * as cartesian from './cartesian_plot.js'
import * as horizontal from './horizontal_barchart.js'

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

const dim = {
    'fullWidth': 700,
    'fullHeight': 450,
    'margin': { top: 30, right: 30, bottom: 50, left: 30 }
}

d3.json("./data/data.json").then(function (data) {

    
    helper.teamList()

    const sliderParameters = makeSlider(),
        teams = helper.getTeams(data),
        inGamePaceParameters = helper.chartBuilder("#InGamePace", dim),
        maxVelParameters = helper.chartBuilder("#MaxVel", dim),
        playerLoadParameters = helper.chartBuilder("#PlayerLoad", dim),
        offensiveParameters = helper.chartBuilder("#offensive", dim),
        defensiveParameters = helper.chartBuilder("#defensive", dim),
        jumpCartesianParameters = cartesian.cartesianBuilder("#cartesian", dim),
        jumpHeightParameters = helper.chartBuilder("#JumpHeight", dim),
        asymmetryParameters = horizontal.horizontalBarchartBuilder('#asymmetry', dim)

    table.lastGamesTableBuilder()

    d3.select("#team-select").on('input.4', function() {

        let team = this.value,
            teamData = data.filter(d => d.catapult_info.current_team_id == team),
            selectedTeamValdData = cartesian.getCompleteValdData(teamData)

        helper.playerList(teamData)
    
        d3.select("#player-select").on("input.3", function () {
    
            var playerData = teamData.filter(d => d.name.includes(this.value))[0];

    
            table.updateTable(playerData, teams)
            table.updateLastGamesTable(playerData)
    
            d3.select("#player-info").select('p').text(playerData.catapult_info.jersey + " | "+ playerData.catapult_info.position_name)
            d3.select("#player-info").select('h1').text(this.value)
    
            function whenBrushed(data, timeInterval) {

                let catapultData = helper.getCatapultData(data, timeInterval, teams), 
                    playerRatingsData1 = helper.getPlayerRatingsData(data, timeInterval),
                    playerRatingsData2 = helper.getPlayerRatingsData(data, timeInterval),
                    valdData = helper.getValdData(data,timeInterval)

                console.log(valdData)
                
                linechart.lineChartUpdate(
                    catapultData.filter(d => d.type !== 'Practice' & d.type !== 'Other'), 
                    inGamePaceParameters,
                    tooltip,
                    'pace',
                    timeInterval
                )
    
                linechart.lineChartUpdate(
                    catapultData.filter(d => d.type !== 'Practice' & d.type !== 'Other'), 
                    maxVelParameters,
                    tooltip,
                    'maxvel',
                    timeInterval
                )
    
                barchart.barChartUpdate(
                    catapultData, 
                    playerLoadParameters,
                    tooltip,
                    'load',
                    timeInterval
                )
    
                barchart.barChartUpdate(
                    playerRatingsData1, 
                    offensiveParameters,
                    tooltip,
                    'ogp',
                    timeInterval,
                    true,
                )
    
                barchart.barChartUpdate(
                    playerRatingsData2, 
                    defensiveParameters,
                    tooltip,
                    'pbw',
                    timeInterval,
                    true,
                )

                cartesian.density(
                    selectedTeamValdData, 
                    valdData, 
                    jumpCartesianParameters, 
                    tooltip, 
                    timeInterval)
    
                linechart.lineChartUpdate(
                    valdData, 
                    jumpHeightParameters,
                    tooltip,
                    'jump_height',
                    timeInterval,
                )

                horizontal.horizontalBarChartUpdate(
                    valdData[0], 
                    asymmetryParameters,
                    tooltip
                ) // PRENDRE LES DERNIÈRES MESURES VALIDES POUR CHAQUE VARIABLE
                
            }
    
            dateSlider(playerData, sliderParameters, whenBrushed)
    
        })

    })

    

})

//d3.csv("../data/on-ice_data.csv").then(function (data) {
//   topSection(data)
//})

// d3.json("../data/vald.json").then(function (data) {


//     d3.select("#player-select").on("input.3", function () {
        
//         addBodyWeight(data, this.value)

        
//     })

// })

// d3.json("../data/catapult.json").then(function (data) {

//     d3.select("#player-select").on("input.4", function () {

//         addCatapultToTable(data, this.value)

//     })

// })

 //offensive()