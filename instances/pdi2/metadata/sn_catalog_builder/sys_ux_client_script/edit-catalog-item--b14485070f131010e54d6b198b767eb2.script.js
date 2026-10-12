function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        snHttp,
        modal
    } = helpers;
    modal.close("[component-id$='checkout_modal']");
    var recordID = api.state.recordID;
    var wizardID = api.state.wizardID;

    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        id: "blocking",
        loading: true,
        blocking: true,
        label: "Opening item for edit"
    });

    snHttp(`/api/sn_sc/v1/servicecatalog/items/${recordID}/versioning/checkout`, {
            method: 'POST',
            batch: true
        })
        .then(({
                response
            }) => {

                api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                    id: "blocking",
                    loading: false
                });

                if (response.result.errMsg) {
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "alert5",
                            status: "high",
                            icon: "info-circle-outline",
                            content: "This item cannot be checked out. If it was just published, please try after some time.",
                            action: {
                                type: "dismiss"
                            }
                        }]
                    });
                    return;
                }

                const checkoutItemId = response.result.result;
                const isSkillActive = api.data.t2c_helper.output?.isSkillActive;
                const routeExists = (api.data.t2c_helper.output?.routes || [])
                    .find(routeConfig => routeConfig.route === "choose-how-to-build");

                const WIZARD_ROUTE = {
                    route: "wizard",
                    fields: {
                        sysId: wizardID
                    },
                    params: {
                        mode: 'normal',
                        recordId: checkoutItemId,
                        templateId: ''
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
                        sysId: wizardID
                    },
                    params: {
                        mode: 'normal',
                        templateId: '',
                        recordId: checkoutItemId,
                        isNewRecord: false
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

            })
            .catch(({
            error
        }) => {
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                id: "blocking",
                loading: false
            });


            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert5",
                    status: "high",
                    icon: "info-circle-outline",
                    content: "This item cannot be checked out. If it was just published, please try after some time.",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            return;
        });
}
