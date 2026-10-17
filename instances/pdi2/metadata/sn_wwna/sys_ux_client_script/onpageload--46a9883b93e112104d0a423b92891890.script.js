/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let guidedDataDummy = {};
    const WWNA_PARAMS_CONFIG_TYPE = "8c9697d7a38a421075d1d78446fcda50";
    const WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID = "5a2bfda3935952104d0a423b92891800";
    if (!api.state.initialSetupDone) {
        let guidedContext = api.context.props?.payload?.guided_context || guidedDataDummy;
        let varSetLength = guidedContext.skill_config_var_sets.length;
        let wwnaConfigVarSetRecord, generalDetailsVarSetRecord;
        for (let i = 0; i < varSetLength; i++) {
            if (guidedContext.skill_config_var_sets[i].config_type === WWNA_PARAMS_CONFIG_TYPE) {
                wwnaConfigVarSetRecord = guidedContext.skill_config_var_sets[i];
            } else if(guidedContext.skill_config_var_sets[i].config_type === WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID) {
                generalDetailsVarSetRecord = guidedContext.skill_config_var_sets[i];
            }
            if(wwnaConfigVarSetRecord && generalDetailsVarSetRecord){
                break;
            }
        }
        api.setState('skillConfigId', guidedContext?.skill_config_id);
        api.setState('skillId',guidedContext?.skill_id);
        api.setState('generalDetails', generalDetailsVarSetRecord || {});
        api.setState('currentVarSetId', guidedContext.sysId);
        if (wwnaConfigVarSetRecord) {
            api.setState('wwnaConfigVarSetId', wwnaConfigVarSetRecord.sysId);
            let tabsData = wwnaConfigVarSetRecord.override_sets;
            tabsData = tabsData.map((tabObj, index) => {
                tabObj.label = tabObj.name;
                tabObj.id = tabObj['sys_id'];
                tabObj.index = index;
                return tabObj;
            });
            api.setState('tabs', tabsData);
        }
        api.setState('initialSetupDone', true);
    }
}
