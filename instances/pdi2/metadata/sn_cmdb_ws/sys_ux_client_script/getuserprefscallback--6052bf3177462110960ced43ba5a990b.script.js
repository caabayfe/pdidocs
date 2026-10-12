function script({ api, event, helpers, imports }) {
    //getUserPrefsCallback script in Map Search Filter UI Controller; fired on page load after all brokers return
    const { cloneDeep, buildUserPrefWithAppId } = imports['sn_cmdb_ws.unifiedMapUtils']();
    const { PRESETS_USER_PREF_KEY, EVENTS, saveUserPref,
        SHOW_FILTERED_ITEMS_USER_PREF_KEY, SHOW_FILTERED_ITEMS_USER_PREF_INITIAL } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
    var filterControls = cloneDeep(api.state.filterControls);
    var userPreferenceList;
    
    var processFilterControls = {

        init: function () {
            userPreferenceList = buildUserPrefWithAppId([SHOW_FILTERED_ITEMS_USER_PREF_KEY, PRESETS_USER_PREF_KEY], api.context.app.appId);
            this.setPresetState();
            this.setShowFilteredItemsState();
            api.setState('filterControls', filterControls);
            this.dispatchUserPrefsInitialized();
        },

        setPresetState: function () {
            const presetsUserKey = userPreferenceList[PRESETS_USER_PREF_KEY];
            this._setFilterControlState(presetsUserKey, { list: null }, ['presets']);
        },

        setShowFilteredItemsState: function () {
            const showFilteredItemsUserPrefKey = userPreferenceList[SHOW_FILTERED_ITEMS_USER_PREF_KEY];
            this._setFilterControlState(showFilteredItemsUserPrefKey, SHOW_FILTERED_ITEMS_USER_PREF_INITIAL, ['showFilteredItems', 'value']);
        },

        _setFilterControlState: function (userPrefKeyName, userPrefDefaultVal, filterControlsPropPath) {
            if (api.data.getUserPrefs?.result.hasOwnProperty(userPrefKeyName) 
            && typeof api.data.getUserPrefs?.result[userPrefKeyName] !== undefined 
            && api.data.getUserPrefs?.result[userPrefKeyName] !== null) {
                var parsed;
                try {
                    parsed = JSON.parse(api.data.getUserPrefs?.result?.[userPrefKeyName]);
                } catch (e) {
                    parsed = userPrefDefaultVal;
                    saveUserPref(userPrefKeyName, userPrefDefaultVal, api);
                }
                this._drillDownToPathAndSetState(parsed, filterControlsPropPath);
            } else {
                this._drillDownToPathAndSetState(userPrefDefaultVal, filterControlsPropPath);
            }
        },

        _drillDownToPathAndSetState: function (val, filterControlsPropPath) {
            filterControlsPropPath.reduce((acc, propPath, i) => { 
                if (i === filterControlsPropPath.length - 1) {
                    acc[propPath] = val;
                } else {
                    return acc[propPath];
                }
            }, filterControls);
        },

        dispatchUserPrefsInitialized: function () {
            //synchronizing this event with a series of others like it for use on page load to make sure the it doesn't start to process map data until prefs are set
            helpers.timing.setTimeout(() => {
                api.emit(EVENTS.EVENT_SYNC, {
                    originatingEvent: EVENTS.USER_PREFS_INITIALIZED,
                    syncEvent: EVENTS.STATE_INITIALIZED,
                    clearOnSync: true
                });
            }, 0);
        }
    };

    processFilterControls.init();
}
