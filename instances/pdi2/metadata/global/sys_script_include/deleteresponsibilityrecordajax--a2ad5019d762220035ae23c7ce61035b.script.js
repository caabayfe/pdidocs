var DeleteResponsibilityRecordAjax = Class.create();
DeleteResponsibilityRecordAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	initialize: function(request, response, processor) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request, response, processor);
		this._log = new GSLog("com.snc.iam.log_level", this.type);
	},

	getResponsibilities: function() {
		var responsibilitySysIds = this.getParameter('sysparm_obj_id');
		var stackName = this.getParameter('sysparm_nameofstack');
		var gotoUrl = this.getParameter('sysparm_goto_url');

		var dList = "";
		if (gotoUrl != null)
			dList += gotoUrl + ";";
		else
			dList += 'null;';

		if (responsibilitySysIds != null)
			dList += this.getAssociatedIncidentAlertRecords(responsibilitySysIds);

		if (this._log.atLevel(GSLog.DEBUG)) {
			this._log.debug('[getResponsibilities] responsibilitySysIds: ' + responsibilitySysIds);
			this._log.debug('[getResponsibilities] stackName: ' + stackName);
			this._log.debug('[getResponsibilities] gotoUrl: ' + gotoUrl);
		}
		return dList;
	},

	getAssociatedIncidentAlertRecords: function(responsibilitySysIds) {
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug('[getAssociatedIncidentAlertRecords] responsibilitySysIds: ' + responsibilitySysIds);

		var gr = new GlideRecord('contact');
		gr.addQuery('responsibility', 'IN', responsibilitySysIds);
		gr.query();
		var index = 0;
		var dList = "";
		while (gr.next()) {
			if (!gr.canRead()) continue;
			if (index == 0)
				dList += gr.getUniqueValue();
			else
				dList += "," + gr.getUniqueValue();
			index++;
		}
		return dList;
	},

	proceedWithDelete: function() {
		var result = this.newItem("result");
		var objSysId = this.getParameter('sysparm_obj_id');
		var disableWf = this.getParameter('sysparm_disable_wf');

		if (this._log.atLevel(GSLog.DEBUG)) {
			this._log.debug('[proceedWithDelete] result: ' + result);
			this._log.debug('[proceedWithDelete] objSysId: ' + objSysId);
			this._log.debug('[proceedWithDelete] disableWf: ' + disableWf);
		}

		// Delete from IAM records
		this.deleteAssociatedIncidentAlertRecords(objSysId);

		// Delete contact_definition
		this.deleteAssociatedContactDefinitionRecords(objSysId);

		// Delete contact_responsibility
		var gRecord = new GlideRecord('contact_responsibility');
		gRecord.addQuery('sys_id', 'IN', objSysId);
		this._deleteRecords(gRecord);
	},

	deleteAssociatedIncidentAlertRecords: function(contactSysIds) {
		var gr = new GlideRecord('contact');
		gr.addEncodedQuery('responsibilityIN' + contactSysIds);
		this._deleteRecords(gr);
		return true;
	},

	deleteAssociatedContactDefinitionRecords: function(contactSysIds) {
		var gr = new GlideRecord('contact_definition');
		gr.addEncodedQuery('responsibilityIN' + contactSysIds);
		this._deleteRecords(gr);
		return true;
	},

	_deleteRecords: function(gr) {
		gr.query();
		while (gr.next()) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug('[_deleteRecords] table: ' + gr.getTableName() + ' sys_id: ' + gr.sys_id + ' canDelete: ' + gr.canDelete());

			if (gr.canDelete())
				gr.deleteRecord();
		}
	},

	toString: function() { return 'DeleteResponsibilityRecordAjax'; },

	type: 'DeleteResponsibilityRecordAjax'
	});
