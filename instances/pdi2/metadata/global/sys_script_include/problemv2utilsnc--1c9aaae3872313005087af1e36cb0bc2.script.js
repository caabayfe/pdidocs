var ProblemV2UtilSNC = Class.create();
ProblemV2UtilSNC.prototype = {

	COPY_ATTACHMENT_PROPERTY_MAP: {
		'incident': 'com.snc.problem.create_from_incident.copy_attachments'
	},

	TABLES: {
		M2M_KB_TASK: 'm2m_kb_task'
	},

	COLUMNS: {
		TASK: 'task',
		KB_KNOWLEDGE: 'kb_knowledge'
	},

	initialize: function(argument) {
		var fixes = gs.getProperty("problem.fix.records");
		if (fixes)
			this.fixTasks = fixes.split(",");
		else
			this.fixTasks = "";
		this.fixTasksMap = this.dotCommaToMap(this.fixTasks);
	},

	dotCommaToMap: function(Arr) {
		var map = {};
		for (var i = 0; i < Arr.length; i++) {
			map[Arr[i].split(".")[0]] = Arr[i].split(".")[1];
		}
		return map;
	},

	isRelatedFix: function(current) {
		if (!current.active.changesTo(false) || !this.fixTasks || (!current.parent && current.sys_class_name + '' !== 'sn_cim_register') || (current.parent && current.parent.sys_class_name + '' !== 'problem'))
			return false;
		if (!this.fixTasksMap[current.sys_class_name])
			return false;
		if (current.sys_class_name + '' === 'sn_cim_register' && !this.isCIMRelatedToProblem(current))
			return false;
		if (current.sys_class_name + '' !== 'sn_cim_register' && !current[this.fixTasksMap[current.sys_class_name]])
			return false;
		return true;
	},

	isCIMRelatedToProblem: function(current) {
		var gr = new GlideRecord('sn_cim_inbound_m2m');
		gr.addQuery('cim_register', current.getUniqueValue());
		gr.addQuery('source_table', 'problem');
		gr.query();
		return gr.hasNext();
	},

	checkRelatedFixes: function(current) {
		if (current.sys_class_name + '' === 'sn_cim_register')
			this.checkAllProblemsForCIM(current);
		else {
			var problem = current[this.fixTasksMap[current.sys_class_name]].getRefRecord();
			if (!this.hasRemainingFixes(this.fixTasksMap, problem))
				gs.eventQueue('problem.fixes', problem);
		}
	},

	checkAllProblemsForCIM: function(current) {
		var gr = new GlideRecord('sn_cim_inbound_m2m');
		gr.addQuery('cim_register', current.getUniqueValue());
		gr.addQuery('source_table', 'problem');
		gr.query();
		while (gr.next()) {
			var problem = gr.source_id.getRefRecord();
			if (!this.hasRemainingFixes(this.fixTasksMap, problem))
				gs.eventQueue('problem.fixes', problem);
		}
	},

	hasRemainingFixes: function(fixTasksMap, problem) {
		var problemId = problem.getUniqueValue() + '';
		for (var key in fixTasksMap) {
			if (key === 'sn_cim_register' && this._hasCIMRelatedActiveFix(problemId))
				return true;
			if (key !== 'sn_cim_register' && this._hasOthersRelatedActiveFix(key, fixTasksMap[key], problemId))
				return true;
		}
		return false;
	},

	_hasCIMRelatedActiveFix: function(problemId) {
		var gr = new GlideRecord('sn_cim_inbound_m2m');
		if (gr.isValid()) {
			gr.addQuery('source_id', problemId);
			gr.query();
			while (gr.next()) {
				var cimRecord = gr.cim_register.getRefRecord();
				if (cimRecord.active && cimRecord.getUniqueValue() + '' !== problemId)
					return true;
			}
		}
		return false;
	},

	_hasOthersRelatedActiveFix: function(table, field, problemId) {
		var taskGr = new GlideAggregate(table);
		if (!taskGr.isValid())
			return false;
		taskGr.addQuery('active', true);
		taskGr.addQuery('sys_id', '!=', problemId);
		taskGr.addQuery(field, problemId);
		taskGr.addAggregate('COUNT');
		taskGr.query();
		if (taskGr.next())
			return taskGr.getAggregate('COUNT') > 0;
	},
	// If making any changes related to movement, check if moveAndCloseRecords would also need the same. 
	moveRecords: function(tableName, problemRelatedField, duplicateProblemGr, originalProblemGr) {
		var gr = new GlideRecord(tableName);
		if (!gr.isValid())
			return false;
		gr.addQuery(problemRelatedField, duplicateProblemGr.getUniqueValue());
		gr.query();
		while (gr.next()) {
			gr.setValue(problemRelatedField, originalProblemGr.getUniqueValue());
			gr.work_notes = gs.getMessage("{0} now associated with {1} based on closure of {2}", [gr.getDisplayValue("sys_class_name"), originalProblemGr.getDisplayValue(), duplicateProblemGr.getDisplayValue()]);
			gr.update();
		}
	},
	// Added to faciliate moving and closing PTASKs in one go. DEF0190002
	moveAndCloseRecords: function(tableName, problemRelatedField, duplicateProblemGr, originalProblemGr) {
		var gr = new GlideRecord(tableName);
		if (!gr.isValid())
			return false;
		gr.addQuery(problemRelatedField, duplicateProblemGr.getUniqueValue());
		gr.query();
		while (gr.next()) {
			gr.setValue(problemRelatedField, originalProblemGr.getUniqueValue());
			gr.work_notes = gs.getMessage("{0} now associated with {1} based on closure of {2}", [gr.getDisplayValue("sys_class_name"), originalProblemGr.getDisplayValue(), duplicateProblemGr.getDisplayValue()]);
			// Additional to moveRecords - closing of active records
			if (gr.active) {
				gr.setValue("state", ProblemTaskState.States.CLOSED);
				gr.setValue("close_code", "canceled");
				gr.setValue("close_notes", gs.getMessage("Problem Task is Canceled based on closure of {0}.", originalProblemGr.getDisplayValue()));
			}
			gr.update();
		}
	},

	/**
	 * Copy Attachments from one gliderecord to another
	 * 
	 * @param srcGr        {GlideRecord}
	 * @param targetGr     {GlideRecord}
	 * @param userSelection Boolean     If true then copy all attachments ignoring any property value    
	 */
	copyAttachments: function(srcGr, targetGr, userSelection) {
		if (!srcGr.isValidRecord() || !targetGr.isValidRecord())
			return;
		var srcTable = srcGr.getTableName();
		var targetTable = targetGr.getTableName();
		var copyEnabled = gs.nil(userSelection) ? gs.getProperty(this.COPY_ATTACHMENT_PROPERTY_MAP[srcTable], 'false') === 'true' : userSelection + '' === 'true';
		if (copyEnabled) {
			if (srcGr.canRead()) {
				var res = [];
				if (srcGr.hasAttachments())
					res = j2js(GlideSysAttachment.copy(srcTable, srcGr.sys_id + '', targetTable, targetGr.sys_id + ''));
				return res;
			} else
				gs.warn('copyAttachments: User is not authorized to perform this action');
		}
	},

	/**
	 * Copy Attached Knowledge from one Task gliderecord to another
	 * 
	 * @param srcGr        {GlideRecord}
	 * @param targetGr     {GlideRecord}
	 * @param userSelection Boolean     If true then copy all attached knowledge articles ignoring any property value    
	 */
	copyAttachedKnowledge: function(srcGr, targetGr, userSelection) {
		if (!srcGr.isValidRecord() || !targetGr.isValidRecord())
			return;
		var srcSysId = srcGr.sys_id + '';
		var targetSysId = targetGr.sys_id + '';
		var copyEnabled = gs.nil(userSelection) ? gs.getProperty(this.COPY_ATTACHMENT_PROPERTY_MAP[srcGr.getTableName()], 'false') === 'true' : userSelection + '' === 'true';
		if (copyEnabled) {
			if (srcGr.canRead()) {
				var kbTaskGr = new GlideRecord(this.TABLES.M2M_KB_TASK);
				kbTaskGr.addQuery(this.COLUMNS.TASK, srcSysId);
				kbTaskGr.query();
				while (kbTaskGr.next()) {
					var newKbTaskGr = new GlideRecord(this.TABLES.M2M_KB_TASK);
					newKbTaskGr.initialize();
					newKbTaskGr.setValue(this.COLUMNS.TASK, targetSysId);
					newKbTaskGr.setValue(this.COLUMNS.KB_KNOWLEDGE, kbTaskGr.kb_knowledge);
					newKbTaskGr.insert();
				}
			} else
				gs.warn('copyAttachedKnowledge: User is not authorized to perform this action');
		}
	},

	type: 'ProblemV2UtilSNC'
};
