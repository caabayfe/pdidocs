function handler({
    api,
    event,
    imports,
    helpers
}) {
    const {
        modal
    } = helpers;
    const MODE = 'normal';
    const RP_TEMPLATE_ID = '2ba8c10b9320221014d63b9534891887';
    const STD_CAT_TEMPLATE_ID = '500781879320221014d63b953489187e';
    const RP_WIZARD_ID = '89bf83d4c7321010159ca1e603c260cd';
    const STD_CAT_WIZARD_ID = '38f351fe73221010c84e2bb43cf6a7ad';
    let WIZARD_ID, TEMPLATE_ID;
    if (api.state.itemModalSelectedValue === "RECORD_PRODUCER") {
        WIZARD_ID = RP_WIZARD_ID;
        TEMPLATE_ID = RP_TEMPLATE_ID;
    } else {
        WIZARD_ID = STD_CAT_WIZARD_ID;
        TEMPLATE_ID = STD_CAT_TEMPLATE_ID;
    }
    modal.close("[component-id$='item_modal']");
    const isSkillActive = api.data.t2c_helper.output?.isSkillActive;
    const routeExists = (api.data.t2c_helper.output?.routes || [])
        .find(routeConfig => routeConfig.route === "choose-how-to-build");


    const WIZARD_ROUTE = {
            route: "wizard",
            fields: {
                sysId: WIZARD_ID
            },
            params: {
                mode: MODE,
                recordId: '',
                templateId: TEMPLATE_ID
            },
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: null,
            navigationOptions: null,
    };

    const CHOOSE_HOW_TO_BUILD_ROUTE = {
        route: "choose-how-to-build",
        fields: {
            sysId: WIZARD_ID
        },
        params: {
            mode: MODE,
            templateId: TEMPLATE_ID,
            recordId: '',
            isNewRecord: true
        },
        redirect: null,
        passiveNavigation: null,
        title: null,
        multiInstField: null,
        targetRoute: null,
        external: null,
        navigationOptions: null,
        reload: true
    };

    function navigateTo(routeConfig) {
		api.emit("NAV_ITEM_SELECTED", routeConfig);
	}

    if (isSkillActive && routeExists) {
        navigateTo(CHOOSE_HOW_TO_BUILD_ROUTE);
    } else {
        navigateTo(WIZARD_ROUTE);
    }

    api.setState('itemModalSelectedValue', 'STANDARD');
}
