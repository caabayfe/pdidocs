(function executeRule(current, previous /*null when async*/ ) {
	var maxInflight = parseInt(gs.getProperty('com.glide.one_extend.eval.batch_run.max_in_flight', 15));
    sn_one_extend.OneExtendUtil.processBatchRunTasks(current.batch_run, maxInflight);

})(current, previous);
