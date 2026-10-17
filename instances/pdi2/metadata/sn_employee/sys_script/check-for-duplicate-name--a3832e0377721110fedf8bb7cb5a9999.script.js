(function executeRule(current, previous /*null when async*/ ) {

    var tabGr = new GlideRecord('sn_employee_tab');
    tabGr.addQuery('name', current.getValue('name').trim());
    tabGr.addActiveQuery();
    tabGr.query();
    if (tabGr.getRowCount() > 0 && tabGr.next() && tabGr.getUniqueValue() != current.getUniqueValue()) {
        gs.addErrorMessage(gs.getMessage('Tab name needs to be unique'));
        current.setAbortAction(true);
    }

})(current, previous);
