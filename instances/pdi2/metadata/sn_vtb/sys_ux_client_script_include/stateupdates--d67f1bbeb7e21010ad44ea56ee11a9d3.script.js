function include({imports}) {
   const {
        'sn_vtb.constants': constantsInclude,
        'sn_vtb.boardManagerMethods': boardManagerMethods,
    } = imports;
    const {
        STATE_PROPS_NAMES: {
            BOARD_STATE,
            BOARD_DIRTY_STATE,
            BOARD_FILTERED_STATE,
            BOARD_FOCUS_STATE,
            INITIALISE_AMB,
            TRANSLATED_MESSAGE,
        }
    } = constantsInclude();
    const { transformBoardData } = boardManagerMethods();

const setBoardState = (api, value, focusValue) => {
      api.setState(BOARD_STATE, value);
      api.setState(BOARD_FILTERED_STATE, transformBoardData(value, focusValue));
};

const setBoardDirtyState = (api, value) => {
   api.setState(BOARD_DIRTY_STATE, value);
};

const setBoardFocusState = (api, value) => {
   api.setState(BOARD_FOCUS_STATE, value);
};

const setAMBState = (api, value) => {
   api.setState(INITIALISE_AMB, value);
};

const setTranslatedMessages = (api, value) => {
   api.setState(TRANSLATED_MESSAGE, value);
};

return {
setBoardState,
setBoardDirtyState,
setAMBState,
setBoardFocusState,
setTranslatedMessages,
}
 }
