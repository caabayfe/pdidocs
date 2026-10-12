var SLASchedule = Class.create();

// decode com.snc.sla.schedule choice values into real field values
// (saves using an eval())
SLASchedule.source = function(source, /* task_sla */ gr, taskGr) {
	var logger = new GSLog('com.snc.sla.task_sla.log', 'SLASchedule');

	if (logger.atLevel(GSLog.DEBUG))
		logger.logDebug('source: ' + source);

	switch(source) {
		// The SLA definition's schedule
		case 'sla_definition':

			if (logger.atLevel(GSLog.DEBUG))
				logger.logDebug('sla_definition scheduleSysId: ' + gr.sla.schedule.sys_id);

			return gr.sla.schedule.sys_id;
		// A "Field from task" selected as source
		case 'task_field':
			if (!taskGr || taskGr.sys_id.nil()) {

				if (logger.atLevel(GSLog.DEBUG))
					logger.logDebug('task_field taskGr empty/null gr.sla.schedule_source_field: task.' +
						gr.sla.schedule_source_field + ' scheduleSysId: ' +
						gr.getElement('task.' + gr.sla.schedule_source_field));

				return gr.getElement('task.' + gr.sla.schedule_source_field);
			} else {

				if (logger.atLevel(GSLog.DEBUG))
					logger.logDebug('task_field gr.sla.schedule_source_field: ' + gr.sla.schedule_source_field +
					' scheduleSysId: ' + taskGr.getElement(gr.sla.schedule_source_field));

				return taskGr.getElement(gr.sla.schedule_source_field);
			}
		// No schedule selected as source
		case 'no_schedule':

			if (logger.atLevel(GSLog.DEBUG))
				logger.logDebug('sla_definition no schedule');

			return null;

		// ----------------------------------------------------------------------------------------
		// Legacy values for schedule source (taken from system property "com.snc.sla.schedule")
		// ----------------------------------------------------------------------------------------

		// The CI's schedule
		case 'sla.schedule':

			if (logger.atLevel(GSLog.DEBUG))
				logger.logDebug('sla.schedule scheduleSysId: ' + gr.sla.schedule.sys_id);

			return gr.sla.schedule.sys_id;
		// The SLA definition's schedule
		case 'task.cmdb_ci.schedule':

			if (logger.atLevel(GSLog.DEBUG))
				logger.logDebug('task.cmdb_ci.schedule scheduleSysId: ' + gr.task.cmdb_ci.schedule.sys_id);

			return gr.task.cmdb_ci.schedule.sys_id;

		default:

			if (logger.atLevel(GSLog.DEBUG))
				logger.logDebug('Schedule source not supported. No Schedule');

			return null;
	}
};

SLASchedule.prototype = {
	initialize : function() {
	},

	type:'SLASchedule'
};
