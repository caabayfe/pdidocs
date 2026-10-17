function initializeConflictDetection() {

    var conflictWorkerSysId = $("conflict_worker_id").value;
    if (conflictWorkerSysId !== "") {
        runBackgroundPoll(conflictWorkerSysId);
        showProgressButton(true);
    }

    // Ensure the warning message and check conflicts button are
    // correctly shown/hidden (Poll every 2 seconds in case User has
    // cleared one of the 3 mandatory conflict detection fields)
    setInterval(updateWarningBoxAndConflictButton, 2000);

    setTimeout(function() {
        if (!g_form.isNewRecord() && ($("conflict_worker_id").value !== "")) {
            if (updateWarningBoxAndConflictButton()) {
                updateConflictStatus(0);
                refreshConflicts();
            }
        }
    }, 1000);

    $("conflict_action_run").observe("click", function(event) {
        event.stop();

        // If we have unfilled mandatory fields then do not progress
        if (!g_form.mandatoryCheck())
            return;

        if (g_form.isNewRecord() || g_form.modified) {
            // Add a hidden parameter to indicate that the run conflict detection should be run after the form has saved
            var afterSaveURL = new GlideURL();

            if (g_form.isNewRecord())
                afterSaveURL.setFromString(g_form.getTableName() + '.do?sys_id=' + g_form.getUniqueValue());
            else
                afterSaveURL.setFromCurrent();

            addHidden(g_form.getFormElement(), 'sysparm_goto_url', afterSaveURL.getURL().replace(g_form.getTableName() + '.do', 'change_conflict_ui.do'));
            g_form.save();
        } else
            runConflictDetection();
    });

    //Add event listener for list v2 changes for Affected CI's
    CustomEventManager.observe('partial.page.reload', function(elem, e) {
        if (e && e.listID === g_form.getTableName() + '.task_ci.task')
            $('affected_item_count').value = e.totalRows;
    });

    //Add event listener for list v3 changes for Affected CI's
    CustomEventManager.observe('g_list.api.refresh', function(e) {
        if (e && e.listId === g_form.getTableName() + '.task_ci.task')
            $('affected_item_count').value = GlideList.get(g_form.getTableName() + '.task_ci.task').getRowCount();
    });

    var runWorkerEl = $("run_worker_ui");
    if (runWorkerEl && runWorkerEl.value == "true")
        runConflictDetection();
}

function getSchedulingConflictMessage() {
    var startDateReadOnly = g_form.isReadOnly("", g_form.getControl("start_date"));
    var endDateReadOnly = g_form.isReadOnly("", g_form.getControl("end_date"));

    if (startDateReadOnly || endDateReadOnly)
        return new GwtMessage().getMessage("Scheduling conflict detected. Review the Conflicts form section.");
    return new GwtMessage().getMessage("Scheduling conflict detected. Use the <a href='javascript:void(0);' onclick='openNextAvailableTime()'>Scheduling Assistant</a> to avoid conflicts.");
}

function runConflictDetection() {
    var cancelButtonId = 'cancelButton';
    var backgroundlButtonId = 'runInBackgroundButton';

    var dd = new GlideModal("change_conflict_progress_renderer", true, "40em", "10.5em");
    dd.setTitle(new GwtMessage().getMessage("Checking conflicts"));
    dd.setPreference('sysparm_progress_name', "Conflict Checker");
    dd.setPreference("sysparm_renderer_expanded_levels", "0");
    dd.setPreference("sysparm_renderer_hide_drill_down", true);

    if ($('conflict_worker_id').value == "") {
        dd.setPreference("sysparm_ajax_processor", "ChangeConflictWorkerAJAXProcessor");
        dd.setPreference("sysparm_sysid", g_form.getUniqueValue());
    } else
        dd.setPreference('sysparm_renderer_execution_id', $('conflict_worker_id').value + "");

    dd.setPreference("sysparm_button_close", new GwtMessage().getMessage("Close"));

    dd.on("executionComplete", function(trackerObj) {
        receiveMessage(trackerObj);

        if (trackerObj.state == 4) {
            var progressContainer = $("change_conflict_progress_renderer");
            if (progressContainer)
                progressContainer.down("#container").innerHTML = $("conflict_canceled_progress_status").innerHTML;
        }

        var closeBtn = $("sysparm_button_close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                showProgressButton(false);
                dd.destroy();
            };
        }

        var cancelButton = $(cancelButtonId);
        if (cancelButton)
            cancelButton.hide();

        var backgroundButton = $(backgroundlButtonId);
        if (backgroundButton)
            backgroundButton.hide();
    });

    dd.on("beforeclose", function() {
        runBackgroundPoll($('conflict_worker_id').value);
    });

    dd.on("renderStatus", function(workerObj) {
        // Record the value of the tracker for future use
        $('conflict_worker_id').value = workerObj.sys_id;

        // Add the cancel button
        if (!dd.hasCancelButton) {
            // Create a button that closes the dialog when it is clicked
            // (But continues to run conflict detection in the background)
			var button = new Element('button', {'id': cancelButtonId, 'class': 'btn btn-default', 'style': 'margin: 0px 4px 0px 4px;'});
            button.update(new GwtMessage().getMessage("Cancel"));
            button.observe("click", function(event) {
                var backgroundButton = $(backgroundlButtonId);
                if (backgroundButton)
                    backgroundButton.disable();

                cancelConflictDetection($('conflict_worker_id').value);
            });

            // Add the button to the dialog and make a note of the fact that you added it
            var buttonPanel = $('buttonsPanel');
            buttonPanel.appendChild(button);
            dd.hasCancelButton = true;
        }

        // Add the Run in background button
        if (!dd.hasRunInBackgroundButton) {
            // Create a button that closes the dialog when it is clicked
            // (But continues to run conflict detection in the background)
			var button = new Element('button', {'id': backgroundlButtonId, 'class': 'btn btn-primary', 'style': 'margin: 0px 4px 0px 4px;'});
            button.update(new GwtMessage().getMessage("Run in Background"));
            button.observe("click", function(event) {
                var cancelButton = $(cancelButtonId);
                if (cancelButton)
                    cancelButton.disable();

                runBackgroundPoll($('conflict_worker_id').value);
                dd.destroy();
            });

            // Add the button to the dialog and make a note of the fact that you added it
            var buttonPanel = $('buttonsPanel');
            buttonPanel.appendChild(button);
            dd.hasRunInBackgroundButton = true;
        }
    });

    showProgressButton(true);
    dd.render();
}

function updateWarningBoxAndConflictButton() {
    // Get values of all fields to determine if conflict detection should be allowed or not
    var cmdbCi = g_form.getValue('cmdb_ci');
    var startDate = g_form.getValue('start_date');
    var endDate = g_form.getValue('end_date');
    var conflictMode = $('conflict_mode').value;
    var affectedItemCount = $('affected_item_count').value;

    // Get references to the two gui widgets you intend to enable/disable
    var warningBox = $('conflictDetectionStatus');
    var checkConflictsButton = $('conflict_action_run');

    // Prioritize g_form.getValue() to capture any client-side changes when field is on the form (returns 'true'/'false').
    // When field is not present in UI, g_form returns '' so fallback to hidden field which contains server value ('1'/'0').
    var excludeConflict = g_form.getValue('exclude_from_conflict_detection') || $('exclude_from_conflict_hidden').value;
    if (excludeConflict === 'true' || excludeConflict === '1') {
        warningBox.show();
        checkConflictsButton.disable();
        return false;
    }

    // Case1: Basic Mode + Configuration Item + Planned Start Date + Planned End Date
    if (conflictMode == 'basic' && cmdbCi != '' && startDate != '' && endDate != '') {
        warningBox.hide();
        checkConflictsButton.enable();
        return true;
    }

    // Case2: Advanced Mode + Configuration Item + Planned Start Date + Planned End Date
    if (conflictMode == 'advanced' && cmdbCi != '' && startDate != '' && endDate != '') {
        warningBox.hide();
        checkConflictsButton.enable();
        return true;
    }

    // Case3: Advanced Mode + Affected Items + Planned Start Date + Planned End Date
    if (conflictMode == 'advanced' && parseInt(affectedItemCount) != 0 && startDate != '' && endDate != '') {
        warningBox.hide();
        checkConflictsButton.enable();
        return true;
    }

    // Default: Do not allow User to run conflict detection
    warningBox.show();
    checkConflictsButton.disable();
    return false;
}

function showProgressButton(boolValue) {
    if (boolValue) {
        $("conflict_run_state").value = "executing";
        $("conflict_action_run").innerHTML = new GwtMessage().getMessage("View Progress");
    } else {
        $("conflict_run_state").value = "ready";
        $("conflict_action_run").innerHTML = new GwtMessage().getMessage("Check Conflicts");
    }
}

function runBackgroundPoll(sysId) {
    if (sysId != "") {
        var ga = new GlideAjax('ChangeConflictWorkerAJAXProcessor');
        ga.addParam('sysparm_name', 'getWorkerRecord');
        ga.addParam('sysparm_worker_id', sysId);
        ga.getXMLAnswer(function(answer) {
            receiveMessage(answer.evalJSON());
        });
    }
}

function cancelConflictDetection(sysId) {
    if (sysId != "") {
        var ga = new GlideAjax('ChangeConflictWorkerAJAXProcessor');
        ga.addParam('sysparm_name', 'cancel');
        ga.addParam('sysparm_worker_id', sysId);
        ga.getXML();
    }
}

function everyTenPercent(percent, handler) {
    this.data = this.data || [false, false, false, false, false, false, false, false, false, false, false];
    var slot = ((Math.round(percent / 10) * 10) / 10);
    if (this.data[slot])
        return;
    this.data[slot] = true;
    handler();
}

function refreshConflicts() {
    var conflictLists = GlideList2.getListsForTable("conflict");
    var impactedCIs = GlideList2.get(g_form.getTableName() + '.task_cmdb_ci_service.task');
    conflictLists.push(impactedCIs);
    for (var i = 0; i < conflictLists.length; ++i)
        if (conflictLists[i]) //Check that the list is valid before trying to refresh
            conflictLists[i].refresh();
}

function receiveMessage(workerObj) {
    /**
     * 1 - Waiting
     * 2 - In-Progress
     * 3 - Complete
     * 4 - Error
     * 5 - Canceled
     */
    if (workerObj.state == "1" || workerObj.state == "2") {
        everyTenPercent(workerObj.percent_complete, refreshConflicts);
        var percentComplete = workerObj.percent_complete;
        if (null === percentComplete || undefined === percentComplete)
            percentComplete = 0;
        $("conflict_status").update(new GwtMessage().getMessage("{0}% completed", percentComplete));
        setTimeout(function() {
            this.runBackgroundPoll($("conflict_worker_id").value);
        }, 2000);
    } else {
        $("conflict_worker_id").value = "";
        showProgressButton(false);

        switch (workerObj.state) {
            case "3":
                refreshConflicts();
                updateConflictLastRun(workerObj.timestamp);
                updateConflictStatus(workerObj.state);
                $("conflict_status").update(new GwtMessage().getMessage("Completed"));
                break;
            case "4":
            case "5":
                deleteConflicts(workerObj);
                break;
        }

        setTimeout(function() {
            $("conflict_status").update("");
        }, 5000);
    }
}

function deleteConflicts(workerObj) {
    if (workerObj.state == "4")
        $("conflict_status").update(new GwtMessage().getMessage("Failed"));

    if (workerObj.state == "5")
        $("conflict_status").update(new GwtMessage().getMessage("Canceled"));

    var ga = new GlideAjax('ChangeConflictWorkerAJAXProcessor');
    ga.addParam('sysparm_name', 'deleteConflicts');
    ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
    ga.addParam('sysparm_worker_id', workerObj.sys_id);
    ga.getXMLAnswer(function(answer) {
        refreshConflicts();
        if (answer + "" !== "NEWER_TRACKER_FOUND") {
            updateConflictLastRun("");
            g_form.setValue('conflict_status', 'Not Run');
        }
    });
}

function updateConflictLastRun(timestamp) {
    // update the field which gets displayed when time displayed in 'calendar' or 'both' modes
    var conflictLastRunCalendar = $('sys_readonly.' + g_form.getTableName() + '.conflict_last_run');
    if (conflictLastRunCalendar)
        conflictLastRunCalendar.setValue(timestamp);

    // update the field which gets displayed when time displayed in 'timeAgo' mode
    var conflictLastRunTimeAgo = $(g_form.getTableName() + '.conflict_last_run.timeago');
    if (conflictLastRunTimeAgo)
        conflictLastRunTimeAgo.update(new GwtMessage().getMessage("Just now"));
}

function updateConflictStatus(workerState) {
    var conflictLastRun = $('sys_readonly.' + g_form.getTableName() + '.conflict_last_run');
    var ga = new GlideAjax("ChangeConflictWorkerAJAXProcessor");
    ga.addParam('sysparm_name', 'getConflictData');
    ga.addParam('sysparm_change_id', g_form.getUniqueValue());
    ga.getXML(function(message) {
        var conflictInfo = message.responseXML.documentElement.getAttribute("answer").evalJSON();

        // Do not update the form if the worker is not finished
        if (workerState === "1" || workerState === "2")
            return;

        if (conflictInfo.conflictCount === 0) {
            if (conflictLastRun == '')
                g_form.setValue('conflict_status', 'Not Run');
            else {
                g_form.setValue('conflict_status', 'No Conflict');
                updateConflictLastRun(conflictInfo.timestamp);
            }
        } else {
            g_form.setValue('conflict_status', 'Conflict');
            updateConflictLastRun(conflictInfo.timestamp);
        }
    });
}
