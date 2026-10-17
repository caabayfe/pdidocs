/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_fieldLabel' the label of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
runContextAction();

function runContextAction() {
	var tableName = g_list.getTableName();
	var fields = g_list.fields;
	var query = g_list.getQuery({orderby:true});
	 
	//create a temp export definition based on list view with prefix ed_t.
	var gr = new GlideRecord('sys_export_definition');
	gr.setValue('name', 'ed_t_'+tableName);
	gr.setValue('filter', query);
	gr.setValue('field_list', fields);
	gr.setValue('table_name', tableName);
	var sysId = gr.insert();
	
	if(!sysId){
		alert("Failed to create temporary export definition based on list view.");
	}else{
		//redirect to sys_export_set.do
		var url = new GlideURL('sys_export_set.do');
		url.addParam('sys_id', '-1');
		url.addParam('sysparm_query', 'export_definition=' + sysId + '^name=es_t_' + tableName);
		url.addParam('sysparm_easy_export', 'true');
		url.addParam('sysparm_table', tableName);		

		window.location = url.getURL();
	}    					
} 
