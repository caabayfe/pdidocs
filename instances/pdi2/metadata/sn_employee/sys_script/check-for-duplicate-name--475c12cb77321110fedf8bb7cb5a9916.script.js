(function executeRule(current, previous /*null when async*/ ) {

    var m2mGr = new GlideRecord('sn_employee_tab_widget_mapping');
    m2mGr.addQuery('tab', current.getValue('tab'));
    m2mGr.addQuery('name', current.getValue('name').trim());
    m2mGr.addActiveQuery();
    m2mGr.query();
    if (m2mGr.getRowCount() > 0 && m2mGr.next() && m2mGr.getUniqueValue() != current.getUniqueValue()) {
        gs.addErrorMessage(gs.getMessage('Name needs to be unique'));
        current.setAbortAction(true);
    }

})(current, previous);
