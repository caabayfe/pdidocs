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
    const {
        table: {
            displayValue,
            value,
        },
        content_pack: {
            value: contentPackValue,
        }
    } = api.data.look_up_process_config_record.result;

    helpers.screen.updateStatus({
        title: await helpers.translate('{0} | Process configuration', displayValue),
    });

    api.setState('processTable', value);
    api.setState('isContentPack', Boolean(contentPackValue));
    
    if(api.context.props.activeTab){
        api.setState('activeTab', api.context.props.activeTab);
    }
}
