'use-strict';

const _ = require('underscore');

const moment = require('moment');
const cron = require('node-cron');
const CronJob = require('cron').CronJob;

let messenger = require('./messenger');
let logger    = require('./logger');

let timer_active = false;
let error_active = false;
let error_passed = false;
let timer_start  = null;
let timer_date   = null;
let timer_task   = null;



function momentToChron(date) {
    let hour = date.hours();
    let minute = date.minute();

    return "0 " + minute + " " + hour  + " * * *";
}








function limitPassed(){
    console.log("Limitpassed called\n");
    console.log(messenger);
    messenger.notifyDelay(timer_date);
    //delete task
    timer_task.stop();
    timer_task = null;
    timer_date = new moment(timer_date + moment.duration('PT1M'));
//    timer_task = cron.schedule(momentToChron(timer_date), warningPassed);
    timer_task = new CronJob(momentToChron(timer_date), warningPassed);
    timer_task.start();
    timer_active = false;
    error_active = true;
}

function warningPassed(){
    messenger.notifyException(timer_date);
    timer_task.stop();
    timer_task = null;
    timer_date = null;
    timer_active = false;
    error_active = false;
    error_passed = true;
}


_.extend(module.exports, {
    getStatus: function getStatus() {
	    if(!timer_active && !error_active) return "The log has you at home.";
	    if(!timer_active && error_active) return "The log states you have yet to return home, warning messages will be sent at " + timer_date.hours() + ":" + timer_date.minutes();
	    if(timer_active) return "The log states you are out of home, and expect to be back at " + timer_date.hours() + ":" + timer_date.minutes();
	},
    setLimit: function setLimit(date) {
	console.log("Setting limit(" + date.toString() + ")\n");
	console.log("timer_active: " + timer_active  + ", error_active: " + error_active + ", timer_date: " + timer_date + "\n");
	    if(timer_active || error_active) {
		if(timer_date < date) {
		    error_passed = false;
		    // update the timing
		    timer_task.destroy();
			console.log("moment to chron returns " + momentToChron(date)  + "\n");
		    //timer_task = cron.schedule(momentToChron(date), limitPassed);
		    timer_task = new CronJob(momentToChron(date), limitPassed);
		    timer_task.start();
		    console.log("moment scheduled");
		    timer_date = date;
		    // reset error status
		    timer_active = true;
		    error_active = false;
		    return true;
		} 
		return false;
	    } else {
		console.log("date");
		if(date > (new moment())) {
		    console.log("date > new moment()");
		    error_passed = false;
		    if(timer_task !== null) {
			timer_task.stop();
		    }

		    console.log("moment to chron returns " + momentToChron(date)  + "\n");
	//            timer_task = cron.schedule(momentToChron(date), limitPassed);
		    timer_task = new CronJob(momentToChron(date), limitPassed);
		    timer_task.start();
		    console.log(timer_task.nextDate());
		    console.log(new moment());
		    timer_active = true;
		    error_active = false;
		    timer_date = date;
		    timer_start = new moment();
		    return true;
		}
	    }
	    return false;
	},
    endLimit: function endLimit() {
	    if(timer_active || error_active || error_passed) {
		let current = new moment();
		logger.storeData(timer_start, current, timer_start, current);
		if(timer_task != null) {
		    timer_task.stop();
		    timer_task = null;
		}
		timer_active = false;
		error_active = false;
		error_passed = false;
		timer_date = null;
	    }

	}
});
