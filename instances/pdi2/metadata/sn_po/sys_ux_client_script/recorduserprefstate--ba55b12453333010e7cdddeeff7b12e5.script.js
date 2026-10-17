/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    // event name
    const eventName = event.name;
    

    // Sidebar specific constants
    const DEFAULT_RATIO_OPEN =  75;
    const DEFAULT_POSITION_CLOSED =  "-48px";
    const SIDEBAR_CLOSED_CONSTRAINT =  {  "minPixels": 48 };
    const SIDEBAR_OPEN_CONSTRAINT =  { "minRatio": 20, "minPixels": 370 };

    // import the getUserPreference method from userPreferenceUtils script includes
    const {
        getUserPreference
    } = imports["sn_uib_base_aw.userPreferenceUtils"](api.context.props.userPrefs);

    /**
     * onLoadSidebarState - When page is loading, either a defined user pref is read for the sidebar ratio,
     * the preference name is initially built since the table name is part of the user pref name
     */
    const onLoadSidebarState = () => {
        // close the sidebar (it should start closed)
        toggleSidebar(true);

        // Build the user pref name for this preference at initialization time
        const PREFIX = "workspace.layout.sidebar_ratio.";
        const table = api.context.props.table || 'global';
        const sidebarRatioPreference = PREFIX + table;

        // save the preference name in a client state variable, which is bound to the data resouce below
        api.setState('sidebarRatioPreference', sidebarRatioPreference);

        // the preference name is read, now look it up.    
        api.data.getSidebarRatioPreference.refresh();
    };

    /**
     * toggleSidebar - toggle the sidebar based on whether the sidebar is shown or hidden
     */
    const toggleSidebar = (isHidden) => {
        if (isHidden) {
            // If the savedSidebarRatio has not been initialized before hiding the element
            // then save it before collapsing the sidebar.
            if(!api.state.sidebarRatioSaved)
                api.setState('sidebarRatioSaved', api.state.sidebarDividerPosition);

            // close the sidebar
            api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
            api.setState("sidebarDividerPosition", DEFAULT_POSITION_CLOSED);
        } else {
            // open the sidebar
            api.setState("sidebarPaneContraints", SIDEBAR_OPEN_CONSTRAINT);
            api.setState("sidebarDividerPosition", api.state.sidebarRatioSaved);
        }
        api.setState("sidebarDisabled", isHidden);
    };

    /**
     * onChangeSidebarState - As a result of user pref setting toggle action, set the state of the sidebar
     */
    const onChangeSidebarState = () => {
        // preference name
        const SHOW_SIDEBAR_PREF_NAME = "workspace.showAgentAssist";

        // fetch the user's show sidebar preference value
        const pref = getUserPreference(SHOW_SIDEBAR_PREF_NAME);

        // set the showRibbon to isRibbonCollapsed in state properties
        toggleSidebar(!pref);
    };

    /**
     * onToggleSidebar - As a result of icon based toggle user action, set the state of the sidebar
     */
    const onToggleSidebar = () => {
        const { sidebarActiveTab, sidebarDisabled } = api.state;
        const { name } = event.payload;
        const isHidden = (name == sidebarActiveTab && !sidebarDisabled);
        toggleSidebar(isHidden);
    };

    /**
     * onLoadUserPreference - Determine whether to show the sidebar for new or users who do not have userPrefs saved
     */
    const onLoadUserPreference = (userPref) => {
        // preference name
        const SHOW_SIDEBAR_PREF_NAME = "workspace.showAgentAssist";

        // fetch the user's show sidebar preference value
        const sidebarOn = getUserPreference(SHOW_SIDEBAR_PREF_NAME);

        // Startup deterination of sidebar status, driven first by menu toggle, then by possibly save pref value
        var position;
        if(sidebarOn) {
              position =  (userPref.length > 0 && userPref[0].value) ? userPref[0].value : DEFAULT_RATIO_OPEN;
        } else {
              position = DEFAULT_POSITION_CLOSED;
              api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
        }

        // persist the sidebar status in client state variables
        api.setState('sidebarDisabled', !sidebarOn);
        api.setState('sidebarDividerPosition', position);
        api.setState('sidebarRatioSaved', position);
    };

    // handle the user pref states based on one of the following changes: the macroponent ready event, 
    // macroponent property change event; sidebar icon clicks and the user pref  fetch succeded
    switch(eventName) {
        case 'MACROPONENT_READY':
            onLoadSidebarState();
            break;

        case 'MACROPONENT_PROPERTY_CHANGED':
            if (event.payload.name === 'userPrefs') {
                onChangeSidebarState();
            }
            break;

        case 'NOW_RECORD_COMMON_SIDEBAR#ACTION_CLICKED':
            onToggleSidebar();
            break;

        case 'DATA_FETCH_SUCCEEDED':
            if (event.elementId === 'getSidebarRatioPreference') 
                    onLoadUserPreference(api.data.getSidebarRatioPreference.result.preferences);
            break;

        default:
            break;
    }
}
