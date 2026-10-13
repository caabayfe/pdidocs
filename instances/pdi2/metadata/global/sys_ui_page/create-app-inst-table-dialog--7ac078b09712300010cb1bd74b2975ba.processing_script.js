process();
response.sendRedirect('discovery_classy_proc.do?sys_id=' + my_sys_id);

function process() {
    // only proceed if user clicked the "Yes" button
    if (selection_result != 'yes')
        return;
    
    // return if either user input is nil
    if (!nait_name) {
        gs.addErrorMessage(gs.getMessage('No table name was supplied.'));
        return;
    }

    if (!nait_label) {
        gs.addErrorMessage(gs.getMessage('No table label was supplied.'));
        return;
    }
    
    // get the sys_id of cmdb_ci_app record in sys_db_object and make sure it exists
    var applID = getApplTableID();
    if (JSUtil.nil(applID)) {
    	gs.addErrorMessage(gs.getMessage('Unable to find cmdb_ci_appl table in sys_db_object table'));
        return;
    }
    
    // get the real table name we will use
	var realTableName = createTable('cmdb_ci_appl_' + nait_name, nait_label, applID);				
	if (!realTableName)
	    return;
	
	// all inputs are valid, create the table and update its form layout
    var gr = new GlideRecord('discovery_classy_proc');
    if (gr.get(my_sys_id)) {
        gr.table = realTableName;
        gr.update();
    }
    copyFormFromAppl(realTableName);
}

// Create the child table and the proper table extension relationship
// return the actual name of the table in case it changes
function createTable(tableName, nait_label, applID) {
	// create the new child table
	cgr = new GlideRecord('sys_db_object');
	cgr.name = new TableUtils().getValidTableName(tableName);
	cgr.label = nait_label;
	cgr.super_class = applID;
	if (!cgr.insert())
	    return null;		

	return cgr.name;
}

//copy the form from cmdb_ci_appl_pending to the new table...
function copyFormFromAppl(tablename) {
 var gr = new GlideRecord('sys_ui_section');
 if (gr.get('name', 'cmdb_ci_appl_pending')) {
     var changes = {'name':tablename};
     var new_sys_id = insertDelta(gr, changes);
     if (new_sys_id) {
         changes = {'sys_ui_section':new_sys_id};
         var sys_id = '' + gr.getUniqueValue();
         gr = new GlideRecord('sys_ui_element');
         gr.addQuery('sys_ui_section', sys_id);
         gr.query();
         while (gr.next())
             insertDelta(gr, changes);
     }
 }
}

//insert a record into the same table as the given GlideRecord, copying its current record except changing the fields in the map...
function insertDelta(gr, changes) {
	var table = gr.getTableName();
	var sys_id = gr.getUniqueValue();
	var ngr = new GlideRecord(table);
	if (ngr.get(sys_id)) {
		for (var field in changes)
			ngr.setValue(field, changes[field]);
		
		return '' + ngr.insert();
	}
	
	return null;
}

function getApplTableID() {
	var gr = new GlideRecord('sys_db_object');
	gr.addQuery('name', 'cmdb_ci_appl');
	gr.query();
	if (gr.next())
		return gr.sys_id;
	
	return;
}
