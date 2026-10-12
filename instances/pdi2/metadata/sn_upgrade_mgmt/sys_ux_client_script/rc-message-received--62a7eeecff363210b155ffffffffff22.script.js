/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const data = event.payload.data;

    console.log("Message received ", data);
    // Not a change message
    if (data.action !== 'change') {
        return;
    }
    
    const record = data.record;
    if (record.state && (record.state.display_value != "Running" && record.state.display_value != "Pending")) {
        console.log("Execution complete");
        api.data.record_watcher_1.unsubscribe();
    }

    if (record.percent_complete) {
        console.log("Message received with percent_complete ", percent_complete);
    }
}
