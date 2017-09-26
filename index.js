const express = require('express');
const twilio = require('./twilio');

const config = require('./auth/config');
const messenger = require('./messenger');
const logger = require('./logger');

const app = express();



app.post('/sms', function(req, res) {
    if(req.body && req.body.Body) {
        let resp = messenger.respondData(req.body.Body);
        let twiml = new twilio.TwimlResponse();
        twiml.message(resp);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    } else {
        res.send(403);
    }
});



if(config.build_locally) {
    const http = require('http');
    http.createServer(app).listen(config.local_port, function() {
        console.log("Express server listening on port " + config.local_port);
    });

} else {
    module.exports = {
        app: app
    };
}