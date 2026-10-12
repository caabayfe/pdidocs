function onCancel() {
	GlideDialogWindow.get().destroy();
}

function onPopupLoad(){
	jQuery('#retry_option_list').select2({
		minimumResultsForSearch: -1
	});

	if (gel("submit_schedule") && gel("is_plugin_schedule_allowed") && gel("is_plugin_schedule_allowed").value == "false")
		gel("submit_schedule").disabled = true;

	if(gel("ok_button") && gel("plugin_installation_allowed") && gel("plugin_installation_allowed").value == "false")
		gel("ok_button").disabled = true;

	CustomEvent.fireAll("adjust-plugin-frame");
}

onPopupLoad();

function onSubmit() {
	var installStartTime = gel('install_start_time').value;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("simple_progress_viewer", true, "40em", "10em");
	dd.on("beforeclose", function() {
		refreshNav();
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});

	var map = new GwtMessage().getMessages(["Plugin Activation", "Activation", "View Plugin", "View Logs", "View Plugin List", "Close & Reload Form", "Close & Refresh List"]);
	dd.setTitle(map["Plugin Activation"]);
	
	var pluginID = gel('plugin_id').value;
	var pluginName = gel('plugin_name').value;
	var pluginSysId = gel('plugin_sys_id').value;
	var listView = gel('list_view').value;
	var pluginCustomVersion = '${sysparm_customized_version}';
	var getCustomVersion = '${sysparm_get_customized_version}';
	var activePluginsBefore = {};
	
	var collectionData = {};
	collectionData.is_search_applied = '${sysparm_is_search_applied}';
	collectionData.is_filter_applied = '${sysparm_is_filter_applied}';
	collectionData.app_id = pluginID;
	var gcfUtil = new GlideAjax('sn_appclient.AppManagerGCFAjax');
	gcfUtil.addParam('sysparm_name', 'capturePluginInstallAnalytics');
	gcfUtil.addParam('sysparm_collection_data', JSON.stringify(collectionData));
	gcfUtil.getXML();

	var ga = new GlideAjax('AppManagerCacheHelper');
	ga.addParam('sysparm_name', 'getActivePlugins');
	ga.getXMLWait();
	activePluginsBefore = ga.getAnswer();
	
	if (getCustomVersion) {
	    var customElem = document.getElementById("customized_version");
	    if (customElem != null)
	        pluginCustomVersion = customElem.value;
	}

	dd.setPreference('sysparm_ajax_processor_plugin_id', pluginID);
	if (pluginCustomVersion != null && pluginCustomVersion != 'none')
	    dd.setPreference('sysparm_ajax_processor_custom_version', pluginCustomVersion);
	dd.setPreference('sysparm_ajax_processor_progress_name', pluginName);
	dd.setPreference('sysparm_ajax_processor', 'AJAXPluginManagerWorker');
	
	dd.setPreference('sysparm_renderer_progress_title', map["Activation"]);

	// adding buttons	
	dd.setPreference('sysparm_button_logs', map["View Logs"]);
	if (listView) {
		dd.setPreference('sysparm_button_vew_plugin', map["View Plugin"]);
		dd.setPreference('sysparm_button_close', map["Close & Refresh List"]);
	}
	else {
		dd.setPreference('sysparm_button_vew_plugin_list', map["View Plugin List"]);
		dd.setPreference('sysparm_button_close', map["Close & Reload Form"]);
	}

	dd.on("executionStarted", function() {
		CustomEvent.fireAll("adjust-plugin-frame");
	});

	dd.on("executionComplete", function(trackerObj) {
		var gr = new GlideAjax("AppManagerCacheHelper");
		gr.addParam("sysparm_name", "refreshAppManagerCache");
		gr.addParam("sysparm_install_start_time", installStartTime);
		gr.addParam("sysparm_active_plugins_before", activePluginsBefore);
		gr.getXMLWait();

		var ga = new GlideAjax("sn_appclient.AppManagerGCFAjax");
		ga.addParam("sysparm_name", "capturePluginInstallationTime");
		ga.addParam("sysparm_install_start_time", installStartTime);
		ga.addParam("sysparm_plugin_id", pluginID);
		ga.getXML();

		var container = $("container");
		if (trackerObj && container) {
			var resultViewPanel = getResultView(trackerObj);
			var new_container = new Element("div");
			new_container.style.marginTop = "10px";
			new_container.style.marginRight = "10px";
			new_container.style.marginLeft = "20px";
			new_container.appendChild(resultViewPanel);
			container.replace(new_container);
		} 

		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
		var viewPluginBtn = $("sysparm_button_vew_plugin"); 
		if (viewPluginBtn) {
			viewPluginBtn.onclick = function() {
				location.href = "v_plugin.do?sysparm_query=id=" + pluginID;
			};
		}
		var viewPluginListBtn = $("sysparm_button_vew_plugin_list"); 
		if (viewPluginListBtn) {
			viewPluginListBtn.onclick = function() {
				location.href = "v_plugin_list.do";
			};
		}
		var logsBtn = $("sysparm_button_logs");
		if (logsBtn) {
			logsBtn.onclick = function() {
				location.href = "sys_plugin_log_list.do?sysparm_query=plugin=" + pluginSysId;
			};
			
		}
		CustomEvent.fireAll("adjust-plugin-frame");
	});	
	
	var loadDemoElem = gel('load_demo');
	
	if (loadDemoElem && loadDemoElem.value == "true")
		dd.setPreference('sysparm_ajax_processor_load_demo', "true");
	
	dd.render();
	GlideDialogWindow.get().destroy();
}

function displaySkippedTableUIMessage(message, skippedTablesList) {
	if (message.substring(0, 15) == "Skipping table:") {
		GlideUI.get().addOutputMessage({
				msg: message,
				type: "warning",
				id: 'skipping_table_alter'
		});
		skippedTablesList.push(message.substring(16, message.length - 21));
	}
}

function displaySkippedTableMessageRecursiveCall(obj, skippedTablesList) {
	displaySkippedTableUIMessage(obj.message, skippedTablesList);
	if (!obj || typeof(obj.children.length) === 'undefined' || obj.children.length == 0)
		return;

	for (var i = 0; i < obj.children.length; i ++) {
		displaySkippedTableMessageRecursiveCall(obj.children[i], skippedTablesList);
	}
}

function getResultView(trackerObj) {
    var skippedTablesList = [];
	displaySkippedTableMessageRecursiveCall(trackerObj, skippedTablesList);
	var pluginName = trackerObj.name;
	var state =  trackerObj.state;
	var message = trackerObj.message;
    var translator = new GwtMessage();
	var map = translator.getMessages(["Success", "Failure", "<b>{0}</b> was activated", "<b>{0}</b> was not activated",
	"Skipped table {0} (too large to alter)", "Contact support to process the following skipped table(s) -"]);
	var view = new Element("div");

	if (NOW.isUsingPolaris) {
        var icon = new Element ('span');

        icon.style.verticalAlign = 'sub';
        icon.style.marginRight = '.25rem';
        if (state == '2') {
            icon.style.color = "#23D647";
            icon.innerHTML = '<svg class="now-icon -lg" aria-hidden="true" viewBox="0 0 24 24"><path d="M17.207 10.207a1 1 0 0 0-1.414-1.414L10 14.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l6.5-6.5z"></path><path d="M12 23C5.925 23 1 18.075 1 12S5.925 1 12 1s11 4.925 11 11-4.925 11-11 11zM3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path></svg>';
        } else if (state == '3') {
           icon.style.color = "red";
           icon.innerHTML = '<svg class="now-icon -lg" aria-hidden="true" viewBox="0 0 24 24"><path d="M11 9a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V9zm1 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path><path d="M9.395 3.515c1.152-2.016 4.059-2.016 5.21 0L22.6 17.512c1.142 2-.302 4.488-2.605 4.488H4.005C1.702 22 .258 19.512 1.4 17.512L9.395 3.515zm3.473.992a1 1 0 0 0-1.736 0L3.137 18.504A1 1 0 0 0 4.005 20h15.99a1 1 0 0 0 .868-1.496L12.868 4.507z"></path></svg>';
        }

        view.appendChild(icon);
	} else {
        var img = new Element("img");

        if (state == "2") {
            img.src = "images/progress_success.png";
            img.title = map["Success"];
        } else if (state == "3") {
            img.src = "images/progress_failure.png";
            img.title = map["Failure"];
        }

        img.style.marginRight = "5px";
        img.style['float'] = "left";

        view.appendChild(img);
    }

	var nsp = new Element("span");

	nsp.style.fontSize = "120%";
	if (state == "2") {
		nsp.style.color = "#23D647";
		nsp.innerHTML = map["Success"];
	} else if (state == "3") {
		nsp.style.color = "red";
		nsp.innerHTML = map["Failure"];
	}
	view.appendChild(nsp);
	var br = new Element("br");
	view.appendChild(br);
	var msgCntr = new Element("div");
	msgCntr.style.marginTop = "10px";
	var msg = new Element("span");
	if (state == "2")
		msg.innerHTML = translator.format(translator.getMessage("<b>{0}</b> was activated"), pluginName);
	else if (state =="3")
		msg.innerHTML = translator.format(translator.getMessage("<b>{0}</b> was not activated. {1}"), pluginName, message);
	msgCntr.appendChild(msg);
	view.appendChild(msgCntr);
	if (skippedTablesList.length > 0) {
		var skipMessage = new Element("span");
		skipMessage.innerHTML = map["Contact support to process the following skipped table(s) -"] + " <br>" + skippedTablesList.map(function(table) {
			    return translator.format(translator.getMessage("Skipped table {0} (too large to alter)"), table);
			}).join(" <br>");
		view.appendChild(skipMessage);
	}
	return view;
}

function trackPlugin(pluginId, pluginName, licCheckReq, hasLicense, actionName) {

  // send platform analytics for plugin-activation ui elements and the state of license check

  var streamId = "snc.plugin";
  var data = {"event.type":"activation.request", "plugin.id":pluginId, "plugin.name":pluginName, "license_check_required":licCheckReq, "has_license":hasLicense, "action.name":actionName};
  data["user"] = window.NOW.user.userID;
  data["has_maint"] = (window.NOW.user.allRoles.indexOf('maint') > -1) ? "true": "false";

  var pa = new GlideAjax("UAPlatformAnalyticsAjaxAPI");
  pa.addParam("sysparm_name", "sendAnalytic");
  pa.addParam("sysparm_streamId", streamId);
  pa.addParam("sysparm_sample", JSON.stringify(data));
  pa.getXML();
}

function continueToApp(destinationAppURL) {
	window.location = destinationAppURL;
}
