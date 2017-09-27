'use-strict';
const _ = require('underscore');
const GoogleSpreadsheet = require('google-spreadsheet');
const credentials = require('./auth/client_secret');
const config = require('./auth/config');
const moment = require('moment');
var document = new GoogleSpreadsheet(config.spreadsheet_id);


/**
 * @desc Stores entry location data into spreadsheet
 * @param {moment} startTime 
 * @param {moment} endTime 
 * @param {moment} startDate 
 * @param {moment} endDate 
 */
/**
 * @desc stores running data into spreadsheet
 * @param {moment} morningRunTime 
 * @param {moment} eveningRunTime 
 * @param {moment} date 
 */


function generateData(startTime, endTime, startDate, endDate) {
    return {
        leavedate: startDate ? startDate.format('DD/MM/YYYY') : 'NA',
        leavetime: startTime ? startTime.format('hh:mm') : 'NA',
        enterdate: endDate ? endDate.format('DD/MM/YYYY') : 'NA',
        entertime: endTime ? endTime.format('hh:mm') : 'NA',
    };
}

function generateRunningData(morningRunTime, eveningRunTime, date) {
    return {
        morningruntime: morningRunTime ? normalizeDuration(morningRunTime) : 'NA',
        eveningruntime: eveningRunTime ? normalizeDuration(eveningRunTime) : 'NA',
        date: date ? date.format('DD/MM/YYYY') : new moment().format('DD/MM/YYYY'),
    }
}


function padleftInt(integral, width){
    let value = Math.pow(10, width - 1);
    let i = 0;
    let result = '';
    do{
        if(integral < value) {
            result += '0';
            value /= 10;
        } else {
            result += integral;
            break;
        }
        i = i + 1;
    } while(i < width);

    return result;

}

function normalizeDuration(duration) {
    return (duration.hours() == 0 ? '' : padleftInt(Number(duration.hours()), 2) + ':') + padleftInt(Number(duration.minutes()), 2) + ':' + padleftInt(Number(duration.seconds()), 2);
}

_.extend(module.exports, {
    storeData: function storeData(startTime, endTime, startDate, endDate) {

	    document.useServiceAccountAuth(credentials, function(err){
		if(err)
		    console.log(err);

		    document.addRow(1, generateData(startTime, endTime, startDate, endDate), function(err) {
			    if(err)
				console.log(err);
			});
		    });
},
    storeRunningData: function storeRunningData(morningRunTime, eveningRunTime, date) {
	    document.useServiceAccountAuth(credentials, function(err){
		if(err)
		    console.log(err);

		    document.addRow(2, generateRunningData(morningRunTime, eveningRunTime, date), function(err) {
			    if(err)
				console.log(err);
			});
		    });

	}
});
