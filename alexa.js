const Alexa = require('alexa-sdk');
const moment = require('moment');
const tracker = require('./tracker');
const logger  = require('./logger');

module.exports.handler = function (event, context) {
    let alexa = Alexa.handler(event, context);

    alexa.registerHandlers({
        'AMAZON.StopIntent': function () {
            this.emit(':tell', "Okay, Closing the log.");
        },
        'AMAZON.HelpIntent': function () {
            this.emit(':tell', "This logging service was designed to make recording house entry exit times easier.");
        },
        'AMAZON.CancelIntent': function () {
            this.emit(':tell', "Okay, Closing the log.");
        },
        'BackIntent': function () {
            tracker.endLimit();
            this.emit(':tell', tracker.getStatus());
        },
        'LeavingIntent': function () {
            if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
                this.context.succeed({
                    "response": {
                        "directives": [
                            {
                                "type": "Dialog.Delegate"
                            }
                        ],
                        "shouldEndSession": false
                    },
                    "sessionAttributes": this.attributes
                });
            } else {
                let expected_time_string = this.event.request.intent.slots.TIME;
                let expected_time; 
                try {
                    expected_time = new moment(expected_time_string);
                } catch (err) {
                    console.log(err);
                    expected_time = null;
                }
                if(expected_time === null) {
                    this.emit(':tell', "LogMyPos was unable to log your leaving time.");
                } else {
                    tracker.setLimit(expected_time);
                    this.emit(':tell', tracker.getStatus())
                }
            }
        },
        'SubmitIntent': function () {
            let morningRunTime_string = this.event.request.intent.slots.MORNINGRUNTIME;
            let eveningRunTime_string = this.event.request.intent.slots.EVENINGRUNTIME;
            let morningRunTime = null;
            let eveningRunTime = null;
            let err_count = 0;
            try {
                morningRunTime = moment.duration(morningRunTime_string);
            } catch(err) {
                err_count = err_count + 1;
                console.log(err);
            }
            try {
                eveningRunTime = moment.duration(eveningRunTime_string);
            } catch(err) {
                err_count = err_count + 1;
                console.log(err);
            }

            if(err_cout < 2) {
                logger.storeRunningData(morningRunTime, eveningRunTime);
                let str = "";
                if(morningRunTime !== null) {
                    str += "Your morning run time of " + (morningRunTime.hours() === 0 ? "" : morningRunTime.hours() + "hours, ") + morningRunTime.minutes() + " minutes and " + morningRunTime.seconds() + " "; 
                } 
                if(eveningRunTime !== null) {
                    if(morningRunTime !== null)
                        str += "and ";
                    str += "Your evening run time of " + (eveningRunTime.hours() === 0 ? "" : eveningRunTime.hours() + "hours, ") + eveningRunTime.minutes() + " minutes and " + eveningRunTime.seconds() + " "; 
                }
                str += "has been recorded."
                this.emit(':tell', str);
            } else {
                this.emit(':tell', "LogMyPos was not able to log your data, please try again.")
            }

        },
        'StatusIntent': function() {
            this.emit(':tell', tracker.getStatus());
        }
    });

    alexa.execute();

}