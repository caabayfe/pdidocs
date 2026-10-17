/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const categoryKPIs = api.data.get_process_category_kpis?.output?.data?.GlidePromin_Query?.configuration?.process?.categoryKpis;

    if (!Array.isArray(categoryKPIs)) {
        return;
    }

    const categoryKPIsMap = categoryKPIs.reduce((acc, cKPI) => {
        acc[cKPI.category] = cKPI;
        return acc;
    }, {});

    api.setState('categoryKPIsMap', categoryKPIsMap);
}
