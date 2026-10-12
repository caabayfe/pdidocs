(function() {
    if (current.isValidRecord() && (current.getValue("caller_id") == gs.getUserID()) || (current.getValue("opened_by") == gs.getUserID())) {
        var incidentUtils = new global.IncidentUtils();
        return incidentUtils.canCloseIncident(current);
    }
    return false;
})();
