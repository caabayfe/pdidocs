function func () {
	if (g_form.getValue("job_name") === "test_generation") {
		window.open("/sn_atf_tg_bootstrap_test_runner_wrapper.do?is_test_generation&user_agent=ATF_CLOUD_RUNNER-123456", "_blank");
    function cb() {
      window.open("/sn_atf_tg_DW_outer_frame.do", "_blank");
    }
    setTimeout(cb, 1500)
	}
	else if (g_form.getValue("job_name") === "test_run"){
		var gr = new GlideRecord("sn_atf_tg_sn_boq");
		gr.get(g_form.getUniqueValue())
		var root_tracker_id = gr.getValue("root_tracker_id");
		window.open("/sn_atf_tg_bootstrap_test_runner_wrapper.do?user_agent=ATF_CLOUD_RUNNER-123456&progress_worker_id=" + root_tracker_id);
	}

}
