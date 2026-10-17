/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //var parFiltersVar = api.state.parFilters; Tech Debt : parFilters is always having redundant data. Need to revisit once component/UIB team fixes it.
    var parFiltersVar = [];
    const { appliedFilters } = event.payload;
    if (appliedFilters && appliedFilters.length > 0 && appliedFilters[0]) {
        parFiltersVar = appliedFilters;
    }
    var DateFilterVar = parFiltersVar.filter(pf => pf.type === "date");
        if (DateFilterVar && DateFilterVar.length > 0 && DateFilterVar[0].start && DateFilterVar[0].end) {
            var customDateFilter ="sys_created_onBETWEENjavascript:gs.dateGenerate('"+ DateFilterVar[0].start +"','00:00:00')@javascript:gs.dateGenerate('"+ DateFilterVar[0].end +"','23:59:59')";
            api.setState('dataEgressDateFilterConitions', customDateFilter);
            api.setState('dataEgressApiFilterConditions', 'source=APIREST^ORsource=APIJSONV2^ORsource=APISOAP^'+customDateFilter);
            api.setState('dataEgressExportFilterConditions', 'source=EXPORTURI^ORsource=EXPORTSET^'+customDateFilter);
            api.setState('filterParamForOverviewPie', 'source=APIREST^ORsource=APIJSONV2^ORsource=APISOAP^ORsource=EXPORTURI^ORsource=EXPORTSET^'+customDateFilter);
            api.setState('filterParamForApi', 'source=APIREST^ORsource=APIJSONV2^ORsource=APISOAP^'+customDateFilter);      
        } else {
            api.setState('dataEgressDateFilterConitions', '');
            api.setState('dataEgressApiFilterConditions', 'source=APIREST^ORsource=APIJSONV2^ORsource=APISOAP^sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfYesterday()');
            api.setState('dataEgressExportFilterConditions', 'source=EXPORTURI^ORsource=EXPORTSET^sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfYesterday()');
            api.setState('filterParamForOverviewPie', 'source=APIREST^ORsource=APIJSONV2^ORsource=APISOAP^ORsource=EXPORTURI^ORsource=EXPORTSET^sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfYesterday()');
            api.setState('filterParamForApi', 'source=APIREST^ORsource=APIJSONV2^ORsource=APISOAP^sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfYesterday()');

        }
}
