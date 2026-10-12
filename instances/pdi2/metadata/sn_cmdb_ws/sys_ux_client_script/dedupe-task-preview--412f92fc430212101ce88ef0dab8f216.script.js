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
    const {
        templateId
    } = api.context.props;
    const {
        testSelectedTaskId
    } = api.state;
    api.data.de_duplication_template_preview.execute({
        taskId: testSelectedTaskId,
        templateSysId: templateId
    });
}
