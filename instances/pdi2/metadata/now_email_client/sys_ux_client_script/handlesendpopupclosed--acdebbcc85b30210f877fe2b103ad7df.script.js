/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
* @param {Window} params.window
* @param {Document} params.document
*/
function handler({api, event, helpers, imports}) {

    helpers.timing.setTimeout(function() {
        // Accessing the current window (which is the popup window)
        const popupWindow = this.window; 
        popupWindow.close();
    }, 0);
}
