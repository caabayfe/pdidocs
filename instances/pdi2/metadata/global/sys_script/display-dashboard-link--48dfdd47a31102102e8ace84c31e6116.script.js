(function executeRule(current, previous /*null when async*/ ) {
	var link = "<a href='nav_to.do?uri=/scheduled_job_dashboard_redirect.do' target='_blank'>Dashboard</a>";
	gs.addUniqueInfoMessage(gs.getMessage("Visit the {0} to get valuable insights and visualizations for monitoring your workloads.", [link]));
})(current, previous);
