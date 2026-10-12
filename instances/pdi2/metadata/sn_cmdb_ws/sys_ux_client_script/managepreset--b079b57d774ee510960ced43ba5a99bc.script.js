function script({ api, event, helpers, imports }) {
    //managePreset script in Map Search Filter UI Controller; 
    // For legacy support, fired after the user clicks the (star) preset button icon, the "Delete" button, or the "Save" button
    // For shared preset support, fired after the user clicks an option in the preset action kebab
    const { FILTER_PANEL_CONTENT, PRESET_ACTIONS, savePreset, deletePreset, getPresetLabelOfCurrent } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
    const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

    var presetMgmt = cloneDeep(api.state.presetMgmt);
    var filterControls = api.state.filterControls;

    var managePreset = {
        init: function () {
            // *** Save and Delete will support Legacy ("star") and Shared preset actions ***
            if (event.payload.managePreset === PRESET_ACTIONS.SAVE) {
                // New shared preset forms take priority over legacy star functionality
                var isUpdate = presetMgmt.visibleContent === FILTER_PANEL_CONTENT.CREATE_USER_OR_SHARED ? false : api.state.updatePresetOptionSelected === PRESET_ACTIONS.UPDATE;
                savePreset({ isUpdate: isUpdate, isShared: presetMgmt.isShared, api: api, helpers: helpers });
                this._setPresetManagement(FILTER_PANEL_CONTENT.MAIN);
            }
            else if (event.payload.managePreset === PRESET_ACTIONS.DELETE) {
                deletePreset({ isShared: presetMgmt.isShared, api: api, helpers: helpers });
                this._setPresetManagement(FILTER_PANEL_CONTENT.MAIN);
            }
            // *** Prompt is used exclusively by the "star" feature for User Presets ***
            else if (event.payload.managePreset === PRESET_ACTIONS.PROMPT) {
                if (filterControls.matchesPreset) {
                    this._setPresetManagement(FILTER_PANEL_CONTENT.DELETE);
                } else { //filter changed
                    api.setState('updatePresetOptionSelected', (!api.context.props.presetId ? PRESET_ACTIONS.SAVE : PRESET_ACTIONS.UPDATE));
                    api.setState('savePresetButtonDisabled', true);
                    api.setState('savePresetText', '');

                    this._setPresetManagement(FILTER_PANEL_CONTENT.SAVE);
                }
            }
            // *** Current preset actions, supporting the User and Shared preset action menu ***
            else if (event.payload.managePreset === PRESET_ACTIONS.MANAGE) {
                var selectedAction = event.payload.managePresetValue.id;
                switch (selectedAction) {
                    case 'createPreset':
                        this._setPresetManagement(FILTER_PANEL_CONTENT.CREATE_USER_OR_SHARED, false);
                        break;
                    case 'updatePreset':
                        this._setPresetManagement(FILTER_PANEL_CONTENT.UPDATE_USER_OR_SHARED, false, true);
                        break;
                    case 'deletePreset':
                        this._setPresetManagement(FILTER_PANEL_CONTENT.DELETE_USER_OR_SHARED, false);
                        break;
                    case 'createSharedPreset':
                        this._setPresetManagement(FILTER_PANEL_CONTENT.CREATE_USER_OR_SHARED, true);
                        break;
                    case 'updateSharedPreset':
                        this._setPresetManagement(FILTER_PANEL_CONTENT.UPDATE_USER_OR_SHARED, true, true);
                        break;
                    case 'deleteSharedPreset':
                        this._setPresetManagement(FILTER_PANEL_CONTENT.DELETE_USER_OR_SHARED, true);
                        break;
                    default:
                        this._setPresetManagement(FILTER_PANEL_CONTENT.MAIN);
                        break;
                }
            }
            // *** Default / No Action ***
            else { //PRESET_ACTIONS.MAIN
                this._setPresetManagement(FILTER_PANEL_CONTENT.MAIN);
            }

            api.setState('presetMgmt', presetMgmt);
        },

        _setPresetManagement: function (visibleContent, isShared, populateNameInput) {
            presetMgmt.visibleContent = visibleContent;
            presetMgmt.isShared = !!isShared;
            if (populateNameInput) {
                api.setState('savePresetText', getPresetLabelOfCurrent(api));
                api.setState('savePresetButtonDisabled', false);
            }
            else {
                api.setState('savePresetText', '');
                api.setState('savePresetButtonDisabled', true);
            }
        }
    }

    managePreset.init();
}
