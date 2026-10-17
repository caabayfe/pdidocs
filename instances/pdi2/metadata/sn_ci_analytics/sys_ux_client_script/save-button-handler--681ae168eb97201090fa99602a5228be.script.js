/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        getMinifiedFunnelData,
        validateDuplicateSteps
    } = imports['sn_ci_analytics.VAFunnelUtils']();
    const {
        validateConditionBuilderInputs
    } = imports['sn_ci_analytics.VAConditionBuilderUtils']();
    const {
        steps,
        funnelName
    } = api.state;

    if(!funnelName){
        api.setState('invalidInput',true);
        return;
    }

    const updatedSteps = JSON.parse(JSON.stringify(steps));
    if (!validateSteps(updatedSteps)) {
        api.setState('steps', updatedSteps);
        return;
    }

    const duplicateStepsValidation = validateDuplicateSteps(steps);
    if (!duplicateStepsValidation.success) {
        const translation = api.data.analytics_locale_get_list_1.output;
        let errorMsg = translation ? translation.duplicateStepError :
            api.state.translations.duplicateStepError;
        errorMsg = errorMsg.replace('{0}', duplicateStepsValidation.steps[0]);
        errorMsg = errorMsg.replace('{1}', duplicateStepsValidation.steps[1]);
        api.setState('errorMessage', errorMsg);

        return;
    }

    const processedSteps = getMinifiedFunnelData(api.state.steps);
    const data = {
        steps: api.state.steps,
        funnelName: api.state.funnelName,
        processedSteps
    };
    let payload = {};
    if (api.context.props.funnelId) {
        data.funnelId = api.context.props.funnelId;
        payload.update = data;
    } else {
        payload.create = data;
    }
    
    api.data.funnel_api.execute({payload});

    function validateSteps(steps) {
        if (!(steps && steps.length > 0))
            return false;

        let isValid = true;
        steps.forEach(step => {
            const {
                comparisonModel
            } = step;
            isValid = isValid && validateConditionBuilderInputs(comparisonModel);
        });

        return isValid;
    }
}
