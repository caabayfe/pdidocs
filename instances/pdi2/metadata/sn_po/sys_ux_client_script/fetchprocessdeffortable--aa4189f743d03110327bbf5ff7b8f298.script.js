/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const table = api.data?.get_project_entities?.results[0]?.table?.value;
    if (!table) {
        api.setState('totalFindingsCount',0);
        api.setState('overlayMessage', {
            type: 'message',
            showColumnHeaders: true,
            messageConfig: {
                illustration: 'no-data',
                heading: {
                    label: await helpers.translate('Project not found'),
                    level: 5,
                },
            },
        });
        return;
    }
    api.setState('processDefQuery', table);
    api.data.get_process_definition.refresh();

}
