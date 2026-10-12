window.onload = function() {
	var exec_id = gel('execution_id').value;
	clickActivate();
	function clickActivate() {
		var dd = new GlideDialogWindow("hierarchical_progress_viewer");
		dd.setPreference('sysparm_renderer_execution_id', exec_id);
		dd.setPreference('sysparm_renderer_expanded_levels',"3");
		dd.on('executionComplete', function(trackerObj) {
			CustomEvent.fireAll("batch_install_complete", trackerObj);
		});
		dd.render();
		
		jQuery(document).on('click', '#treeitem-'+ exec_id, function(e){
			if (window.parent && window.parent.document) {
				var tree = document.getElementById("treeitem-"+exec_id);
				var iframe = window.parent.document.getElementById("pluginActivateFrame");
				if (tree && tree.scrollHeight > 100)	
					iframe.style.height = '350px';
				else
					iframe.style.height = '170px';
			}	
		});	
	}
};
