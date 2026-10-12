(function executeRule(current, previous /*null when async*/ ) {
    var name = current.name.toString();
    var displayName = current.display_name.toString();

	var previousName = previous.name.toString();
    var previousDisplayName = previous.display_name.toString();

    if (!isNameUnique(name, displayName) && (name != previousName || displayName != previousDisplayName)) {
        gs.addErrorMessage(gs.getMessage("Failed to update/insert record: Another data channel has the same name or display_name"));
        current.setAbortAction(true);
    }

    function isNameUnique(name, displayName) {
        var gr = new GlideRecord('dp_channel');
        var encodedQuery = `name=${name}^ORdisplay_name=${displayName}`;
        gr.addEncodedQuery(encodedQuery);
        gr.setLimit(1);
        gr.query();
        return !gr.hasNext();
    }
})(current, previous);
