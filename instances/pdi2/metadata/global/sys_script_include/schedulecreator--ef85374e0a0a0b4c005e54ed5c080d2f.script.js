var ScheduleCreator = Class.create();
ScheduleCreator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	ajaxFunction_createSchedule: function() {
		var access_method = "btree";
		if (this.getParameter("sysparm_access_method"))
			access_method = this.getParameter("sysparm_access_method");
		
		var unique = false;
		if (this.getParameter("sysparm_unique") == "true")
			unique = true;
			
		var m = new IndexCreator(this.getParameter('sysparm_table'),
			this.getParameter('sysparm_fields'),
			unique,
			this.getParameter('sysparm_email'),
			this.getParameter('sysparm_schedule_name'));
		m.setAccessMethod(access_method);
		m.schedule();
	}
});
