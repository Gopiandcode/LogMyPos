'use-strict';


const moment = require('moment');
const cron = require('node-cron');

let messenger = require('./messenger');
let logger    = require('./logger');

let timer_active = false;
let error_active = false;
let error_passed = false;
let timer_start  = null;
let timer_date   = null;
let timer_task   = null;



function momentToChron(date) {
    let hour = date.hour();
    let minute = date.minute();

    return "* " + minute + " " + hour + " * " + " * " + " * ";
}




module.exports = {
    getStatus: getStatus,
    setLimit: setLimit,
    endLimit: endLimit
};

function getStatus() {
    if(!timer_active && !error_active) return "The log has you at home.";
    if(!timer_active && error_active) return "The log states you have yet to return home, warning messages will be sent at " + timer_date.hours() + ":" + timer_date.minutes();
    if(timer_active) return "The log states you are out of home, and expect to be back at " + timer_date.hours() + ":" + timer_date.minutes();
}

function setLimit(date) {
    if(timer_active || error_active) {
        if(timer_date < date) {
            error_passed = false;
            // update the timing
            timer_task.destroy();
            timer_task = cron.schedule(momentToChron(date), limitPassed);
            timer_date = date;
            // reset error status
            timer_active = true;
            error_active = false;
        }
    } else {
        if(date > new moment()) {
            error_passed = false;
            if(timer_task != null) {
                timer_task.destroy();
            }
            timer_task = cron.schedule(momentToChron(date), limitPassed);
            timer_active = true;
            error_active = false;
            timer_date = date;
            timer_start = new moment();
        }
    }
}

function endLimit() {
    if(timer_active || error_active || error_passed) {
        let current = new moment();
        logger.storeData(timer_start, current, timer_start, current);
        if(timer_task != null) {
            timer_task.destroy();
            timer_task = null;
        }
        timer_active = false;
        error_active = false;
        error_passed = false;
        timer_date = null;
    }

}


function limitPassed(){
    messenger.notifyDelay(timer_date);
    //delete task
    timer_task.destroy();
    timer_task = null;
    timer_date = new moment(timer_date + moment.duration('PT1H'));
    timer_task = cron.schedule(momentToChron(timer_date), warningPassed);
    timer_active = false;
    error_active = true;
}

function warningPassed(){
    messenger.notifyException(timer_date);
    timer_task.destroy();
    timer_task = null;
    timer_date = null;
    timer_active = false;
    error_active = false;
    error_passed = true;
}
