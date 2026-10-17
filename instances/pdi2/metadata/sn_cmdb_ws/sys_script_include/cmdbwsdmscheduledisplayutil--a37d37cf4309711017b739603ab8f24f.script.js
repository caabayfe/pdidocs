var CMDBWsDMScheduleDisplayUtil = Class.create();
CMDBWsDMScheduleDisplayUtil.prototype = {
    initialize: function() {

    },

	_getWeekDay: function(weekDayNum) {
		var CONST = new CMDBWsDMConstants();
		switch (weekDayNum) {
			case "1":
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Monday");
			case "2":
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Tuesday");
			case "3":
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Wednesday");
			case "4":
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Thursday");
			case "5":
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Friday");
			case "6":
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Saturday");
			case "7":
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Sunday");
			default:
				return "";
		}
	},

	getScheduleLabel: function(schedule) {
		var CONST = new CMDBWsDMConstants();
		switch (schedule[CONST.POLICY_SCHEDULED_JOB.RUN_TYPE]) {
			case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.DAILY:
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Daily at {0}", 
					{
						0: schedule.run_time_display
					}
				);
			case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.WEEKLY:
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Weekly on {0} at {1}", 
					{
						0: this._getWeekDay(schedule[CONST.POLICY_SCHEDULED_JOB.RUN_DAYOFWEEK]),
						1: schedule.run_time_display
					}
				);
			case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.MONTHLY:
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Day {0} of the month at {1}", 
					{
						0: schedule[CONST.POLICY_SCHEDULED_JOB.RUN_DAYOFMONTH],
						1: schedule.run_time_display
					}
				);
			case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.PERIODICALLY:
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Periodically every {0} starting on {1}", 
					{
						0: schedule.run_period_display,
						1: schedule.run_start
					}
				);
			case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.ONCE:
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "Once on {0}", 
					{
						0: schedule.run_start
					}
				);
			case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.ON_DEMAND:
				return sn_i18n.Message.getMessage("sn_cmdb_ws", "On demand");
			default:
				return "";
		}
	},

    type: 'CMDBWsDMScheduleDisplayUtil'
};
