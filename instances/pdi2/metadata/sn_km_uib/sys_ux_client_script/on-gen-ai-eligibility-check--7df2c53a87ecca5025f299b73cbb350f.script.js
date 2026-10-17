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
    if (api.state.isGenAiSuggested)
        return;

    if (event.name === 'DATA_FETCH_SUCCEEDED') {
        var answer = api.data.check_gen_ai_eligibility_1.output;
        if (answer.eligible && !api.state.isGeneratingMergeDuplicates && !api.context.props.duplicateSysIds) {
            helpers.modal.open('modal_gen_ai');
            var filters = [];
            for (var f in answer.availableTaskFilters) {
                filters.push({
                    id: f,
                    label: answer.availableTaskFilters[f].label
                });
            }
            api.setState('availableTaskFilters', filters);
            const defaultFilter = filters.length ? filters[0] : {};
            api.setState('defaultTaskFilters', [defaultFilter.id]);
            if (defaultFilter.id) {
                api.setState('searchFilters', defaultFilter.id);
            }
            
            api.setState('isGenAiSuggested', true);
        }
        if (answer.timeout) {
            api.setState('genAiTimeout', answer.timeout);
        }
    }
}
