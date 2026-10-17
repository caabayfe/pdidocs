function script({ api, event, helpers, imports }) {
    //handleManagePresetResponse script in Map Search Filter UI Controller; fired from broker response to mangedSharedPresets
    const { ALERT, addAlerts, cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
    const { setManagePresetState } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
 
    var functions = {

        handleManageSharedPresetResponse: function () {
            var { operation, preset } = event.payload.data.output;
            var { info, error } = event.payload.data.output.alerts;
            debugger;
            if (error?.length) {
                this._displayErrorMessage(error);
            }
            else {
                if (operation === 'upsert') {
                    this._displaySuccessMessage(preset.name);
                    this._appendToSharedPresetList(preset);
                }
                else if (operation === 'delete') {
                    // Move handling from "managePreset" client script in order to report any errors
                }
            }
            this._logInfoMessage(info);
        },

        _appendToSharedPresetList: function (preset) {
            var { presetId, name, unchecked } = preset;
            var filterControls = cloneDeep(api.state.filterControls);
            var sharedPresetList = filterControls.presets.list.find(o => o.id === 'shared');
            if (!sharedPresetList) {
                sharedPresetList = {
                    id: 'shared',
                    label: api.state.translations.SHARED_PRESETS,
                    children: []
                }
                filterControls.presets.list.push(sharedPresetList);
            }

            var existingPreset = sharedPresetList.children.find(p => p.id === presetId);
            if (existingPreset) {
                existingPreset.label = name;
                existingPreset.unchecked = JSON.parse(unchecked);
            } else {
                sharedPresetList.children.push({
                    id: presetId,
                    label: name,
                    unchecked: JSON.parse(unchecked),
                    shared: true
                });
            }
            api.setState('filterControls', filterControls);
            api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
                params: { "presetId": presetId }
            });
            api.setState('labelOfCurrentPreset', name);
            setManagePresetState({
                api: api,
                presetId: presetId,
                isDirty: false,
                isSharedSelected: true
            });
        },

        _displaySuccessMessage: function (presetName) {
            helpers.translate('Filter preset "{0}" has been saved.', presetName).then((translatedText) => {
                addAlerts([{
                    id: new Date().getTime(),
                    status: ALERT.STATUS.POSITIVE,
                    icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
                    header: '',
                    content: translatedText,
                    action: { type: ALERT.TYPE.DISMISS },
                    autoDismiss: true
                }], api, helpers);
            });
        },

        _logInfoMessage: function (infoMessages) {
            infoMessages?.forEach(infoMessage => {
                console.log("Save shared preset operation notification: " + infoMessage);
            });
        },

        _displayErrorMessage: function (errors) {
            errors.forEach(errorMessage => {
                addAlerts([{
                    id: new Date().getTime(),
                    status: ALERT.STATUS.WARNING,
                    icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
                    header: api.state.translations.EDIT_SAVE_ERROR,
                    content: errorMessage.message,
                    action: { type: ALERT.TYPE.DISMISS }
                }], api, helpers);
            });
        }

    };

    functions.handleManageSharedPresetResponse();

}
