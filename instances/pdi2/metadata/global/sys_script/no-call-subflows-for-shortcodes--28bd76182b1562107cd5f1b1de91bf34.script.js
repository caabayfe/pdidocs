(function executeRule(current, previous /*null when async*/ ) {
    var numberGr = new GlideRecord('notify_number');
    numberGr.addQuery('notify_group', current.getUniqueValue());
    numberGr.addNotNullQuery('short_code');
    numberGr.query();
    if (numberGr.next()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Can't associate call subflow as atleast one number associated with this group is a ShortCode"));
    }
})(current, previous);
