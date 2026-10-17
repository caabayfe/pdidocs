function onLoad() {
   if (g_form.getValue("state") != "running")
      return;

   showStatus();
}

function cancellUploading() {
	var ga = new GlideAjax('ScheduleNodesLogsDownload');
	ga.addParam('sysparm_name', 'cancell');
	ga.addParam('sysparm_executionTrackerID', g_form.getValue('execution_tracker'));
	ga.addParam('sysparm_tableSysID', g_form.getUniqueValue());
	ga.getXML();
}

function showStatus() {
	var sysId = g_form.getValue('execution_tracker')+'';
	var dd = new GlideModal("hierarchical_progress_viewer", false, "40em", "10em");
	dd.setTitle("Status");
	dd.setPreference('sysparm_renderer_execution_id', sysId);
	dd.setPreference('sysparm_renderer_expanded_levels', '0');
	dd.setPreference('sysparm_button_close', 'Close');

	dd.on("renderStatus", function() {
		var cancelBtn = $("sysparm_button_cancel");
		if (cancelBtn)
			return;

        var buttonsPanel = $("buttonsPanel");
		if (!buttonsPanel)
			return;

        var table = new Element("table", {cellpadding: 0, cellspacing: 0, width : "100%"});
        var buttonsCell = table.appendChild(new Element("tr")).appendChild(new Element("td"));
        buttonsCell.align = "right";
        buttonsPanel.appendChild(table);

        cancelBtn = new Element("button");
        cancelBtn.id = "sysparm_button_cancel";
        cancelBtn.type = "button";
        cancelBtn.innerHTML = "Cancel";
        cancelBtn.onclick = function() {
            var response = confirm(new GwtMessage().getMessage("Are you sure you want to cancel?"));
            if (response != true)
                return;

            cancellUploading();
        };
        buttonsCell.appendChild(cancelBtn);
	});

	dd.on("executionComplete", function() {
		var closeBtn = $("sysparm_button_close");
        closeBtn.onclick = function() {
			window.location = "node_log_download_info.do?sys_id=" + g_form.getUniqueValue();
        };
	});

	dd.render();
}
