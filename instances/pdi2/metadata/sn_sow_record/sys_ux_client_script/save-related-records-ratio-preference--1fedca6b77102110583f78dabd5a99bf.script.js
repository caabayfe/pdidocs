/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
if (event.payload.interaction === "USER_ACTION") {
        const relatedRecordsDividerPosition = event.payload.dividerPosition;
        api.setState('relatedRecordsDividerPosition', relatedRecordsDividerPosition);
        api.data.save_user_preference.execute({
            'name': api.state.relatedRecordsRatioPreference,
            'value': relatedRecordsDividerPosition
        });
    }
}
