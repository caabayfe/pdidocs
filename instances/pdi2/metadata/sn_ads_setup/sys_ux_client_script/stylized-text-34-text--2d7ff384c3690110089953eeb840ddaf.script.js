/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    let result = helpers.translateSync('Taking you to the next category... ');
    let setupSummary = api.data.get_setup_summary_1.output;
    if (!setupSummary) {
        return;
    }
    
    let allCategories = setupSummary.result.setup.steps;
    let indexOfCurrCategory = allCategories.findIndex(category => category.id == api.context.props.categoryId);
    
    if(indexOfCurrCategory + 1 <= allCategories.length - 1) {
        let nextCategory = allCategories[indexOfCurrCategory + 1].name;
        result += nextCategory;
        return result;
    }
    return result;
}
