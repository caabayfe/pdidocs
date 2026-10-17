/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {getAnalyzedForDisplayVal} = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
    const analyzedForDisplayVal = getAnalyzedForDisplayVal(api.data.request_resource.result);
    api.setState("resultTitle", await helpers.translate("Permissions for {0}", analyzedForDisplayVal));
    
    const userDate = api.data.request_resource.result.last_run.displayValue;
    const systemDateFormat = api.context.session.user.dateFormat;

    api.setState("lastRunResultsEncQuery", getLastRunResultsEncQuery(userDate, systemDateFormat));
    
    api.data.last_run_results.refresh();
    api.data.time_limited_roles.refresh();

    function getLastRunResultsEncQuery(inputDate, inputFormat) {
        return `access_analyzer_request=${api.context.props.requestId}^execution_time>=javascript:(function(){
                var gdt = new GlideDateTime();
                gdt.setDisplayValue('${inputDate}', '${inputFormat}');
                var standardFormat = gdt.getDisplayValueInternal();
                var parts = standardFormat.split(' ');
                return gs.dateGenerate(parts[0], parts[1]);
            })()`;
    }
}
