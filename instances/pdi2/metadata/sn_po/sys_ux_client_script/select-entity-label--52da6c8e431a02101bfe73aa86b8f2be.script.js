/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        TABLE,
        EXTERNAL_DATA,
        REPORT_SOURCE,
        ARCHIVED_DATA,
        AGENTIC_AI_DATA,
        PLAYBOOK_DATA
    } = api.state.SOURCE_TYPES;
    const sourceType = api.state.entityForm.fields.sourceType.selectedValue;

    if (sourceType === TABLE || sourceType === PLAYBOOK_DATA)
        return helpers.translateSync('Table');
    else if (sourceType === EXTERNAL_DATA)
        return helpers.translateSync('External data');
    else if (sourceType === REPORT_SOURCE)
        return helpers.translateSync('Report source');
    else if (sourceType === ARCHIVED_DATA)
        return helpers.translateSync('Archived data');
    else if (sourceType === AGENTIC_AI_DATA)
        return helpers.translateSync('Agentic AI data');

    return '';
}
