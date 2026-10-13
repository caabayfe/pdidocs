// ADD ANY ECC_QUEUE TOPICS THAT SHOULD BE PREPROCESSED TO THE CONDITION
// THIS BUSINESS RULE MUST RUN AFTER THE "Propagate Probe Parameters" BUSINESS RULE
// SO THAT THE PROPER PARAMETERS ARE POPULATED FOR THE PRELAUNCH CHECK
(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	var shouldLaunch = SNC.ProbePreProcessor.preProcess(current);
	current.setAbortAction(!shouldLaunch);
})(current, previous);
