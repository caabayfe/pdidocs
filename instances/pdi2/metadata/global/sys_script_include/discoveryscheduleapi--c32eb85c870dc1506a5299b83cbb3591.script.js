var DiscoveryScheduleAPI = Class.create();
/*
Input Json Object Sample : 

  {
    "name":"",
	"discover":"Serverless",
	"mid": {
		"server":""
	},
	 "scheduling": {
		         "run_type":"",
         		 "run_time":"", 
                 "run_dayofweek":"", 
                 "run_dayofmonth":"",
                 "run_repeat_interval":"",
                 "run_starting":"",
                 "run_after":"" 
    	 },
   	  "execution_info":{
     		"name":"",
     		"pattern":"",

     	"pattern_params": [
     			{
     				"key":"url",
     				"value":""
     			},
     			{
     				"key":"namespace",
     				"value":""
     			},
     			{
     				"key":"credentialsAlias",
     				"value":""
     			},
     			{
     				"key":"prometheusURL",
     				"value":""
     			}
     		]
     	}
}

*/

DiscoveryScheduleAPI.createSchedule = function(scheduleConfig) {
    var ds = new DiscoveryScheduleAPI();
    return ds.createSchedule(scheduleConfig);
};

DiscoveryScheduleAPI.findScheduleWithIpFromCiUsingDeviceHistory = function(ciSysId, ipAddresses) {
	if (gs.nil(ciSysId)) 
		return;
	var ips = ipAddresses || DiscoveryFunctions.getIpsForCi(ciSysId);
	var dh = new GlideRecord('discovery_device_history');
	dh.addQuery('cmdb_ci', ciSysId);
	dh.addQuery('status.dscheduler.active', true);
	dh.orderByDesc('sys_created_on');
	dh.query();

	while (dh.next()) {
		if (SNC.IPAddress.isValid(dh.source)) {
			gr = new GlideRecord('discovery_schedule');
			gr.get('sys_id', dh.status.dscheduler);
			schedule = new DiscoverySchedule(gr);
			if (schedule.contains(dh.source))
				return {
					ip: dh.source,
					schedule: schedule
				};

			for (i in ips) {
				if (schedule.contains(ips[i]))
					return {
						ip: ips[i],
						schedule: schedule
					};
			}
		}
	}
};

DiscoveryScheduleAPI.findScheduleFromCiUsingDeviceHistory = function(ciSysId) {
	var scheduleWithAssocIp = DiscoveryScheduleAPI.findScheduleWithIpFromCiUsingDeviceHistory(ciSysId);

	if (scheduleWithAssocIp)
		return scheduleWithAssocIp.schedule;
};

DiscoveryScheduleAPI.prototype = {
    initialize: function() {
        this.discoverySchedule = null;
        this.patternLauncher = null;
        this.scheduleConfig = null;
    },

    createSchedule: function(scheduleConfig) {

        if (JSUtil.nil(scheduleConfig)) {
            gs.logError("Discovery schedule input json object is null or empty, provide a valid input JSON object.", "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule input json object is null or empty, provide a valid input JSON object.";
        }
        this.scheduleConfig = scheduleConfig;
        this.createDiscoverySchedule();
        this.createServerlessPattern();
        this.populatePatternParameters();

        return this.discoverySchedule;
    },

    createDiscoverySchedule: function() {

        this.checkServerlessDiscoveryMandatoryParams();

        var obj = JSON.parse(this.scheduleConfig);
        var name = obj.name;
        var discover = obj.discover;
        var mid_server = obj.mid.server;
        var run_type = obj.scheduling.run_type;

        var choiceArray = [];
        choiceArray.push(discover);
        choiceArray.push(run_type);

        var choiceGr = new GlideRecord('sys_choice');
        choiceGr.addQuery("label", 'IN', choiceArray.join(','));
        choiceGr.addQuery("name", "discovery_schedule");
        choiceGr.query();

        while (choiceGr.next()) {
            if (choiceGr.label.equals(discover)) {
                discover = choiceGr.value + "";
            } else if (choiceGr.label.equals(run_type)) {
                run_type = choiceGr.value + "";
            }
        }

        //Validate if the run is  valid ie: Daily/Weekly etc
        if (this.validateRunType(run_type) == false) {
            gs.logError("Discovery schedule run is not valid, kindly verify the 'scheduling.run_type' property in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule run is not valid, kindly verify the 'scheduling.run_type' property in the input JSON object";
        }

        var scheduleGr = new GlideRecord('discovery_schedule');
        scheduleGr.initialize();
        scheduleGr.name = name;
        scheduleGr.discover = discover;
        scheduleGr.mid_server.setDisplayValue(mid_server);
        scheduleGr.disco_run_type = run_type;

        switch (run_type) {
            case "weekdays":
            case "weekends":
            case "month_last_day":
            case "calendar_quarter_end":
            case "daily":
                this.insertCommonDiscovery(scheduleGr);
                break;
            case "after_discovery":
                this.insertAfterDiscoveryDiscovery(scheduleGr);
                break;
            case "weekly":
                this.insertWeeklyDiscovery(scheduleGr);
                break;
            case "monthly":
                this.insertMonthlyDiscovery(scheduleGr);
                break;
            case "periodically":
                this.insertPeriodicallyDiscovery(scheduleGr);
                break;
            case "once":
                this.insertRunOnceDiscovery(scheduleGr);
                break;
            default:
                //On demand
                this.discoverySchedule = scheduleGr.insert();
        }
    },

    createServerlessPattern: function() {
        var obj = JSON.parse(this.scheduleConfig);

        var name = obj.execution_info.name;
        var pattern_name = obj.execution_info.pattern;

        var patLauncherGr = new GlideRecord('discovery_ptrn_hostless_lchr');
        patLauncherGr.initialize();
        patLauncherGr.active = true;
        patLauncherGr.name = name;
        patLauncherGr.pattern.setDisplayValue(pattern_name);
        patLauncherGr.schedule = this.discoverySchedule;
        patLauncherGr.setWorkflow(false);

        this.patternLauncher = patLauncherGr.insert();
    },

    populatePatternParameters: function() {
        var obj = JSON.parse(this.scheduleConfig);
        var pattern_params = obj.execution_info.pattern_params;
        var paramsMap = {};

        for (var i = 0; i < pattern_params.length; i++) {
            var params = pattern_params[i];
            paramsMap[params.key] = params.value;
        }


        var gr = new GlideRecord('discovery_ptrn_hostless_lchr');
        gr.get(this.patternLauncher);
        var pattern = gr.pattern;

        // Get list of parameters to create
        var paramDefGr = new GlideRecord('discovery_ptrn_lnch_param_def');
        paramDefGr.addQuery('pattern', pattern);
        paramDefGr.query();

        // Create parameters as needed
        while (paramDefGr.next()) {
            var paramGr = new GlideRecord('discovery_ptrn_lnch_param');
            paramGr.initialize();
            paramGr.setValue('param', paramDefGr.getValue('sys_id'));
            paramGr.setValue('pattern_launcher', this.patternLauncher);

            if (JSUtil.notNil(paramsMap[paramDefGr.key])) {
                paramGr.value = paramsMap[paramDefGr.key];
            }

            paramGr.setWorkflow(false);
            paramGr.insert();

        }
    },

    insertCommonDiscovery: function(scheduleGr) {
        var obj = JSON.parse(this.scheduleConfig);
        var run_time = obj.scheduling.run_time;

        var gtime = new GlideTime();
        var exp = /^\d{1,2}:\d{1,2}:\d{1,2}$/;

        var time = run_time.match(exp);

        //Validate if the run time is  valid and in format HH:MM:SS
        if (JSUtil.nil(time)) {
            gs.logError("Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object.";
        }

        gtime.setDisplayValue(time);
        scheduleGr.setValue('run_time', gtime.getValue());
        this.discoverySchedule = scheduleGr.insert();
    },

    insertAfterDiscoveryDiscovery: function(scheduleGr) {
        var obj = JSON.parse(this.scheduleConfig);
        var run_after = obj.scheduling.run_after;

        if (JSUtil.nil(run_after)) {
            gs.logError("Discovery schedule property 'scheduling.run_after' is empty, kindly validate the property in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule property 'scheduling.run_after' is empty, kindly validate the property in the input JSON object.";
        }
        scheduleGr.run_after.setDisplayValue(run_after);
        this.discoverySchedule = scheduleGr.insert();
    },

    insertWeeklyDiscovery: function(scheduleGr) {
        var obj = JSON.parse(this.scheduleConfig);
        var run_time = obj.scheduling.run_time;
        var run_dayofweek = obj.scheduling.run_dayofweek;

        var gtime = new GlideTime();
        var exp = /^\d{1,2}:\d{1,2}:\d{1,2}$/;

        var time = run_time.match(exp);

        //Validate if the run time is  valid and in format HH:MM:SS
        if (JSUtil.nil(time)) {
            gs.logError("Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object.";
        }

        var day = this.getDaysNumber(run_dayofweek);

        if (day == -1) {
            gs.logError("Discovery schedule property 'scheduling.run_dayofweek' is either empty or not valid, kindly validate the property in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule property 'scheduling.run_dayofweek' is either empty or not valid, kindly validate the property in the input JSON object.";

        }

        gtime.setDisplayValue(time);
        scheduleGr.setValue('run_time', gtime.getValue());
        scheduleGr.run_dayofweek = day;
        this.discoverySchedule = scheduleGr.insert();
    },

    insertMonthlyDiscovery: function(scheduleGr) {
        var obj = JSON.parse(this.scheduleConfig);
        var run_time = obj.scheduling.run_time;
        var run_dayofmonth = obj.scheduling.run_dayofmonth;

        var gtime = new GlideTime();
        var exp = /^\d{1,2}:\d{1,2}:\d{1,2}$/;

        var time = run_time.match(exp);

        //Validate if the run time is  valid and in format HH:MM:SS
        if (JSUtil.nil(time)) {
            gs.logError("Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object.";
        }

        //Validate if dayofmonth is in valid range
        if (run_dayofmonth < 1 && run_dayofmonth > 31) {
            gs.logError("Discovery schedule run_dayofmonth is not in valid range, kindly verify the 'scheduling.run_dayofmonth' property in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule run_dayofmonth is not in valid range, kindly verify the 'scheduling.run_dayofmonth' property in the input JSON object.";
        }

        gtime.setDisplayValue(time);
        scheduleGr.setValue('run_time', gtime.getValue());
        scheduleGr.run_dayofmonth = run_dayofmonth;
        this.discoverySchedule = scheduleGr.insert();
    },

    insertPeriodicallyDiscovery: function(scheduleGr) {
        var obj = JSON.parse(this.scheduleConfig);
        var run_period = obj.scheduling.run_repeat_interval;
        var run_start = obj.scheduling.run_starting;

        var exp = /^\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/;
        var period = run_period.match(exp);

        //Validate if period is in valid format- DAY HH:MM:SS
        if (JSUtil.nil(period)) {
            gs.logError("Discovery schedule property 'scheduling.run_repeat_interval' is either empty or not valid, kindly provide the input in 'DAY HH:MM:SS' format in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule property 'scheduling.run_repeat_interval' is either empty or not valid, kindly provide the input in 'DAY HH:MM:SS' format in the input JSON object.";
        }

        scheduleGr.run_period = new GlideDuration(period);
        scheduleGr.run_start = new GlideDateTime(run_start);
        this.discoverySchedule = scheduleGr.insert();
    },

    insertRunOnceDiscovery: function(scheduleGr) {
        var obj = JSON.parse(this.scheduleConfig);
        var run_time = obj.scheduling.run_time;
        var run_start = obj.scheduling.run_starting;

        var gtime = new GlideTime();
        var exp = /^\d{1,2}:\d{1,2}:\d{1,2}$/;

        var time = run_time.match(exp);

        //Validate if the run time is  valid and in format HH:MM:SS
        if (JSUtil.nil(time)) {
            gs.logError("Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule property 'scheduling.run_time' is either empty or not valid, kindly provide the input in 'HH:MM:SS' format in the input JSON object.";
        }

        gtime.setDisplayValue(time);
        scheduleGr.setValue('run_time', gtime.getValue());
        scheduleGr.run_start = new GlideDateTime(run_start);
        this.discoverySchedule = scheduleGr.insert();
    },

    checkServerlessDiscoveryMandatoryParams: function() {

        var obj = JSON.parse(this.scheduleConfig);
        var discover = obj.discover;
        var mid_server = obj.mid.server;
        var pattern = obj.execution_info.pattern;

        //Validate if discovery is serverless
        if (JSUtil.nil(discover) || !discover.equalsIgnoreCase("Serverless")) {
            gs.logError("Discovery schedule is not set to Serverless under the JSON property  'discover' , set the 'discover' property to Serverless in the input JSON Object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Discovery schedule is not set to Serverless under the JSON property  'discover' , set the 'discover' property to Serverless in the input JSON Object";
        }

        //mid server name is valid or not
        if (JSUtil.nil(MIDServer.getByName(mid_server))) {
            gs.logError("Mid server is either empty or not valid, kindly verify the 'mid.server' property in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Mid server is either empty or not valid, kindly verify the 'mid.server' property in the input JSON object";
        }

        //Pattern name is valid or not
        var patternGr = new GlideRecord("sa_pattern");
        patternGr.addQuery("name", pattern);
        patternGr.query();
        patternGr.next();

        if (JSUtil.nil(patternGr.name)) {
            gs.logError("Pattern is either empty or not valid, kindly verify the 'execution_info.pattern' property in the input JSON object - " + this.scheduleConfig, "DiscoveryScheduleAPI");
            throw "ERROR: Pattern is either empty or not valid, kindly verify the 'execution_info.pattern' property in the input JSON object.";
        }
    },

    validateRunType: function(run_type) {
        var runType = {
            "weekly": "Weekly",
            "monthly": "Monthly",
            "periodically": "Periodically",
            "once": "Once",
            "on_demand": "On Demand",
            "daily": "Daily",
            "weekdays": "Weekdays",
			"weekends": "Weekends",
            "month_last_day": "Month Last Day",
            "calendar_quarter_end": "Calendar Quarter End",
            "after_discovery": "After Discovery"

        };

        if (runType.hasOwnProperty(run_type)) {
            return true;
        }

        return false;
    },

    getDaysNumber: function(day) {
        var dayNumber = -1;
        var days = {
            "monday": 1,
            "tuesday": 2,
            "wednesday": 3,
            "thursday": 4,
            "friday": 5,
            "saturday": 6,
            "sunday": 7
        };

        if (days.hasOwnProperty(day.toLowerCase())) {
            dayNumber = days[day.toLowerCase()];
        }

        return dayNumber;
    },


    type: 'DiscoveryScheduleAPI'
};
