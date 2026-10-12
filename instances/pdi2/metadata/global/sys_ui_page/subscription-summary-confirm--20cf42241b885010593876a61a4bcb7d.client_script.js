function onCancel() {
	GlideDialogWindow.get().destroy();
    return false;
}

function onSubmit() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dd = new dialogClass("hierarchical_progress_viewer", true, "40em", "10em");
	dd.on("beforeclose", function() {
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});

	var map = new GwtMessage().getMessages(["Subscription Allocation", "Subscription Allocation Running", "Subscription Allocation successfull", "Subscription Allocation failed", "View Logs", "Close & Reload Form", "Close & Refresh List", "Close"]);
	dd.setTitle(map["Subscription Allocation"]);


	dd.setPreference('sysparm_ajax_processor', 'AJAXSubscriptionSummaryWorker');

	dd.setPreference('sysparm_renderer_progress_title', map["Subscription Allocation Running"]);

	// adding buttons
	dd.setPreference('sysparm_button_close', map["Close"]);

	dd.on("executionComplete", function(trackerObj) {

	     var container = $("container");
	    if (trackerObj && container) {
		    var resultViewPanel = getResultView(trackerObj.name, trackerObj.state, trackerObj.message);
			var new_container = new Element("div");
			new_container.style.marginTop = "10px";
			new_container.style.marginRight = "10px";
			new_container.style.marginLeft = "20px";
			new_container.appendChild(resultViewPanel);
			container.replace(new_container);
	    }

		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.addEventListener('click', function() {
				dd.destroy();
			});
		}

		var closeFormBtn = $("sysparm_button_close");
		if (closeFormBtn) {
			closeFormBtn.addEventListener('click', function() {
				dd.destroy();
			});

		}
	});

	 dd.render();
	 GlideDialogWindow.get().destroy();
}

function getResultView(trackerName, state, message) {
    var translator = new GwtMessage();
	var map = translator.getMessages(["Success", "Failure", "<b>{0}</b> was successfully run", "<b>{0}</b> run failed"]);
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
	img.style['float'] = "left";

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
		msg.innerHTML = translator.format("<b>{0}</b> was successfully run", trackerName);
	else if (state =="3")
		msg.innerHTML = translator.format("<b>{0}</b> run failed. {1}", trackerName, message);
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
