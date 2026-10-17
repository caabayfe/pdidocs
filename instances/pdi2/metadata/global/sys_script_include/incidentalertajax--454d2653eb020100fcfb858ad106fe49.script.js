var IncidentAlertAjax = Class.create();
IncidentAlertAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getSummary: function() {
		var source_inc = this.getParameter('sysparm_source_inc');
		
		if (!source_inc)
			return '';
		
		var inc = new GlideRecordSecure('incident');
		inc.get(source_inc);

		var notes = inc.work_notes.getDisplayValue();
		var comnt = inc.comments.getDisplayValue();
		
		var summary = 'Source Incident Details\n\nNumber: ' + inc.number + '\nCaller: ' + inc.caller_id.name 
			+ '\nConfiguration item: ' + inc.cmdb_ci.name + '\nDuration: ' + inc.calendar_duration.getDisplayValue() 
			+ '\nOpened: ' + inc.opened_at + '\nOpened by: ' + inc.opened_by.name + '\nResolved: ' + inc.resolved_at 
			+ '\nShort description: ' + inc.short_description + '\n\n' + comnt + notes;
		
		return summary;
	},
	
	isPublic: function() {
		return false;
	},

    type: 'IncidentAlertAjax'
});
