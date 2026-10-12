function script({ api, event, helpers, imports }) {
//macroponentReady script in Map Search Filter UI Controller; fired on page load 
const { cloneDeep, buildUserPrefWithAppId } = imports['sn_cmdb_ws.unifiedMapUtils']();
const { SYS_PROP, PRESETS_USER_PREF_KEY, SHOW_FILTERED_ITEMS_USER_PREF_KEY, EVENTS } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
var functions = {

    macroponentReady: function () {
        this.setTranslationsIntoState();
        this.setMiscEnumsIntoState();
        this.setDefaultMapData(); //TODO: temp workaround until nodemap component defect (DEF0547934) is fixed; remove after
        this.setupEventSync();
    },

    setTranslationsIntoState: function () {
        //this will set into client state so they only have to be translated once and 
        // also so they can be shared and are consistent across the module
        //Additionally, using client state allows for them to be accessed from anywhere 
        // since presets, formulae, or inline scripts cannot access cilent script includes
        var promises = [
            helpers.translate('All relationships'),
            helpers.translate('An error occurred during save'),
            helpers.translate('Application Service'),
            helpers.translate('Application'),
            helpers.translate('Business'),
            helpers.translate('Cancelling previous search and issuing new one...'),
            helpers.translate('Cannot hide home node.'),
            helpers.translate('Change connection'),
            helpers.translate('Change'),
            helpers.translate('CI added.'),
            helpers.translate('CI relationship type'),
            helpers.translate('CI removed.'),
            helpers.translate('CI type'),
            helpers.translate('Class'),
            helpers.translate('Connect to...'),
            helpers.translate('Connection already exists'),
            helpers.translate('Connection changed.'),
            helpers.translate('Connection created.'),
            helpers.translate('Connection is now hidden.'),
            helpers.translate('Create a connection to another CI on the map.'),
            helpers.translate('Create connection'),
            helpers.translate('Create preset'),
            helpers.translate('Create shared preset'),
            helpers.translate('Default view'),
            helpers.translate('Delete preset'),
            helpers.translate('Delete shared preset'),
            helpers.translate('Discovery source'),
            helpers.translate('Duplicate.'),
            helpers.translate('Editing virtual and reference connection types not supported'),
            helpers.translate('Infrastructure'),
            helpers.translate('Location'),
            helpers.translate('Manage my presets'),
            helpers.translate('Manage shared presets'),
            helpers.translate('Multiple'),
            helpers.translate('None'),
            helpers.translate('Not allowed.'),
            helpers.translate('Owned by'),
            helpers.translate('Delete connection'),
            helpers.translate('Remove'),
            helpers.translate('Save successful'),
            helpers.translate('Search in progress...'),
            helpers.translate('Select All'),
            helpers.translate('Select "Save" to apply changes and update the map.'),
            helpers.translate('Shared presets'),
            helpers.translate('Suggested relationships'),
            helpers.translate('The connection will be deleted when the map is saved.'),
            helpers.translate('The map already includes the selected CI. Depending on the map filter settings the CI may not be displayed on the map.'),
            helpers.translate('The map editor does not support adding endpoint CIs.'),
            helpers.translate('unnamed'),
            helpers.translate('Unsupported.'),
            helpers.translate('Update preset'),
            helpers.translate('Update shared preset')
        ];

        Promise.all(promises).then((arr) => {
            var [
                ALL_RELATIONSHIPS,
                EDIT_SAVE_ERROR,
                APPLICATION_SERVICE,
                APPLICATION,
                BUSINESS,
                CANCELLING_PREVIOUS_SEARCH,
                CANNOT_HIDE_HOME_NODE,
                CHANGE_CONNECTION,
                CHANGE,
                CI_ADDED,
                CI_RELATIONSHIP_TYPE,
                CI_REMOVED,
                CI_TYPE,
                CLASS,
                CONNECT_TO,
                CONNECTION_ALREADY_EXISTS,
                CONNECTION_CHANGED,
                CONNECTION_CREATED,
                CONNECTION_IS_NOW_HIDDEN,
                CREATE_A_CONNECTION_TO_ANOTHER_CI_ON_THE_MAP,
                CREATE_CONNECTION,
                CREATE_PRESET,
                CREATE_SHARED_PRESET,
                DEFAULT_VIEW,
                DELETE_PRESET,
                DELETE_SHARED_PRESET,
                DISCOVERY_SOURCE,
                DUPLICATE,
                EDITING_VIRTUAL_AND_REFERENCE_CONNECTION_TYPES_NOT_SUPPORTED,
                INFRASTRUCTURE,
                LOCATION,
                MANAGE_MY_PRESETS,
                MANAGE_SHARED_PRESETS,
                MULTIPLE,
                NONE,
                NOT_ALLOWED,
                OWNED_BY,
                DELETE_CONNECTION,
                REMOVE,
                EDIT_SAVE_SUCCESS,
                SEARCH_IN_PROGRESS,
                SELECT_ALL,
                SELECT_SAVE_TO_APPLY_CHANGES_AND_UPDATE_THE_MAP,
                SHARED_PRESETS,
                SUGGESTED_RELATIONSHIPS,
                THE_CONNECTION_WILL_BE_DELETED_WHEN_THE_MAP_IS_SAVED,		
                CI_ALREADY_EXISTS,
                THE_MAP_EDITOR_DOES_NOT_SUPPORT_ADDING_ENDPOINT_CIS,
                UNNAMED,
                UNSUPPORTED,
                UPDATE_PRESET,
                UPDATE_SHARED_PRESET
            ] = arr;

            var translations = {
                ALL_RELATIONSHIPS: ALL_RELATIONSHIPS,
                ATTRIBUTE: {
                    CLASS: CLASS,
                    DISCOVERY_SOURCE: DISCOVERY_SOURCE,
                    LOCATION: LOCATION,
                    OWNED_BY: OWNED_BY
                },
                CANCELLING_PREVIOUS_SEARCH: CANCELLING_PREVIOUS_SEARCH,
                CANNOT_HIDE_HOME_NODE: CANNOT_HIDE_HOME_NODE,
                CHANGE: CHANGE,
                CHANGE_CONNECTION: CHANGE_CONNECTION,
                CI_ADDED: CI_ADDED,
                CI_ALREADY_EXISTS: CI_ALREADY_EXISTS,
                CI_RELATIONSHIP_TYPE: CI_RELATIONSHIP_TYPE,
                CI_REMOVED: CI_REMOVED,
                CI_TYPE: CI_TYPE,
                CONNECT_TO: CONNECT_TO,
                CONNECTION_ALREADY_EXISTS: CONNECTION_ALREADY_EXISTS,
                CONNECTION_CHANGED: CONNECTION_CHANGED,
                CONNECTION_CREATED: CONNECTION_CREATED,
                CONNECTION_IS_NOW_HIDDEN: CONNECTION_IS_NOW_HIDDEN,
                CREATE_A_CONNECTION_TO_ANOTHER_CI_ON_THE_MAP: CREATE_A_CONNECTION_TO_ANOTHER_CI_ON_THE_MAP,
                CREATE_CONNECTION: CREATE_CONNECTION,
                CREATE_PRESET: CREATE_PRESET,
                CREATE_SHARED_PRESET: CREATE_SHARED_PRESET,
                DEFAULT_VIEW: DEFAULT_VIEW,
                DELETE_PRESET: DELETE_PRESET,
                DELETE_SHARED_PRESET: DELETE_SHARED_PRESET,
                DUPLICATE: DUPLICATE,
                EDIT_SAVE_ERROR: EDIT_SAVE_ERROR,
                EDIT_SAVE_SUCCESS: EDIT_SAVE_SUCCESS,
                EDITING_VIRTUAL_AND_REFERENCE_CONNECTION_TYPES_NOT_SUPPORTED: EDITING_VIRTUAL_AND_REFERENCE_CONNECTION_TYPES_NOT_SUPPORTED,
                LAYER: {
                    SELECT_ALL: SELECT_ALL,
                    BUSINESS: BUSINESS,
                    APPLICATION_SERVICE: APPLICATION_SERVICE,
                    APPLICATION: APPLICATION,
                    INFRASTRUCTURE: INFRASTRUCTURE
                },
                MANAGE_MY_PRESETS: MANAGE_MY_PRESETS,
                MANAGE_SHARED_PRESETS: MANAGE_SHARED_PRESETS,
                MULTIPLE: MULTIPLE,
                NONE: NONE,
                NOT_ALLOWED: NOT_ALLOWED,
                REMOVE: REMOVE,
                DELETE_CONNECTION: DELETE_CONNECTION,
                SEARCH_IN_PROGRESS: SEARCH_IN_PROGRESS,
                SELECT_ALL: SELECT_ALL,
                SELECT_SAVE_TO_APPLY_CHANGES_AND_UPDATE_THE_MAP: SELECT_SAVE_TO_APPLY_CHANGES_AND_UPDATE_THE_MAP,
                SHARED_PRESETS: SHARED_PRESETS,
                SUGGESTED_RELATIONSHIPS: SUGGESTED_RELATIONSHIPS,
                THE_CONNECTION_WILL_BE_DELETED_WHEN_THE_MAP_IS_SAVED: THE_CONNECTION_WILL_BE_DELETED_WHEN_THE_MAP_IS_SAVED,
                THE_MAP_EDITOR_DOES_NOT_SUPPORT_ADDING_ENDPOINT_CIS: THE_MAP_EDITOR_DOES_NOT_SUPPORT_ADDING_ENDPOINT_CIS,
                UNNAMED: UNNAMED,
                UNSUPPORTED: UNSUPPORTED,
                UPDATE_PRESET: UPDATE_PRESET,
                UPDATE_SHARED_PRESET: UPDATE_SHARED_PRESET
            };
            api.setState('translations', translations);
            helpers.timing.setTimeout(() => {
                api.emit(EVENTS.TRANSLATIONS_COMPLETED, {});
            }, 0);
        });
    },

    setMiscEnumsIntoState: function () {
        api.setState('sysProperties', Object.keys(SYS_PROP).map(k => SYS_PROP[k]).join());
        const userPreferenceList = buildUserPrefWithAppId([PRESETS_USER_PREF_KEY, SHOW_FILTERED_ITEMS_USER_PREF_KEY], api.context.app.appId);
        api.setState('userPrefKeys', [
            userPreferenceList[PRESETS_USER_PREF_KEY],
            userPreferenceList[SHOW_FILTERED_ITEMS_USER_PREF_KEY]
        ].join(','));
        //so we can reference certain enums directly from the UX Formulae to avoid having to go to script (more expensive)

        var USER_PREFS = {
            'PRESETS_USER_PREF_KEY': userPreferenceList[PRESETS_USER_PREF_KEY],
            'SHOW_FILTERED_ITEMS_USER_PREF_KEY': userPreferenceList[SHOW_FILTERED_ITEMS_USER_PREF_KEY]
        };
        //so we can reference certain enums directly from the UX Formulae to avoid having to go to script (more expensive)
        api.setState('USER_PREFS', USER_PREFS);
    },

    /* 
    * Remove this function and replace with UX Formulae !@context.props.rootNode
    * on the "Show empty state" nodemap component input prop
    * once COE fixes DEF0547934 - "Show empty state" input prop not working.
    * 
    * the only purpose of this whole function is to get nodemap component to show the "No content yet" message with image
    * otherwise without it, it just shows "...loading" text indefinitely
    */
    setDefaultMapData: function () {
        if (!api.context.props.ciSysid) {
            api.setState('nodes', []);
            api.setState('rootNode', "");
            helpers.timing.setTimeout(() => {
                api.setState('nodes', null);
                api.setState('rootNode', null);
            }, 900); //just enough time to exceed nodemap state change debounce
        }
    },

    setupEventSync: function () {
        var events = cloneDeep(api.state.events);
        events.sync = {
            [EVENTS.BROKERS_COMPLETED]: [
                EVENTS.MAP_DATA_FETCH_COMPLETED,
                EVENTS.LOOKUP_SYSTEM_PROPS_COMPLETED, //remove this after sys props are moved into workspace delineated config tables
                EVENTS.GET_USER_PREFS_COMPLETED
            ],
            [EVENTS.STATE_INITIALIZED]: [
                EVENTS.USER_PREFS_INITIALIZED,
                EVENTS.LEVELS_INITIALIZED,
                EVENTS.FILTER_INITIALIZED
            ]
        };
        api.setState('events', events);
    }
};

functions.macroponentReady();
}
