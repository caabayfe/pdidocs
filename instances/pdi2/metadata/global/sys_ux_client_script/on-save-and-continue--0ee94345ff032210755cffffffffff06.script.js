/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        deepClone
    } = imports["global.DMClientScriptUtils"]();
    const {
        STATE,
        OTD_SCHEDULE,
        TAB_ID,
        RULE_TYPE,
        COLUMNS,
        EVENT
    } = imports["global.DMClientConstants"]();
    const {
        FormValidator
    } = imports["global.DMCFormValidator"]();


    const {
        isValid,
        formValidatorJson
    } = await FormValidator.validateState(api, helpers);

    api.setState(STATE.FORM_VALIDATOR_JSON, formValidatorJson);
    if (!isValid) {
        return;
    }

    const {
        ruleData,
        selectedRuleType: ruleType,
        selectedTabId,
        isEditFlow
    } = api.state;

    var tableName = api.context.props.tableName;

    ruleData["rule_type"] = ruleType;
    if (ruleType == "table_cleaner")
        ruleData[ruleType]["tablename"] = tableName;
    else
        ruleData[ruleType]["table"] = tableName;

    const {
        retainReferenceCheckBoxDisabled
    } = api.state;
    if ((selectedTabId == TAB_ID.ARCHIVE_DEFINE_CONDITIONS || isEditFlow) &&
        (ruleType == RULE_TYPE.ARCHIVE) &&
        (ruleData[RULE_TYPE.ARCHIVE][COLUMNS.RETAIN_REFERENCES] !== false) &&
        (api.data.dmc_rule_app_context.output.tableMetadata.archive.retainReferences == false) &&
        (!retainReferenceCheckBoxDisabled)) {
        // We need to interrupt and show pop if retain references is selected 
        api.emit("RETAIN.REFERENCES.CONFIRMATION.POPUP", {});
        return;
    }

    if (api.data.dmc_rule_app_context.output.tableMetadata.archive.retainReferences) {
        ruleData[RULE_TYPE.ARCHIVE][COLUMNS.RETAIN_REFERENCES] = true;
    }

    if (ruleType == RULE_TYPE.ONETIME_DELETE) {
        if (selectedTabId == TAB_ID.OTD_SCHEDULE) {
            // Default selection for One time delete rule schedule is execute later
            if (!ruleData[ruleType][OTD_SCHEDULE.SCHEDULE_TYPE]) {
                ruleData[ruleType][OTD_SCHEDULE.SCHEDULE_TYPE] = OTD_SCHEDULE.EXECUTE_LATER;
            }
        }

        if(api.state.isEditFlow) {
            if(ruleData[RULE_TYPE.ONETIME_DELETE][COLUMNS.RUN_AT]) {
                // Show confirmation popup on rule for seting up schedule before save.
                api.emit(EVENT.OPEN_SCHEDULE_CONFIRMATION_POPUP);
                return;
            }
        }
    }
    

    var dmRuleObj = {
        dmRule: ruleData,
        tableName: tableName
    };
    if (selectedTabId == "onetime_delete.view_summary" && ruleType == "onetime_delete") {
        ruleData["onetime_delete"]["rule_confirmed"] = true;
    }
    api.setState("ruleData", deepClone(ruleData));
    api.data.create_data_management_rule.execute(dmRuleObj);
}
