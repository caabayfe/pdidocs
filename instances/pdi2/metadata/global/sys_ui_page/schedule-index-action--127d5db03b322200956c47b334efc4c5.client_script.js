function schedule(action) {
	var selected = getTimeOption();
	if (selected == 'now') {
		GlideModal.get().destroy();
		createAndRenderProgress(action);
	}
	else if (selected == 'later') {
		var actionFunction = "";
		if (action == "create")
			actionFunction = 'schedule_create';
		else if (action == "drop")
			actionFunction = 'schedule_drop';
		
		var time = gel('selected_time').value;
		var ga = new GlideAjax('IndexSuggestionCreatorAjax');
		ga.addParam('sysparm_ajax_processor_sug_id', rowSysId);
		ga.addParam('sysparm_ajax_processor_name', actionFunction);
		ga.addParam('sysparm_ajax_processor_time', time);
		ga.getXML();
		
		displayScheduledTime(action, time);
		GlideModal.get().destroy();
	}
}

function cancel() {
	GlideDialogWindow.get().destroy();
}

function disableDateTime() {
	$j("#selected_time").attr("readonly", "true");
	$j("#anchorselected_timex").attr("disabled", "true");
}

function enableDateTime() {
	$j("#selected_time").removeAttr("readonly");
	$j("#anchorselected_timex").removeAttr("disabled");
}

function getTimeOption() {
	var options = document.getElementsByName('time_option');
	for (var i=0; i < options.length; i++)
		if (options[i].checked)
			return options[i].value;
}

function displayScheduledTime(action, time) {
	var string = "Index " + action + " scheduled for";
	g_form.addInfoMessage(getMessage(string) + " " + time);
}

function createAndRenderProgress(action) {	
	var actionFunction = "";
	var actionTitle = "";
		if (action == "create") {
			actionFunction = 'create';
			actionTitle = getMessage("schedule_index_creation");
		}
		else if (action == "drop") {
			actionFunction = 'drop';
			actionTitle = getMessage("schedule_index_drop");
		}
	
	var dd = new window.GlideModal("hierarchical_progress_viewer", true, "40em", "10em");
	dd.setTitle(actionTitle);
	dd.setPreference('sysparm_ajax_processor', 'IndexSuggestionCreatorAjax');
	dd.setPreference('sysparm_ajax_processor_sug_id', rowSysId);
	dd.setPreference('sysparm_ajax_processor_name', actionFunction);
	
	dd.on("executionStarted", function(response) {
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
		
		var buttonsPanel = $("buttonsPanel");
		buttonsPanel.parentNode.appendChild(closeBtn);
    });
	
	dd.render();
}
