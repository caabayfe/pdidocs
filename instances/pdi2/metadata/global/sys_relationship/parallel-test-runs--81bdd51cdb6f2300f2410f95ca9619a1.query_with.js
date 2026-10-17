(function refineQuery(current, parent) {
	var parallelTestRunSysIds = new ATFParallelTestingUtil().getParallelTestRuns(parent);
	current.addQuery('sys_id', 'IN', parallelTestRunSysIds.join(','));
})(current, parent);
