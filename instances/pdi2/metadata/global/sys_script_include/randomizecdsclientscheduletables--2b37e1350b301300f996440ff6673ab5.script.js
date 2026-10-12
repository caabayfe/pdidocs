var RandomizeCDSClientScheduleTables = Class.create();
RandomizeCDSClientScheduleTables.prototype = {

	/**
	 * Randomize download/pull time of the jobs for tables in the input array so,
	 * that they won't initiate download at the same time
	 * 
	 * @param {string[]} CDSTablesToDownload - Array of tables to be ranomized.
	 * @param {int[]} offsetTimes - Array is used to stagger the download/pull times of the tables
	 * 
	 * Update the table run_time and run_dayofweek to the calcuated value from offsetTimes[]
	 */
	
	initialize: function() {
	},
	
	process : function(CDSTablesToDownload, offsetTimes, overrideScheduleParams) {
		
		if (!(this.checkTable('sys_trigger')) || !(this.checkTable('cds_client_schedule'))) {
			return;
		}
		
		this.processCDSDownloadSchedules(CDSTablesToDownload, offsetTimes, overrideScheduleParams);
	},
	
	checkTable : function(table) {
		var gr = new GlideRecord(table);
		if (!gr.isValid()) {
			this.log('Table checking failed');
			return false;
		}
		
		return true;
	},
	
	processCDSDownloadSchedules : function(CDSTablesToDownload, offsetTimes, overrideScheduleParams) {
		var day = this.getRandomDay();
		this.log('Random Day: ' + day);
		
		var time = this.getRandomTime();
		this.log('Random Time: ' + time);
		
		var clientSchedule = new GlideRecord('cds_client_schedule');
		clientSchedule.initialize();
		clientSchedule.addQuery('table.table', CDSTablesToDownload[0]);
		clientSchedule.query();
		if (clientSchedule.next()) {
			clientSchedule.setValue('run_type', 'weekly');
			clientSchedule.setValue('run_dayofweek', day.toString());
			clientSchedule.setValue('run_time', time);
			clientSchedule.setValue('active', true);
			this.setOverrideScheduleParams(clientSchedule, overrideScheduleParams, time);
			clientSchedule.update();
		}
		
		for(var i = 1; i < CDSTablesToDownload.length; i++) {
			clientSchedule.initialize();
			clientSchedule.addQuery('table.table', CDSTablesToDownload[i]);
			clientSchedule.query();
			if (clientSchedule.next()) {
				clientSchedule.setValue('run_type', 'weekly');
				clientSchedule.setValue('active', true);
				this.setDateAndTime(clientSchedule, offsetTimes[i-1], CDSTablesToDownload[i-1], overrideScheduleParams);
			}
		}
	},
	
	getRandomInt : function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	
	log : function(msg) {
		gs.info('RandomizeCDSClientSchedule: ' + msg);
	},
	
	getRandomDay : function() {
		var day = this.getRandomInt(1, 7);
		var gdt = new GlideDateTime();
		var dayOfWeek = gdt.getDayOfWeekLocalTime();
		while(dayOfWeek == day) {
			day = this.getRandomInt(1, 7);
		}
		return day;
	},
	
	getRandomTime : function() {
		return this.getRandomInt(0, 23) + ':' + this.getRandomInt(0, 59) + ':' + this.getRandomInt(0, 59);
	},
	
	generateRunTime : function (newRunTimeHrs, newRunTimeMin, newRunTimeSec) {
		return newRunTimeHrs + ':' + newRunTimeMin + ':' + newRunTimeSec;
	},
	
	setDateAndTime : function(clientSchedule, offset, prevTableName, overrideScheduleParams) {
		var prevClientScheduleTable = new GlideRecord('cds_client_schedule');
		prevClientScheduleTable.addQuery('table.table', prevTableName);
		prevClientScheduleTable.query();
		if (prevClientScheduleTable.next()) {
			var prevRunTime = prevClientScheduleTable.getValue('run_time');
			var prevDayOfWeek = prevClientScheduleTable.getValue('run_dayofweek');
			var dayTimeSplit = prevRunTime.split(' ');
			var runTime = dayTimeSplit[1].split(':');
			var newRunTimeHours = Number(runTime[0]);
			var newRunTimeMinutes = Number(runTime[1]) + parseInt(offset);
			while (newRunTimeMinutes >= 60) {
				newRunTimeHours = newRunTimeHours + 1;
				newRunTimeMinutes = newRunTimeMinutes - 60;
			}
			while (newRunTimeHours >= 24) {
				newRunTimeHours = newRunTimeHours - 24;
				prevDayOfWeek = parseInt(prevDayOfWeek) + 1;
				if (prevDayOfWeek == 8) {
					prevDayOfWeek = 1;
				}
			}
			
			var finalRunTime = this.generateRunTime(newRunTimeHours, newRunTimeMinutes, Number(runTime[2]));
			clientSchedule.setValue('run_time', finalRunTime);
			clientSchedule.setValue('run_dayofweek', prevDayOfWeek + '');
			this.setOverrideScheduleParams(clientSchedule, overrideScheduleParams, finalRunTime);
			clientSchedule.update();
		}
	},

	setOverrideScheduleParams: function(record, params, runTime) {
		if (params) {
			for (var key in params) {
				record.setValue(key, params[key]);
				if (key == 'run_type' && params[key] == 'periodically') {
					var runStart = this.getMostRecentDateForDay(record.getValue('run_dayofweek')) + ' ' + runTime;
					record.setValue('run_start', runStart);
				}
			}
		}
	},

	// Input: dayOfWeek (1 for Monday, 7 for Sunday)
	getMostRecentDateForDay: function(dayOfWeek) {
		var today = new GlideDateTime();
		var currentDayOfWeek = today.getDayOfWeekLocalTime(); // Get the current day of the week (1 for Monday, 7 for Sunday)
	
		// Calculate the difference in days
		var daysDifference = currentDayOfWeek - dayOfWeek;
		if (daysDifference < 0) {
			daysDifference += 7; // Adjust to find the closest past day
		}
		
		today.addDays(-daysDifference);
		
		return today.getLocalDate();
	},
	
	type: 'RandomizeCDSClientScheduleTables'
};
