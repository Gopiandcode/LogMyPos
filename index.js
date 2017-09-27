const createHandler = require('azure-function-express').createHandler;
const context = require('aws-lambda-mock-context');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const config = require('./auth/config');
const messenger = require('./messenger');
const logger = require('./logger');
const lambda = require('./alexa');

const app = express();
const port = process.env.PORT || config.local_port;

app.use(session({secret: 'LogmyposSecret'}));
app.use(bodyParser.json({type: 'application/json'}));


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

app.post('/alexa', function(req,res) {
    let ctx = context();

    lambda.handler(req.body, ctx);

    ctx.Promise.then((resp) => {
        return res.status(200).json(resp);
    }).catch((err) => {
        console.log(err);
    });

});



if(config.build_locally) {
    const http = require('http');
    http.createServer(app).listen(config.local_port, function() {
        console.log("Express server listening on port " + config.local_port);
    });

} else {
    module.exports = app;
}