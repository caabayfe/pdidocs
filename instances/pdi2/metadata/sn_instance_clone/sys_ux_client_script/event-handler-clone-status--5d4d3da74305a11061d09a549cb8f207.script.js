function handler({
    api,
    event,
    helpers,
    imports
}) {

    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const {
        eventName,
        eventPayload
    } = event.payload;
    var blockcontext = { ...eventPayload.blockcontext
    };
    blockcontext.occurrences_lock_settings_stack = null;
    // state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "CONFIRM_CANCEL_ROLLBACK") {
        aceUtils.dismissModal("01af-8b4d-aba998-5660-899896a9");
        blockcontext.show_loader_modal = true;
        aceUtils.setContext(blockcontext);
        var operation = "CANCEL_ROLLBACK_CLONE_REQUESTED";
        loaderComponent(true);
        helpers
            .snHttp("/api/sn_instance_clone/clone/util", {
                method: "POST",
                body: {
                    operation: operation,
                    cloneId: blockcontext.current_sys_id,
                    reason: blockcontext.cancel_rollback_reason,
                    options: blockcontext.options
                },
            })
            .then((response) => {
                var result = response.response.result;
                aceUtils.setContext(blockcontext);
                loaderComponent(false);
                refreshData();
                if (!result.isError) {}

            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });
    }
    if (eventName == "STEPPER_ITEM_SELECED") {
        if (eventPayload.item.id == "POST_CLONE_ACTIVITY") {
            blockcontext.show_substep_container = true;
            blockcontext.show_step_progress = false;
        } else {
            blockcontext.show_substep_container = false;
            blockcontext.show_step_progress = true;
        }
        blockcontext.substep_heading = eventPayload.item.label;
        var clickedItem = eventPayload.item.label;
        var itemsList = [];
        blockcontext.steps.forEach(element => {
            itemsList.push(element.label);
        });
        var stepperCompletedCount = itemsList.indexOf(blockcontext.stage);
        var clickedItemIndex = itemsList.indexOf(clickedItem);
        if (clickedItemIndex < stepperCompletedCount) {
            blockcontext.substage_percent_value = 100;
        } else if (clickedItemIndex > stepperCompletedCount) {
            blockcontext.substage_percent_value = 0;
        } else {
            blockcontext.substage_percent_value = blockcontext.stage_percent_complete;
        }
        blockcontext.substep_progress_bar_heading = blockcontext.progress + blockcontext.substage_percent_value + "% ";
    }
    if (eventName == "REASON_TEXT_VALUE_SET") {
        blockcontext.cancel_rollback_reason = eventPayload.fieldValue;
        if (blockcontext.cancel_rollback_show_text && blockcontext.cancel_rollback_reason.length > 0) {
            blockcontext.disable_cancel_button = false;
        } else {
            blockcontext.disable_cancel_button = true;

        }
        aceUtils.setContext(blockcontext);
    }
    if (eventName == "TOGGLE_SHOW_MORE") {
        blockcontext.show_more_data = blockcontext.show_more_data != true;
        if (blockcontext.show_more_less_text == "Show more") {
            blockcontext.show_more_less_text = "Show less";
        } else {
            blockcontext.show_more_less_text = "Show more";
        }

        if (!blockcontext.occurrences_lock_settings_stack) {
            blockcontext.occurrences_lock_settings_stack = [{
                    "label": "Number of occurrences",
                    "value": {
                        "type": "string",
                        "value": blockcontext.occurrences
                    }
                },
                {
                    "label": "Lock profile settings for this clone request",
                    "value": {
                        "type": "string",
                        "value": blockcontext.lock_profile_settings
                    }
                },
            ]
            if(blockcontext.clone_request_id_for_backup) {
                blockcontext.occurrences_lock_settings_stack.push({
                    "label": "Use the same backup as another clone request",
                    "value": {
                        "type": "string",
                        "value": blockcontext.clone_request_id_for_backup
                    }
                });
            }
            else {
                blockcontext.occurrences_lock_settings_stack.push({
                    "label": "",
                    "value": {
                        "type": "string",
                        "value": ""
                    }
                });
            }
        }
        // api.emit("ACE_PAGE_READY", {
        //     blockcontext,
        // });
        aceUtils.setContext(blockcontext);
    }
    if (eventName == "TOGGLE_SHOW_LOGS") {
        blockcontext.show_more_logs = !blockcontext.show_more_logs;
        if (blockcontext.show_more_logs_text == "Show logs") {
            blockcontext.show_more_logs_text = "Hide logs";
        } else {
            blockcontext.show_more_logs_text = "Show logs";
            blockcontext.searchInputIcon = "magnifying-glass-outline";
            blockcontext.searchInputText = "";
            blockcontext.searchInputIconTooltip = "";
            blockcontext.searchInputIconDisable = true;
        }
        if (blockcontext.show_more_logs) {
            getCloneLogs();
            api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
                event: "Click Show Logs from Clone Status Page",
                value: {}
            });
        }
    }
    if (eventName == "CLEAR_CLONE_LOG_SEARCH") {
        blockcontext.searchInputIcon = "magnifying-glass-outline";
        blockcontext.searchInputText = "";
        blockcontext.searchInputIconTooltip = "";
        blockcontext.searchInputIconDisable = true;
        blockcontext.showInputHelper = false;
        blockcontext.pageNumber = 0;
        getCloneLogs();
    }
    if (eventName == "SEARCH_CLONE_LOGS") {
        blockcontext.searchInputIcon = "circle-close-outline";
        blockcontext.searchInputIconDisable = false;
        blockcontext.searchInputIconTooltip = "Clear Search"
        blockcontext.searchInputText = eventPayload.fieldValue;
        blockcontext.pageNumber = 0;
        getCloneLogs();
    }
    if (eventName == "SHOW_INPUT_HELPER") {
        blockcontext.showInputHelper = true;
    }
    if(eventName == "OPEN_LOGS_IN_PLATFORM") {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: '/now/nav/ui/classic/params/target/sn_instance_clone_log_list.do'+encodeURIComponent('?sysparm_query=clone_request='+blockcontext.current_sys_id)
            }
        });
    }
    if (eventName == "CLONE_LOG_PAGE_CHANGED") {
        blockcontext.pageNumber = eventPayload.value;
        getCloneLogs();
    }
    if (eventName == "CLOSE_CANCEL_ROLLBACK_MODAL") {
        aceUtils.dismissModal("01af-8b4d-aba998-5660-899896a9");
    }
    if (eventName == "CANCEL_ROLLBACK_REASON_SELECTED") {
        if (
            eventPayload.item.id == "CANCEL_OPTION_OTHER" ||
            eventPayload.item.id == "ROLLBACK_OPTION_OTHER"
        ) {
            blockcontext.disable_cancel_button = true;

            blockcontext.cancel_rollback_show_text = true;
        } else {
            blockcontext.cancel_rollback_show_text = false;
            blockcontext.cancel_rollback_reason = eventPayload.item.id;
            blockcontext.disable_cancel_button = false;
        }
        aceUtils.setContext(blockcontext);
    }
    if (eventName == "CANCEL_CLONE_CLICKED") {
        aceUtils.openModal("01af-8b4d-aba998-5660-899896a9");
        blockcontext.cancel_rollback_modal_heading =
            "Are you sure you want to cancel clone?";
        blockcontext.cancel_rollback_modal_choose_reason =
            "Specify Reason";
        blockcontext.cancel_rollback_enter_reason = "Other reason";
        blockcontext.cancel_rollback_button_name = "Cancel Clone";
        blockcontext.clone_rollback_warning =
            "This will cancel the clone " + blockcontext.request_id;
        blockcontext.options = "cancelOptions";
        aceUtils.setContext(blockcontext);
        var operation = "GET_CLONE_CANCEL_ROLLBACK_REASONS";
        helpers
            .snHttp("/api/sn_instance_clone/clone/util", {
                method: "POST",
                body: {
                    operation: operation,
                    options: blockcontext.options,
                },
            })
            .then((response) => {
                var reasons = response.response.result;
                var options = [];
                Object.keys(reasons).forEach((key) => {
                    options.push({
                        id: key,
                        label: reasons[key]
                    });
                });
                blockcontext.cancel_rollback_options = options;
                aceUtils.setContext(blockcontext);
            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });
    }
    if (eventName == "ROLL_BACK_BUTTON_CLICKED") {
        aceUtils.openModal("01af-8b4d-aba998-5660-899896a9");
        blockcontext.cancel_rollback_modal_heading =
            "Are you sure you want to rollback clone?";
        blockcontext.cancel_rollback_modal_choose_reason =
            "Specify Reason";
        blockcontext.cancel_rollback_enter_reason = "Other reason";
        blockcontext.cancel_rollback_button_name = "Rollback Clone";
        blockcontext.clone_rollback_warning =
            "This will rollback the clone " + blockcontext.request_id;
        blockcontext.options = "rollbackOptions";
        aceUtils.setContext(blockcontext);
        var operation = "GET_CLONE_CANCEL_ROLLBACK_REASONS";
        helpers
            .snHttp("/api/sn_instance_clone/clone/util", {
                method: "POST",
                body: {
                    operation: operation,
                    options: blockcontext.options,
                },
            })
            .then((response) => {
                var reasons = response.response.result;
                var options = [];
                Object.keys(reasons).forEach((key) => {
                    options.push({
                        id: key,
                        label: reasons[key]
                    });
                });
                blockcontext.cancel_rollback_options = options;
                aceUtils.setContext(blockcontext);
            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });
    }
    if (eventName == "SYNC_CLONE_STATUS_DATA") {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED",{
            event: "TRACK_CLONE_SYNC",
            data: ""
        });
        refreshData();
    }

    function getCloneLogs() {
        helpers
            .snHttp("/api/sn_instance_clone/clone/util", {
                method: "POST",
                body: {
                    operation: "GET_CLONE_LOGS",
                    sysId: blockcontext.current_sys_id,
                    searchTerm: blockcontext.searchInputText,
                    pageNumber: blockcontext.pageNumber
                },
            })
            .then((response) => {
                var columnsAndRows = response.response.result;
                blockcontext.logColumns = columnsAndRows.columns;
                blockcontext.logRows = columnsAndRows.rows;
                blockcontext.totalRecords = columnsAndRows.totalRecords;
                blockcontext.pageNumber = 0;
                aceUtils.setContext(blockcontext);
            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });
    }

    function loaderComponent(show) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: show,
            label: loadingText,
            action: null,
            nonBlocking: false
        });
    }

    function refreshData() {
        var operation = "SYNC_CLONE_STATUS_DATA";
        loaderComponent(true);
        helpers
            .snHttp("/api/sn_instance_clone/clone/util", {
                method: "POST",
                body: {
                    operation: operation,
                    sys_id: blockcontext.current_sys_id,
                },
            })
            .then((response) => {
                var data = JSON.stringify(response);
                var result = response.response.result;
                blockcontext = result;
                // api.emit("ACE_PAGE_READY", {
                //     blockcontext,
                // });
                aceUtils.setContext(blockcontext);
                loaderComponent(false);
            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });

    }


    if (eventName == "DEFINITIONS_TEXT_LINK_CLICKED") {
        // aceUtils.openModal("a15b-c748-b9a889-ca72-b99915a9");
        var table = eventPayload.item.table;
        blockcontext.model_table_name = table;
        var row_name = eventPayload.item.row_name;
        blockcontext.row_name = row_name;
        blockcontext.table_lable = eventPayload.item.table_lable;
        var row_display = row_name.charAt(0).toUpperCase() + row_name.slice(1);
        const columnDefinitions = {
            columns: [{
                key: "row_name",
                type: "string",
                label: row_display.replace("_", " "),
            }, ],
        };
        blockcontext.columnDefinitions = columnDefinitions;
        var operation = "GET_DEFINITIONS_TABLE_DATA";
        // aceUtils.openModal("a15b-c748-b9a889-ca72-b99915a9");
        helpers
            .snHttp("/api/sn_instance_clone/clone/util", {
                method: "POST",
                body: {
                    operation: operation,
                    row_name: row_name,
                    table_name: table,
                    profile_sys_id: blockcontext.profile_sys_id,
                },
            })
            .then((response) => {
                var result = response.response.result;
                callbackHandler(result);
                aceUtils.openModal(
                    "a15b-c748-b9a889-ca72-b99915a9",
                    aceUtils.getContentBlocks()
                );
            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });
    }

    function callbackHandler(result) {
        let rows = [];
        for (let i = 0; i < result.length; i++) {
            var key = result[i][0];
            var row_value = result[i][1];
            rows.push({
                key: key,
                cells: {
                    row_name: {
                        value: row_value,
                    },
                },
            });
        }
        const rowDefinitions = {
            rows: [],
        };
        rowDefinitions.rows = rows;
        blockcontext.rowDefinitions = rowDefinitions;
        (blockcontext.table_name = blockcontext.model_table_name),
        aceUtils.setContext(blockcontext);
    }

    if (eventName == "CLEANUP_LIST_REFRESH") {
        refreshData();
    }

    if (eventName == 'NAVIGATE_TO_CLEANUP_SCRIPT') {
        var refId = (eventPayload && (eventPayload.refId || eventPayload.sys_id)) || '';
        if (refId) api.emit('NAV_ITEM_SELECTED', { external: { url: '/sn_instance_clone_cleanup_script_execution_vtable.do?sys_id=' + refId } });
    }

    if (eventName == "TOGGLE_CLEANUP_PANEL") {
        blockcontext.show_cleanup_panel = !blockcontext.show_cleanup_panel;
        blockcontext.cleanup_toggle_label = blockcontext.show_cleanup_panel ? "Hide cleanup scripts" : "Show cleanup scripts";
    }

     aceUtils.setContext(blockcontext);


}
