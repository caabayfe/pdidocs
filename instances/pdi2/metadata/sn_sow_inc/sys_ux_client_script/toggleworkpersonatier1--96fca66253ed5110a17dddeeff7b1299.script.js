/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { value } = event.payload;
    const landingPageUtils = imports['sn_sow_inc.SowIncidentLandingPageUtils']();
        
    const donutConfigParamCount = landingPageUtils.getDonutConfig.length;
    const donutConfig = (donutConfigParamCount === 3)
        ? await landingPageUtils.getDonutConfig(helpers, value[0], api.state.conditionalRecordCount)
        : await landingPageUtils.getDonutConfig(helpers, value[0], api.state.conditionalRecordCount, api);

    api.setState("donutConfig", donutConfig);

    if (donutConfig.length === 0) {
        const isYourWork = value[0] === "your_work";
        const headingLabel = isYourWork ?
                await helpers.translate("You don't have work assigned to you") :
                await helpers.translate("Your team doesn't have work assigned");
        const emptyState = {
            heading: {
                label: headingLabel,
                level: 3
            },
            content: isYourWork 
                ? await helpers.translate("View \"Your team's work\" to review work at your team's level") 
                : "",
            illustration: "completed-tasks",
            visibility: true
        };
        api.setState("emptyState", emptyState);
    }
}
