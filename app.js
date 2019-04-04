/*jslint node: true*/
/*jslint es6 */
"use strict";

require('dotenv').config();

const bodyParser = require('body-parser');
const my_btoa = require("btoa");
const express = require("express");
const fs = require("fs");
const application = express();
const my_XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const wml_credentials = new Map();

//wml_credentials.set("url", process.env.WML_URL);
//wml_credentials.set("username", process.env.WML_USERNAME);
//wml_credentials.set("password", process.env.WML_PASSWORD);
wml_credentials.set("scoring_url", process.env.SCORING_URL);


// Tokens obtained at startup
let token = "";
let wmlToken = "";

const scoring_url = process.env.SCORING_URL;
const wml_url = process.env.WML_URL;
const wml_username = process.env.WML_USERNAME;
const wml_password = process.env.WML_PASSWORD;
const map_apikey= process.env.MAP_APIKEY;
let parsedGetResponse;
application.use(bodyParser.urlencoded({ extended: true }));

application.use(express.static(__dirname + "/public"));

application.post('/modelintensity', function(req, res) {

    var payload = '{"fields": ["latitude", "longitude"], "values": [[' + req.body.lat + ',' + req.body.lng + ']]}';

    wml_apiPost(scoring_url, wmlToken, payload, function (resp) {
        let parsedPostResponse;
        try {
            parsedPostResponse = JSON.parse(this.responseText);
        } catch (ex) {
            console.log("Error parsing response.");
        }
        console.log("Scoring response");
        console.log(parsedPostResponse);
        if (parsedPostResponse.errors && parsedPostResponse.errors[0].message === "Expired authorization token."){
            console.log("Token has expired. Requesting new token...");
            getToken();
        }
        res.send(parsedPostResponse);

    }, function (error) {
        console.log(error);
    });
});


function wml_api_Get(url, username, password, loadCallback, errorCallback){
    const oReq = new my_XMLHttpRequest();
    const tokenHeader = "Basic " + my_btoa((username + ":" + password));
    const tokenUrl = url + "/v3/identity/token";

    oReq.addEventListener("load", loadCallback);
    oReq.addEventListener("error", errorCallback);
    oReq.open("GET", tokenUrl);
    oReq.setRequestHeader("Authorization", tokenHeader);
    oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    oReq.send();
}

function wml_apiPost(scoring_url, token, payload, loadCallback, errorCallback){
    const oReq = new my_XMLHttpRequest();
    oReq.addEventListener("load", loadCallback);
    oReq.addEventListener("error", errorCallback);
    oReq.open("POST", scoring_url);
    oReq.setRequestHeader("Accept", "application/json");
    oReq.setRequestHeader("Authorization", token);
    oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    oReq.send(payload);
}

function getToken(){
    wml_api_Get(wml_url,
        wml_username,
        wml_password,
        function (res) {
            let parsedGetResponse;
            try {
                parsedGetResponse = JSON.parse(this.responseText);
            } catch(ex) {
                // TODO: handle parsing exception
            }
            if (parsedGetResponse && parsedGetResponse.token) {
                token = parsedGetResponse.token;
                wmlToken = "Bearer " + token;
            } else {
                console.log("Failed to retrieve Bearer token");
            }
        }, function (err) {
            console.log(err);
        }
    );
}

fs.readFile("public/index.html", 'utf8', function (err,data) {
  if (err) {
    console.log("error: " + err);
    return;
  }

  const result = data.replace("APIKEY", map_apikey);
  fs.writeFile("public/index.html", result, 'utf8', function (err) {
      console.log("FS Write Err: " + err);
  });
});

getToken();

const port = process.env.PORT || process.env.VCAP_APP_PORT || 5000;

application.listen(port, function () {
    console.log("Server running on port: %d", port);
});

application.get('/express_backend', (req, res) => {
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

application.get('/modelintensity', (req, res) => {
    res.send({ response: parsedGetResponse	});
});
