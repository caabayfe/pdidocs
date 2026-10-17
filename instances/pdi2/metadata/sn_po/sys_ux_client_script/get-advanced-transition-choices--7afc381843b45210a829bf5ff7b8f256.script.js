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
    if (event.elementId == 'get_transition_relation') {
        const eventuallyFollowedByLabel = await helpers.translate('At some point followed by');
        const directlyFollowedByLabel = await helpers.translate('Directly followed by');
        const TRANSITION_RELATION_LABELS = {
            'EVENTUALLY_FOLLOWED_BY': eventuallyFollowedByLabel,
            'FOLLOWED_BY': directlyFollowedByLabel,
        };
        const transitionRelations = event.payload.data.output.data.GlideChoiceColumn_Query.getChoiceFields;
        const items = transitionRelations.filter(choice => choice.rawValue !== "null").map(choice => ({
            id: choice.rawValue,
            label: TRANSITION_RELATION_LABELS[choice.rawValue] || choice.displayValue,
        }));
  
        api.setState('transitionRelations', items);

    } else {
        const advancedConditionTypes = event.payload.data.output.data.GlideChoiceColumn_Query.getChoiceFields;
        const items = advancedConditionTypes.filter(choice => choice.rawValue !== "null").map(choice => ({
            id: choice.rawValue,
            label: choice.displayValue,
        }));
        api.setState('advancedConditionTypes', items);
    }
}
