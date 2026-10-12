function include({imports}, api, event, helpers) {
    let SOWListContextActionHandlerSNC = imports['sn_sow.SOWListContextActionHandlerSNC'](api, event, helpers);
    class SOWListContextActionHandler extends SOWListContextActionHandlerSNC {
    }
    return SOWListContextActionHandler;
}
