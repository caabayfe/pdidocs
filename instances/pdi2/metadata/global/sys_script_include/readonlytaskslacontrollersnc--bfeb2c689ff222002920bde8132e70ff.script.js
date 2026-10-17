var ReadOnlyTaskSLAControllerSNC = Class.create();
ReadOnlyTaskSLAControllerSNC.prototype = Object.extendsObject(TaskSLAController, {
	ATTR_SYS_ID: 'sys_id',
	ATTR_SYS_CREATED_ON: 'sys_created_on',

	initialize: function() {
		TaskSLAController.prototype.initialize.call(this);
		this.slaUtil = new SLAUtil();
	},

	initNewTaskSLA: function(taskGr, contractSLAGr) {
		if (!this._checkIfContractSLAIsAvailableToTaskDomain(contractSLAGr, taskGr))
			return null;

		this.setTaskGR(taskGr);
		var slac = this._newSLACondition(contractSLAGr, taskGr);
		var startMatches = slac.attach();
		if (!startMatches)
			return null;
		var taskSLAParams = {
			dryRun: true
		};
		var taskSLA = new TaskSLA(contractSLAGr, taskGr, true, taskSLAParams);
		taskSLA.currentStage = taskSLA.STAGE_STARTING;
		taskSLA.taskSLAgr.duration = new GlideDuration(0);
		taskSLA.taskSLAgr.business_duration = new GlideDuration(0);
		taskSLA.taskSLAgr.pause_duration = new GlideDuration(0);
		taskSLA.taskSLAgr.business_pause_duration = new GlideDuration(0);
		taskSLA.taskSLAgr.sys_created_on = taskGr.sys_updated_on;
		taskSLA.taskSLAgr.sys_domain = taskGr.sys_domain;
		//check for retroactive pause time
		if (contractSLAGr.retroactive && contractSLAGr.retroactive_pause) {
			this._adjustPauseFromHistory(taskSLA, taskGr);
			this.setTaskGR(taskGr);
		}
		taskSLA.setUpdateTime(taskGr.sys_updated_on);
		taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);

		//Check if pause is met for current time.
		this._pauseUnpause(taskSLA, contractSLAGr);
		if (taskSLA.taskSLAgr.stage + '' !== taskSLA.STAGE_PAUSED)
			taskSLA.calculate(true, taskSLA.updateTime);

		return taskSLA;
	},

	updateTaskSLA: function(taskGr, taskSLA, contractSLAGr) {
		this.setTaskGR(taskGr);
		var slaIsRetroactive = contractSLAGr.retroactive;
		taskSLA.setUpdateTime(taskGr.sys_updated_on);
		if ((!slaIsRetroactive && taskGr.sys_updated_on >= taskSLA.taskSLAgr.start_time) || (
			slaIsRetroactive)) {

			var conditionResults = {stopCancel: {}, pauseResume: {}};
			// (stop/cancel takes precedence over pause/unpause also matching in the same update to the task record)
			conditionResults.stopCancel = this._stopCancel(taskSLA, contractSLAGr);

			if (!conditionResults.stopCancel.conditionMatched)
				conditionResults.pauseResume = this._pauseUnpause(taskSLA, contractSLAGr);

			//Re-Calculate end times after change of stage
			if (taskSLA.taskSLAgr.stage + '' !== taskSLA.STAGE_PAUSED)
				taskSLA.calculate(true, taskSLA.updateTime);
		}
		return taskSLA;
	},

	copyTaskSLA: function(contractSLAGr, taskGr, taskSLAgrToCopy, retroactivePauseDataListToCopy) {
		var taskSLA = new TaskSLA(contractSLAGr, taskGr, true, {
			dryRun: true
		});
		taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
		taskSLA.taskSLAgr = taskSLAgrToCopy;
		taskSLA.retroactivePauseDataList = retroactivePauseDataListToCopy;
		return taskSLA;
	},

	_checkIfContractSLAIsAvailableToTaskDomain: function(contractSLAGrToTest, taskGr) {
		var contractSLAGr = new GlideRecord(contractSLAGrToTest.getRecordClassName());
		contractSLAGr.addDomainQuery(taskGr);
		contractSLAGr.addQuery(this.ATTR_SYS_ID, contractSLAGrToTest.getUniqueValue());
		contractSLAGr.addNotNullQuery(this.ATTR_SYS_CREATED_ON);
		contractSLAGr.query();
		if (contractSLAGr.next())
			return true;
		return false;
	},

	_adjustPauseFromHistory: function(taskSLA, taskGr) {
		var retroactivePauseDataList = [];

		var contractSLARecord = taskSLA.getContractSLA();
		var withJournals = contractSLARecord ? this.slaUtil.hasAdvancedJournalCondition(contractSLARecord) : false;
		var withSysFields = contractSLARecord ? this.slaUtil.hasAdvancedSysFieldCondition(contractSLARecord) : false;
		var withVariables = contractSLARecord ? this.slaUtil.hasVariablesCondition(contractSLARecord) : false;

		var hw = this.slaUtil.getHistoryWalker(
			taskGr.getRecordClassName(),
			taskGr.getValue('sys_id'),
			/*recordLevelSecurity*/ false,
			/*fieldLevelSecurity*/ false,
			/*withVariables*/ withVariables,
			/*walkToFirstUpdate*/ true,
			/*withJournalFields*/ withJournals,
			/*withSysFields*/ withSysFields
		);

		if (!hw) {
			this.lu.logError("[_adjustPauseFromHistory]: failed getting HistoryWalker to initial update");
			return;
		}

		var contractSLAgr = taskSLA.taskSLAgr.sla.getRefRecord();
		var firstRun = true;

		do {
			var walkedRecordGr = hw.getWalkedRecord();
			walkedRecordGr.original_sys_id = taskGr.getUniqueValue();

			if (walkedRecordGr.sys_updated_on < taskSLA.taskSLAgr.start_time)
                continue;

			if (firstRun) {
				taskSLA.setUpdateTime(walkedRecordGr.sys_updated_on);
				taskSLA.updateState(TaskSLA.STATE_IN_PROGRESS);
				var prevStage = taskSLA.STAGE_IN_PROGRESS;
				var currStage = taskSLA.STAGE_IN_PROGRESS;
				firstRun = false;
			}

			taskSLA.setUpdateTime(walkedRecordGr.sys_updated_on);
			this.setTaskGR(walkedRecordGr);
			prevStage = taskSLA.getGlideRecord().stage + '';
			taskSLA.getGlideRecord().sys_updated_on = walkedRecordGr.sys_updated_on;
			this._pauseUnpause(taskSLA, contractSLAgr);
			//Re-Calculate end times after change of stage
			if (taskSLA.taskSLAgr.stage + '' !== taskSLA.STAGE_PAUSED)
				taskSLA.calculate(true, taskSLA.updateTime);

			var taskSLAGr = taskSLA.getGlideRecord();
			currStage = taskSLAGr.stage + '';
			if ((prevStage === taskSLA.STAGE_PAUSED || currStage === taskSLA.STAGE_PAUSED) && currStage !== prevStage) {
				//Record if exiting or entering pause
				retroactivePauseDataList.push({
					responsibleTaskGr: this.slaUtil.copyGlideRecord(walkedRecordGr),
					taskSLAGr: this.slaUtil.copyGlideRecord(taskSLA.getGlideRecord())
				});
			}
		} while (hw.walkForward() && walkedRecordGr.sys_updated_on < taskGr.sys_updated_on);

		taskSLA.retroactivePauseDataList = retroactivePauseDataList;
	},

	type: 'ReadOnlyTaskSLAControllerSNC'
});
