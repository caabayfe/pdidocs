function onCancel() {
	GlideModal.get().destroy();
}

function onSubmit() {
	var dd = new GlideModal("simple_progress_viewer_ui16", true, "40em", "10em");
	dd.on("beforeclose", function() {
		g_navigation.reloadWindow();
		g_navigation.refreshNavigator();
	});

	var map = g_i18n.getMessages(["Plugin Activation", "Activation", "View Plugin", "View Logs", "View Plugin List", "Close & Reload Form", "Close & Refresh List"]);
	dd.setTitle(map["Plugin Activation"]);

	var pluginID = g_document.getElement('#plugin_id').value;
	var pluginName = g_document.getElement('#plugin_name').value;
	var pluginSysId = g_document.getElement('#plugin_sys_id').value;
	var listView = g_document.getElement('#list_view').value;
	var pluginCustomVersion = null;
	var getCustomVersion = '${sysparm_get_customized_version}';
	if (getCustomVersion) {
	    var customElem = document.getElementById("customized_version");
	    if (customElem != null)
	        pluginCustomVersion = customElem.value;
	}

	dd.setPreference('sysparm_ajax_processor_plugin_id', pluginID);
	dd.setPreference('sysparm_ajax_processor_progress_name', pluginName);
	dd.setPreference('sysparm_ajax_processor', 'AJAXPluginManagerWorker');
	if (pluginCustomVersion != null && pluginCustomVersion != 'none')
	    dd.setPreference('sysparm_ajax_processor_custom_version', pluginCustomVersion);

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
	dd.on("executionComplete", function(trackerObj) {

	    var container = g_document.getElement("#container");
	    if (trackerObj && container) {
		    var resultViewPanel = getResultView(trackerObj.name, trackerObj.state, trackerObj.message);
			var new_container = g_document.createElement("div");
			new_container.style.marginTop = "10px";
			new_container.style.marginRight = "10px";
			new_container.style.marginLeft = "20px";
			new_container.appendChild(resultViewPanel);
			container.outerHTML = new_container.outerHTML;
	    }

		var closeBtn = g_document.getElement("#sysparm_button_close");
		if (closeBtn) {
			closeBtn.addEventListener('click', function() {
				dd.destroy();
			});
		}
		var viewPluginBtn = g_document.getElement("#sysparm_button_vew_plugin");
		if (viewPluginBtn) {
			viewPluginBtn.addEventListener('click', function() {
				location.href = "v_plugin.do?sysparm_query=id=" + pluginID;
			});
		}
		var viewPluginListBtn = g_document.getElement("#sysparm_button_vew_plugin_list");
		if (viewPluginListBtn) {
			viewPluginListBtn.addEventListener('click', function() {
				location.href = "v_plugin_list.do";
			});
		}
		var logsBtn = g_document.getElement("#sysparm_button_logs");
		if (logsBtn) {
			logsBtn.addEventListener('click', function() {
				location.href = "sys_plugin_log_list.do?sysparm_query=plugin=" + pluginSysId;
			});

		}
	});

	var loadDemoElem = g_document.getElement('#load_demo');

	if (loadDemoElem && loadDemoElem.value == "true")
		dd.setPreference('sysparm_ajax_processor_load_demo', "true");

	dd.render();
	GlideModal.get().destroy();
}

function getResultView(pluginName, state, message) {
    var translator = g_i18n;
	var map = translator.getMessages(["Success", "Failure", "<b>{0}</b> was activated", "<b>{0}</b> was not activated"]);
	var view = g_document.createElement("div");

	var img = g_document.createElement("img");
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

	var nsp = g_document.createElement("span");

	nsp.style.fontSize = "120%";
	if (state == "2") {
		nsp.style.color = "#23D647";
		nsp.innerHTML = map["Success"];
	} else if (state == "3") {
		nsp.style.color = "red";
		nsp.innerHTML = map["Failure"];
	}
	view.appendChild(nsp);
	var br = g_document.createElement("br");
	view.appendChild(br);
	var msgCntr = g_document.createElement("div");
	msgCntr.style.marginTop = "10px";
	var msg = g_document.createElement("span");
	if (state == "2")
		msg.innerHTML = translator.format(translator.getMessage("<b>{0}</b> was activated"), pluginName);
	else if (state =="3")
		msg.innerHTML = translator.format(translator.getMessage("<b>{0}</b> was not activated. {1}"), pluginName, message);
	msgCntr.appendChild(msg);
	view.appendChild(msgCntr);
	return view;
}

// polyfill for setCheckBox which doesn't exist on UI16 pages
function setCheckBox(box) {
	var name = box.name;
	var id = name.substring(3);
	var frm = box.form;

	if (frm)
		frm[id].value = box.checked;
	else {
		var widget = $(id);

		if (widget)
			widget.value = box.checked;
	}

	if (box['onchange'])
		box.onchange();
}

function continueToApp(destinationAppURL) {
	window.location = destinationAppURL;
}
