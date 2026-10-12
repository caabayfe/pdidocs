function getCodeCoverage() {
	var ga = new GlideAjax("ATFCodeCoverageBridge");
    ga.addParam('sysparm_name', 'aggregateTestSuiteCodeCoverage');
    ga.addParam('sysparm_test_suite_result_id', g_form.getUniqueValue());
    ga.getXMLAnswer(function(answer) {
        if (answer) {
            var modal = new GlideModal("hierarchical_progress_viewer");
            modal.setTitle(new GwtMessage().getMessage("Loading code coverage"));
            modal.setPreference("sysparm_renderer_execution_id", answer);

			modal.on("beforeclose", function() {
				g_navigation.reloadWindow();
			});

            modal.render();
        } else {
            gsftSubmit(null, g_form.getFormElement(), 'get_code_coverage');
        }
    });
}
