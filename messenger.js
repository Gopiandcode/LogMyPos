'use-strict';

const twilio = require('twilio');
const twilio_config = require('./auth/twilio_config');
const config = require('./auth/config');
const moment = require('moment');
const Sherlock = require('sherlockjs');

const client = new twilio(twilio_config.account_sid, twilio_config.auth_token);

const tracker = require('./tracker');

module.exports = {
    notifyDelay : notifyDelay,
    notifyException: notifyException,
    respondData : respondData
};

function notifyDelay(expt_time) {
    current = new moment();
    str_message = "You were expected back at " + expt_time.format('hh:mm') + " it is now " +  current.format('hh:mm');
    client.messages.create({
        body: str_message,
        to: config.own_number,
        from: twilio_config.twilio_number
    });
}

function notifyException(expt_time) {
    current = new moment();
    str_message = "THIS IS AN AUTOMATED MESSAGE: Kiran was expected back at " + expt_time.format('hh:mm') + " however it is now " +  current.format('hh:mm');
    client.messages.create({
        body: str_message,
        to: config.emergency_number,
        from: twilio_config.twilio_number
    });
}



function respondData(body) {
    if(body === "status") {
        return tracker.getStatus();
    }
    let parsed = Sherlock.parse(body);
    if(parsed.startDate === null) {
        return "Sorry didn't understand that. No changes were made";
    }
    else {
        var date = null;
        try {
            date = new moment(parsed.startDate);
        } catch(e) {
            return "Unknown error occurred";
        }
        tracker.setLimit(date, (bool) => {
            if(bool)
                return "Updated limit to " + date.format('hh:mm');
            else
                return "Unknown error occurred.";
        });
    }
}