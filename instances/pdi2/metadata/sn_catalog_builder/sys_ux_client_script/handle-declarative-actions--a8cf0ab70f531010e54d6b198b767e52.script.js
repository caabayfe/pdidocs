function handler({
    api,
    event,
    helpers
}) {
    const {
        snHttp,
        modal
    } = helpers;
    if (event.payload.wrappedAction == 'SN_CATALOG_BUILDER#EDIT_CAT_TEMPLATE') {
        const selectInfoMessage = "Please select a template to edit";
        const accessErrorMessage = "You do not have access to edit this template";
        const hasAccess = api.data.check_edit_access_on_catalog_template.output;
        handleAction(hasAccess, selectInfoMessage, accessErrorMessage);
    } else if (event.payload.wrappedAction == 'SN_CATALOG_BUILDER#DUPLICATE_CAT_TEMPLATE') {
        const selectInfoMessage = "Please select a template to duplicate";
        const accessErrorMessage = "You do not have permissions to duplicate this template";
        const hasAccess = api.data.check_edit_access_on_catalog_template.output;
        handleAction(hasAccess, selectInfoMessage, accessErrorMessage);
    } else if (event.payload.wrappedAction == 'SN_CATALOG_BUILDER#CREATE_CAT_TEMPLATE') {
        api.emit('LAUNCH_MODAL_FROM_TEMPLATE_TAB', {});
    }
    function handleAction(hasAccess, selectInfoMessage, accessErrorMessage) {
        const {
            state: {
                selectedTemplateId,
                wizardId,
                templateNotSelected
            }
        } = api;

        const {
            payload: {
                wrappedAction
            }
        } = event;

        if (templateNotSelected) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert5",
                    status: "high",
                    icon: "info-circle-outline",
                    content: selectInfoMessage,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            return;
        }

        if (!hasAccess) {
            api.setState('errorMsg', accessErrorMessage);
            modal.open("[component-id$='template_alert']");
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert5",
                    status: "high",
                    icon: "info-circle-outline",
                    content: accessErrorMessage,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            return;
        }

        if (wrappedAction === 'SN_CATALOG_BUILDER#EDIT_CAT_TEMPLATE') {
            navigateToWizard(wizardId, selectedTemplateId);
        }

        if (wrappedAction === 'SN_CATALOG_BUILDER#DUPLICATE_CAT_TEMPLATE') {
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                id: "blocking",
                loading: true,
                blocking: true,
                label: "Duplicating the item template"
            });
            snHttp(`api/sn_sc/servicecatalog/template/${selectedTemplateId}/duplicate`, {
                method: 'POST',
                batch: false
            })
                .then(({
                    response
                }) => {
                    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                        id: "blocking",
                        loading: false
                    });
                    const newtemplateId = response.result;
                    navigateToWizard(wizardId, newtemplateId);
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
                            content: "Error occured while duplicating the template",
                            action: {
                                type: "dismiss"
                            }
                        }]
                    });
                    return;

                });
        }
    }

    function navigateToWizard(wizardId, templateId) {
        helpers.navigate.to("wizard", {
            sysId: wizardId
        }, {
            mode: 'template',
            recordId: templateId,
            templateId: ''
        });
    }
}
