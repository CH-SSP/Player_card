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
import { addBodyWeight } from "./helper.js"
import { addCatapultToTable } from "./helper.js"
import { offensive } from "./offensive_stat.js"

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

const dim = {
    'fullWidth': 700,
    'fullHeight': 400,
    'margin': { top: 30, right: 30, bottom: 30, left: 30 }
}

d3.json("./data/data.json").then(function (data) {

    helper.playerList(data)

    const sliderParameters = makeSlider()
    const teams = helper.getTeams(data)
    const inGamePaceParameters = helper.chartBuilder("#InGamePace", dim)
    const maxVelParameters = helper.chartBuilder("#MaxVel", dim)
    const playerLoadParameters = helper.chartBuilder("#PlayerLoad", dim)


    d3.select("#player-select").on("input.3", function () {

        var playerData = data.filter(d => d.name.includes(this.value))[0];


        function whenBrushed(data, timeInterval) {
            // if (event.sourceEvent && event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            // var s = event.selection || x.range();
            // x.domain(s.map(x.invert, x));
            // focus.select(".area").attr("d", area);
            // focus.select(".axis--x").call(xAxis);
            // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            //     .scale(width / (s[1] - s[0]))
            //     .translate(-s[0], 0));
            let datesData = helper.getCatapultData(data, timeInterval, teams)

            
            linechart.lineChartUpdate(
                datesData.filter(d => d.type !== 'Practice' & d.type !== 'Other'), 
                inGamePaceParameters,
                tooltip,
                'pace',
                timeInterval
            )

            linechart.lineChartUpdate(
                datesData.filter(d => d.type !== 'Practice' & d.type !== 'Other'), 
                maxVelParameters,
                tooltip,
                'maxvel',
                timeInterval
            )

            barchart.barChartUpdate(
                datesData, 
                playerLoadParameters,
                tooltip,
                'load',
                timeInterval
            )
            
        }

        dateSlider(playerData, sliderParameters, whenBrushed)

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