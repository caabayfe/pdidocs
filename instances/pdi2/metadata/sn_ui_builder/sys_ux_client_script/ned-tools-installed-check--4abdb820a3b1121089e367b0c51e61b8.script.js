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

    /**
     * Using the passed `window` object, check if the browser is Chromium
     * and if the NED Tools are installed or not. Update the client state
     * variable on the page appropriately.
     */
    const check = (window) => {
        const isChromium = !!window.chrome;
        const toolsInstalled = window.SDT_INSTALLED === true;
        if (toolsInstalled) {
            api.setState('hideNedToolsBanner', true);
        } else if (isChromium) {
            api.setState('hideNedToolsBanner', false);
        }
    };

    // this `setTimeout` call is a workaround to get access to the `window` globals.
    helpers.timing.setTimeout(function() {
        check(this.window);
    }, 0);

    /*
     * This callback is similarbut given a 5-second lead for slower browsers.
     * 
     * At this point, we don't have a way to check if the devtools are done loading,
     * because they might not be there at all.
     */
    helpers.timing.setTimeout(function() {
        check(this.window);
    }, 5000);
}
