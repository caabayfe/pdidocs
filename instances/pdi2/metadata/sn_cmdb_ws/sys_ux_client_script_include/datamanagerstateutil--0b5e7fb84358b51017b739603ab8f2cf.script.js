function include({ imports }) {
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();

    const POLICY_FORM_VIEWS = {
        ASSIGNMENT: "assignment",
        DATA_FILTER: "data_filter",
        GENERAL_INFO: "general_info",
        OPTIONS: "options",
        REVIEW: "review",
        SCHEDULE: "schedule"
    }

    const SCHEDULE_TYPES = {
        DAILY: "daily",
        WEEKLY: "weekly",
        MONTHLY: "monthly",
        PERIODICALLY: "periodically",
        ON_DEMAND: "on_demand",
        ONCE: "once"
    }

    const SCHEDULE_IDS = {
        RUN_TYPE: "run_type",
        RUN_TIME: "run_time",
        RUN_START: "run_start",
        RUN_PERIOD: "run_period",
        RUN_DAYOFWEEK: "run_dayofweek",
        RUN_DAYOFMONTH: "run_dayofmonth",
        RUN_PERIOD_DISPLAY: "run_period_display"
    }

    const POLICY_TYPE_IDS = {
        ARCHIVE: "b82b20d00731201017b703767cd300e1",
        ATTESTATION: "7b80ed7753823010ee0dddeeff7b1223",
        CERTIFICATION: "fe2a16b3436031106d8a8ef0dab8f2ff",
        DELETE: "562bec900731201017b703767cd300e7",
        DELETE_RELATED_ENTRY: "c3059c79ff920110456d766cf43bf1c6",
        RETIRE: "66306fcb7352201026f6aa114df6a77c"
    }

    const FORM_ICONS = {
        LOCKED : {
             "statuses": [
                    {
                        "type": "icon",
                        "icon": "lock-outline"
                    }
                ],
                "disabled": true
         }, 
         EDITING : { 
                "statuses": [
                    {
                        "type": "icon",
                        "icon": "circle-semi-check-outline"
                    }
                ],
                "disabled": false
         }, 
         DONE : {
                 "statuses": [
                    {
                        "type": "icon",
                        "icon": "circle-check-outline"
                    }
                ],
                "disabled": false
         }
    };

    const FORM_STATE = {

        "assignment": {
            "isHidden": true,
            "label": "Assignment",
            "nextView": POLICY_FORM_VIEWS.OPTIONS,
            "previousView": POLICY_FORM_VIEWS.DATA_FILTER,
            "disabled": true,
            "focusElementId": "assignment_type_select",
            ...FORM_ICONS.LOCKED

        },
        "data_filter": {
            "isHidden": true,
            "label": "Data Filter",
            "nextView": POLICY_FORM_VIEWS.ASSIGNMENT,
            "previousView": POLICY_FORM_VIEWS.GENERAL_INFO,
            "focusElementId": "data_filter_table_select",
            ...FORM_ICONS.LOCKED
        },
        "general_info": {
            "isHidden": false,
            "label": "General Information",
            "nextView": POLICY_FORM_VIEWS.DATA_FILTER,
            "previousView": "",
            "focusElementId": "policy_name_input",
            ...FORM_ICONS.EDITING
        },
        "options": {
            "isHidden": true,
            "label": "Options",
            "nextView": POLICY_FORM_VIEWS.SCHEDULE,
            "previousView": POLICY_FORM_VIEWS.ASSIGNMENT,
            "focusElementId": "",
            ...FORM_ICONS.LOCKED
        },
        "review": {
            "isHidden": true,
            "label": "Review",
            "nextView": "",
            "previousView": POLICY_FORM_VIEWS.SCHEDULE,
            "focusElementId": "",
            ...FORM_ICONS.LOCKED
        },
        "schedule": {
            "isHidden": true,
            "label": "Schedule",
            "nextView": POLICY_FORM_VIEWS.REVIEW,
            "previousView": POLICY_FORM_VIEWS.OPTIONS,
            "focusElementId": "schedule_type_select",
            ...FORM_ICONS.LOCKED
        }
    }

   const EXCLUSION_FORM_VIEWS = {
          DATA_FILTER : "data_filter",
          POLICY_TYPE : "policy_type",
          REVIEW: "review"
   }

   const EXCLUSION_FORM_STATE = {
        "data_filter": {
            "isHidden": false,
            "label": "",
            "nextView":EXCLUSION_FORM_VIEWS.POLICY_TYPE,
            "previousView": "",
            ...FORM_ICONS.EDITING
        },
        "policy_type": {
            "isHidden": true,
            "label": "",
            "nextView": EXCLUSION_FORM_VIEWS.REVIEW,
            "previousView": EXCLUSION_FORM_VIEWS.DATA_FILTER,
            ...FORM_ICONS.LOCKED
        },
        "review": {
            "isHidden": true,
            "label": "",
            "nextView": "",
            "previousView": EXCLUSION_FORM_VIEWS.POLICY_TYPE,
            ...FORM_ICONS.LOCKED
        }
    };

    /**
     *
     * @param helpers The UXF helpers class, required for translations
     * @returns state map for the Exclusion form
     */
    const _getExclusionFormViewStateMap = async (helpers) => {
        const formState = EXCLUSION_FORM_STATE;
        formState[EXCLUSION_FORM_VIEWS.DATA_FILTER].label = await helpers.translate("Data Filter");
        formState[EXCLUSION_FORM_VIEWS.POLICY_TYPE].label = await helpers.translate("Select policy type");
        formState[EXCLUSION_FORM_VIEWS.REVIEW].label = await helpers.translate("Review");
        return formState;
    }

    /**
     * resetCurrentTab - something changed. set current view to editing and all next views to locked and disabled
     * change the current view's form icon status to editing, and next view's form icon status to locked
     * @param selectedTabId current selected tab Id of the form page
     * @param formViewStateMap - current form view state map of the form
     * @returns updated formViewStateMap 
     */
     var _resetCurrentTab = (selectedTabId, formViewStateMap) => {
         formViewStateMap[selectedTabId].statuses = FORM_ICONS.EDITING.statuses;
         formViewStateMap[selectedTabId].disabled = false;

         let nextView = formViewStateMap[selectedTabId].nextView;
         while(nextView != "") {
             formViewStateMap[nextView].statuses = FORM_ICONS.LOCKED.statuses;
             formViewStateMap[nextView].disabled = true;
             nextView = formViewStateMap[nextView].nextView;
         }
        return  formViewStateMap;
    }

    

    /**
     * 
     * @param helpers The UXF helpers class, required for translations
     * @returns state map for the policy form
     */
    const _getFormViewStateMap = () => {
        return FORM_STATE;
    }

    const _getFormViewStateLabel = async (api, helpers) => {
        let formState = api.state.formViewStateMap;
        if (!formState) {
             formState = FORM_STATE;
         }
        formState[POLICY_FORM_VIEWS.ASSIGNMENT].label = await helpers.translate("Assignment");
        formState[POLICY_FORM_VIEWS.DATA_FILTER].label = await helpers.translate("Data Filter");
        formState[POLICY_FORM_VIEWS.OPTIONS].label = await helpers.translate("Options");
        formState[POLICY_FORM_VIEWS.GENERAL_INFO].label = await helpers.translate("sn_cmdb_ws.generalInformation.titleCase")
        formState[POLICY_FORM_VIEWS.REVIEW].label = await helpers.translate("Review");
        formState[POLICY_FORM_VIEWS.SCHEDULE].label = await helpers.translate("Schedule");
        api.setState('formViewStateMap', cloneDeep(formState));
    }

    /**
     * 
     * @param stateMap 
     * @returns true if the back button is hidden on this view
     */
    const _getHideBackButton = (currentView) => {
        return FORM_STATE[currentView] && !FORM_STATE[currentView].previousView
    }

    /**
     * 
     * @param stateMap 
     * @returns required fields for a given policy type
     */
    const _getHideContinueButton = (currentView) => {
        return FORM_STATE[currentView] && !FORM_STATE[currentView].nextView
    }

     /**
     *
     * @param stateMap
     * @returns true if the back button is hidden on this view
     */
    const _getExclusionHideBackButton = (currentView) => {
        return EXCLUSION_FORM_STATE[currentView] && !EXCLUSION_FORM_STATE[currentView].previousView
    }

    /**
     *
     * @param stateMap
     * @returns true if the continue button is hidden on this view
     */
    const _getExclusionHideContinueButton = (currentView) => {
        return EXCLUSION_FORM_STATE[currentView] && !EXCLUSION_FORM_STATE[currentView].nextView
    }

    /**
     * Get the list of schedule component IDs that are hidden given a schedule run_type
     * @param runType daily, weekly, on_demand, etc
     * @returns array
     */
    const _getHiddenScheduleComponentsByType = (runType) => {
        switch (runType) {
            case (SCHEDULE_TYPES.DAILY):
                return ['run_start', 'run_period', 'run_dayofweek', 'run_dayofmonth'];
            case (SCHEDULE_TYPES.WEEKLY):
                return ['run_start', 'run_period', 'run_dayofmonth'];
            case (SCHEDULE_TYPES.MONTHLY):
                return ['run_start', 'run_period', 'run_dayofweek'];
            case (SCHEDULE_TYPES.PERIODICALLY):
                return ['run_time', 'run_dayofmonth', 'run_dayofweek'];
            case (SCHEDULE_TYPES.ONCE):
                return ['run_time', 'run_period', 'run_dayofmonth', 'run_dayofweek'];
            case (SCHEDULE_TYPES.ON_DEMAND):
                return ['run_time', 'run_start', 'run_period', 'run_dayofmonth', 'run_dayofweek'];
        }
    }

    const _getOptionsFocusElementId = (policyType) => {
        switch (policyType) {
            case (POLICY_TYPE_IDS.ATTESTATION):
                return "days_to_complete_input";
            case (POLICY_TYPE_IDS.CERTIFICATION):
                return "display_fields_typeahead";
            default:
                return "subflow_select";
        }
    }

    const _focusElement = function(context, elementId, view, policyType) {
        const { api, helpers } = context;
        if (helpers && helpers.focus) {
            // If it is the options page, we need to get the element id
            if (view === POLICY_FORM_VIEWS.OPTIONS) {
                elementId = _getOptionsFocusElementId(policyType);
            }
            helpers.timing.setTimeout(() => {
                api.emit('DM_FOCUS_ELEMENT', {"elementId": elementId});
            }, 500);
        }
    }

    return {
        POLICY_FORM_VIEWS,
        SCHEDULE_TYPES,
        SCHEDULE_IDS,
        FORM_ICONS,
        getFormViewStateMap: _getFormViewStateMap,
        getFormViewStateLabel: _getFormViewStateLabel,
        getHideBackButton: _getHideBackButton,
        getHideContinueButton: _getHideContinueButton,
        EXCLUSION_FORM_VIEWS,
        getExclusionFormViewStateMap : _getExclusionFormViewStateMap,
        getExclusionHideBackButton : _getExclusionHideBackButton,
        getExclusionHideContinueButton : _getExclusionHideContinueButton,
        getHiddenScheduleComponentsByType: _getHiddenScheduleComponentsByType,
        resetCurrentTab : _resetCurrentTab,
        focusElement: _focusElement
    }
}
