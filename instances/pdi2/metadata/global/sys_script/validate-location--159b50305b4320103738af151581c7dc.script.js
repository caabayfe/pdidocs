(function executeRule(current, previous /*null when async*/ ) {

    var table = current.getValue("table");
    var location = current.getValue("location");
    var references = location.split(".");
    var currentReferenceTable = table;

    for (var i = 0; i < references.length; i++) {
        var refTable = new GlideRecord(currentReferenceTable);
        if (!refTable.isValid()) {
            currentReferenceTable = "";
            break;
        }

        currentReferenceTable = refTable.getElement(references[i]).getReferenceTable();
    }

    if (current.getValue('location_source') === 'location') {
        if (currentReferenceTable === "cmn_location")
            return;

        gs.addErrorMessage(gs.getMessage("Location must be referencing a source of type Locations (cmn_location)."));
        current.setAbortAction(true);
    }
})(current, previous);
