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
        projectPermissions: pp,
        projectTemplateDetails: pt
    } = api.state;
    return !(pt.isTemplate && pp.promin_project.fields.is_template.canWrite);
}
