/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const result = api.data.get_service_and_offering?.output?.serviceAndOffering || [];

    const serviceAndOffering = result.map((d) => {
        const {
            count,
            label,
            table,
            filter 
        } = d;
        return {
            score: [{
                data: [
                    {
                        value: count
                    }
                ],
                metadata: {
                    format: {
                        precision: 0,
                        unitFormat: "{0}"
                    }
                }
            }],
            list: {
                table,
                filter,
                title: label
            },
            ...d
        };
    });
    api.setState("serviceAndOffering", serviceAndOffering);
}
