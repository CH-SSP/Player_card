/**
 * app.js
 * ======
 * Main file of the application. This file is used to initialize the scroller and imports the visualizations used.
 */

'use strict';
import * as d3 from 'd3';
import '../assets/styles/style.scss';
import { playerList } from "./helper.js"
import { makeSlider, dateSlider } from "./slider.js"
import * as catapult from './catapult.js';
import { addBodyWeight } from "./helper.js"
import { addCatapultToTable } from "./helper.js"
import { offensive } from "./offensive_stat.js"

d3.json("./data/data.json").then(function (data) {

    playerList(data)

    var sliderParameters = makeSlider()

    var teams = [
        ...new Set(data.map(d => d.player_ratings.map(d => d.opponent)).flat()), 
        ...new Set(data.map(d => d.catapult_data.map(d => {
            let splitted = d.activity_name.split(' ')
            if (splitted[0] == 'LR' && splitted[1] == 'vs') {
                return splitted[2]//.slice(0,3)
            }
        })).flat())
    ]
    console.log(teams)

    var inGamePaceParameters = catapult.lineChartBuilder("#InGamePace")

    d3.select("#player-select").on("input.3", function () {

        var playerData = data.filter(d => d.name.includes(this.value))[0];

        function whenBrushed(data, timeInterval ) {
            // if (event.sourceEvent && event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            // var s = event.selection || x.range();
            // x.domain(s.map(x.invert, x));
            // focus.select(".area").attr("d", area);
            // focus.select(".axis--x").call(xAxis);
            // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            //     .scale(width / (s[1] - s[0]))
            //     .translate(-s[0], 0));
            let datesData = catapult.getCatapultData(data, timeInterval, teams)
            
            catapult.lineChartUpdate(
                datesData.filter(d => d.type !== 'Practice' & d.type !== 'Other'), 
                inGamePaceParameters
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