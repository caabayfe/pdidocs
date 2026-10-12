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
    let filterdProjectEntities = api.data.look_up_records_1.results;
    filterdProjectEntities = filterdProjectEntities.map((data) => data.project.value);
    if (filterdProjectEntities.length == 0) {
        api.setState('templateId', '');
         const templateListQuery = filterdProjectEntities.join();
        api.data.list_controller.updateQuery({
            encodedQuery: `sys_idIN${templateListQuery}`,
        });
        api.setState('noDataMessage', {
            type: 'message',
            showColumnHeaders: true,
            messageConfig: {
                illustration: 'no-data',
                heading: {
                    label: 'No data found',
                    level: 5,
                },
                content: await helpers.translate(`No templates found for table {0}`, api.state.selectedSourceLabel),
            },
        }, );
    } else {
        api.setState('noDataMessage', {});
        const templateListQuery = filterdProjectEntities.join();
        api.data.list_controller.updateQuery({
            encodedQuery: `sys_idIN${templateListQuery}`,
        });
    }
}
