// If the view name has changed, delete previous Field Label and List records. The new Field Label is created in the 
// 'SNC - Database View Documentation' Business Rule and the new List record is created when the list of the db view is navigated to
// If the view is deleted, also delete the associated Field Label and list records
if (current.name.changes())
	deleteRecords(previous.name);
else
	deleteRecords(current.name);
	
	
function deleteRecords(name) {
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', name);
	doc.addQuery('language', session.getLanguage());
	doc.query();
	doc.deleteMultiple();

	var list = new GlideRecord('sys_ui_list');
	list.addQuery('name', name);
	list.query();
	list.deleteMultiple();
	
	gs.info(gs.getMessage("Removing sys_documentation and sys_ui_list records associated with sys_db_view record {0} because the view has been modified or deleted"), name);
}

	
	
