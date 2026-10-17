if (!pm.isZboot())
	deleteModelFields();

// we only need to delete the model fields that aren't camel cased
// the `element` column is lowercased but the `field_label`column is camel cased
// the table is locked down to maint only so customization is not allowed
function deleteModelFields() {
	var modelFields = new GlideRecord('sys_declarative_action_model_field');
  modelFields.query();

  while(modelFields.next()) {
    if (modelFields.getValue('element') != modelFields.getValue('field_label')) {
      modelFields.deleteRecord();
    }
}
}
