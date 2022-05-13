/**
 * app.js
 * ======
 * Main file of the application.
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

// Appends the tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

// Dimensions of the viz
const dim = {
    'fullWidth': 700,
    'fullHeight': 450,
    'margin': { top: 35, right: 30, bottom: 50, left: 30 }
}

// Imports data
d3.json("./data/data.json").then(function (data) {

    // Appends the filter for teams
    helper.teamList()

    // Initializes all the viz and returns the parameters
    const sliderParameters = makeSlider(),
        teams = helper.getTeams(data), // every opponent
        inGamePaceParameters = helper.chartBuilder("#InGamePace", dim, "↑ Distance skated above 80% max velocity"),
        maxVelParameters = helper.chartBuilder("#MaxVel", dim, "↑ Maximum Velocity (m/s)"),
        playerLoadParameters = helper.chartBuilder("#PlayerLoad", dim, "↑ Player Load", "Team Legend"),
        offensiveParameters = helper.chartBuilder("#offensive", dim, "↑ Offensive Generating Plays"),
        defensiveParameters = helper.chartBuilder("#defensive", dim, "↑ Loose Puck Recovery %"),
        jumpCartesianParameters = cartesian.cartesianBuilder("#cartesian", dim, "Concentric Impulse (N s) →", "↑ RSI Modified"),
        jumpHeightParameters = helper.chartBuilder("#JumpHeight", dim, "↑ Jump Height (cm)"),
        asymmetryParameters = horizontal.horizontalBarchartBuilder('#asymmetry', dim, "Asymmetry %")

    // When a team is selected
    d3.select("#team-select").on('input.4', function () {

        // Gets the data for the team
        let team = this.value,
            teamData = data.filter(d => d.catapult_info.current_team_id == team),
            selectedTeamValdData = cartesian.getCompleteValdData(teamData) // Specifically for the cartesian plot

        // Appends the filter for players
        helper.playerList(teamData)

        // When a player is selected
        d3.select("#player-select").on("input.3", function () {

            // Gets the data for the selected player
            var playerData = teamData.filter(d => d.name.includes(this.value))[0];

            // Updates the two tables
            table.updateTable(playerData, teams)
            table.updateLastGamesTable(playerData)

            // Appends the info of the selected player
            d3.select("#player-info").select('p').text(playerData.catapult_info.jersey + " | " + playerData.catapult_info.position_name)
            d3.select("#player-info").select('h1').text(this.value)

            // To do when dates are selected with the slider
            function whenBrushed(data, timeInterval) {

                // Gets specific data for the viz
                let catapultData = helper.getCatapultData(data, timeInterval, teams),
                    playerRatingsData1 = helper.getPlayerRatingsData(data, timeInterval),
                    playerRatingsData2 = helper.getPlayerRatingsData(data, timeInterval),
                    valdData = helper.getValdData(data, timeInterval)

                // Updates the in game pace linechart
                linechart.lineChartUpdate(
                    catapultData.filter(d => d.type !== 'Practice' & d.type !== 'Other'),
                    inGamePaceParameters,
                    tooltip,
                    'pace',
                    timeInterval
                )

                // Updates the max velocity linechart
                linechart.lineChartUpdate(
                    catapultData.filter(d => d.type !== 'Practice' & d.type !== 'Other'),
                    maxVelParameters,
                    tooltip,
                    'maxvel',
                    timeInterval
                )

                // Updates the player load barchart
                barchart.barChartUpdate(
                    catapultData,
                    playerLoadParameters,
                    tooltip,
                    'load',
                    timeInterval
                )

                // Updates the offensive stat barchart
                barchart.barChartUpdate(
                    playerRatingsData1,
                    offensiveParameters,
                    tooltip,
                    'ogp',
                    timeInterval,
                    true,
                )

                // Updates the defensive stat barchart
                barchart.barChartUpdate(
                    playerRatingsData2,
                    defensiveParameters,
                    tooltip,
                    'pbw',
                    timeInterval,
                    true,
                )

                // Updates the jump stat cartesian plot
                cartesian.cartesianUpdate(
                    selectedTeamValdData,
                    valdData,
                    jumpCartesianParameters,
                    tooltip,
                    timeInterval)

                // Updates the jump height linechart
                linechart.lineChartUpdate(
                    valdData,
                    jumpHeightParameters,
                    tooltip,
                    'jump_height',
                    timeInterval,
                )

                // Updates the asymmetry barchart
                horizontal.horizontalBarChartUpdate(
                    valdData,
                    asymmetryParameters,
                    tooltip
                )

            }

            // Appends the slider and runs whenBrushed when the dates change
            dateSlider(playerData, sliderParameters, whenBrushed)

        })

    })

})
