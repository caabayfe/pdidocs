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
    try {
        const recordGeneratorObject = {
            id: '-1',
            label: await helpers.translate('New Record'),
            sublabel: await helpers.translate('Playbook Record Generator')
        };
        
        api.setState('record_generator_object', recordGeneratorObject);
    } catch (err) {
        console.error(err);
    }
}
