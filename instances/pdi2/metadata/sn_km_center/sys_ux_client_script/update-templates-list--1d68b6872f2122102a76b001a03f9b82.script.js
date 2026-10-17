/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    event,
    imports,
    helpers
}) {
    const {
        filterAndMapList
    } = imports["sn_km_center.filterAndMapListUtil"]();
    const templateList = api.data &&
        api.data.article_templates_by_knowledgebase &&
        api.data.article_templates_by_knowledgebase.output &&
        api.data.article_templates_by_knowledgebase.output.data &&
        api.data.article_templates_by_knowledgebase.output.data.schema &&
        api.data.article_templates_by_knowledgebase.output.data.schema["function"];
    
    const isEmpty = !templateList || templateList.length === 0;
    api.setState("showEmptyTemplatePreview", isEmpty);
    
    let filteredKnowledgeTemplates = [];
    const filterString = event && event.payload && event.payload.fieldValue ? event.payload.fieldValue : "";
    if (templateList) {
        filteredKnowledgeTemplates = filterAndMapList(templateList, filterString);
    }
    api.setState("kbTemplateList", filteredKnowledgeTemplates);

    // Check if Standard template is enabled for duplicate merge
    const params = api.state?.interceptorExtraParams;
    if (params?.sourcePage === "duplicatesMerge") {
        const hasStandardTemplate = filteredKnowledgeTemplates.some(
            (template) => template.id === "kb_knowledge"
        );
        api.setState("showStandardTemplateError", !hasStandardTemplate);
    } else {
        api.setState("showStandardTemplateError", false);
    }

    const isTemplateActive = filteredKnowledgeTemplates.some(
        template => template.id === api.state.template
    );
    if (!isTemplateActive) {
        api.setState("template", null);
    }

    if (api.state && api.state.interceptorExtraParams && api.state.interceptorExtraParams["kb-template"]) {
        imports["sn_km_center.Article Preview"]({
            api,
            event
        });
    }
}
