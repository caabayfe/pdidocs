(function executeRule(current, previous /*null when async*/ ) {
    //Synch up the label in the sys_dictionary for columns and sys_db_object for tables for the
    //the default language choice when the label and name is not empty.
    if (gs.getSession().getLanguage() != "en" && !(current.name + '').startsWith("var__m_")) {
        gs.addErrorMessage(gs.getMessage("Can not change an English language label in the current language. To change the label, switch to the English language."));
        current.setAbortAction(true);
        return;
    }

    if (current.element.nil()) {
        //if the element is empty then synch with table
        var tableGR = new GlideRecord("sys_db_object");
        tableGR.addQuery("name", current.name);
        tableGR.query();
        //if found, then update it
        if (tableGR.next()) {
            tableGR.setValue("label", current.label);
            tableGR.update();
        }
    } else {
        //if the element is not empty then synch with column
        var colGR = new GlideRecord("sys_dictionary");
        colGR.addQuery("name", current.name);
        colGR.addQuery("element", current.element);
        colGR.query();
        //if found, then update it
        if (colGR.next()) {
            colGR.setValue("column_label", current.label);
            colGR.update();
        }
    }

})(current, previous);
