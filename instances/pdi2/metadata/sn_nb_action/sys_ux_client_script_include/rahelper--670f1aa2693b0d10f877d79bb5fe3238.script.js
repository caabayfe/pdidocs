function include(proxyArg, params) {
    const { api, event, helpers, imports } = params;
    const gform = api.data.gform;
    //for form controller form access
    const gform2 = api.data.glide_form_1;
    const NEW_RECORD_SYS_ID = "-1";
    const isNewRecord = api.context.props.sysId == NEW_RECORD_SYS_ID;
    const FIELDS_TO_MONITOR = "fieldsToMonitor";
    const RECOMMENDED_FIELDS = "recommendedFields";
    const FIELD_NAME = "name";
    const FIELD_VALUE = "value";
    const FIELD_ORIGINAL_VALUE = "originalValue";
    const FIELD_DISPLAY_VALUE = "displayValue";
    const STAMP_VALUE = "value";
    const STAMP_DISPlAY_VALUE = "displayValue";
    const FIELD_NAME_KEY = "fieldName";
    const INFO_MESSAGE_TYPE = "info";
    const GET_RECOMMENDATIONS_ACTION_DETAILS_KEY = "actionDetails";
    const GET_RECOMMENDATIONS_FIELDS_TO_MONITOR_KEY = "fieldsToMonitor";
    const GET_RECOMMENDATIONS_CUSTOM_ATTRIBUTES_KEY = "customAttributes";
    const FIELD_RECOMMENDATION_MESSAGE_KEY = "recommendationMessage";
    const FIELD_RECOMMENDATION_IS_CONFIDENT_KEY = "isConfident";
    const FIELD_RECOMMENDATION_STAMP_DETAILS_KEY = "stampDetails";
    const FIELD_VALUE_CHANGED = "CTRL_RECORD#FIELD_VALUE_CHANGED";
    const FIELD_VALUE_CHANGED_NEW_EVENT= "SN_FORM_DATA_CONNECTED#FIELD_VALUE_CHANGED";
    const HIDE_FIELD_MESSAGE = "RECORD#GFORM_HIDE_FIELD_MESSAGE";
    const SHOW_FIELD_MESSAGE = "RECORD#GFORM_SHOW_FIELD_MESSAGE";
    const SET_FIELD_VALUE = "RECORD#GFORM_SET_VALUE";
    const NAV_ITEM_SELECTED = "NAV_ITEM_SELECTED";
    const NOW_UXF_PAGE_ADD_NOTIFICATIONS = "NOW_UXF_PAGE#ADD_NOTIFICATIONS";
    const NOW_UXF_PAGE_REMOVE_NOTIFICATIONS = "NOW_UXF_PAGE#REMOVE_NOTIFICATIONS";
    const RA_ADD_NOTIFICATION_REQUESTED = "RECOMMENDED_ACTIONS#ADD_NOTIFICATION_REQUESTED";
    const RA_ACTION_CLICKED = "RECOMMENDED_ACTIONS#ACTION_CLICKED";
    const RA_LINK_CLICKED = "SN_NEXT_BEST_ACTION_LIST_CONNECTED#LINK_CLICKED";

    var formDataController;
    const isDataControllerInitialized = () => {
        if(typeof gform.table === 'string' && gform.table.length > 0){
            formDataController = gform.form;
            return true;
        }
        else if(typeof gform2.table === 'string' && gform2.table.length > 0){
            formDataController = gform2.nowRecordFormBlob;
            return true;
        }
        return false;
    }
    const clearPreviousRecommendations = () => {
        const previousRecommendedFields = api.state[RECOMMENDED_FIELDS] || [];
        for (var fieldIdx = 0; fieldIdx < previousRecommendedFields.length; fieldIdx++) {
            const field = previousRecommendedFields[fieldIdx];
            api.emit(HIDE_FIELD_MESSAGE, {
                fieldName: field,
                clearAll: true
            });
        }
    }
    const showFieldMessage = (fieldName, message) => {
        api.emit(SHOW_FIELD_MESSAGE, {
            fieldName: fieldName,
            message: message,
            type: INFO_MESSAGE_TYPE
        });
    }
    const showFieldMessages = (fieldMessageRecommendations) => {
        const fieldNames = Object.keys(fieldMessageRecommendations);
        for (let fieldIdx = 0; fieldIdx < fieldNames.length; fieldIdx++) {
            const fieldName = fieldNames[fieldIdx];
            const messages = new Set(fieldMessageRecommendations[fieldName]);
            messages.forEach(function (message) {
                showFieldMessage(fieldName, message);
            });
        }
        api.setState(RECOMMENDED_FIELDS, fieldNames);
    };
    const stampFieldRecommendations = (stampRecommendations) => {
        const fields = Object.keys(stampRecommendations);
        for (let fieldIdx = 0; fieldIdx < fields.length; fieldIdx++) {
            const field = fields[fieldIdx];
            const fieldDetails = formDataController.fields[field] || {};
            const currentValue = fieldDetails[FIELD_VALUE];
            const stampDetail = stampRecommendations[field];
            if (currentValue == "") {
                let payload = {};
                payload[FIELD_NAME_KEY] = field;
                payload[FIELD_VALUE] = stampDetail[STAMP_VALUE];
                if (stampDetail[STAMP_DISPlAY_VALUE]) {
                    payload[FIELD_DISPLAY_VALUE] = stampDetail[STAMP_DISPlAY_VALUE];
                }
                api.emit(SET_FIELD_VALUE, payload);
            }
        }
    }
    const getChangedFields = () => {
        let updatedFields = {};
        const formFields = formDataController.fields;
        const fieldNames = Object.keys(formFields);
        for (let fieldIndex = 0; fieldIndex < fieldNames.length; fieldIndex++) {
            const fieldName = fieldNames[fieldIndex];
            const field = formFields[fieldName];
            if (field.hasOwnProperty(FIELD_ORIGINAL_VALUE) && field[FIELD_ORIGINAL_VALUE] != field[FIELD_VALUE]) {
                updatedFields[field[FIELD_NAME]] = field[FIELD_VALUE];
            }
        }
        if (event.name == FIELD_VALUE_CHANGED || event.name == FIELD_VALUE_CHANGED_NEW_EVENT) {
            let payload = event.payload;
            updatedFields[payload[FIELD_NAME_KEY]] = payload[FIELD_VALUE];
        }
        return updatedFields;
    }
    const showRecommendations = () => {
        isDataControllerInitialized();
        const result = event.payload.data.output.result;
        let fieldMessageRecommendations = {};
        let fieldStampRecommendations = {};
        const actionDetails = result[GET_RECOMMENDATIONS_ACTION_DETAILS_KEY];
        const fieldsToMonitor = result[GET_RECOMMENDATIONS_FIELDS_TO_MONITOR_KEY];
        api.setState(FIELDS_TO_MONITOR, fieldsToMonitor);
        for (let recommendationIdx = 0; recommendationIdx < actionDetails.length; recommendationIdx++) {
            const actionDetail = actionDetails[recommendationIdx];
            const allFieldRecommendations = actionDetail[GET_RECOMMENDATIONS_CUSTOM_ATTRIBUTES_KEY];
            const fields = Object.keys(allFieldRecommendations);
            for (let fieldIdx = 0; fieldIdx < fields.length; fieldIdx++) {
                const field = fields[fieldIdx];
                const fieldMessages = [];
                const fieldRecommendations = allFieldRecommendations[field];
                for (let fieldRecommendationIdx = 0; fieldRecommendationIdx < fieldRecommendations.length; fieldRecommendationIdx++) {
                    const fieldRecommendation = fieldRecommendations[fieldRecommendationIdx];
                    fieldMessages.push(fieldRecommendation[FIELD_RECOMMENDATION_MESSAGE_KEY]);
                    if (isNewRecord && fieldRecommendation[FIELD_RECOMMENDATION_IS_CONFIDENT_KEY] && !fieldStampRecommendations[field]) {
                        fieldStampRecommendations[field] = fieldRecommendation[FIELD_RECOMMENDATION_STAMP_DETAILS_KEY];
                    }
                }
                if (fieldMessageRecommendations[field]) {
                    fieldMessageRecommendations[field].push(...fieldMessages);
                } else {
                    fieldMessageRecommendations[field] = fieldMessages;
                }
            }
        }
        clearPreviousRecommendations();
        if (isNewRecord) {
            stampFieldRecommendations(fieldStampRecommendations);
        }
        showFieldMessages(fieldMessageRecommendations);
    }
    const getRecommendations = () => {
        const fieldsToMonitor = api.state[FIELDS_TO_MONITOR] || [];
        if (event.name == FIELD_VALUE_CHANGED || event.name == FIELD_VALUE_CHANGED_NEW_EVENT) {
            const fieldName = event.payload.fieldName;
            if (fieldsToMonitor.indexOf(fieldName) == -1) {
                return;
            }
        }
        let fields = {};
        if (isDataControllerInitialized() && (event.name == FIELD_VALUE_CHANGED) || event.name == FIELD_VALUE_CHANGED_NEW_EVENT)
            fields = getChangedFields();
        api.data.get_field_recommendations.execute({
            'table': api.context.props.table,
            'sysId': (isNewRecord ? NEW_RECORD_SYS_ID : api.context.props.sysId),
            'fields': JSON.stringify(fields)
        });
    }

    const handleOpenRecord = () => {
        const {
            routeMapping,
            buildDefaultRoutePayload
        } = imports["global.recordRoutesMapping"]();
        var route = 'record';
        var targetRoute = 'current';
        const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event);
        const routeMap = api.data.recommended_actions_dynamic_routing.routeMap;
        const payload = routeMapping(routeMap, defaultRoutePayload, event);
        api.emit(NAV_ITEM_SELECTED, payload);
    }

    const addRANotification = () => {
        var item = event.payload.notificationItem;
        var itemId = event.payload.notificationItem.id;
        api.emit(NOW_UXF_PAGE_ADD_NOTIFICATIONS, {
            items: [
                item
            ],
        });
        helpers.timing.setTimeout(() => api.emit(NOW_UXF_PAGE_REMOVE_NOTIFICATIONS, {
            items: [{ id: itemId }]
        }), 5000);

    }

    const handleActionClicked = () => {
        if (event.payload.actionProps) {
            if (event.payload.actionProps.type == 'guidedDecisionGuidance'){
                helpers.navigate.to('guidance', { 'recommender': event.payload.actionProps.recommender, 'recommendedBy': event.payload.actionProps.recommendedBy}, {"actionConfigurations": JSON.stringify(event.payload.actionProps.actionConfigurations)}, false, false, 'current');
            }else if (event.payload.actionProps.type == 'guidedDecision')
                helpers.navigate.to('guided-decisions', { 'executionId': event.payload.actionProps.executionId, 'decisionTreeId': event.payload.actionProps.decisionTreeId }, {}, false, false, 'current');
            else if (event.payload.actionProps.type == 'raExpandedSearch') {
                const { contextTable, contextId, contextSysId, searchTerm,selectedFilterTab,selectedFacetOptions, selectedSortOption,actionConfigurations } = event.payload.actionProps;
                helpers.navigate.to('ra-expanded-search', { 'contextTable': contextTable, 'contextId': contextId }, {'contextSysId': contextSysId, 'searchTerm': searchTerm, 'selectedFilterTab': selectedFilterTab, 'selectedFacetOptions': selectedFacetOptions, 'selectedSortOption': selectedSortOption , 'actionConfigurations': JSON.stringify(actionConfigurations)}, false, false, 'current');
            }
        }

    }

    const handleRAEvents = () => {
        if (event.name === RA_ADD_NOTIFICATION_REQUESTED)
            addRANotification();
        else if (event.name === RA_ACTION_CLICKED)
            handleActionClicked();
        else if (event.name === RA_LINK_CLICKED)
            handleOpenRecord();
    }

    return {
        getRecommendations: getRecommendations,
        showRecommendations: showRecommendations,
        handleRAEvents: handleRAEvents
    }
}
