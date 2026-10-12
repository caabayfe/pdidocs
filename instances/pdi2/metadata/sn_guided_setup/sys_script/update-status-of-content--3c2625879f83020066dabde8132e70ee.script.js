/*
* For content of type gsw_content_group, this BR is run for Deactivated, Reactivated and Visited.
* Other Change Types are informational in nature and useful for analytics.
*/

(function executeRule(current, previous /*null when async*/) {

	new GuidedSetupUtilSNC().updateStatusOfContent(current);

})(current, previous);
