/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (!api.state.startWithTemplate) {
        api.data.create_promin_process_configuration_1.execute({
            table: api.state.selectedProcessTable.item.tableName,
            isContentPack: api.state.isContentPack,
        });
    } else {
        const processConfigRows = api.state.processConfigurationsList.rows;
        const foundIndex = processConfigRows.findIndex(row => row.cells.table.value === api.state.selectedProcessTable.item.tableName);
        if (foundIndex !== -1) {
            const errorMessage = await helpers.translate('Only one process configuration is allowed per table');
            api.setState('errorMessage', errorMessage);
            return;
        } else {
            api.data.copy_process_config.execute({
                table: api.state.selectedProcessTable.item.tableName,
            });
        }
    }

    api.setState('creatingNewConfigurationInprogress', true);
}
