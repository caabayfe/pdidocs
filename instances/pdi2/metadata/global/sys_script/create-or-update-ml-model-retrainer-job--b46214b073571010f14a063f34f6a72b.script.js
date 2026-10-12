(function executeRule(current, previous /*null when async*/) {
	
	if (current.operation() == 'delete') {
		deleteScheduledJob(current);
		return;
	}

	var scheduledJobName = 'Auto-Resolution Model Retrainer for ' + current.target_table_name;
	var scheduledJobSysId = checkIfScheduledJobExists(scheduledJobName);	
	var sysautoGr = new GlideRecord('sysauto_script');
	
	if (gs.nil(scheduledJobSysId) && gs.nil(current.retrain_scheduled_job) && !gs.nil(current.retrain_frequency)) {
			
		sysautoGr.initialize();
		sysautoGr.setValue('name', scheduledJobName);
		sysautoGr.setValue('active', true);
		sysautoGr.setValue('conditional', true);
		var condition = 'new AutoResolutionMLHelper(\'' + current.getUniqueValue() + '\').checkAllLanguageModelsTrainingCompleted();\n';
		sysautoGr.setValue('condition', condition);
		var script = 'gs.info(\'Executing scheduled job to train or retrain auto-resolution machine learning language models.\');\n';
		script += 'var mlHelper = new AutoResolutionMLHelper(\'' + current.getUniqueValue() + '\');\n';
		script += 'var trainResult = mlHelper.trainLanguageModels();\n';	
		script += 'if (!gs.nil(trainResult))\n';
		script += '\tgs.error(trainResult.msg);\n';
		sysautoGr.setValue('script', script);
		sysautoGr.setValue('run_type', 'periodically');
		sysautoGr.setValue('run_period', setRunPeriod(current.retrain_frequency));

		var sysautoGrId = sysautoGr.insert();

		current.retrain_scheduled_job = sysautoGrId;
		current.update();
	}
	else if (!gs.nil(scheduledJobSysId)) {
		current.retrain_scheduled_job = scheduledJobSysId;
		current.update();
	}
	
	if (current.retrain_frequency != previous.retrain_frequency) {
		sysautoGr.initialize();
		sysautoGr.get(current.retrain_scheduled_job);
		
		if (gs.nil(current.retrain_frequency))
			sysautoGr.setValue('active', false); //if they set it to None, we will de-activate the scheduled job
		else {
			sysautoGr.setValue('active', true);
			sysautoGr.setValue('run_period', setRunPeriod(current.retrain_frequency));
		}
		sysautoGr.update();
	}
	
	function deleteScheduledJob(current) {
		var sysautoGr = new GlideRecord('sysauto_script');
		sysautoGr.get(current.retrain_scheduled_job);
		sysautoGr.deleteRecord();
	}
	
	function checkIfScheduledJobExists(name) {
		var sysautoGr = new GlideRecord('sysauto_script');
		sysautoGr.addQuery('name', name);
		sysautoGr.query();
		
		if (sysautoGr.next())
			return sysautoGr.getUniqueValue();
		else 
			return null;
	}
	
	function setRunPeriod(retrainFrequency) {
		var gdt = new GlideDateTime('1970-01-01 00:00:00');
		gdt.addDaysUTC(current.retrain_frequency);
		return gdt;
	}

})(current, previous);
