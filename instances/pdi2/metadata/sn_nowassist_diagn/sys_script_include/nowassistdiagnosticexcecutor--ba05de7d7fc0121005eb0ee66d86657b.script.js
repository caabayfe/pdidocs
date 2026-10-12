var NowAssistDiagnosticExcecutor = Class.create();
NowAssistDiagnosticExcecutor.prototype = {
	executionRecordSysId: null,
	
    initialize: function(executionRecordSysId) {
		if (executionRecordSysId) {
			this.executionRecordSysId = executionRecordSysId;
		}
    },

	execute: function(diagSysId) {
		var scriptRecord = new GlideRecord('sn_nowassist_diagn_script');
		var found = scriptRecord.get(diagSysId);
		if (found) {
			return this._executeFromRecord(scriptRecord);
		} else {
			gs.warn("Script id " + name + " not found");
		}
	},

	executeByName: function(name) {
		var scriptRecord = new GlideRecord('sn_nowassist_diagn_script');
		scriptRecord.addQuery('name', name);
		scriptRecord.query();
		if (scriptRecord.next()) {
			return this._executeFromRecord(scriptRecord);
		} else {
			gs.warn("Script " + name + " not found");
		}
	},

	_getEvaluatedScriptListFromContextInDb: function() {
		try {
			var executionRecord = new GlideRecord('sn_nowassist_diagn_execution_result');
			executionRecord.get(this.executionRecordSysId);
			var context = JSON.parse(executionRecord.context);
			if (context && typeof context.evaluatedScripts == "object") {
				return context.evaluatedScripts;
			} else {
				return [];
			}
		} catch {
			return [];
		}
	},

	_addToEvaluatedScripts: function(scriptId) {
		var executionRecord =  new GlideRecord('sn_nowassist_diagn_execution_result');
		executionRecord.get(this.executionRecordSysId);
		var context = JSON.parse(executionRecord.context);
		if (typeof context == 'object') {
			if (typeof context.evaluatedScripts != 'object') {
				context.evaluatedScripts = [];
			}
		} else {
			context = {
				evaluatedScripts: []
			};
		}
		context.evaluatedScripts.push(scriptId);
		executionRecord.setValue('context', JSON.stringify(context));
		executionRecord.update();
	},

	_executeFromRecord: function(scriptRecord) {
		var messages = [];

		if (!this.executionRecordSysId) {
			this._initExecutionRecord(scriptRecord.sys_id);
		}

		if (this._getEvaluatedScriptListFromContextInDb().includes(scriptRecord.sys_id.getDisplayValue())) {
			gs.warn("Script " + scriptRecord.name + " already evaluated");
		} else {
			messages = this._evaluateScriptUnsafe(scriptRecord);
			this._addToEvaluatedScripts(scriptRecord.sys_id.getDisplayValue());
		}

		messages.forEach(this._saveMessage, this);

		return this.executionRecordSysId;
	},

	_evaluateScriptUnsafe: function(scriptRecord) {
		var evaluator = new GlideScopedEvaluator();
		return evaluator.evaluateScript(scriptRecord, 'script', {'executionRecordSysId': this.executionRecordSysId});
	},

	_initExecutionRecord: function(scriptRecordSysId) {
		var executionRecord =  new GlideRecord('sn_nowassist_diagn_execution_result');
		executionRecord.initialize();
		executionRecord.setValue('diagnostic', scriptRecordSysId);
		executionRecord.setValue('context', "{}");
		this.executionRecordSysId = executionRecord.insert();
	},

	_saveMessage: function(message) {
		var executionMessage = new GlideRecord('sn_nowassist_diagn_execution_result_message');
		executionMessage.initialize();
		executionMessage.setValue('execution_result', this.executionRecordSysId);
		executionMessage.setValue('message', message.message);
		executionMessage.setValue('resolution', message.resolution);
		executionMessage.insert();
	},

    type: 'NowAssistDiagnosticExcecutor'
};
