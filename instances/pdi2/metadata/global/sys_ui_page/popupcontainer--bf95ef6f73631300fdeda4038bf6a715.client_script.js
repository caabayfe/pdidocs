window.onload = function() {
	clickActivate();

	function clickActivate() {
		var scheduleTitle = "$[gs.getMessage('Schedule Activation')]";
		var installTitle = "$[gs.getMessage('Activate Plugin')]";
		var ngScope = parent.angular.element('[uib-modal-window="modal-window"]').scope();
		var rootScope = ngScope.$root;
		var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
		var dd = new dialogClass("activate_plugin_confirm");
		dd.setTitle(ngScope.app.isScheduleInstall ? scheduleTitle : installTitle);
		dd.setPreference('sysparm_plugin_id', document.getElementById("pluginId").value);
		dd.setPreference('sysparm_plugin_scope', document.getElementById("scope").value);
		dd.setPreference('sysparm_is_search_applied', document.getElementById("isSearchApplied").value);
		dd.setPreference('sysparm_is_filter_applied', document.getElementById("isFilterApplied").value);
		if (ngScope.app.isScheduleInstall) {
			dd.setPreference('sysparm_is_schedule_install', ngScope.app.isScheduleInstall);
			dd.setPreference('sysparm_schedule_start_date_time', ngScope.app.scheduleStartDateTime.slice(0, -3));
			dd.setPreference('sysparm_failure_strategy_options', JSON.stringify(ngScope.failureStrategyOptions));
			dd.setPreference('sysparm_selected_failure_strategy', JSON.stringify(ngScope.selectedFailureStrategy));
			dd.setPreference('sysparm_customized_version_label', ngScope.getCustomizedVersionText());
		}

		if (document.getElementById("popup_customized_version").value !== 'undefined')
			dd.setPreference('sysparm_customized_version', document.getElementById("popup_customized_version").value);
		else
			dd.setPreference('sysparm_get_customized_version', true);
		dd.setWidth(500);
		dd.setBackdropStatic(true);
		dd.render();

		jQuery(document).on('click', '#activate_plugin_confirm_closemodal', function(){
			ngScope.app.isScheduleInstall = false;
			ngScope.$close();
		});

		jQuery(document).on('click', '#cancel_button', function(){
			ngScope.app.isScheduleInstall = false;
			ngScope.$close();
		});

		jQuery(document).on('click', '#sysparm_button_close', function(){
			ngScope.app.isScheduleInstall = false;
			ngScope.$close();
			// Close and refresh.
			rootScope.$emit("unified_plugin.refetch_app_list");
		});

		jQuery(document).on('click', '#sysparm_button_vew_plugin_list', function(){
			window.parent.location.replace("/v_plugin_list.do");
			return false;
		});

		jQuery(document).on('click', '#sysparm_button_logs', function(){
			window.parent.location.replace("/sys_plugin_log_list.do?sysparm_query=plugin=" + document.getElementById("pluginId").value);
		});

		jQuery(document).keyup(function(e) {
			if (e.keyCode == 27 && !document.getElementById("simple_progress_viewer")) {
				var ngScope = parent.angular.element('[uib-modal-window="modal-window"]').scope();
				ngScope.$close();
			}

		});

		jQuery(document).on('click', '#ok_button', function(){
			adjustFrameHeight();
		});

		jQuery(document).on('click', "#submit_schedule", function() {
			ngScope.app.retry_option_value = gel("retry_option_list") ? gel("retry_option_list").value : "";
			ngScope.app.load_demo_data = gel("load_demo") ? gel("load_demo").value == "true" : "";
			ngScope.app.isScheduleInstall = false;
			dd.destroy();
			ngScope.schedulePluginInstall();
		});

		function adjustFrameHeight(triesLeft) {
			var modalDialog = jQuery('.modal-dialog')[0];
			if (modalDialog) {
				var confirmDialog = jQuery('#activate_plugin_confirm')[0] || jQuery('#simple_progress_viewer')[0];
				if(jQuery('#simple_progress_viewer')) jQuery('#simple_progress_viewer').focus();
				var newHeight = modalDialog.getDimensions().height + "px";
				confirmDialog.style.height = newHeight;

				// Dialog's height changes to fix the content to re-measure it's height
				newHeight = modalDialog.getDimensions().height + "px";

				window.parent.jQuery("#pluginActivateFrame")[0].style.height = newHeight;
				var parentModalContent = window.parent.jQuery(".modal-content")[0];
				if (parentModalContent && parentModalContent.style) {
					parentModalContent.style.height = newHeight;
					parentModalContent.style.border = "0px solid";
				}

				if (confirmDialog && confirmDialog.id === 'activate_plugin_confirm' || (confirmDialog.id === 'simple_progress_viewer' && jQuery('#sysparm_button_vew_plugin_list')[0])) {
					// Trying for few more time as sometimes the image icon takes time to download.
					// This introduces the scroll bar after the resize has stopped.
					if (!triesLeft) {
						clearTimeout(window.resizeTimeout);
						return;
					}
					triesLeft--;
				}
			}

		}

		// Overriding popListDiv function to prevent opening of popup in iframe for
		// showing dependent plugin detail.
		popListDiv = function (event, tableName, pluginId) {
			if (tableName == 'v_plugin') {
				window.open(window.location.origin + "/v_plugin.do?sys_id=" + pluginId, "_blank");
				event.stopPropagation();
			}
		};

		CustomEvent.on("adjust-plugin-frame", function() {
			setTimeout(function(){ adjustFrameHeight();}, 0);
		});
	}
};
