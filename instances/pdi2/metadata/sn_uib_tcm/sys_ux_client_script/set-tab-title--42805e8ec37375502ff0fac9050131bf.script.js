/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
        const result = api.data.comm_task_details.result;
        const title = await helpers.translate("{0} - New Communication", result.number.value);

        if(result && result.number && result.number.value)
	        helpers.screen.updateStatus({ title: title });
}
