function showMiningTracker() {
    var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
    gaProminUtil.addParam('sysparm_name', 'getExecutionIdByProjectDef');
    gaProminUtil.addParam('sysparm_projectDefId', g_form.getUniqueValue());
    gaProminUtil.getXML(getActiveTrackerResponse);

    function getActiveTrackerResponse(response) {
        var trackerDetails = response.responseXML.documentElement.getAttribute("answer");
        if (trackerDetails) {
            trackerDetails = JSON.parse(trackerDetails);
            if (trackerDetails.executionId) {
                var map = getMessages(["Progress", "Close & Refresh", "View in Workspace", "Process Mining", "Cancel", "Notify Me", "Are you sure you want to cancel the mining?"]);
                var dd = new GlideModal("hierarchical_progress_viewer", true, "40em", "10em");
                dd.setTitle(map["Progress"]);
                dd.setPreference("sysparm_renderer_execution_id", trackerDetails.executionId);
                dd.setPreference("sysparm_renderer_progress_title", map["Process Mining"]);
                dd.setPreference("sysparm_button_show_graph", map["View in Workspace"]);
                dd.setPreference("sysparm_button_close", map["Close & Refresh"]);
                dd.on("executionComplete", function(trackerObj) {

                    var showGraph = $("sysparm_button_show_graph");
                    if (showGraph) {
                        if (trackerObj.state == 2) {
                            showGraph.onclick = function() {
                                var workBenchUrl = '/now/experience/promin/process-details/' + trackerDetails.versionId;
                                g_navigation.open(workBenchUrl, "_blank");
                                dd.destroy();
                                g_navigation.reloadWindow();
                            };
                        } else {
                            showGraph.style = 'display:none';
                        }
                    }
                    var closeBtn = $("sysparm_button_close");
                    if (closeBtn) {
                        closeBtn.onclick = function() {
                            dd.destroy();
                            g_navigation.reloadWindow();
                        };
                    }
                    if (trackerObj.state == "-1") { //When tracker is deleted
                        var cancelBtn = new Element("button");
                        cancelBtn.id = "sysparm_button_cancel";
                        cancelBtn.type = "button";
                        cancelBtn.className += 'btn btn-danger';
                        cancelBtn.style.marginLeft = "5px";
                        cancelBtn.innerHTML = map["Cancel"];
                        if (!g_user.hasRole("sn_process_optimization_analyst")) {
                            cancelBtn.disabled = true;
                        }
                        cancelBtn.onclick = function() {
                            if (confirm(map["Are you sure you want to cancel the mining?"]) == true) {
                                cancelMiningProcess(trackerDetails.versionId);
                                dd.destroy();
                                g_navigation.reloadWindow();
                            }
                        };
                        jQuery('#buttonsPanel').append(cancelBtn);
                    }
                });
                dd.on("renderStatus", function(trackerObj) {
                    var cancelBtn = $("sysparm_button_cancel");
                    if (cancelBtn)
                        return;

                    var notifyBtn = $("sysparm_button_notify");
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
                    cancelBtn.className += 'btn btn-danger';
                    cancelBtn.style.marginLeft = "5px";
                    cancelBtn.innerHTML = map["Cancel"];
                    if (!g_user.hasRole("sn_process_mining_analyst")) {
                        cancelBtn.disabled = true;
                    }
                    cancelBtn.onclick = function() {
                        if (confirm(map["Are you sure you want to cancel the mining?"]) == true) {
                            cancelMiningProcess(trackerDetails.versionId);
                            dd.destroy();
                            if (g_form.getValue('state') == 'AVAILABLE') {
                                g_navigation.reloadWindow();
                            }
                        }
                    };
                    buttonsCell.appendChild(cancelBtn);

                    if (g_form.getValue('watch_list').toString().indexOf(g_user.userID) < 0) {
                        notifyBtn = new Element("button");
                        notifyBtn.id = "sysparm_button_notify";
                        notifyBtn.type = "button";
                        notifyBtn.innerHTML = map["Notify Me"];
                        notifyBtn.className += 'btn btn-default';
                        notifyBtn.style.marginLeft = "5px";
                        notifyBtn.onclick = function() {
                            addUserToWatchList(function() {
                                notifyBtn.disabled = true;
                                alert("You'll receive an email notifying you of the final extraction status.");
                            });
                        };
                        buttonsCell.appendChild(notifyBtn);
                    }
                    var iconCross = $("hierarchical_progress_viewer_closemodal");
                    iconCross.style.display = "inline"; //show close icon
                });
                dd.render();
            }
        }
    }
}

function cancelMiningProcess(versionId) {
    var gaCancelMining = new GlideAjax('global.ProminUtilsAJAX');
    gaCancelMining.addParam('sysparm_name', 'cancelMining');
    gaCancelMining.addParam('sysparm_versionId', versionId);
    gaCancelMining.getXML();
}

function addUserToWatchList(callbackFn) {
    var gaNotify = new GlideAjax('global.ProminUtilsAJAX');
    gaNotify.addParam('sysparm_name', 'addUserToWatchList');
    gaNotify.addParam('sysparm_projectDefId', g_form.getUniqueValue());
    gaNotify.getXML(confirmUserAddParse);

    function confirmUserAddParse(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer == "true") {
            callbackFn();
        } else
            alert("Cannot add you to the watch list");
    }
}
