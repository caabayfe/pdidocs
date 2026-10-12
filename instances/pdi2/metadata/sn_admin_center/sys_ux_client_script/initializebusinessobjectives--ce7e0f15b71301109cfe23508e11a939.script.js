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
        const resource = await helpers.snHttp('/api/sn_admin_center/adminx/business_objectives', {
            method: 'GET',
            batch: false
        });
        const {result} = resource.response;
        let businessObjectivesData = [];
        for (let businessObjective of Object.keys(result))
            businessObjectivesData.push(result[businessObjective]);

            api.setState('business_objectives_data', businessObjectivesData);
    } catch ({error}) {
        console.error(error);
    }
}
