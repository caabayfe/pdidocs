/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let {
        cbTableName,
        defActive,
        existingDefForTable,
        queryValidation: {
            isPartial,
            hasOr,
            unsupportedOperator
        },
        validQuery
    } = api.state;
    const {
        active: {
            value: activeValue
        } = {},
        retirement_definition: {
            value: retirementDefValue
        } = {},
        table: {
            value: tableValue
        } = {}
    } = api.data.look_up_record.result;
    const { sysId } = api.context.props;
    if (event.name == 'NOW_TOGGLE#CHECKED_SET') {
        defActive = event.payload.value;
        api.setState('defActive', defActive);
    }

    // If there's an existing definition or error, disable save button and no need to check further
    if (existingDefForTable || isPartial || hasOr || unsupportedOperator) {
        api.setState('disableSave', true);
        return;
    }
    // If missing required values, disable save button and return
    if (!cbTableName || !validQuery) {
        api.setState('disableSave', true);
        return;
    }
    // If not a new record, compare values against existing record
    if (sysId != -1) {
        let hasChange = activeValue !== defActive 
            || retirementDefValue !== validQuery
            || tableValue !== cbTableName;
        api.setState('disableSave', !hasChange);
    } else {
        api.setState('disableSave', false);
    }
}
