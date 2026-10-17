var ConnectionUtils = {
	getSysConnection: function() {
		var connGR = new GlideRecord("sys_connection");
		connGR.addQuery('active', true);
		connGR.addQuery("connection_alias", g_form.getValue("connection_alias"));
		connGR.addQuery("sys_domain", g_form.getValue("sys_domain"));
		connGR.addQuery("sys_id", "!=", g_form.getUniqueValue());
		connGR.query();
	
		return connGR;
	},
	
	doConnection: function(verb) {
		var currName = g_form.getValue("name");

		// ensure connection name does not contain special characters like >, < to prevent XSS
		if (currName.match(/[^A-Za-z0-9_ @./()#&+\-=!*]/)){
			g_form.addErrorMessage(new GwtMessage().getMessage("Invalid connection name"));
			return false;
		}
	
		if (g_form.getValue("active") == "false") {
			gsftSubmit(null, g_form.getFormElement(), verb);
			return;
		}
	
		var connGR;
		var performOverride = function() {
			connGR.active = false;
			connGR.update();
			gsftSubmit(null, g_form.getFormElement(), verb);
		};
	
		var grConnAlias = new GlideRecord("sys_alias");
		if (grConnAlias.get(g_form.getValue("connection_alias"))) {
			if (grConnAlias.multiple_connections == 'true') {
				gsftSubmit(null, g_form.getFormElement(), verb);
			} else {
				connGR = this.getSysConnection();
	
				if (connGR.next()) {
					var escapedCurrName = this.escapeHTML(currName);
					var escapedConnGRName = this.escapeHTML(connGR.name);
					
					if (escapedConnGRName.toUpperCase() == escapedCurrName.toUpperCase()) {
						var uniqueErrMsg = new GwtMessage().getMessage("A connection with {0} name already exists, duplicate connection names are not allowed", escapedCurrName);
						g_form.addErrorMessage(uniqueErrMsg);
						return false;
					}
	
					// Get user confirmation to deactivate the current active one
					var title = new GwtMessage().getMessage("Confirm inactivation");
					var question = new GwtMessage().getMessage("You already have a {0} connection active, {1}.<br/>By making this one active, {2} will become inactive. <br/>Are you sure you want to make {3} the active connection?", connGR.protocol, escapedConnGRName, escapedConnGRName, escapedCurrName);
	
					this.confirmOverride(title, question, performOverride);
				} else {
					gsftSubmit(null, g_form.getFormElement(), verb);
				}
			}
		}
	},
	
	confirmOverride: function(title, question, onPromptComplete) {
		var dialogClass = (window.GlideModal) ? GlideModal : GlideDialogWindow;
		var dialog = new GlideDialogWindow('glide_confirm_basic');
		dialog.setTitle(title);
		dialog.setSize(400, 325);
		dialog.setPreference('title', question);
		dialog.setPreference('onPromptComplete', onPromptComplete);
		dialog.render();
	},
	
	escapeHTML: function(str) {
		return str.replace(/[&<>"'\u00AD]/g, function (c) {
			switch (c) {
				case '&': return '&amp;';
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '"': return '&quot;';
				case "'": return '&#039;';
				case '\u00AD': return '&shy;';
				default: return c;
			}
		});
	}
	
	};
