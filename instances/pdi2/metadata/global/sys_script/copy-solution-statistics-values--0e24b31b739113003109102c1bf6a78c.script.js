(function executeRule(current, previous /*null when async*/) {
	/*
	This Business Rule copies (user overridden) precision/coverage values from previous active solution to new solution after training is complete.
	*/
	var copySolutionStatistics = new CopySolutionStatistics();
	copySolutionStatistics.copyStatistics(current);

})(current, previous);
