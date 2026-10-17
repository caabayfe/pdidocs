function publish() {
   var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
   var gDialog = new dialogClass('publish_to_product_catalog');
   gDialog.setWidth("500");
   gDialog.setTitle('Publish ' + g_form.getValue('display_name') + ' to Software Catalog');
   gDialog.setPreference('sysparm_display_name', g_form.getValue('name'));
   gDialog.setPreference('sysparm_sys_id', g_form.getUniqueValue());
   gDialog.setPreference('sysparm_type', 'vendor');
   gDialog.setPreference('sysparm_catalog', 'software');
   gDialog.render();
}
