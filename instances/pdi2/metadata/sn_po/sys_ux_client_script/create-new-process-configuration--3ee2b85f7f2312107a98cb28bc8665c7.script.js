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
    const { selectedEntity, createUsingContentPack } = api.state;

    // copy existing content pack to new process config
    if (createUsingContentPack) {
        api.data.copy_process_config.execute({
            table: selectedEntity.table.value,
        });
    } else {
        // insert new
        api.data.create_promin_process_configuration.execute({
            table: selectedEntity.table.value,
            isContentPack: false,
        });
    }
}
