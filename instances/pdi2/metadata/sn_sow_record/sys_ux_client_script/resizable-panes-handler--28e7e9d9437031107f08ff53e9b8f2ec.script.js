/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const eventName = event.name;

    const setRPRatioPreferenceName = () => {
        const PREFIX = "sow.layout.related_records_ratio.";
        const table = api.context.props.parentTable || 'global';
        const relatedRecordsRatioPreference = PREFIX + table;
        api.setState('relatedRecordsRatioPreference', relatedRecordsRatioPreference);
    };

    const setRPDividerPreferenceValue = () => {
        const userData = api.data.look_up_user_preferences.result;
        if (userData && userData.preferences) {
            const preferences = userData.preferences;
            for (let index in preferences) {
                if (preferences[index].name === api.state.relatedRecordsRatioPreference && preferences[index].value != null) {
                    api.setState('relatedRecordsDividerPosition', preferences[index].value);
                    return;
                }
            }
        }
    };

    const saveRPDividerPreference = () => {
        if (event.payload.interaction === "USER_ACTION") {
            const relatedRecordsDividerPosition = event.payload.dividerPosition;
            api.setState('relatedRecordsDividerPosition', relatedRecordsDividerPosition);
            api.data.save_user_preference.execute({
                'name': api.state.relatedRecordsRatioPreference,
                'value': relatedRecordsDividerPosition
            });
        }
    };


    switch (eventName) {
        case 'MACROPONENT_READY':
            setRPRatioPreferenceName();
            break;

        case 'DATA_FETCH_SUCCEEDED':
            setRPDividerPreferenceValue();
            break;

        case 'NOW_RESIZABLE_PANES#PANE_SIZES#CHANGED':
            saveRPDividerPreference();
            break;
            
        default:
            break;
    }
    

}
