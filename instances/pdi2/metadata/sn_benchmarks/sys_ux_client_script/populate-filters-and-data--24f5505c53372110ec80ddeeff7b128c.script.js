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
    var benchmarksUtils = imports['sn_benchmarks.BenchmarksUtils']();
    var result = api.data.get_benchmarks_data_1.output;
    var filteredIndicatorData = {};
    api.setState("optedIn", result.optedIn);
    api.setState("hideLoader", true);
    if (!result.optedIn)
        return;
    // populate groups/tabs based on db output
    var tabs = await benchmarksUtils.getCurrentTabs(result.groups, helpers);
    api.setState('tabs', tabs);
    if (result.breakdowns) {
        // populate category dropdown data
        var categories = result.categories;
        var categoriesDropDownData = await benchmarksUtils.getCategoryDropdown(categories);
        api.setState('categories', categoriesDropDownData);

        // populate cohort dropdown data
        var cohortsItems = await benchmarksUtils.getCohortDropdown(result.breakdowns, helpers);
        api.setState("cohort", cohortsItems);
    }

    if (api.context.props.category)
        api.setState('selectedCategory', api.context.props.category);

    var initialGroup = "all";
    if (api.context.props.selectedTabIndex) {
        initialGroup = tabs[api.context.props.selectedTabIndex]["id"];
        var tabLabel = tabs[api.context.props.selectedTabIndex]["label"];
        api.setState("selectedTabLabel", tabLabel);
    }

    filteredIndicatorData = await benchmarksUtils.getCurrentFilteredData(initialGroup, api.data.get_benchmarks_data_1.output);
    api.setState("filteredIndicatorData", filteredIndicatorData);
    api.setState("detailsHeaderInfo", {
        "month": filteredIndicatorData.month,
        "industry": filteredIndicatorData.industry,
        "region": filteredIndicatorData.region,
        "sizeBucket": filteredIndicatorData.sizeBucket
    });
}
