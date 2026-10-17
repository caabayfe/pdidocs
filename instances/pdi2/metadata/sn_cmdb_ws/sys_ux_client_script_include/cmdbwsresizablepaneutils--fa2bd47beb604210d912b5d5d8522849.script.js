function resizablePanelUtils(proxyArg, params) {
    const { api, event, helpers, imports } = params;

    const SIDEBAR_CLOSED_DEFAULT_POSITION = "-48px";
    const SIDEBAR_CLOSED_CONSTRAINT = { "minPixels": 48 };
    const SIDEBAR_OPEN_CONSTRAINT = { "minRatio": 20, "minPixels": 370 };
    const SIDEBAR_OPEN_DEFAULT_POSITION = "75";

    const pageId = (api.context.props.pageId || "").replace(" ", "_");
    const SIDEBAR_RATIO_PREF_NAME = `cmdbws.${pageId}.sidebar-ratio`;
    const SHOW_SIDEBAR_PREF_NAME = `cmdbws.${pageId}.show-sidebar`;

    const onMacroponentReady = () => {
        api.setState('lookupPreferenceNames', [SHOW_SIDEBAR_PREF_NAME, SIDEBAR_RATIO_PREF_NAME].join(","));
    }

    const getUserPreferenceMap = () => {
        const userPrefs = api.data?.lookupSidebarUserPref?.result?.preferences;
        const userPrefMap = new Map();
        userPrefs.forEach(item => {
            if (item.value != undefined || item.value != null) {
                userPrefMap.set(item.name, item.value);
            }
        });
        return userPrefMap;
    };

    const getUserPreference = (preference, defaultValue) => {
        const userPrefMap = getUserPreferenceMap();
        if (userPrefMap.has(preference)){
            if (userPrefMap.get(preference) === 'true' || userPrefMap.get(preference) === true)
                return true;
            if (userPrefMap.get(preference) === 'false' || userPrefMap.get(preference) === false)
                return false;
            return userPrefMap.get(preference);
        } else {
            return defaultValue;
        }
    };

    function toggleSidebar(isHidden) {
		if (isHidden) {
			// If the savedSidebarRatio has not been initialized before hiding the element
			// then save it before collapsing the sidebar.
			if (!api.state.sidebarRatioSaved)
				api.setState('sidebarRatioSaved', api.state.sidebarDividerPosition);

			// close the sidebar
			api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
			api.setState("sidebarDividerPosition", SIDEBAR_CLOSED_DEFAULT_POSITION);
		} else {
			// open the sidebar
			api.setState("sidebarPaneContraints", SIDEBAR_OPEN_CONSTRAINT);
			api.setState("sidebarDividerPosition", api.state.sidebarRatioSaved);
		}
		api.setState("sidebarDisabled", isHidden);
    	api.data.setUserPref.execute({
			name: SHOW_SIDEBAR_PREF_NAME,
			value: !isHidden
		});
	};

    function initializeSidebarPosition () {
        const userPrefMap = getUserPreferenceMap(); 
        const sidebarOn = getUserPreference(SHOW_SIDEBAR_PREF_NAME, true);
        const sidebarDisabled = !sidebarOn;
        const sidebarRatioSavedValue = getUserPreference(SIDEBAR_RATIO_PREF_NAME, SIDEBAR_OPEN_DEFAULT_POSITION);
        const sidebarRatioSaved = typeof sidebarRatioSavedValue === 'string' ? sidebarRatioSavedValue : null;
        const position = sidebarOn ? sidebarRatioSaved : SIDEBAR_CLOSED_DEFAULT_POSITION;
        if (sidebarDisabled)
            api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
        else
            api.setState("sidebarPaneContraints", SIDEBAR_OPEN_CONSTRAINT);
        if (sidebarRatioSaved)
            api.setState('sidebarRatioSaved', sidebarRatioSaved);

        api.setState('sidebarDisabled', sidebarDisabled);
        if (position)
            api.setState('sidebarDividerPosition', position);
    };

    function resizePane(dividerPosition) {
        api.setState('sidebarRatioSaved', dividerPosition);
        api.data.setUserPref.execute({
            name: SIDEBAR_RATIO_PREF_NAME,
            value: dividerPosition
        });
    }

    return {
        onMacroponentReady,
        toggleSidebar,
        initializeSidebarPosition,
        getUserPreference,
        resizePane
    };
}
