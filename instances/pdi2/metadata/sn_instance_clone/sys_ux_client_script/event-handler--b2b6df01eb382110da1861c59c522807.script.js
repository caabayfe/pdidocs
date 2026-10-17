function script({
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
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    var blockcontext = eventPayload.blockcontext;
    switch (eventName) {
        case 'NAME_ENTERED':
            if (eventPayload.fieldValue != "") {
                blockcontext.name = eventPayload.fieldValue;
                blockcontext.disableAddButton = false;
            } else {
                blockcontext.disableAddButton = true;
            }
            blockcontext.showErrorMessage = false;
            break;
        case 'AMOUNT_OF_DATA_COPIED_CARD':
            blockcontext.amount_of_data_copied_from_large_tables = eventPayload.value;
            if(blockcontext.amount_of_data_copied_from_large_tables == "last_90_days") {
                    blockcontext.highlightText = api.state.translations.dataCopyInfoText;
                    blockcontext.highlightTextShow = true;
                } else
                    blockcontext.highlightTextShow = false;
            break;
        case 'SELECT_YOUR_BACKUP_OPTIONS':
            blockcontext.backupTypeFromCloneProfileDefaultSelectedItem = eventPayload.value;
            break;
        case 'APPLY_ON_DEMAND_BACKUP':
            blockcontext.on_demand_backup = eventPayload.value;
            break;
        case 'EXCLUDE_TABLES_CARD':
            blockcontext.exclude_all_from_exclusion_list = eventPayload.value;
            break;
        case 'EXCLUDE_AUDIT_CARD':
            blockcontext.exclude_large_data = eventPayload.value;
            break;
        case 'EXCLUDE_ATTACHMENTS_CARD':
            blockcontext.filter_attachment_data = eventPayload.value;
            break;
        case 'PRESERVE_THEME_CARD':
            blockcontext.preserve_theme = eventPayload.value;
            break;
        case 'NUMBER_OF_DAYS_CARD':
            blockcontext.preserve_in_progress_update_sets = eventPayload.value;
            break;
        case 'RESET_BUTTON_CLICKED':
            blockcontext.amount_of_data_copied_from_large_tables = "full";
            blockcontext.default_profile = false;
            blockcontext.exclude_all_from_exclusion_list = true;
            blockcontext.exclude_large_data = true;
            blockcontext.filter_attachment_data = true;
            blockcontext.name = " ";
            blockcontext.on_demand_backup = false;
            blockcontext.preserve_in_progress_update_sets = "none";
            blockcontext.preserve_theme = true;
            blockcontext.target_instance = "";
            blockcontext.showErrorMessage = false;
            blockcontext.backupTypeFromCloneProfileDefaultSelectedItem = 'use_recent_backup';
            break;
        case 'ADD_BUTTON_CLICKED':
            var recordValues = {
                amount_of_data_copied_from_large_tables: blockcontext.amount_of_data_copied_from_large_tables,
                default_profile: blockcontext.default_profile,
                exclude_all_from_exclusion_list: blockcontext.exclude_all_from_exclusion_list,
                exclude_large_data: blockcontext.exclude_large_data,
                filter_attachment_data: blockcontext.filter_attachment_data,
                name: blockcontext.name,
                on_demand_backup: blockcontext.backupTypeFromCloneProfileDefaultSelectedItem == 'use_recent_backup' ? false:true,
                preserve_in_progress_update_sets: blockcontext.preserve_in_progress_update_sets,
                preserve_theme: blockcontext.preserve_theme,
                target_instance: blockcontext.target_instance,
                backup_type: blockcontext.backupTypeFromCloneProfileDefaultSelectedItem
            };
            callUtilAPI('INSERT', recordValues);
            break;
        case 'DUPLICATE_BUTTON_CLICKED':
            aceUtils.openModal("28a5-4c63-ba8998-5e87-8a8a40a9");
            break;
        case 'MODAL_CANCEL_BUTTON_CLICKED':
            aceUtils.dismissModal("28a5-4c63-ba8998-5e87-8a8a40a9");
            break;
        case 'DUPLICATE_CLONE_PROFILE':
            var recordValues = {
                amount_of_data_copied_from_large_tables: blockcontext.amount_of_data_copied_from_large_tables,
                default_profile: blockcontext.default_profile,
                exclude_all_from_exclusion_list: blockcontext.exclude_all_from_exclusion_list,
                exclude_large_data: blockcontext.exclude_large_data,
                filter_attachment_data: blockcontext.filter_attachment_data,
                name: blockcontext.name+"_COPY",
                on_demand_backup: blockcontext.on_demand_backup,
                preserve_in_progress_update_sets: blockcontext.preserve_in_progress_update_sets,
                preserve_theme: blockcontext.preserve_theme,
                target_instance: blockcontext.target_instance,
                backup_type: blockcontext.backupTypeFromCloneProfileDefaultSelectedItem
            };
            callUtilAPI('DUPLICATE_CLONE_PROFILE', recordValues,true);
            break;
        case 'CANCEL_BUTTON_CLICKED':
            redirect(getNavPayloadToProfileList({
                aceNav: 'clone_profile'
            }));
            break;
        case 'UPDATE_BUTTON_CLICKED':
            var recordValues = {
                amount_of_data_copied_from_large_tables: blockcontext.amount_of_data_copied_from_large_tables,
                default_profile: blockcontext.default_profile,
                exclude_all_from_exclusion_list: blockcontext.exclude_all_from_exclusion_list,
                exclude_large_data: blockcontext.exclude_large_data,
                filter_attachment_data: blockcontext.filter_attachment_data,
                name: blockcontext.name,
                on_demand_backup: blockcontext.backupTypeFromCloneProfileDefaultSelectedItem == 'use_recent_backup' ? false:true,
                preserve_in_progress_update_sets: blockcontext.preserve_in_progress_update_sets,
                preserve_theme: blockcontext.preserve_theme,
                target_instance: blockcontext.target_instance,
                backup_type: blockcontext.backupTypeFromCloneProfileDefaultSelectedItem
            };
            debugger;
            callUtilAPI('UPDATE', recordValues);
            break;
        case 'DELETE_BUTTON_CLICKED':
            callUtilAPI('DELETE', null);
            break;
        case 'EXCLUSIONS_COUNT_CLICKED':
            navigateToDefinitions('clone_profile_exclusions');
            break;
        case 'PRESERVERS_COUNT_CLICKED':
            navigateToDefinitions('clone_profile_preservers');
            break;
        case 'CLEAUP_SCRIPTS_COUNT_CLICKED':
            navigateToDefinitions('clone_profile_cleanup_scripts');
            break;
        case 'DELETE_MODAL_CANCEL_CLICKED':
            aceUtils.dismissModal('8f33-39cd-89989b-b586-988bfb8a');
            break;
        default:
            break;
    }

    aceUtils.setContext(blockcontext);

    function callUtilAPI(operation, recordValues,duplicate) {
        helpers.snHttp('/api/sn_instance_clone/clone/util', {
            method: 'POST',
            body: {
                operation: operation,
                table: 'clone_profile',
                sysId: api.context.props.sysId,
                valuePairs: recordValues
            }
        }).then(resp => {
            callbackHandler(operation, resp.response,duplicate);
        }).catch(resp => {
            if (!!resp.error) {
                try {
                    console.log(operation + " failed: " + JSON.stringify(resp.error));
                } catch (e) {
                    console.log(operation + " failed, could not provide details");
                }
            }
        });
    }

    function callbackHandler(operation, response,duplicate) {
        switch (operation) {
            case 'INSERT':
                if (response.result.isError) {
                    blockcontext.showErrorMessage = true;
                    blockcontext.errorMessage = response.result.message;
                } else {
                    if(duplicate) {
                        redirect({
                            route:'clone-profile', 
                            fields:{
                                sysId: response.result.sysId
                            }, 
                            params:{
                                aceNav: 'clone_profile'
                                }
                        });
                    }
                    else {
                        redirect(getNavPayloadToProfileList({
                            aceNav: 'clone_profile',
                            profileName: response.result.sysId,
                            operation: 'create'
                        }));
                    }
                }
                break;
            case 'DUPLICATE_CLONE_PROFILE':
                if (response.result.isError) {
                    blockcontext.showErrorMessage = true;
                    blockcontext.errorMessage = response.result.message;
                } else {
                    aceUtils.dismissModal("28a5-4c63-ba8998-5e87-8a8a40a9");
                    redirect({
                        route: 'clone-profile',
                        fields: { sysId: response.result.sysId },
                        params: { aceNav: 'clone_profile' }
                    });
                }
                break;
            case 'DELETE':
                if (response.result.isError) {
                    blockcontext.showErrorMessage = true;
                    blockcontext.errorMessage = response.result.message;
                    aceUtils.setContext(blockcontext);
                    aceUtils.dismissModal('a8af-e0a4-ba9bab-cea3-ab88678b');
                } else {
                    redirect(getNavPayloadToProfileList({
                        aceNav: 'clone_profile',
                        profileName: response.result.sysId,
                        operation: 'delete'
                    }));
                }
                break;
            case 'UPDATE':
                if (response.result.isError) {
                    blockcontext.showErrorMessage = true;
                    blockcontext.errorMessage = response.result.message;
                } else {
                    redirect(getNavPayloadToProfileList({
                        aceNav: 'clone_profile',
                        profileName: response.result.sysId,
                        operation: 'create'
                    }));
                }
                break;
        }
        aceUtils.setContext(blockcontext);
    }

    function getNavPayloadToProfileList(params) {
        var navPayload = {
            route: 'list',
            fields: {
                'table': 'clone_profile'
            },
            params: params
        }
        return navPayload;
    }

    function redirect(navPayload) {
        api.emit("NAV_ITEM_SELECTED", {
            ...navPayload,
            reload: true
        });
    }

    function navigateToDefinitions(table) {
        var navPayload = {
            route: 'list',
            fields: {
                'table': table
            },
            params: {
                fixedFilter: 'profile.name' + 'IN' + 'System Profile' + ',' + blockcontext.name,
                aceNav: 'clone_profile',
                view: 'clone_ui'
            }
        }
        api.emit("NAV_ITEM_SELECTED", {
            ...navPayload,
            reload: true
        });
    }
}
