/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
 function handler({ api, event, imports }) {
  const { getUserPreference } = imports["sn_uib_base_aw.userPreferenceUtils"](api.context.props.userPrefs);

  const COMPACT_PREF_NAME = "glide.ui.compact";
  const isCompact = getUserPreference(COMPACT_PREF_NAME);

  const DEFAULT_RATIO_OPEN = 75;
  const DEFAULT_POSITION_CLOSED = isCompact ? "-40px" : "-48px";
  const SIDEBAR_CLOSED_CONSTRAINT = { minPixels: isCompact ? 40 : 48 };
  const SIDEBAR_OPEN_CONSTRAINT = { minRatio: 20, minPixels: 370 };

  const onLoadSidebarState = () => {
    const PREFIX = "workspace.layout.sidebar_ratio.";
    const table = 'global';
    const sidebarRatioPreference = PREFIX + table;

    if (api.state.sidebarRatioPreference !== sidebarRatioPreference) {
      api.setState('sidebarRatioPreference', sidebarRatioPreference);
    }
  };

  const toggleSidebar = (isHidden) => {
    if (isHidden) {
      if (!api.state.sidebarRatioSaved) {
        api.setState('sidebarRatioSaved', api.state.sidebarDividerPosition);
      }

      api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
      api.setState("sidebarDividerPosition", DEFAULT_POSITION_CLOSED);
    } else {
      api.setState("sidebarPaneContraints", SIDEBAR_OPEN_CONSTRAINT);
      api.setState("sidebarDividerPosition", api.state.sidebarRatioSaved);
    }

    api.setState("sidebarDisabled", isHidden);
  };

  const onChangeSidebarState = () => {
    const SHOW_SIDEBAR_PREF_NAME = "workspace.showAgentAssist";
    const pref = getUserPreference(SHOW_SIDEBAR_PREF_NAME);
    api.setState("sidebarPref", pref);
    toggleSidebar(!pref);
  };

  const onToggleSidebar = () => {
    const { sidebarActiveTab, sidebarDisabled } = api.state;
    const { payload } = event;
    const isHidden = payload.collapsed && !sidebarDisabled;
    toggleSidebar(isHidden);
  };

  const onLoadUserPreference = (userPref) => {
    const SHOW_SIDEBAR_PREF_NAME = "workspace.showAgentAssist";
    const sidebarOn = getUserPreference(SHOW_SIDEBAR_PREF_NAME);

    let position;
    const sidebarRatioSaved = userPref.length > 0 && userPref[0].value ? userPref[0].value : DEFAULT_RATIO_OPEN;
    if (sidebarOn) {
      position = sidebarRatioSaved;
    } else {
      position = DEFAULT_POSITION_CLOSED;
      api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
    }

    api.setState('sidebarDisabled', !sidebarOn);
    api.setState('sidebarDividerPosition', position);
    api.setState('sidebarRatioSaved', sidebarRatioSaved);
  };

  const callSideBarPreference = () => {
    api.data.gliderecord_collection_query_1?.refresh();
    const preferences = api.data.gliderecord_collection_query_1?.refresh();
    if(preferences) {
      onLoadUserPreference(preferences);
    }
  };  

  onLoadSidebarState();

  const eventName = event.name;
  const { sidebarActiveTab, previousActiveTab, sidebarDisabled } = api.state;

  const eventHandlers = {
    'MACROPONENT_PROPERTY_CHANGED': () => {
      if (event.payload.name === 'userPrefs') {
        onChangeSidebarState();
      }
    },
    'UXF_TAB_SET#TAB_SELECTED': () => {
      if (sidebarActiveTab !== previousActiveTab && sidebarDisabled) {
        toggleSidebar(!sidebarDisabled);
      }
    },
    'UXF_TAB_SET#TAB_COLLAPSED': () => {
      onToggleSidebar();
    },
    'NOW_EMAIL_CLIENT_COMPOSER_CONNECTED#DRAFT_INITIALISED': () => {
      api.setState("sysId", event.payload.targetRecord);
      api.setState("table", event.payload.targetTable);
      const subject = event.payload.subject;
      api.setState("emailFields", {
        "subject": {
            "name": "subject",
            "value": subject,
            "displayValue": subject,
        }
      });

      callSideBarPreference();
    },
  };

  const handleEvent = eventHandlers[eventName];
  if (handleEvent) {
    handleEvent();
  }
}
