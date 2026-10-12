/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let data = api.data.get_benchmark_indicators_category_and_data_1.output;
    let kpiName;
    let kpiDescription;
    for (let i = 0; i < data.length; i++) {
        if (data[i]['sys_id'] == api.context.props.category) {
            kpiName = data[i]['name'];
            kpiDescription = await helpers.translate("Review the list of KPIs available for benchmarking with {0}. Benchmarking KPI available for {1}.", kpiName, data[i]['groups']);
        }
    }
    await api.setState("selectedKPICategory",kpiName);
    await api.setState("kpiDescription",kpiDescription);

    api.emit("REFRESH_VIEWPORT",{});
}
