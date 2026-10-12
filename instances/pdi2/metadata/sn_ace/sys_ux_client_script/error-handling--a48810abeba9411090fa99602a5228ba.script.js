/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	const {error} = event.payload;

    return {
        items: [{
            id: "failed-experience-creation",
            status: "critical",
            icon: "info-circle-outline",
			header: "App creation failed",
            content: JSON.stringify(error),
            action: {
                type: "dismiss"
            },
            expanded: true
        }]
    };
}
