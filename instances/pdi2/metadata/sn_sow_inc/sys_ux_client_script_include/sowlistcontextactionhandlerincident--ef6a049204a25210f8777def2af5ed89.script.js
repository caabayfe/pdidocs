function include({imports}, api, event, helpers) {
    let SOWListContextActionHandlerIncidentSNC = imports['sn_sow_inc.SOWListContextActionHandlerIncidentSNC'](api, event, helpers);
    class SOWListContextActionHandlerIncident extends SOWListContextActionHandlerIncidentSNC {
    }
    return SOWListContextActionHandlerIncident;
}
