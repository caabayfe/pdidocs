async function script({
    api,
    event,
    imports,
    helpers
}) {
    const {
        emit: dispatch
    } = api;
    const {
        'sn_vtb.stateUpdates': stateUpdatesInclude,
        'sn_vtb.notificationHandler': notificationHandlerInclude,
        'sn_vtb.constants': constantsInclude,
        'sn_vtb.utils': utilsInclude
    } = imports;
    const {
        setBoardState,
        setAMBState,
    } = stateUpdatesInclude();
    const {
        dismissLoader
    } = notificationHandlerInclude();
    const {
        MENU_ITEMS: {
            ADD_CARD,
            HIDE_LANE,
            MOVE_LANE,
            DELETE_LANE,
            ARCHIVE_ALL_CARDS,
            COLLAPSE_ALL,
            EXPAND_ALL,
            MOVE_SWIMLANE,
            HIDE_SWIMLANE,
            DELETE_SWIMLANE,
            ARCHIVE_CARD,
            MOVE_CARD
        }
    } = constantsInclude();
    const {
        translateWrapper
    } = utilsInclude();
    const {
        setTranslatedMessages
    } = stateUpdatesInclude();

    let tMessages = await Promise.all([
        translateWrapper(ADD_CARD, helpers.translate('Add Card')),
        translateWrapper(HIDE_LANE, helpers.translate('Hide Lane')),
        translateWrapper(MOVE_LANE, helpers.translate('Move Lane')),
        translateWrapper(DELETE_LANE, helpers.translate('Delete Lane')),
        translateWrapper(ARCHIVE_ALL_CARDS, helpers.translate('Archive All Cards')),
        translateWrapper(COLLAPSE_ALL, helpers.translate('Collapse All')),
        translateWrapper(EXPAND_ALL, helpers.translate('Expand All')),
        translateWrapper(MOVE_SWIMLANE, helpers.translate('Move Swimlane')),
        translateWrapper(HIDE_SWIMLANE, helpers.translate('Hide Swimlane')),
        translateWrapper(DELETE_SWIMLANE, helpers.translate('Delete Swimlane')),
        translateWrapper(ARCHIVE_CARD, helpers.translate('Archive Card')),
        translateWrapper(MOVE_CARD, helpers.translate('Move Card'))
    ]);

    let tMessagesState = {};
    tMessages.forEach(tMessage => {
        tMessagesState[tMessage.key] = tMessage.tText;
    });

    const boardState = api.data.visualBoardLoadCompositeDataBroker.visualBoardLoadDataTransform.board;
    
    console.log("boardState: ", boardState);

    const sortPlaceholderTranslatedText = await helpers.translate('Card will be ordered in the lane according to fields on which the board is sorted');
    const newLaneConfigOverride = boardState.lanes.reduce(
        (acc, lane) => ({
            ...acc,
            [lane.sys_id]: {
                sort_enabled: true,
                sort_tag_drop_placeholder: boardState.laneDropPlaceholderTag || 'sn-vtb-lane-dest-placeholder',
                sort_placeholder_text: sortPlaceholderTranslatedText,
            }
        }), {}
    );

    boardState.laneConfigOverride = { 
        ...boardState.laneConfigOverride,
        ...newLaneConfigOverride
    };

    boardState.translatedMessages = tMessagesState || {};
    setBoardState(api, boardState);
    setAMBState(api, true);

    dismissLoader(api);
    console.log("Board load completed");
}
