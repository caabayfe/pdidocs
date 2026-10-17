var ScheduledImportSetRunTime = Class.create();
ScheduledImportSetRunTime.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	date:function() { 
		var gr = new GlideRecord('scheduled_import_set');
		gr.addQuery('sys_id', this.getParameter('sysparm_sys_id'));
		gr.query();
		var runtime = ''; 
		if (gr.next())
 			runtime = gr.getValue('run_time');

		var dt = new GlideDateTime();
		// Revert the daylight saving adjustment after DEF0431911 is fixed
		var timeOffset = (dt.getTZOffset() - dt.getDSTOffset()) / 60 / 60 / 1000;

		var result = this.newItem("result");
		result.setAttribute("run_time", runtime);
		result.setAttribute("timeOffset", timeOffset);
	},
    type: 'ScheduledImportSetRunTime'
});
