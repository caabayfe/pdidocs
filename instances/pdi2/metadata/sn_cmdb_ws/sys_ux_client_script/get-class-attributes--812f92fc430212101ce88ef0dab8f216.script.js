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
        templateTable
    } = api.context.props;
    api.data.de_duplication_get_class_attributes.execute({
        'class': templateTable
    });
}
