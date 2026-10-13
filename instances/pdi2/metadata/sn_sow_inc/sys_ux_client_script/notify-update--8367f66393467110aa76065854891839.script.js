/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    /*
    Display a message as a banner on the page
    */
    console.log(event.payload);
    if (event.payload && event.payload.errors && event.payload.errors.length) {
        for(const error of event.payload.errors) {
            showBanner(error, "critical", "circle-exclamation-outline");
        }
        return;
    }

    // Display error on ACL failure 
    if (event.payload && event.payload.data && event.payload.data.output && event.payload.data.output.status != 200 && event.payload.data.output.message) {
        showBanner(event.payload.data.output.message, "critical", "circle-exclamation-outline");
        return;
    }
    showBanner(event.payload.data.output.message, "positive", "circle-check-outline");
    
    function showBanner(content, status, icon) {
        const id = Math.ceil(Math.random() * 1000);
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: `alert12342${id}`,
                status,
                icon,
                content,
                action: {
                    type: "dismiss"
                }
            }],
        });
        helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#CLEAR_NOTIFICATIONS", {}), 3000);
    }
}
