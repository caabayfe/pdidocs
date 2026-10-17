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
    let categoryCollapseStatus = {};
    let categoryWeightCollapseStatus = {};

    let categorizedAppsList = api.context.props.categorizedAppsList;
    let nextUpAppFound = false;
    for (let i = 0; i < categorizedAppsList.length; i++) {
        let {
            weightedApplications,
            maturity
        } = categorizedAppsList[i];

        // All categories are collapsed by default
        categoryCollapseStatus[maturity] = true;
        for (let j = 0; j < weightedApplications.length; j++) {
            let {
                isCollapsed,
                applications,
                weight
            } = weightedApplications[j];
            categoryWeightCollapseStatus[`${maturity}-${weight}`] = isCollapsed;
            if (nextUpAppFound)
                continue;
            let nextUpAppFromApplications = applications.filter(application => application.applicationId === api.context.props.nextUpApplicationId);
            if (nextUpAppFromApplications.length > 0) {

                // A category is expanded if it contains the next up app
                categoryCollapseStatus[maturity] = false;
                nextUpAppFound = true;

            }
        }
    }
    api.setState('categoryCollapseStatus', JSON.stringify(categoryCollapseStatus));
    api.setState('categoryWeightCollapseStatus', JSON.stringify(categoryWeightCollapseStatus));
}
