var roleGR = new GlideRecord('sys_user_role');
roleGR.addQuery('name','IN','platform_document_management_delete,platform_document_management_reader,platform_document_management_writer');
roleGR.query();
if (roleGR.next()) {
	roleGR.deleteMultiple();
}

// Setting default values for the records created earlier. ie, during Rome release
// The below code must be removed from Tokyo as this fix script execution can potentially modify the documents created in SD

var gr = new GlideRecord('ds_document');
gr.query();

gr.inherited_access = true;
gr.share_access = false;
gr.admins_access = true;

gr.updateMultiple();
