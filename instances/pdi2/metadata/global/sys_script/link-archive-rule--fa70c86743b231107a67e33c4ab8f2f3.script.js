(function executeRule(current, previous /*null when async*/ ) {

    if (current && (current.isNewRecord() || current.archive.changes())) {
        var archiveRuleGr = new GlideRecord('sys_archive');
        if (archiveRuleGr.get(current.archive)) { //Check to make sure we have one to one mapping
            if (!archiveRuleGr.destroy_rule.isNil() && archiveRuleGr.getValue('destroy_rule') != current.getUniqueValue()) {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("The selected archive rule is already associated with a different destroy rule"));
				return;
            }
        }

        //Unlink the old archive rule
        if (!previous.archive.isNil() && archiveRuleGr.get(previous.archive)) {
            archiveRuleGr.setValue('destroy_rule', '');
            archiveRuleGr.update();
        }

        //Link the new archive rule
        if (archiveRuleGr.get(current.archive)) {
            archiveRuleGr.setValue('destroy_rule', current.getUniqueValue());
            archiveRuleGr.update();
        }
    }

})(current, previous);
