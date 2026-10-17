function showProgress() {
    var map = getMessages(["Progress", "Process Mining", "Cancel"]);
    var progressViewer = new GlideModal("hierarchical_progress_viewer", false, "40em", "10em");
    progressViewer.setTitle(map["Progress"]);
    progressViewer.setPreference("sysparm_renderer_execution_id", g_form.getValue('tracker'));
    progressViewer.setPreference("sysparm_renderer_progress_title", map["Process Mining"]);
    progressViewer.on("renderStatus", function(trackerObj) {
        if (trackerObj.state == "0" || trackerObj.state == "1") {
            var cancelBtn = $("sysparm_button_cancel");
            if (cancelBtn)
                return;

            var buttonsPanel = $("buttonsPanel");
            if (!buttonsPanel)
                return;

            var table = new Element("table", {
                cellpadding: 0,
                cellspacing: 0,
                width: "100%"
            });
            var buttonsCell = table.appendChild(new Element("tr")).appendChild(new Element("td"));
            buttonsCell.align = "right";
            buttonsPanel.appendChild(table);
            cancelBtn = new Element("button");
            cancelBtn.id = "sysparm_button_cancel";
            cancelBtn.type = "button";
            cancelBtn.innerHTML = map["Cancel"];
            cancelBtn.onclick = function() {
                cancelMiningProcess();
                jQuery('#sysparm_button_cancel').hide();
            };
            buttonsCell.appendChild(cancelBtn);
        }
    });
    progressViewer.render();
}


function cancelMiningProcess() {
    var ga = new GlideAjax('global.ProminUtilsAJAX');
    ga.addParam('sysparm_name', 'cancelMining');
    ga.addParam('sysparm_versionId', g_form.getUniqueValue());
    ga.getXML();
}
