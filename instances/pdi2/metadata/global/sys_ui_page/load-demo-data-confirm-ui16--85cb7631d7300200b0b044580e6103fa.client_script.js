function onCancel() {
  GlideModal.get().destroy();
  return false;
}

function onSubmit() {
    var dd = new GlideModal("simple_progress_viewer_ui16", false, "40em", "10em");
	dd.on("beforeclose", function() {
		g_navigation.reloadWindow(); //reload current form after closing the progress viewer dialog
	});
	var map = g_i18n.getMessages(["Loading Demo Data", "Loading", "View Plugin", "View Logs", "View Plugin List", "Close & Reload Form", "Close & Refresh List"]);

    dd.setTitle(map["Loading Demo Data"]);
    
	var pluginID = g_document.getElement('#plugin_id').value;
	var pluginName = g_document.getElement('plugin_name').value;
	var listView = g_document.getElement('list_view').value;
	
	dd.setPreference('sysparm_ajax_processor_plugin_id', pluginID);
    dd.setPreference('sysparm_ajax_processor_progress_name', pluginName);
	dd.setPreference('sysparm_ajax_processor', 'AJAXPluginManagerWorker');
	dd.setPreference('sysparm_ajax_processor_load_demo_data_only', "true");
	
	dd.setPreference('sysparm_renderer_progress_title', map["Loading"]);

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
		    var resultViewPanel = getResultView(trackerObj.name, trackerObj.state);
			var new_container = g_document.createElement('div');
			new_container.style.marginTop = "10px";
			new_container.style.marginRight = "10px";
			new_container.style.marginLeft = "20px";
			new_container.appendChild(resultViewPanel);
			container.replaceWith(new_container);
	    }

		var closeBtn = snc.getElement("#sysparm_button_close");
		if (closeBtn) {
			closeBtn.on('click', function() {
				dd.destroy();
			});
		}
		var viewPluginBtn = snc.getElement("#sysparm_button_vew_plugin");
		if (viewPluginBtn) {
			viewPluginBtn.on('click', function() {
				location.href = "v_plugin.do?sysparm_query=id=" + pluginID;
			});
		}
		var viewPluginListBtn = snc.getElement("#sysparm_button_vew_plugin_list"); 
		if (viewPluginListBtn) {
			viewPluginListBtn.on('click', function() {
				location.href = "v_plugin_list.do";
			});
		}
		var logsBtn = snc.getElement("#sysparm_button_logs");
		if (logsBtn) {
			logsBtn.on('click', function() {
				location.href = "sys_plugin_log_list.do?sysparm_query=plugin=" + pluginID;
			});
			
		}
	});	
	
    dd.render();
	GlideModal.get().destroy();
}

function getResultView(pluginName, state) {
	var map = snc.i18n.getMessages(["Success", "Failure", "Demo Data was loaded", "Demo Data was not loaded"]);
	var view = snc.getElement('<div/>').get(0);

	var img = snc.getElement("<img />").get(0);
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

	var nsp = snc.getElement("<span />").get(0);

	nsp.style.fontSize = "120%";
	if (state == "2") {
		nsp.style.color = "#23D647";
		nsp.innerHTML = map["Success"];
	} else if (state == "3") {
		nsp.style.color = "red";
		nsp.innerHTML = map["Failure"];
	}
	view.appendChild(nsp);
	var br = snc.getElement("<br />").get(0);
	view.appendChild(br);
	var msgCntr = snc.getElement("<div />").get(0);
	msgCntr.style.marginTop = "10px";
	var msg = snc.getElement("<span />").get(0);
	if (state == "2")
		msg.innerHTML = map["Demo Data was loaded"];
	else if (state =="3")
		msg.innerHTML = map["Demo Data was not loaded"];
	msgCntr.appendChild(msg);
	view.appendChild(msgCntr);
	return view;
}
