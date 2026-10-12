function script({api, event, imports, helpers}) {
    console.log("Mutation success");
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
        'sn_vtb.notificationHandler': notificationHandlerInclude
    } = imports;
    const {
        DATA_BROKER_OP: {
            CARD_MOVE,
            CARD_ARCHIVED,
            ARCHIVE_ALL_CARDS_BY_LANE,
            FETCH_ARCHIVE_CARD,
            FETCH_ARCHIVE_CARDS,
            RESTORE_CARD,
            CREATE_LANE_REQUEST,
            SET_USER_PREFERENCE,
            LANE_HEADER_UPDATED,
            DELETE_LANE,
            FETCH_VTB_USERS,
            FETCH_VTB_CARD,
            ADD_CARD
        }
    } = constantsInclude();
    const {
        moveCardSuccessHandler,
        archiveCardSuccessHandler,
        fetchArchiveCardSuccessHandler,
        fetchArchiveCardsSuccessHandler,
        restoreCardSuccessHandler,
        fetchVTBCardSuccessHandler,
        addCardSuccessHandler
    } = cardHandlersInclude();
    const {
        archiveCardsByLaneSuccessHandler,
        createLaneRequestSuccessHandler,
        setUserPreferenceSuccessHandler,
        updateLaneHeaderSuccessHandler,
        deleteLaneHeaderSuccessHandler,
        fetchVTBUsersSuccessHandler
    } = laneHandlersInclude();
    const {
        setBoardState,
        setBoardDirtyState,
        setBoardFocusState
    } = stateUpdatesInclude();
    const {
        showAlertAndInitiateDismiss
    } = notificationHandlerInclude();

    const {
        payload,
        payload: {
            operation
        }
    } = event;
    const {
        boardState,
        boardDirtyState = {},
        boardFocusState = {}
    } = state;
    const {
        [operation]: operationFailPayload,
        ...newBoardDirtyState
    } = boardDirtyState || {};

    let output = {};
    let updatedBoardState = null;
    switch (operation) {
        case CARD_MOVE:
            output = moveCardSuccessHandler(boardState, payload, operationFailPayload);
            break;
        case CARD_ARCHIVED:
            updatedBoardState = archiveCardSuccessHandler(boardState , boardFocusState, payload );
            output.newBoardState = updatedBoardState.newBoardDirtyState;
            output.newBoardFocusState = updatedBoardState.newBoardFocusState;
            output.dbPayload = updatedBoardState.dbPayload;
            break;
        case FETCH_ARCHIVE_CARDS:
            output.newBoardState = fetchArchiveCardsSuccessHandler(boardState, payload, emit);
            break;
        case FETCH_ARCHIVE_CARD:
            output.newBoardState = fetchArchiveCardSuccessHandler(boardState, payload, emit);
            break;
        case ARCHIVE_ALL_CARDS_BY_LANE:
            output.newBoardState = archiveCardsByLaneSuccessHandler(boardState, payload, emit);
            break;
        case RESTORE_CARD:
            output.newBoardState = restoreCardSuccessHandler(boardState, payload, emit);
            break;
        case LANE_HEADER_UPDATED:
            output.newBoardState = updateLaneHeaderSuccessHandler(boardState, payload, emit);
            break;
        case CREATE_LANE_REQUEST:
            updatedBoardState = createLaneRequestSuccessHandler(boardState, boardFocusState, payload, emit);
            output.newBoardState = updatedBoardState.newBoardDirtyState;
            output.newBoardFocusState = updatedBoardState.newBoardFocusState;
            break;
        case SET_USER_PREFERENCE:
            output.newBoardState = setUserPreferenceSuccessHandler(boardState, payload, emit);
            break;
        case DELETE_LANE:
            updatedBoardState = deleteLaneHeaderSuccessHandler(boardState, boardFocusState, payload, emit);
            output.newBoardState = updatedBoardState.newBoardDirtyState;
            output.newBoardFocusState = updatedBoardState.newBoardFocusState;
            break;
        case FETCH_VTB_USERS:
            output.newBoardState = fetchVTBUsersSuccessHandler(boardState, payload, emit);
            break;
        case FETCH_VTB_CARD:
            output.newBoardState = fetchVTBCardSuccessHandler(boardState, payload, emit);
            break;
        case ADD_CARD:
            let boardTempState = null;
            boardTempState = addCardSuccessHandler(boardState , boardFocusState , payload);
            output.newBoardState = boardTempState.newBoardDirtyState;
            output.newBoardFocusState = boardTempState.newBoardFocusState;
            break;
    }

    if (output.newBoardState)
        setBoardState(api, output.newBoardState, output.newBoardFocusState);

    if (output.warningPayload)
        showAlertAndInitiateDismiss(api, output.warningPayload, helpers);

    if (output.newBoardFocusState)
        setBoardFocusState(api, output.newBoardFocusState);

    if (operationFailPayload)
        setBoardDirtyState(api, newBoardDirtyState);

    if (output.dbPayload)
       emit("UXF_DB_OP_TRIGGER_REQUESTED", output.dbPayload);
}
