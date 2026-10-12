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
    const landingPageUtils = imports['sn_sow_itsm_common.SOWLandingPageTier2Utils']();
    const workPersonaConfig = await landingPageUtils.getWorkPersonaConfig(helpers);
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
    
    let translations = api.state.translations || {};
    if (Object.keys(translations).length == 0) {
        translations = {
            "Incidents assigned to you": await helpers.translate("Incidents assigned to you"),
            "Incidents assigned to your team": await helpers.translate("Incidents assigned to your team"),
            "Problems assigned to you": await helpers.translate("Problems assigned to you"),
            "Problems assigned to your team": await helpers.translate("Problems assigned to your team"),
            "Changes assigned to you": await helpers.translate("Changes assigned to you"),
            "Changes assigned to your team": await helpers.translate("Changes assigned to your team"),
            "Tasks assigned to you": await helpers.translate("Tasks assigned to you"),
            "Tasks assigned to your team": await helpers.translate("Tasks assigned to your team"),
            "New incidents assigned to you": await helpers.translate("New incidents assigned to you"),
            "In Progress incidents assigned to you": await helpers.translate("In Progress incidents assigned to you"),
            "On Hold incidents assigned to you": await helpers.translate("On Hold incidents assigned to you"),
            "Resolved incidents assigned to you": await helpers.translate("Resolved incidents assigned to you"),
            "New incidents assigned to your team": await helpers.translate("New incidents assigned to your team"),
            "In Progress incidents assigned to your team": await helpers.translate("In Progress incidents assigned to your team"),
            "On Hold incidents assigned to your team": await helpers.translate("On Hold incidents assigned to your team"),
            "Resolved incidents assigned to your team": await helpers.translate("Resolved incidents assigned to your team"),
            "In Review changes assigned to you": await helpers.translate("In Review changes assigned to you"),
            "Scheduled changes assigned to you": await helpers.translate("Scheduled changes assigned to you"),
            "Authorize changes assigned to you": await helpers.translate("Authorize changes assigned to you"),
            "Assess changes assigned to you": await helpers.translate("Assess changes assigned to you"),
            "New changes assigned to you": await helpers.translate("New changes assigned to you"),
            "Implement changes assigned to you": await helpers.translate("Implement changes assigned to you"),
            "In Review changes assigned to your team": await helpers.translate("In Review changes assigned to your team"),
            "Scheduled changes assigned to your team": await helpers.translate("Scheduled changes assigned to your team"),
            "Authorize changes assigned to your team": await helpers.translate("Authorize changes assigned to your team"),
            "Assess changes assigned to your team": await helpers.translate("Assess changes assigned to your team"),
            "New changes assigned to your team": await helpers.translate("New changes assigned to your team"),
            "Implement changes assigned to your team": await helpers.translate("Implement changes assigned to your team"),
            "New problems assigned to your team": await helpers.translate("New problems assigned to your team"),
            "Assess problems assigned to your team": await helpers.translate("Assess problems assigned to your team"),
            "Resolved problems assigned to your team": await helpers.translate("Resolved problems assigned to your team"),
            "New problems assigned to you": await helpers.translate("New problems assigned to you"),
            "Assess problems assigned to you": await helpers.translate("Assess problems assigned to you"),
            "Resolved problems assigned to you": await helpers.translate("Resolved problems assigned to you"),
            "Fix in Progress problems assigned to you": await helpers.translate("Fix in Progress problems assigned to you"),
            "Root Cause Analysis problems assigned to you": await helpers.translate("Root Cause Analysis problems assigned to you"),
            "Fix in Progress problems assigned to your team": await helpers.translate("Fix in Progress problems assigned to your team"),
            "Root Cause Analysis problems assigned to your team": await helpers.translate("Root Cause Analysis problems assigned to your team"),
            "Catalog tasks assigned to you": await helpers.translate("Catalog tasks assigned to you"),
            "Catalog tasks assigned to your team": await helpers.translate("Catalog tasks assigned to your team"),
            "Change tasks assigned to you": await helpers.translate("Change tasks assigned to you"),
            "Change tasks assigned to your team": await helpers.translate("Change tasks assigned to your team"),
            "Problem tasks assigned to you": await helpers.translate("Problem tasks assigned to you"),
            "Problem tasks assigned to your team": await helpers.translate("Problem tasks assigned to your team"),
            "Incident tasks assigned to you": await helpers.translate("Incident tasks assigned to you"),
            "Incident tasks assigned to your team": await helpers.translate("Incident tasks assigned to your team"),
            "Tasks delegated to you": await helpers.translate("Tasks delegated to you"),
            "Incidents delegated to you": await helpers.translate("Incidents delegated to you"),
            "Incident tasks delegated to you": await helpers.translate("Incident tasks delegated to you"),
            "Problems delegated to you": await helpers.translate("Problems delegated to you"),
            "Problem tasks delegated to you": await helpers.translate("Problem tasks delegated to you"),
            "Change requests delegated to you": await helpers.translate("Change requests delegated to you"),
            "Change tasks delegated to you": await helpers.translate("Change tasks delegated to you"),
            "Catalog tasks delegated to you": await helpers.translate("Catalog tasks delegated to you"),
        };
        api.setState("translations", translations);
    }

    var currentVizSelection = landingPageUtils.getInitialVisualizationConfig();
    if (translations.hasOwnProperty(currentVizSelection.title)) {
        currentVizSelection = { ...currentVizSelection,
            title: translations[currentVizSelection.title]
        };
        api.setState("currentVizSelection", currentVizSelection);
    }
    api.setState("workPersonaConfig", workPersonaConfig);
}
