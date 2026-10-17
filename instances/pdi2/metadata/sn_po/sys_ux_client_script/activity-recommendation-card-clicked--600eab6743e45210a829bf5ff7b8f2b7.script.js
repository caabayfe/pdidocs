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

    const selectedRecommendedActivity = event.context.item.value;
    api.setState('selectedRecommendedActivity', selectedRecommendedActivity);
    const filteredActivityRecommendations = api.state.filteredActivityRecommendations.map(item => {
        if (item.id == selectedRecommendedActivity.id) {
            return { ...item,
                selected: true
            };
        }
        return { ...item,
            selected: false
        };
    });
    api.setState('filteredActivityRecommendations', filteredActivityRecommendations);
}
