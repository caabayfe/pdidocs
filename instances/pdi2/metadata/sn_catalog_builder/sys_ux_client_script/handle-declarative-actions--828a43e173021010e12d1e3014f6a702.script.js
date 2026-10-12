function handler({
    api,
    event,
    imports,
    helpers
}) {
    const {
        snHttp,
        modal,
        screen,
    } = helpers;
    if (event.payload.wrappedAction == 'SN_CATALOG_BUILDER#EDIT_CAT_ITEM') {
        var recordID = api.state.recordID;
        var wizardID = api.state.wizardID;
        var itemState = api.state.itemState;
        if (!recordID) {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                id: 'non_blocking',
                loading: false
            });
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert5",
                    status: "high",
                    icon: "info-circle-outline",
                    content: "Please select an item to edit",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            return;
        }

        if (itemState === 'in_review') {
            modal.open("[component-id$='cancel_review_1']");
            return;
        }

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
                api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                    id: 'non_blocking',
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
                api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                    id: 'non_blocking',
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

    } else if (event.payload.wrappedAction == 'SN_CATALOG_BUILDER#CREATE_CAT_ITEM') {
        api.setState('itemCreationMode', 'FROM_TEMPLATE');
        api.setState('itemCreationModeNotSelected', false);
        const {
            catalog_builder_editor_blank_template = false
        } = api.data.userRoles.output;
        if (catalog_builder_editor_blank_template) {
            modal.open("[component-id$='item_modal']");
        } else {
            api.emit("NAV_ITEM_SELECTED", {
                route: "selector",
                title: "Template Selection"
            });
        }
    } else if (event.payload.wrappedAction == 'SN_CATALOG_BUILDER#DISCARD_DRAFT') {
        var recordID = api.state.recordID;
        var itemState = api.state.itemState;

        if (!recordID) {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                id: 'non_blocking',
                loading: false
            });
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert5",
                    status: "high",
                    icon: "info-circle-outline",
                    content: "Please select the draft item to delete",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            return;
        }

        if (itemState != 'draft') {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert5",
                    status: "high",
                    icon: "info-circle-outline",
                    content: "You can discard only those items that are in the draft state",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
          return;
        }

        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            id: "blocking",
            loading: true,
            blocking: true,
            label: "Discarding draft item"
        });

        snHttp('/api/sn_sc/v1/servicecatalog/item/' + recordID, {
                method: 'DELETE'
        }).then(({
                response
            }) => {
                 api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                      id: "blocking",
                      loading: false
                 });
                 api.setState('recordID', '');
                 api.setState('catalogItemsListRefresh', {timestamp: Date.now()});
            }).catch(({
                error
            }) => {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "alert5",
                        status: "high",
                        icon: "info-circle-outline",
                        content: "Problem in discarding the draft item",
                        action: {
                            type: "dismiss"
                        }
                    }]
                });
                api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                      id: "blocking",
                      loading: false
                 });
            });
   }
}
