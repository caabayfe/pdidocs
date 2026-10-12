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
    if (event.elementId != "viewport_isl" || (event.elementId == "viewport_isl" && event.payload.isInitialPageLoad == false)) {
        let detailsCurrentSelectionInfo = api.state.detailsCurrentSelectionInfo;
        let benchmarksUtils = imports['sn_benchmarks.BenchmarksUtils']();
        if (event.elementId == "category_dropdown") {
            api.emit("CONTENT_UPDATED", {
                params: {
                    selectedTabIndex: 0,
                    category: event.payload.value[0]
                }
            });
            api.setState('selectedCategory', event.payload.value[0]);
            detailsCurrentSelectionInfo.categoryLabel = event.payload.items[0].label;
            detailsCurrentSelectionInfo.category = event.payload.value[0];
            api.setState('detailsCurrentSelectionInfo', detailsCurrentSelectionInfo);
        } else if (event.elementId == "cohort_dropdown") {
            api.setState('selectedCohortType', event.payload.items[0].cohort);
            api.setState('selectedCohortID', event.payload.items[0].id);
            detailsCurrentSelectionInfo.cohort = event.payload.items[0].id;
            if (event.payload.items[0].cohort == 'sn_bm_company_similar') {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'alert_similar_company',
                        status: 'positive',
                        icon: 'check-circle-outline',
                        content: api.state.indicatorData.i18n.alertSimilarCompany,
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
            }
            api.setState('detailsCurrentSelectionInfo', detailsCurrentSelectionInfo);
        } else if (event.elementId == "viewport_isl") { // tab click
            api.emit("CONTENT_UPDATED", {
                params: {
                    selectedTabIndex: event.payload.selectedTabIndex,
                    category: api.context.props.category
                }
            });
            api.setState("selectedTabLabel", event.payload.selectedTabLabel);
            let filteredIndicatorData = await benchmarksUtils.getCurrentFilteredData(api.state.tabs[event.payload.selectedTabIndex].id, api.data.get_benchmarks_data_1.output);
            api.setState("filteredIndicatorData", filteredIndicatorData);
        }
    }
}
