function script({api, event, imports}) { 
    const {
        'sn_vtb.constants': constantsInclude,
        'sn_vtb.notificationHandler': notificationHandlerInclude,
        'sn_vtb.utils': utilsInclude,
        'sn_vtb.stateUpdates': stateUpdatesInclude,
    } = imports;
    const {
        showAlert,
        dismissLoader
    } = notificationHandlerInclude();

    const {
        setBoardState
    } = stateUpdatesInclude();
    const lanes = {lanes:[]};
    setBoardState(api, {...api.state.boardState, ...lanes})

    const {
        STATUS: {
            CRITICAL
        },
        ICONS: {
            CIRCLE_CLOSE_OUTLINE
        },
        DONT_HAVE_PERMISSIONS_MESSAGE,
        INSUFFICIENT_PERMISSIONS
    } = constantsInclude();

    const {
        getErrorMessage
    } = utilsInclude()

    const {
        payload: {
            errors
        }
    } = event;

    dismissLoader(api);

    let errorMessage = getErrorMessage(errors);
    errorMessage = errorMessage.includes(INSUFFICIENT_PERMISSIONS) ? DONT_HAVE_PERMISSIONS_MESSAGE : errorMessage;
    showAlert(api, {
        status: CRITICAL,
        icon: CIRCLE_CLOSE_OUTLINE,
        content: {
            type: "html",
            value: errorMessage
        }
    });

    console.log("Board load failed");
 }
