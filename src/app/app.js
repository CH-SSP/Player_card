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
import { addBodyWeight } from "./helper.js"
import { addCatapultToTable } from "./helper.js"
import { offensive } from "./offensive_stat.js"

d3.json("../data/data.json").then(function (data) {

    console.log(data)

    playerList(data)

    var sliderParameters = makeSlider()

    d3.select("#player-select").on("input.3", function () {

        function whenBrushed(timeInterval) {
            // if (event.sourceEvent && event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            // var s = event.selection || x.range();
            // x.domain(s.map(x.invert, x));
            // focus.select(".area").attr("d", area);
            // focus.select(".axis--x").call(xAxis);
            // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            //     .scale(width / (s[1] - s[0]))
            //     .translate(-s[0], 0));
            console.log(timeInterval)
        }

        dateSlider(data, this.value, sliderParameters, whenBrushed)

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