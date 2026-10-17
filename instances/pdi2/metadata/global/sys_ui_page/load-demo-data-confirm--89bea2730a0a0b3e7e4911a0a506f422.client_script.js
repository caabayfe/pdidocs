function onCancel() {
  GlideDialogWindow.get().destroy();
  return false;
}

function onSubmit() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dd = new dialogClass("simple_progress_viewer", false, "40em", "10em");
	dd.on("beforeclose", function() {
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});
	var map = new GwtMessage().getMessages(["Loading Demo Data", "Loading", "View Plugin", "View Logs", "View Plugin List", "Close & Reload Form", "Close & Refresh List"]);

    dd.setTitle(map["Loading Demo Data"]);
    
	var pluginID = gel('plugin_id').value;
	var pluginName = gel('plugin_name').value;
	var listView = gel('list_view').value;
	
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

	    var container = $("container");
	    if (trackerObj && container) {
		    var resultViewPanel = getResultView(trackerObj.name, trackerObj.state);
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
				location.href = "sys_plugin_log_list.do?sysparm_query=plugin=" + pluginID;
			};
			
		}
	});	
	
    dd.render();
	GlideDialogWindow.get().destroy();
}

function getResultView(pluginName, state) {
	var map = new GwtMessage().getMessages(["Success", "Failure", "Demo Data was loaded", "Demo Data was not loaded"]);
	var view = new Element("div");

	var img = new Element("img");
	if (state == "2") {
		img.src = "images/progress_success.png";
		img.title = map["Success"];
	} else if (state == "3") {
		img.src = "images/progress_failure.png";
		img.title = map["Failure"];
	}
	img.style.marginRight = "5px";
	img.style.float = "left";

	view.appendChild(img);

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
		msg.innerHTML = map["Demo Data was loaded"];
	else if (state =="3")
		msg.innerHTML = map["Demo Data was not loaded"];
	msgCntr.appendChild(msg);
	view.appendChild(msgCntr);
	return view;
}
