function script({api, event, imports, helpers}) { 
    console.log("Visual Board Loader Script");
    const {
        'sn_vtb.notificationHandler': notificationHandlerInclude,
    } = imports;
    const {
        showLoader
    } = notificationHandlerInclude();
    showLoader(api);
 }
