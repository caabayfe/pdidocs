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

    const ACTION_ADD_ROLE = "add-role";
    const ACTION_REMOVE_ROLE = "remove-role";
    const ACTION_ADD_GROUP = "add-group";
    const ACTION_REMOVE_GROUP = "remove-group";

    const GEConf = api.state.guidedExperienceConf;
    const geHandler = imports["sn_access_analyzer.GuidedExperienceHandler"](api, helpers);
    const JSONQuery = imports["sn_access_analyzer.JSONQuery"]();
    const simUtil = new imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const TAKE_ACTION_HIDDEN = "hidden";

    function onPageReady() {
        //firstly determine if take action needs to be shown based on if it has been previously
        // touched by admin and then initialize the contentTree
        api.data.fetch_access_sim_settings.refresh();

    }

    function isCurrentUserRoleAllowedToTakeAction() {
        let userRoles = api?.context?.session?.user?.roles;
        return userRoles.includes('user_admin') || userRoles.includes('admin');
    }

    function determineIfTakeHidden() {
        let simulatorConfigurations = api.data.fetch_access_sim_settings.result.value.value;
        return simulatorConfigurations == TAKE_ACTION_HIDDEN;
    }

    const loadContentTree = () => {
        if(simUtil.hasServerError(event)) {
            simUtil.showPageError();
            return;
        }

        const isTakeActionBlocked = determineIfTakeHidden() || !isCurrentUserRoleAllowedToTakeAction();
        geHandler.updateConf({
            "subPages[@name=takeAction].visible": !isTakeActionBlocked, // hide take action tab if takeaction is hidden or the current user is not a user admin or maint
            "subPages[@name=result].buttonBehaviour.exit": isTakeActionBlocked ? "hidden" : "visible", // hide the top exit button if takeaction is hidden or the current user is not a user admin or maint
            "subPages[@name=result].buttonBehaviour.next": isTakeActionBlocked ? "hidden" : "visible", // hide the next button if takeaction is hidden or the current user is not a user admin or maint
            "subPages[@name=result].buttonBehaviour.bottomExit": isTakeActionBlocked ? "visible" : "hidden" // the exit button should be present @ the bottom of the page (instead of the top) if takeaction is hidden or the current user is not a user admin or maint
        });
        new Promise(translateMessages).then(() => geHandler.init());
    };

    function translateMessages(resolve) {

        let action = api.context.props.action.toLowerCase();
        let isValidAction = [ACTION_ADD_ROLE, ACTION_REMOVE_ROLE, ACTION_ADD_GROUP, ACTION_REMOVE_GROUP].includes(action);
        simUtil.updateState("pageProps", "isValidAction", isValidAction);
        if (!isValidAction)
            return;

        /**
         * Translate message for Exit window
         */
        let exitKey = "modalWindow[@name=exitModal]";
        helpers.translate("Are you sure you want to exit?")
            .then(val => JSONQuery.update(GEConf, `${exitKey}.title`, val));
        helpers.translate("You're about to exit mid simulation. Your progress will not be saved. Select Close to go back to the simulation.")
            .then(val => JSONQuery.update(GEConf, `${exitKey}.description`, val));
        helpers.translate("Yes, Exit")
            .then(val => JSONQuery.update(GEConf, `${exitKey}.primaryButton.label`, val));

        /**
         * Translate message for Startover window
         */
        let statOverKey = "modalWindow[@name=startOverModal]";
        helpers.translate("Are you sure you want to start over?")
            .then(val => JSONQuery.update(GEConf, `${statOverKey}.title`, val));
        helpers.translate("You're about to quit mid simulation and start over a new simulation. Your progress will not be saved. Select Close to go back to the simulation.")
            .then(val => JSONQuery.update(GEConf, `${statOverKey}.description`, val));
        helpers.translate("Yes, Start over")
            .then(val => JSONQuery.update(GEConf, `${statOverKey}.primaryButton.label`, val));

        let promises = [
            helpers.translate("Simulation criteria"),
            helpers.translate("Preview changes"),
            helpers.translate("Simulated results"),
            helpers.translate("Take action"),
            helpers.translate("Start over"),
            helpers.translate("Exit"),
            helpers.translate("Next"),
            helpers.translate("Skip and Exit")
        ];

        promises.push(action.includes("add") ?
            helpers.translate("Add and complete") :
            helpers.translate("Remove and complete"));

        switch (action) {
            case ACTION_ADD_ROLE:
                promises.push(helpers.translate("New simulation: Add a Role to the user"));
                break;
            case ACTION_REMOVE_ROLE:
                promises.push(helpers.translate("New simulation: Remove a Role from the user"));
                break;
            case ACTION_ADD_GROUP:
                promises.push(helpers.translate("New simulation: Add the user to a Group"));
                break;
            case ACTION_REMOVE_GROUP:
                promises.push(helpers.translate("New simulation: Remove the user from a Group"));
                break;
        }


        Promise.all(promises).then(values => {
            geHandler.updateConf({
                "subPages[@name=criteria].label": values[0],
                "subPages[@name=previewChanges].label": values[1],
                "subPages[@name=result].label": values[2],
                "subPages[@name=takeAction].label": values[3],
                "buttons[@name=startOver].label": values[4],
                "buttons[@name=exit].label": values[5],
                "buttons[@name=bottomExit].label": values[5],
                "buttons[@name=next].label": values[6],
                "buttons[@name=skipAndExit].label": values[7],
                "buttons[@name=complete].label": values[8],
                "pageHeader.title": values[9]
            });

            resolve();
        });
    }

    function onNavPage(prevPage, currentPage) {
        if (currentPage.getName() == "criteria" && currentPage.getData() != null) {
            geHandler.openModal("startOverModal");
            return false;
        }
        return true;
    }

    simUtil.execute({
        MACROPONENT_READY: onPageReady,
        fetch_access_sim_settings: loadContentTree
    }, event);

    geHandler.addEventHandler("NAV_PAGE", onNavPage);
    geHandler.handle(event);

}
