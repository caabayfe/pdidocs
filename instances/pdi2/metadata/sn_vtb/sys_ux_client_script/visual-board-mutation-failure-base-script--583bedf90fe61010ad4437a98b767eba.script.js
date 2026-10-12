function script({api, event,imports, helpers})  { 
    console.log("Mutation Failure");
    const {
        emit,
        setState,
        state,
        context,
        data,
        elements
    } = api;
    const {
        'sn_vtb.constants': constantsInclude,
        'sn_vtb.cardHandlers': cardHandlersInclude,
        'sn_vtb.laneHandlers': laneHandlersInclude,
        'sn_vtb.stateUpdates': stateUpdatesInclude,
        'sn_vtb.notificationHandler': notificationHandlerInclude,
        'sn_vtb.utils': utilsInclude
    } = imports;
    const {
        DATA_BROKER_OP: {
            CARD_MOVE,
            LANE_HEADER_UPDATED
        },
        STATUS: {
            CRITICAL
        },
        ICONS: {
            CIRCLE_CLOSE_OUTLINE
        }
    } = constantsInclude();
    const {
        moveCardFailureHandler
    } = cardHandlersInclude();
    const {
        laneHeaderUpdateFailureHandler
    } = laneHandlersInclude();
    const {
        setBoardState,
        setBoardDirtyState
    } = stateUpdatesInclude();
    const {
        getErrorMessage
    } = utilsInclude();
    const {
        showAlert
    } = notificationHandlerInclude();

    console.log("event ", event);
    const {
        payload: {
            errors,
            operation
        }
    } = event;
    const {
        boardState,
        boardDirtyState = {}
    } = state;
    const {
        [operation]: operationFailPayload,
        ...newBoardDirtyState
    } = boardDirtyState || {};

    let newBoardState = null;
    let message = null;

    switch (operation) {
        case CARD_MOVE:
            if (operationFailPayload) {
                      let newBoardData = moveCardFailureHandler(boardState, operationFailPayload);
                      newBoardState = newBoardData.newBoardState;
                      let operationFailFormData = newBoardData.cardFormData;
                      operationFailFormData.errorMessage = getErrorMessage(errors);
                      api.setState('cardForm',operationFailFormData);
          }
            break;

        case LANE_HEADER_UPDATED:
            if (operationFailPayload) 
                newBoardState = laneHeaderUpdateFailureHandler(boardState, operationFailPayload);
            break;
        
        default:    
            if (errors)
                showAlert(api, {
                    status: CRITICAL,
                    icon: CIRCLE_CLOSE_OUTLINE,
                    content: {
                        type: "html",
                        value: getErrorMessage(errors)
                    }
                });
    }

    if (newBoardState)
        setBoardState(api, newBoardState);

    if (operationFailPayload)
        setBoardDirtyState(api, newBoardDirtyState);
 }
