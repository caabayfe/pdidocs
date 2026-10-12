function include({imports}, api, event, helpers) {
    let SOWListContextActionHandlerITSMSNC = imports['sn_sow_itsm_common.SOWListContextActionHandlerITSMSNC'](api, event, helpers);
    class SOWListContextActionHandlerITSM extends SOWListContextActionHandlerITSMSNC {
    }
    return SOWListContextActionHandlerITSM;
}
