var AssociateCIsToChangeUtil = Class.create();
AssociateCIsToChangeUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	SESSION_KEY: 'com.snc.change_request.AssociateCIsToChangeUtil.selected_cis',
	AFFECTED_CI_TABLE: 'task_ci',
	IMPACTED_SERVICE_TABLE: 'task_cmdb_ci_service',

	CMDB_CI: 'cmdb_ci',
	TASK_CI: 'task_ci',
	TASK_CMDB_CI_SERVICE: 'task_cmdb_ci_service',
	TASK_SERVICE_OFFERING: 'task_service_offering',

	// Cannot use: sys_meta[table].sys_meta.plural because: task_ci.xml mtom="Affected CIs" is not available
	TABLE_DISPLAY: {
		'task_ci': {
			'label': gs.getMessage('Affected CI'),
			'plural': gs.getMessage('Affected CIs')
		},
		'task_cmdb_ci_service': {
			'label': gs.getMessage('Impacted Service/CI'),
			'plural': gs.getMessage('Impacted Services/CIs')
		},
		'task_service_offering': {
			'label': gs.getMessage('Service Offering'),
			'plural': gs.getMessage('Service Offerings')
		}
	},

	ajaxFunction_storeCIsAndPostInfoMsg: function() {
		var cis = this.getParameter('sysparm_selected_cis') + '';
		if (cis) {
			cis = cis.trim();
			gs.getSession().putClientData(this.SESSION_KEY, cis);
			var ciItemLabel = this.getParameter('sysparm_table_label') + '';
			if (!ciItemLabel)
				ciItemLabel = gs.getMessage('Configuration Items');

			ciItemLabel = SNC.GlideHTMLSanitizer.sanitize(ciItemLabel);
			gs.addInfoMessage(gs.getMessage('Your selected {0} will be related to this Change Request once saved', [ciItemLabel]));
			var primaryCiClassData = this._getPrimaryCiClass(cis);
			return primaryCiClassData ? this.SESSION_KEY + '_' + JSON.stringify(primaryCiClassData) : this.SESSION_KEY;
		}
	},

	ajaxFunction_addManyRelatedAjax: function() {
		var taskSysId = this.getParameter('sysparm_task_sys_id') + '';
		var cis = this.getParameter('sysparm_selected_cis') + '';
		return new JSON().encode(this.addManyRelated(taskSysId, cis.split(',')));
	},

	_getPrimaryCiClass: function(ciSysIds) {
		if (!ciSysIds)
			return null;

		var ciArray = ciSysIds.split(',').filter(function(elem) { return elem; });
		if (ciArray.length !== 1)
			return null;

		var primaryCiClassData = {};
		primaryCiClassData.sys_id = ciArray[0];
		primaryCiClassData.classname = null;
		var ciGr = new GlideRecordSecure('cmdb_ci');
		if (ciGr.get(ciArray[0]))
			primaryCiClassData.classname = ciGr.getValue('sys_class_name');

		if (primaryCiClassData.classname !== 'service_offering')
			return primaryCiClassData;

		var cmdbCiGr = new GlideRecordSecure('service_offering');
		if (!cmdbCiGr.get(primaryCiClassData.sys_id ))
			return primaryCiClassData;

		var parentSysId = cmdbCiGr.getValue('parent');
		if (!parentSysId)
			return primaryCiClassData;

		primaryCiClassData.parent_sys_id = parentSysId;
		primaryCiClassData.parent_classname = 'business_service';
		
		return primaryCiClassData;
	},

	/** DEPRECATED FUNCTIONS and FUNCTIONALITY not used by code, but available if customers called these functions */

	// deprecated function
	_addRelated: function(table, foreignKey, taskSysId, sysId) {
		var gr = new GlideRecord(table);
		gr.addQuery('task', taskSysId);
		gr.addQuery(foreignKey, sysId);
		gr.query();
		if (!gr.hasNext()) {
			gr.initialize();
			gr.task = taskSysId;
			gr[foreignKey] = sysId;
			return (gr.insert());
		}
		return false;
	},

	// deprecated function
	addImpactedRelated: function(taskSysId, sysId) {
		return this._addRelated(this.IMPACTED_SERVICE_TABLE, 'cmdb_ci_service', taskSysId, sysId);
	},

	// deprecated function
	addAffectedRelated: function(taskSysId, sysId) {
		return this._addRelated(this.AFFECTED_CI_TABLE, 'ci_item', taskSysId, sysId);
	},

	/** END OF DEPRECATED FUNCTIONS and FUNCTIONALITY */

	addManyRelated: function(taskSysId, ciSysIds) {
		var taskUtils = new TaskUtils();
		var result = taskUtils.assocCiToTaskByCiClass(taskSysId, ciSysIds);
		if (!result.validTask)
			return result;

		result.addedPrimaryCi = this._addCiToRecordIfEmpty(ciSysIds[ciSysIds.length - 1], result.processedCount, result.taskGr);
		var taskDisplayValue = result.validTask ? result.taskGr.getDisplayValue() : '';
		result.messages = this._getMessages(result.serviceOfferingCount, result.impactedServiceCount, result.affectedCICount, taskDisplayValue, taskSysId);

		// legacy result properties, to support customer customizaiton using these resulting properties
		result.displayValue = GlideStringUtil.escapeHTML(taskDisplayValue);
		result.changeId = taskSysId;
		result.count = result.serviceOfferingCount + result.impactedServiceCount + result.affectedCICount;

		// remove the taskGr from the returned result
		delete result.taskGr;

		return result;
	},

	_addCiToRecordIfEmpty: function(ciSysId, processedCount, taskGr) {
		if (!ciSysId || processedCount !== 1 || !taskGr || !taskGr.canWrite())
			return false;

		var taskUtils = new TaskUtils();
		var assocByCiClass = taskUtils._getAssocByCiClass(taskGr);
		if (assocByCiClass) {
			var ciTaskField = taskUtils.getCiTaskField(ciSysId, taskGr);
			if (ciTaskField && !taskGr.getValue(ciTaskField)) {
				taskGr.setValue(ciTaskField, ciSysId);

				// Service Offerings have a parent Service which should also be populated
				if (ciTaskField + '' === taskUtils.FIELD.SERVICE_OFFERING) {
					var cmdbCiGr = new GlideRecord('service_offering');
					if (cmdbCiGr.get(ciSysId)) {
						var parentCmdbCi = cmdbCiGr.getValue('parent') + '';
						if (parentCmdbCi && !taskGr.getValue('business_service'))
							taskGr.setValue('business_service', parentCmdbCi);
					}
				}

				taskGr.update();
				return true;
			}
		} else if (!taskGr.getValue(this.CMDB_CI)) {
			taskGr.cmdb_ci = ciSysId;
			taskGr.update();
			return true;
		}

		return false;
	},

	_getMessages: function(serviceOfferingCount, impactedServiceCount, affectedCICount, taskDisplayValue, taskSysId) {
		messages = [];

		if (serviceOfferingCount > 0)
			messages.push(this._getMessage(this.TASK_SERVICE_OFFERING, serviceOfferingCount, taskSysId, taskDisplayValue));

		if (impactedServiceCount > 0)
			messages.push(this._getMessage(this.TASK_CMDB_CI_SERVICE, impactedServiceCount, taskSysId, taskDisplayValue));

		if (affectedCICount > 0)
			messages.push(this._getMessage(this.TASK_CI, affectedCICount, taskSysId, taskDisplayValue));

		return messages;
	},

	_getMessage: function(relatedList, relatedListCount, chgReqSysId, chgReqDisplayValue) {
		var relatedListDisplayValue = GlideStringUtil.escapeHTML(this._getRelatedListDisplayValue(relatedList, relatedListCount));
		chgReqSysId = SNC.GlideHTMLSanitizer.sanitize(chgReqSysId);
		chgReqDisplayValue = GlideStringUtil.escapeHTML(chgReqDisplayValue);

		var chgReqURL = '';
		if (chgReqSysId)
			chgReqURL = 'change_request.do?sys_id=' + chgReqSysId;
		else
			chgReqURL = '#';

		return gs.getMessage('{0} {1} added to Change Request <a href="{2}">{3}</a>', [
			relatedListCount + '',
			relatedListDisplayValue,
			chgReqURL,
			chgReqDisplayValue
		]);
	},

	_getRelatedListDisplayValue: function(table, count) {
		if (!table || !count)
			return '';

		return count > 1 ? this.TABLE_DISPLAY[table].plural : this.TABLE_DISPLAY[table].label;
	},

	type: 'AssociateCIsToChangeUtil'
});
