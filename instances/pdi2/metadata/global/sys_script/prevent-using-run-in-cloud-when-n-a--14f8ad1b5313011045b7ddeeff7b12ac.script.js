(function executeRule(current, previous /*null when async*/) {

	if (!pm.isActive('sn_atf_tg')) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('ATF_TG:install_atf_cloud_runner_app', 'href="/api/now/v1/context_doc_url/Cloud_Runner_Browser" style="display: contents;" target="_blank"'));
		current.run_in_cloud = false;
	}

})(current, previous);
