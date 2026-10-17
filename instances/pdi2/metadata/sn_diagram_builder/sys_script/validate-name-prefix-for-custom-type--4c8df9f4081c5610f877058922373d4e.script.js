(function executeRule(current, previous /*null when async*/ ) {

    if (!current.target_property.startsWith('_')) {
        gs.addErrorMessage(gs.getMessage("For 'Custom' type, the property must begin with an underscore ( {0} ).", '_'));
        current.setAbortAction(true);
    }

})(current, previous);
