(function onBefore(current, previous /*null when async*/) {
	if (current.enable_rest_listener) {
		if (GlideStringUtil.nil(current.web_ext)) {
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("Cannot define an extension without associating a MID Web Server Extension to it."));	
			return;	
		}

		var web = new GlideRecord("ecc_agent_ext_context_webserver");
		web.get(current.web_ext);

		if (!(web.isValid())) {
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("Cannot define an extension without associating a valid MID Web Server Extension to it."));	
			return;			
		}

		if (web.execute_on != current.execute_on) {
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("The extension cannot be saved since the \"Execute on\" field is not the same as that of the MID Web Server Extension."));	
			return;			
		}
		else if (web.execute_on == "Specific MID Server") {
			if (web.mid_server != current.mid_server) {
				current.setAbortAction(true);
				gs.addInfoMessage(gs.getMessage("The extension cannot be saved since the MID Server is not the same as that of the MID Web Server Extension."));	
				return;						
			}
		}
		else {
			if (web.mid_server_cluster != current.mid_server_cluster) {
				current.setAbortAction(true);
				gs.addInfoMessage(gs.getMessage("The extension cannot be saved since the MID Server Cluster is not the same as that of the MID Web Server Extension."));	
				return;						
			}		
		}
	}
})(current, previous);
