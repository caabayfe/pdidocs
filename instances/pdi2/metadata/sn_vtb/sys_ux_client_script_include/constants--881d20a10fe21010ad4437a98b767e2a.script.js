function include({
    imports
}) {
    const DATA_BROKER_OP = {
        CARD_MOVE: 'CARD_MOVE',
        LANE_MOVE: 'LANE_MOVE',
        SWIMLANE_MOVE: 'SWIMLANE_MOVE',
        CARD_ARCHIVED: 'CARD_ARCHIVED',
        ARCHIVE_ALL_CARDS_BY_LANE: 'ARCHIVE_ALL_CARDS_BY_LANE',
        FETCH_ARCHIVE_CARD: 'FETCH_ARCHIVE_CARD',
        FETCH_ARCHIVE_CARDS: 'FETCH_ARCHIVE_CARDS',
        RESTORE_CARD: 'RESTORE_CARD',
        CREATE_LANE_REQUEST: 'CREATE_LANE_REQUEST',
        SET_USER_PREFERENCE: 'SET_USER_PREFERENCE',
        LANE_HEADER_UPDATED: 'LANE_HEADER_UPDATED',
        FETCH_VTB_USERS: 'FETCH_VTB_USERS',
        FETCH_VTB_CARD: 'FETCH_VTB_CARD',
        ADD_CARD: 'ADD_CARD',
        DELETE_LANE: 'DELETE_LANE'
    };

    const ACTIONS = {
        CARD_MOVED: 'VTB#CARD_MOVED',
        LANE_MOVED: 'VTB#LANE_MOVED',
        SWIMLANE_MOVED: 'VTB#SWIMLANE_MOVED',
        NOW_VISUAL_BOARD_CARD_MOVED: 'NOW_VISUAL_BOARD#CARD_MOVED',
        NOW_VISUAL_BOARD_LANE_MOVED: 'NOW_VISUAL_BOARD#LANE_MOVED',
        NOW_VISUAL_BOARD_SWIMLANE_MOVED: 'NOW_VISUAL_BOARD#SWIMLANE_MOVED',
        VTB_CREATE_LANE_ACTION_PERFORMED: 'VTB#CREATE_LANE_ACTION_PERFORMED',
        VTB_SWIMLANE_ACTION: 'VTB#SWIMLANE_ACTION_PERFORMED',
        VTB_ADD_CARD_CLICKED: 'VTB#ADD_CARD_CLICKED',
        VTB_ATTACHMENT_UPLOADED: 'VTB#ATTACHMENT_UPLOADED',
        VTB_FREEFORM_CARD_ADDED: 'VTB#FREEFORM_CARD_ADDED',
        VTB_REMOVE_FREEFORM_PLACEHOLDER_CARD: 'VTB#FREEFORM_PLACEHOLDER_CARD_REMOVED',
        VTB_DATA_DRIVEN_CARD_ADDED: 'VTB#DATA_DRIVEN_CARD_ADDED',
        NOW_UXF_PAGE_SET_LOADING_STATE: 'NOW_UXF_PAGE#SET_LOADING_STATE',
        NOW_UXF_PAGE_ADD_NOTIFICATIONS: 'NOW_UXF_PAGE#ADD_NOTIFICATIONS',
        NOW_UXF_PAGE_REMOVE_NOTIFICATIONS: 'NOW_UXF_PAGE#REMOVE_NOTIFICATIONS',
        VTB_LANE_HIDE_SELECTED: 'VTB#LANE_HIDE_SELECTED',
        VTB_LANE_HEADER_UPDATED: 'VTB#LANE_HEADER_UPDATED',
        VTB_CONFIRMATION_MODAL_SELECTED: 'VTB#CONFIRMATION_MODAL_SELECTED',
    };

    const BOARD = {
        FREEFORM: 'FREEFORM',
        FLEXIBLE: 'FLEXIBLE',
        GUIDED: 'GUIDED',
    };

    const ELEMENTS_IDS = {
        MUTATION_DATA_BROKER_ELEMENT_ID: 'visualBoardMutationCompositeDataBroker'
    };

    const DATA_BROKERS_IDS = {
        MUTATION_DATA_BROKER_ID: "f547801a0f121010461d37a98b767e8d"
    };

    const STATE_PROPS_NAMES = {
        BOARD_STATE: 'boardState',
        BOARD_FILTERED_STATE: 'boardFilteredState',
        BOARD_DIRTY_STATE: 'boardDirtyState',
        INITIALISE_AMB: 'initialiseAMB',
        BOARD_FOCUS_STATE: 'boardFocusState',
        TRANSLATED_MESSAGE: 'translatedMessages'
    };

    const STATUS = {
        CRITICAL: 'critical',
        INFO: 'info'
    };

    const ICONS = {
        CIRCLE_CLOSE_OUTLINE: 'circle-close-outline',
        CIRCLE_INFO_OUTLINE: 'circle-info-outline',
        CIRCLE_CHECK_OUTLINE: 'circle-check-outline'
    };

    const LOADING_LABEL = 'Visual Board Loading...';
    const LOADING_ID = 'blocking';
    const ATTACHMENT_UPLOAD_SUCCESS_MESSAGE = 'uploaded successfully';
    const ATTACHMENT_UPLOAD_FAILURE_MESSAGE = 'upload failed';
    const DONT_HAVE_PERMISSIONS_MESSAGE = 'You do not have the permissions to modify this record';
    const INSUFFICIENT_PERMISSIONS = "Insufficient Permissions";

    const MENU_ITEMS = {
        ADD_CARD: 'Add Card',
        HIDE_LANE: 'Hide Lane',
        MOVE_LANE: 'Move Lane',
        DELETE_LANE: 'Delete Lane',
        ARCHIVE_ALL_CARDS: 'Archive All Cards',
        COLLAPSE_ALL: 'Collapse All',
        EXPAND_ALL: 'Expand All',
        MOVE_SWIMLANE: 'Move Swimlane',
        HIDE_SWIMLANE: 'Hide Swimlane',
        DELETE_SWIMLANE: 'Delete Swimlane',
        ARCHIVE_CARD: 'Archive Card',
        MOVE_CARD: 'Move Card'
    };

    const ACCESSIBILITY = {
        VTB_CARD_SELECTOR: '.sn-vtb-card',
        NOW_CARD_SELECTOR: '.now-card',
        ADD_CARD_SELECTOR: '.add-card',
        ADD_LANE_SELECTOR: '.lane-add-btn',
        LANE_HEADER_SELECTOR: '.sn-vtb-lane-header',
        CARD_FIRST_ELEM_SELECTOR: 'button.now-dropdown',
        LANE_HEADER_FIRST_ELEM_SELECTOR: '.value-label ',
        SWIMLANE_HEADER_SELECTOR: '.sn-vtb-swimlane-header .container',
        SWIMLANE_HEADER_FIRST_ELEM_SELECTOR: '.value-label'
    };

    return {
        DONT_HAVE_PERMISSIONS_MESSAGE,
        INSUFFICIENT_PERMISSIONS,
        LOADING_ID,
        LOADING_LABEL,
        ACTIONS,
        DATA_BROKER_OP,
        ELEMENTS_IDS,
        STATE_PROPS_NAMES,
        DATA_BROKERS_IDS,
        BOARD,
        STATUS,
        ICONS,
        ATTACHMENT_UPLOAD_SUCCESS_MESSAGE,
        ATTACHMENT_UPLOAD_FAILURE_MESSAGE,
        ACCESSIBILITY,
        MENU_ITEMS
    };
}
