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
    if (api.state.miftoggle === true) {
        api.setState("loader", true);
        api.setState("currentcontainer","");
        helpers.timing.setTimeout(() => {
            api.setState("loader", false);
                    api.setState("currentcontainer", "step2");

        }, 2000);


    } else {
        api.setState("loader",false);
    }
}
