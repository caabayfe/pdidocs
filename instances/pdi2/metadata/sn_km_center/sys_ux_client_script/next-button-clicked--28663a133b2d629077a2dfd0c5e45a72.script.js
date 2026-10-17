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
    if (api.state.hasNavigatedToFormPage) {
    return;
    }
    api.setState('hasNavigatedToFormPage', true);
    let query = (api.data.kb_processor?.processor?.tableAndQuery?.query ?? "")
            + (api.state?.interceptorQueryParam ? "^" + api.state.interceptorQueryParam : "");

    // FIX DEF0807129: inject source= so platform auto-populates source_task on form load
    if (api.context.props.gapsSysIds && api.data.kb_processor?.processor?.gapSourceSysId) {
        query += "^source=" + api.data.kb_processor.processor.gapSourceSysId;
    }

    const params = { "query": query };
    if (api.context.props.gapsSysIds) {
        params["extraParams"] = `gapsSysIds:${api.context.props.gapsSysIds}:`;
    }

    if (api.state.duplicateArticleIds) {
        params["duplicateSysIds"] = api.state.duplicateArticleIds
        params["isGeneratingMergeDuplicates"] = "true"
    }
    var templatesEnabled = api.data.kb_processor?.processor?.canContributeToTemplates;
    const fields = {
        "table": ((templatesEnabled == true) && api.state.template && api.state.template != "") ? api.state.template : "kb_knowledge",
        "sysId": "-1"
    };
    if (api.data.kb_processor?.processor?.shouldUseItsmKcsFlow) {
        if (!api.data.kb_processor.processor.tableAndQuery.tableName) {
            fields.table = "kb_template_incident_kcs_article_html";
        } else {
            fields.table = api.data.kb_processor.processor.tableAndQuery.tableName;
        }
        if (!params.query || (params.query && params.query === 'null')) {
            params.query = "source=" + api.state?.sourceId;
        }
    }

    // Close current tab
    api.emit('SCREEN_STATUS_CHANGED', {
        status: 'closed',
        skipNextScreenActivation: true
    });

    function getTargetRoute() {
        try {
            var fnConstr = (function() {}).constructor;
            var window = fnConstr('return this')();
            var isSubTab = window.location.href.indexOf('/sub/kb_interceptor') > -1;
            return isSubTab ? "current" : undefined;
        } catch (e) {
            console.warn('Unable to detect sub-tab context: ' + e.message);
            return undefined;
        }
    }
    
    // Navigate to record page
    api.emit('NAV_ITEM_SELECTED', {
        route: "record",
        multiInstField: "sysId",
        fields,
        params,
        targetRoute: getTargetRoute()
    });
}
