function viewProgress() {	
	var dd = new window.GlideModal("hierarchical_progress_viewer", true, "40em", "10em");
	dd.setTitle("Index Suggestion Creation");
	dd.setPreference('sysparm_ajax_processor', 'IndexSuggestionCreatorAjax');
	dd.setPreference('sysparm_ajax_processor_sug_id', rowSysId);
	dd.setPreference('sysparm_ajax_processor_name', 'getTrackerID');
	
	dd.on("executionStarted", function(response) {
		var closeBtn = new Element("button", {
			'id': 'sysparm_button_close',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px; float:right;'
		}).update("Close");
		
		closeBtn.onclick = function() {
			dd.destroy();
		};
		
		var buttonsPanel = $("buttonsPanel");
		buttonsPanel.parentNode.appendChild(closeBtn);
    });
	
	dd.render();
}
