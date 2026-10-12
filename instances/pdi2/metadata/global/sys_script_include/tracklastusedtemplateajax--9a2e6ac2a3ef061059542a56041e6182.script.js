var TrackLastUsedTemplateAjax = Class.create();
TrackLastUsedTemplateAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	trackUsage: function() {
        var templateId = this.getParameter('sysparm_template_id');
        var recordId = this.getParameter('record_sys_id');
        var tableName = this.getParameter('table_name');
        var userId = gs.getUserID();
        var lastUsed = new GlideDateTime();

        return this.updateOrInsertTemplateUsage(templateId, userId, lastUsed, recordId, tableName);
    },
	updateOrInsertTemplateUsage: function(templateId, userId, lastUsed, recordId, tableName) {
		try {
            if (!this.checkTemplateExists(templateId)) {
                gs.error("Template ID does not exist: " + templateId);
                return false;
            }

			var gr = new GlideRecordSecure('sys_template_usage');
			gr.addQuery('template', templateId);
			gr.addQuery('user', userId);
			gr.query();

			if (gr.next()) {
				gr.last_used = lastUsed;
				gr.update();
			} else {
				gr.initialize();
				gr.template = templateId;
				gr.user = userId;
				gr.last_used = lastUsed;
				gr.insert();
			}
			var grTempApplied = new GlideRecordSecure('sys_template_applied');
			grTempApplied.addQuery('template', templateId);
			grTempApplied.addQuery('record', recordId);
			grTempApplied.query();

			if (grTempApplied.next()) {
				grTempApplied.last_applied = lastUsed;
				grTempApplied.update();
			} else {
				grTempApplied.initialize();
				grTempApplied.template = templateId;
				grTempApplied.record = recordId;
				grTempApplied.last_applied = lastUsed;
				grTempApplied.table_name = tableName;
				grTempApplied.insert();
			}
			return true;
		} catch (err) {
			gs.error("Error in updating/inserting last used template: "+ err.message);
			return false;
		}
       
    },
	checkTemplateExists: function(templateId) {
        var templateCheck = new GlideRecordSecure('sys_template');
        return templateCheck.get("sys_id", templateId);
    },
    type: 'TrackLastUsedTemplateAjax'
});
