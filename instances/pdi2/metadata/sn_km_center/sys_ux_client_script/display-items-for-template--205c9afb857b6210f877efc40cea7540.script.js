/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const state = api?.state;
    const params = state?.interceptorExtraParams;
    const templates = state?.kbTemplateList ?? [];

    // Called from duplicates merge → Only show standard templates
    if (params?.sourcePage === "duplicatesMerge") {
        return templates.filter(
            (item) => item.id === "kb_knowledge"
        );
    }

    // Restricted by kb-template parameter
    if (params?.["kb-template"]) {
        const kbTemplateId = params["kb-template"];
        return templates.filter((item) => item.id === kbTemplateId);
    }

    return templates;
}
