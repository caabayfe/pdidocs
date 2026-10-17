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

    async function translateAndSaveMessages(keyToUpdate) {
        if (!api.state[keyToUpdate]?.length) {
            let translatedMessage = '';
            if (keyToUpdate === 'presetActionAlertMessages') {
                translatedMessage = await helpers.translate('In-active actions selected as part of trigger actions will not be shown in Now Assist')
            } else if (keyToUpdate === 'refineActionAlertMessages') {
                translatedMessage = await helpers.translate('In-active actions selected as part of refine actions will not be shown in Now Assist')
            } else if (keyToUpdate === 'ctActionAlertMessages') {
                translatedMessage = await helpers.translate('In-active actions selected as part of dialog actions will not be shown in Now Assist')
            } else if(keyToUpdate === 'defaultActionAlertMessages'){
                translatedMessage = await helpers.translate('In-active action selected as part of default action will not be invoked in Now Assist')
            } else if(keyToUpdate === 'triggerActionAlertMessage'){
                translatedMessage = await helpers.translate('Select at least one active trigger action')

            }
            if (translatedMessage && keyToUpdate) {
                let contentObj = {
                    content: translatedMessage,
                    status: "warning",
                    icon: "circle-exclamation-outline"
                }
                if(keyToUpdate === 'triggerActionAlertMessage'){
                    contentObj.status = "critical";
                }
                api.setState(keyToUpdate, [contentObj]);
            }
        }

    }

    const WWNA_CONFIG_TYPE_ID = "8c9697d7a38a421075d1d78446fcda50";
    const GENERAL_DETAILS_TYPE_ID = "5a2bfda3935952104d0a423b92891800";
    let dummyGuidedContext = {};
    if (!api.state.initialSetupDone) {
        var guidedContext = api?.context?.props?.payload?.guided_context || dummyGuidedContext;
        var wasDataManuallyRefreshed = guidedContext?.wasDataManuallyRefreshed || false;
        if (!api.state.firstTimeSetupDone && !wasDataManuallyRefreshed) {
            api.emit('ACE_ACTION_PERFORMED', {
                eventName: 'SN_NS_ADMIN_REFRESH_GUIDED_STEP_DATA',
                eventPayload: {
                    varSetId: guidedContext?.sysId
                }
            });
            api.setState('firstTimeSetupDone', true);
        }
        if (!api.state.currentVarSetId && guidedContext.sysId) {
            api.setState('currentVarSetId', guidedContext.sysId);
        }
        let skillConfigId = guidedContext['skill_config_id'];
        let nacmConfig = {};
        nacmConfig.skill_config_id = skillConfigId;
        nacmConfig.skill_id = guidedContext['skill_id'];
        nacmConfig.skill_name = guidedContext.skill_name || guidedContext.name;
        nacmConfig.skill_description = guidedContext.skill_description;
        nacmConfig.user_sys_id = api.context?.user?.sys_id;
        nacmConfig.is_wwna_active = true;
        nacmConfig.variable_sets = [];
        api.setState('nacmConfig', nacmConfig);

        guidedContext = guidedContext.skill_config_var_sets || [];

        let varSetLength = guidedContext.length;
        let generalDetails, actionTemplate;
        for (let i = 0; i < varSetLength; i++) {
            let variableSetObj = JSON.parse(JSON.stringify(guidedContext[i]));
            if (variableSetObj.config_type === GENERAL_DETAILS_TYPE_ID) {
                generalDetails = variableSetObj;

            } else if (variableSetObj.config_type === WWNA_CONFIG_TYPE_ID) {
                actionTemplate = variableSetObj;
            }
            if (generalDetails && actionTemplate) {
                break;
            }
        }
        let tableName;

        if (!api.state.skillConfigId && skillConfigId) {
            api.setState('skillConfigId', skillConfigId);
        }
        
        if (!api.state.generalDetails?.sysId && generalDetails?.sysId) {
            api.setState('generalDetails', generalDetails);
            tableName = generalDetails.props?.table;
            let configuredColumns = (generalDetails.props?.configured_columns || '').split(',');
            api.setState('tableName', tableName);
            if(generalDetails.props?.config_type === api.state.CONFIG_TYPE.TABLE){
                api.setState('configuredColumns', configuredColumns);
            }
            
        }

        if (!api.state.actionConfig && actionTemplate?.sysId) {
            api.setState('actionConfig', actionTemplate);
        }

        

        api.setState('initialSetupDone', true);
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            action: null,
            nonBlocking: false
        });
    }
    translateAndSaveMessages('presetActionAlertMessages');
    translateAndSaveMessages('refineActionAlertMessages');
    translateAndSaveMessages('ctActionAlertMessages');
    translateAndSaveMessages('defaultActionAlertMessages');
    translateAndSaveMessages('triggerActionAlertMessage');
}
