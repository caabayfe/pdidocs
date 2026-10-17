(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	current.script = `var utils = new sn_km_center.ArticleAssistUtils(); utils.runScan("${current.sys_id}");`;

})(current, previous);
