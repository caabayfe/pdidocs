/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState('report_state', {
        illustration: 'first-time-user',
        heading: {
            label: await helpers.translate('Loading'),
            level: 3,
        },
        content: await helpers.translate('Running automation report'),
        actions: []
    });
    api.setState('report_hidden', true);
    api.setState('status_hidden', false);
}
