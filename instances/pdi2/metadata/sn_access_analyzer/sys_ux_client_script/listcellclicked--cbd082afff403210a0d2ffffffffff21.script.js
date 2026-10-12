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
    // From the logs page, we click on a ref column to break out open the ACL record, in separate tab
    const cellContext = event.payload.cell;
    const {
        navigate
    } = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api, helpers);
    const redirectConfig = {
        route: null,
        fields: null,
        params: null,
        redirect: true,
        passiveNavigation: null,
        targetRoute: null,
        external: "nav_to.do?uri=" + cellContext.href,
        title: null
    }
    navigate(redirectConfig);
}
