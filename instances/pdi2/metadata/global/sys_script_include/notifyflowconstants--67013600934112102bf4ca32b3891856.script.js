var NotifyFlowConstants = Class.create();

NotifyFlowConstants.ACTIONS = {
    SAY: "say",
    PLAY: "play",
    HANG_UP: "hang_up",
    REJECT: "reject",
    CALL: "call",
    FORWARD_CALL: "forward_call",
    FORWARD_TO_NOTIFY_CLIENT: "forward_to_notify_client",
    RECORD_CALL: "record_call",
    JOIN_CONFERENCE_CALL: "join_conference_call",
    QUEUE: "queue",
    INPUT: "input",
    INPUT_ADVANCED: "input_advanced"
};

NotifyFlowConstants.TABLES = {
    NOTIFY_WF_ACTIVITY: "notify_wf_activity",
    NOTIFY_NUMBER: "notify_number",
    NOTIFY_CLIENT_SESSION: "notify_client_session",
    NOTIFY_CALL_STATUS: "notify_call_status",
    NOTIFY_LANGUAGE: "notify_language"
};

NotifyFlowConstants.COLUMNS = {
    NOTIFY_CALL: "notify_call",
    NOTIFY_ACTION: "notify_action",
    LANGUAGE_CODE: "language_code",
    STATE: "state",
    NOTIFY_GROUP: "notify_group",
    OUTGOING_CALL_SUBFLOW: "outgoing_call_subflow",
    PHONE_NUMBER: "phone_number",
    USER: "user",
    AVAILABLE: "available",
    SYS_CREATED_ON: "sys_created_on",
    STATUS: "status",
    RESPONSE_ARGS: "response_args",
    NUMBER: "number"
};

NotifyFlowConstants.COLUMN_VALUES = {
    FAILED: "failed",
    RINGING: "ringing",
    IN_PROGESS: "in-progress",
    COMPLETE: "complete"
};

NotifyFlowConstants.REGEX_PATTERN = {
    // pattern for a valid URL
    URL: "[-a-zA-Z0-9@:%_\\+.~#?&//=]{2,256}\\.[a-z]{2,4}\\b(\\/[-a-zA-Z0-9@:%_\\+.~#?&//=]*)?(\\?([-a-zA-Z0-9@:%_\\+.~#?&//=]+)|)",
    // pattern for country code config LANGUAGE_CODE: MENU_TEXT
    // e.g. en-US: Press 1 to hear the menu again
    COUNTRY_CODE_CONFIG: "^([^:]+)(:)(.*$)"
};
