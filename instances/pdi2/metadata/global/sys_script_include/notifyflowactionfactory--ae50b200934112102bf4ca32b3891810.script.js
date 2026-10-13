var NotifyFlowActionFactory = Class.create();

NotifyFlowActionFactory.createAction = function( /*String*/ actionType) {
    switch (actionType) {
        case NotifyFlowConstants.ACTIONS.SAY:
            return new NotifySayFlowAction();
        case NotifyFlowConstants.ACTIONS.PLAY:
            return new NotifyPlayFlowAction();
        case NotifyFlowConstants.ACTIONS.HANG_UP:
            return new NotifyHangUpFlowAction();
        case NotifyFlowConstants.ACTIONS.REJECT:
            return new NotifyRejectFlowAction();
        case NotifyFlowConstants.ACTIONS.CALL:
            return new NotifyCallFlowAction();
        case NotifyFlowConstants.ACTIONS.FORWARD_CALL:
            return new NotifyForwardCallFlowAction();
        case NotifyFlowConstants.ACTIONS.FORWARD_TO_NOTIFY_CLIENT:
            return new NotifyForwardToNotifyClientFlowAction();
        case NotifyFlowConstants.ACTIONS.RECORD_CALL:
            return new NotifyRecordCallFlowAction();
        case NotifyFlowConstants.ACTIONS.JOIN_CONFERENCE_CALL:
            return new NotifyJoinConferenceCallFlowAction();
        case NotifyFlowConstants.ACTIONS.QUEUE:
            return new NotifyQueueFlowAction();
        case NotifyFlowConstants.ACTIONS.INPUT:
            return new NotifyInputFlowAction();
        case NotifyFlowConstants.ACTIONS.INPUT_ADVANCED:
            return new NotifyInputAdvancedFlowAction();
        default:
            new NotifyFlowErrorHandler().throwInvalidAction();

    }
};
