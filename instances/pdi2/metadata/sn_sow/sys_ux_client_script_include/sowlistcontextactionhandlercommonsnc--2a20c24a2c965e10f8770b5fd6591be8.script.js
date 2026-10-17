function include({imports}, api, event, helpers) {
    class SOWListContextActionHandlerCommonSNC {
        static handleContextAction(recordSysId, actionId) {
            switch (actionId) {
                case 'copy_sysId':
                    helpers.writeText(recordSysId).then(() => {
                        helpers.translate('Copied to clipboard').then((value) => {
                            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                                items: [{
                                    id: "copySysIdAlert",
                                    status: "positive",
                                    icon: "check-circle-outline",
                                    content: value,
                                    action: {
                                        type: "dismiss"
                                    }
                                }],
                            });
                        });
                    });
                    break;
            }
        }
    }
    return SOWListContextActionHandlerCommonSNC;
}
