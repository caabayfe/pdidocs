/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {COLUMNS, RULE_TYPE, STATE, UI_ELEMENT_ID} = imports["global.DMClientConstants"]();
    const {FormValidator} = imports["global.DMCFormValidator"]();
    const {deepClone, isPartialQuery} = imports["global.DMClientScriptUtils"]();

    const {selectedRuleType, ruleData} = api.state;
    const encodedQuery = event.payload.encodedQuery;
    
    if(!selectedRuleType || !ruleData) {
        return;
    }

    //If query is partial, return after saving state, We'll display error on save on continue if not fixed;
    const query = deepClone(api.state[STATE.PARTIAL_QUERY_ALERT]);
    query.hide = true;
    query.isValid = !isPartialQuery(encodedQuery);
    api.setState(STATE.PARTIAL_QUERY_ALERT, query);
    if(!query.isValid)
        return;

    
    // Trigger validation for empty condition  
    const eventPayload = {
        name: UI_ELEMENT_ID.CONDITIONS,
        value: encodedQuery
    };
    const {formValidatorJson} = await FormValidator.validateField(api, helpers, eventPayload);
    api.setState(STATE.FORM_VALIDATOR_JSON, formValidatorJson);
    

    // Save Rule State
    const ruleObj = deepClone(ruleData);
    ruleObj[RULE_TYPE.ONETIME_DELETE][COLUMNS.CONDITION] = encodedQuery;
    api.setState(STATE.RULE_DATA, ruleObj);
}
