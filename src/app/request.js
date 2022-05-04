/*import * as d3 from 'd3';

export function catapult_import () {

    const proxy = 'http://localhost:8000/';
    const url = 'https://connect-us.catapultsports.com/api/v6/athletes';
    const token = "yJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0NjFiMTExMS02ZjdhLTRkYmItOWQyOS0yMzAzOWZlMjI4OGUiLCJqdGkiOiIwZDU5M2E1ZDQ1MDZlMDMzMzFmOTE0YzNjMjA5ZWUwYjhkOTM4NjU5NTNlZTRhZTc2ZTJjMGQ0ZjY4MjFhOWVjMDU1ZTUxOGNhODBkNzQ4NCIsImlhdCI6MTY0NTA0MzEzMiwibmJmIjoxNjQ1MDQzMTMyLCJleHAiOjQ3OTg2NDMxMzIsInN1YiI6IjFjNGUyMGU3LWQzNWEtNGIwMy1hOWEwLTYxZDRjMDQ5MmJlMSIsInNjb3BlcyI6WyJjYXRhcHVsdHIiLCJjb25uZWN0Iiwic2Vuc29yLXJlYWQtb25seSJdfQ.IsvLfX-pTKW7IGsOpoR7YNry4i5ECv9MG04XAUmZpZwQRUfZnHTEnE8tmXNGmPrg7IX_eEXMQyj8WamDM3LCEB4FQAqVZ0p8KCiTxUZ5McohuJd6v7NFbd7XDDwgP0lMMQkktSa5Rh6P2cNY71FsBsKKQOvwctZ93nhUyYvh80_HA6mYT6GJ1G4FWORh1ZDqe9d0H0pN9-aXSuublQ_IgS4PqKkb7CYXBxjWjMlsIjmtKrIxK7S2NDyqOfhsamEoei8kXUmsgpr4f_SJaQw6MF-6b9xNx4Q_tDmGPLGoH-e2e3wwoRGaBA6p77Zf8bAcyw2eE0Py8-MZuA_MJEvb1WYtt6YCC3z3RORQc-HyHPKiqByOVZ3wcJKXcvRNE6PbE0hOKyPSp39QiBogbpNIW79juB-9-mdePWtW-ArnQsIMoMrL8azok5DEnYaMmroGFnueW7opNt7chl6YhLnGLq24YiwFCaUSy2sAw2iNCW1oWlIMbXZLfIqNqsUhEJOx2GyA5oxVHefRLjTKobF8dIxN2S9NUoS0ulwheZ3KRf07S-iKsWic6oRCOGag8_TU-Y_lDU8Vmjfa3R-HEHtLvKEhzwtu28ggrWdYEEB7sBiS_X0EpcdEacUjF0V-8_FinVcL62iyjV6NYYsrotjNOkp1c_FMMgDbNIkJHYdol1Q";

    //const url = 'https://jsonplaceholder.typicode.com/users';

    d3.json(url, {
        headers: new Headers({
          "Authorization": "Bearer " + token
        })
    })
    .then(json => {console.log(json)});
}*/

//const Http = new XMLHttpRequest();
/*Http.open("GET", url);
Http.setRequestHeader("Access-Control-Allow-Origin", "*");
Http.setRequestHeader("Accept", "application/json");
Http.setRequestHeader("Authorization", "Bearer " + token);
Http.send();

Http.onreadystatechange = (e) => {
  if (Http.readyState === 4) {
     console.log(Http.status);
     console.log(Http.responseText);
  }};*/

/*const express = require('express');
const request = require('request');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/jokes/random', (req, res) => {
  request(
    { url: url },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: err.message });
      }

      res.json(JSON.parse(body));
    }
  )
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`listening on ${PORT}`));*/


/*d3.fetch("api_url/path")
.header("Content-Type", "application/json")
.header("Authorization", "Bearer " + token)
.post(function(data) {
   console.log(data);
})*/




//TEST DONNÉES
//d3.json("../data/catapult_activities.json").then(function(data){console.log(data)});

//PROXY
