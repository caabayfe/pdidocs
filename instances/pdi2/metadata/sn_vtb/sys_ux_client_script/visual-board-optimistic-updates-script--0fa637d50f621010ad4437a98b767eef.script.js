function script({api, event,imports, helpers}) { 
    const {
        snHttp,
        modal,
        screen
    } = helpers;
    const {
        emit: dispatch,
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
        'sn_vtb.utils': utilsInclude
    } = imports;
    const {
        ACTIONS: {
            CARD_MOVED,
            LANE_MOVED,
            SWIMLANE_MOVED,
            VTB_DATA_DRIVEN_CARD_ADDED,
            VTB_LANE_HIDE_SELECTED,
            VTB_LANE_HEADER_UPDATED
        }
    } = constantsInclude();
    const {
        execGraphQLEndPoint
    } = utilsInclude();
    const {
        moveCardOptimisticHandler,
        addDataDrivenOptimisticCardHandler
    } = cardHandlersInclude();
    const {
        moveLaneOptimisticHandler,
        moveSwimlaneOptimisticHandler,
        hideLaneOptimisticHandler,
        laneHeaderOptimisticUpdateHandler
    } = laneHandlersInclude();
    const {
        setBoardState,
        setBoardDirtyState
    } = stateUpdatesInclude();

    const {
        name,
        payload
    } = event;
    const {
        boardState,
        boardDirtyState = {}
    } = state;

    let output = {};
    switch (name) {
        case CARD_MOVED:
            output = moveCardOptimisticHandler(boardState, boardDirtyState, payload);
            break;

        case LANE_MOVED:
            output = moveLaneOptimisticHandler(boardState, boardDirtyState, payload);
            break;

        case SWIMLANE_MOVED:
            output = moveSwimlaneOptimisticHandler(boardState, boardDirtyState, payload);
            break;

        case VTB_DATA_DRIVEN_CARD_ADDED:
            output = addDataDrivenOptimisticCardHandler(boardState, boardDirtyState, payload);
            break;

        case VTB_LANE_HIDE_SELECTED:
            output = hideLaneOptimisticHandler(boardState, payload);
            break;

        case VTB_LANE_HEADER_UPDATED:
            output = laneHeaderOptimisticUpdateHandler(boardState, boardDirtyState, payload);
            break;
    }

    if (output.newBoardState)
        setBoardState(api, output.newBoardState);

    if (output.newBoardDirtyState)
        setBoardDirtyState(api, output.newBoardDirtyState);

    if (output.dbPayload)
        execGraphQLEndPoint(output.dbPayload.operationName, output.dbPayload.operationPayload, dispatch);
 }
