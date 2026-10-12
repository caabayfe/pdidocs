function include({imports}) {
    //Clone states
    const STATES = {
        REQUESTED: 'Requested',
        RUNNING: 'Running',
        COMPLETED: 'Completed',
        ERROR: 'Error',
        CANCELED: 'Canceled',
        DRAFT: 'Draft',
        ROLLBACK_REQUESTED: 'Rollback requested',
        ROLLING_BACK: 'Rolling back',
        ROLLBACK_FAILURE: 'Roll back Failure',
        ROLLED_BACK: 'Rolled back'

    };

    //Clone Home Page - Grid state color
    const COLOR = {
        LOW: 'low',
        HIGH: 'high',
        POSITIVE: 'positive',
        CRITICAL: 'critical',
        INFO: 'info'
    };

    //Clone Home Page - icon for various states like Completed, Canceled etc.
    const ICON = {
        CLOCK_OUTLINE: 'Clock Outline',
        CIRCLE_SEMI_CHECK_OUTLINE: 'Circle Semi Check Outline',
        CIRCLE_CHECK_OUTLINE: 'Circle Check Outline',
        CIRCLE_INFO_OUTLINE: 'Circle Info Outline',
        CLOSE_OUTLINE: 'Close Outline',
        PENCIL_OUTLINE: 'Pencil Outline',
        UNDO_TOP_OUTLINE: 'undo-top-outline'
    };

    const HTTP_REQ_TYPE = {
        POST: 'POST',
        GET: 'GET'
    };

    const SERVER_PATH = '/api/sn_instance_clone/clone/util';
    const OPERATION = {
        SAVE_USER_PREFERENCE: 'SAVE_USER_PREFERENCE',
        GET_CLONE_REQUEST_SYS_ID: 'GET_CLONE_REQUEST_SYS_ID'
    };

    const EVENT = {
        NOW_CARD_CLICKED: 'NOW_CARD#CLICKED',
        NOW_LIST_CELL_LINK_CLICKED: 'NOW_LIST#CELL_LINK_CLICKED',
        NOW_INPUT_VALUE_SET: 'NOW_INPUT#VALUE_SET',
        NOW_INPUT_ENTER_KEYDOWN: 'NOW_INPUT#ENTER_KEYDOWN',
        SN_COMPONENT_FILTER_APPLIED_ITEMS: 'SN_COMPONENT_FILTER#APPLIED_ITEMS',
        NOW_DROPDOWN_ITEM_SELECTED:'NOW_DROPDOWN#SELECTED_ITEMS_SET'
    };

    return {
        STATES,
        COLOR,
        ICON,
        HTTP_REQ_TYPE,
        SERVER_PATH,
        OPERATION,
        EVENT
    };
 }
