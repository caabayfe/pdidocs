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
            if (keyToUpdate === 'orderFieldErrorMessage') {
                translatedMessage = await helpers.translate('Please enter a valid whole number.')
            }
            
            if (translatedMessage && keyToUpdate) {
                let contentObj = {
                    content: translatedMessage,
                    status: "critical",
                    icon: "circle-exclamation-outline"
                }
                
                api.setState(keyToUpdate, [contentObj]);
            }
        }

    }

    let guidedDummyData = {};
    let guidedContext = api.context?.props?.payload?.guided_context || guidedDummyData;
    if (!api.state.initialSetupDone) {
        if (!api.state.skillConfigId && guidedContext['skill_config_id']) {
            api.setState('skillConfigId', guidedContext['skill_config_id']);
        }
        let skillConfigName = guidedContext.name || guidedContext.skill_config_title;
        let skillConfigDescription = guidedContext.description || guidedContext.skill_description;
        let workflowName = guidedContext.skill_family_parent_name;
        let productName = guidedContext.skill_family_name;
        api.setState('productName', productName || '');
        api.setState('workflowName', workflowName || '');
        api.setState('skillConfigName', skillConfigName);
        api.setState('skillConfigDescription', skillConfigDescription);
        api.setState('skillConfigOrder', guidedContext.skill_config_order);
        guidedContext = guidedContext.skill_config_var_sets || [];
        let varSetLength = guidedContext.length;
        let generalDetails, actionTemplate;
        for (let i = 0; i < varSetLength; i++) {
            let variableSetObj = guidedContext[i];
            if (variableSetObj.config_type === "5a2bfda3935952104d0a423b92891800") {
                generalDetails = JSON.parse(JSON.stringify(variableSetObj));

            } else if (variableSetObj.config_type === "8c9697d7a38a421075d1d78446fcda50") {
                actionTemplate = variableSetObj;
            }
            if (generalDetails && actionTemplate) {
                break;
            }
        }
        if (!api.state.actionTemplateVarSetId && actionTemplate?.sysId) {
            api.setState('actionTemplateVarSetId', actionTemplate.sysId);
            if (generalDetails.props?.config_type === 'single_occurence' && actionTemplate.override_sets?.length && actionTemplate.override_sets[0].props?.variant) {
                api.setState('variantType', actionTemplate.override_sets[0].props?.variant);
            }

        }

        if (generalDetails) {
            let tableName = generalDetails.props['table'];

            api.setState('generalDetails', generalDetails);
            if (generalDetails.props) {
                if (generalDetails.props['config_type']) {
                    api.setState('configType', generalDetails.props['config_type']);
                }


                if (tableName) {
                    api.setState('tableName', tableName);
                    api.setState('searchTerm', `name=${tableName}`);
                }
                let componentIds = generalDetails.props['component_ids'].split(',');
                if (generalDetails.props['component_ids']) {
                    api.setState('componentIds', componentIds);
                }

            }

        }
        api.setState('initialSetupDone', true);
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true,
            action: null,
            nonBlocking: false
        });
    }
    translateAndSaveMessages('orderFieldErrorMessage');
    
}
