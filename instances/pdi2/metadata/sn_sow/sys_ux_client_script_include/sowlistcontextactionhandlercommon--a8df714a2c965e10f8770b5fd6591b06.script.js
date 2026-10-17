function include({imports}, api, event, helpers) {
    let SOWListContextActionHandlerCommonSNC = imports['sn_sow.SOWListContextActionHandlerCommonSNC'](api, event, helpers);
    class SOWListContextActionHandlerCommon extends SOWListContextActionHandlerCommonSNC {}
    return SOWListContextActionHandlerCommon;
}
