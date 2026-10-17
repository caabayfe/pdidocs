function renderProgress() {
	if (!g_form.getValue("example") && !g_form.getValue("imported_example")) {
		g_form.addInfoMessage("Cannot test performance because example field is empty");
		return;
	}
	
	if (isSafeStatement() === 'false') {
		g_form.addInfoMessage("Due to security constraints, the test tool only runs select statements");
		return;
	}

	var dd = new window.GlideModal("hierarchical_progress_viewer", true, "40em", "10em");
	dd.setTitle(getMessage("test_index_suggestion"));
	dd.setPreference("sysparm_ajax_processor", "TestQueryPerformanceAjax");
	dd.setPreference("sysparm_function", "test");
	dd.setPreference("sysparm_suggestion_id", g_form.getUniqueValue());

	dd.on("renderStatus", function(statusObject) {
		if (statusObject == null || statusObject.result == null || $("sysparm_button_result_page"))
			return;

		var resultBtn = new Element("button", {
			'id': 'sysparm_button_result_page',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px; float:right;'
		}).update(getMessage("go_to_result_query_performance"));

		resultBtn.onclick = function() {
			window.location = "sys_query_performance_test_result.do?sys_id=" + statusObject.result['result_id'];
		};

		var buttonsPanel = $("buttonsPanel");
		var cancelBtn = $("sysparm_button_cancel");
		if (cancelBtn)
			buttonsPanel.parentNode.insertBefore(resultBtn, cancelBtn);
		else
			buttonsPanel.parentNode.appendChild(resultBtn);
	});

	dd.on("executionStarted", function(response) {
		var trackerID = response.responseXML.documentElement.getAttribute("answer");
		var closeBtn = new Element("button", {
			'id': 'sysparm_button_close',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px; float:right;'
		}).update(getMessage("index_suggestion_close"));

		closeBtn.onclick = function() {
			dd.destroy();
			reloadWindow(window);
		};

		var cancelBtn = new Element("button", {
			'id': 'sysparm_button_cancel',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px; float:right;'
		}).update("Cancel");

		cancelBtn.onclick = function() {
			var ajax = new GlideAjax('TestQueryPerformanceAjax');
			ajax.addParam("sysparm_type", "cancel");
			ajax.addParam("sysparm_suggestion_id", g_form.getUniqueValue());
			ajax.getXMLAnswer();
		};

		var buttonsPanel = $("buttonsPanel");
		buttonsPanel.parentNode.appendChild(closeBtn);
		buttonsPanel.parentNode.appendChild(cancelBtn);

	});
	
	dd.on("executionComplete", function(trackerObj) {
		var cancelBtn = $("sysparm_button_cancel");
		if (cancelBtn)
			cancelBtn.remove();
	});

	dd.render();
}

// Determine if statement is non-destructive
function isSafeStatement() {
	var ajax = new GlideAjax('TestQueryPerformanceAjax');
	ajax.addParam("sysparm_type", "isSafeStatement");
	ajax.addParam("sysparm_suggestion_id", g_form.getUniqueValue());
	ajax.getXMLWait();
	return ajax.getAnswer();
}
