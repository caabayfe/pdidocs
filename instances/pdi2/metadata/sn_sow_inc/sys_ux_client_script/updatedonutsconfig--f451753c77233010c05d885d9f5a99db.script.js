/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    let translations = api.state.translations || {};
    if (Object.keys(translations).length == 0) {
        translations = {
            "Incidents assigned to you": await helpers.translate("Incidents assigned to you"),
            "Incidents assigned to your team": await helpers.translate("Incidents assigned to your team"),
            "Incident SLAs": await helpers.translate("Incident SLAs"),
            "Unassigned incidents": await helpers.translate("Unassigned incidents"),
            "Catalog tasks assigned to you": await helpers.translate("Catalog tasks assigned to you"),
            "Catalog tasks assigned to your team": await helpers.translate("Catalog tasks assigned to your team"),
            "New incidents assigned to you": await helpers.translate("New incidents assigned to you"),
            "In Progress incidents assigned to you": await helpers.translate("In Progress incidents assigned to you"),
            "On Hold incidents assigned to you": await helpers.translate("On Hold incidents assigned to you"),
            "Resolved incidents assigned to you": await helpers.translate("Resolved incidents assigned to you"),
            "P1 unassigned incidents": await helpers.translate("P1 unassigned incidents"),
            "P2 unassigned incidents": await helpers.translate("P2 unassigned incidents"),
            "P3 unassigned incidents": await helpers.translate("P3 unassigned incidents"),
            "P4 unassigned incidents": await helpers.translate("P4 unassigned incidents"),
            "P5 unassigned incidents": await helpers.translate("P5 unassigned incidents"),
            "Pending catalog tasks assigned to you": await helpers.translate("Pending catalog tasks assigned to you"),
            "Open catalog tasks assigned to you": await helpers.translate("Open catalog tasks assigned to you"),
            "Work in progress catalog tasks assigned to you": await helpers.translate("Work in progress catalog tasks assigned to you"),
            "New incidents assigned to your team": await helpers.translate("New incidents assigned to your team"),
            "In Progress incidents assigned to your team": await helpers.translate("In Progress incidents assigned to your team"),
            "On Hold incidents assigned to your team": await helpers.translate("On Hold incidents assigned to your team"),
            "Resolved incidents assigned to your team": await helpers.translate("Resolved incidents assigned to your team"),
            "Pending catalog tasks assigned to your team": await helpers.translate("Pending catalog tasks assigned to your team"),
            "Open catalog tasks assigned to your team": await helpers.translate("Open catalog tasks assigned to your team"),
            "Work in progress catalog tasks assigned to your team": await helpers.translate("Work in progress catalog tasks assigned to your team"),
            "Catalog tasks delegated to you": await helpers.translate("Catalog tasks delegated to you"),
            "Incidents delegated to you": await helpers.translate("Incidents delegated to you")
        };
        api.setState("translations", translations);
    }
    const landingPageUtils = imports['sn_sow_inc.SowIncidentLandingPageUtils']();
    var currentVizSelection = landingPageUtils.getInitialVisualizationConfig();
    if (translations.hasOwnProperty(currentVizSelection.title)) {
        currentVizSelection = { ...currentVizSelection,
            title: translations[currentVizSelection.title]
        };
    }
    api.setState("currentVizSelection", currentVizSelection);
    const workPersonaConfig = await landingPageUtils.getWorkPersonaConfig(helpers);
    api.setState("workPersonaConfig", workPersonaConfig);
    const defaultWorkPersona = workPersonaConfig.defaultSelected[0];

    if (api.state.donutConfig.length == 0) {
        const donutConfigParamCount = landingPageUtils.getDonutConfig.length;
        const donutConfig = (donutConfigParamCount === 3) ?
            await landingPageUtils.getDonutConfig(helpers, defaultWorkPersona, api.state.conditionalRecordCount) :
            await landingPageUtils.getDonutConfig(helpers, defaultWorkPersona, api.state.conditionalRecordCount, api);

        api.setState("donutConfig", donutConfig);

        if (donutConfig.length === 0) {
            const headingLabel = defaultWorkPersona === "your_work" ?
                await helpers.translate("You don't have work assigned to you") :
                await helpers.translate("Your team doesn't have work assigned");

            const contentLabel = defaultWorkPersona === "your_work" ?
                await helpers.translate("View \"Your team's work\" to review work at your team's level") :
                "";

            const emptyState = {
                heading: {
                    label: headingLabel,
                    level: 3
                },
                content: contentLabel,
                illustration: "completed-tasks",
                visibility: true
            };
            api.setState("emptyState", emptyState);
        }
    }
}
