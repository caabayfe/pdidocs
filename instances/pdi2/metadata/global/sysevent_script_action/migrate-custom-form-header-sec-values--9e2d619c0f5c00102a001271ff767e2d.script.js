    (function migrateFormHeaderSecondaryValues(){
 				var gr = new GlideRecord('sys_aw_form_header');
				gr.query();
				while (gr.next()) {
					var formheaderSysId = gr.getUniqueValue();
					var fieldNames = gr.getValue('secondary_fields');
					var fieldNamesArray = fieldNames ? fieldNames.split(',') : [];
					var checkAlreadyMigrated = new GlideRecord('sys_aw_form_header_secondary_values');
					checkAlreadyMigrated.addQuery('form_header', formheaderSysId);
					checkAlreadyMigrated.query();
					if (!checkAlreadyMigrated.next()) {
						for (var i = 0; i < fieldNamesArray.length; i++) {
									var newGr = new GlideRecord('sys_aw_form_header_secondary_values');
									newGr.initialize(); 
									newGr.field = fieldNamesArray[i];
									newGr.form_header = formheaderSysId;
									newGr.active = true;
									newGr.order = (i + 1) * 100;
									newGr.sys_scope =  gr.getValue('sys_scope');
									newGr.setWorkflow(false);
									newGr.insert();
						}
						gr.setValue('secondary_fields','');
						gr.setWorkflow(false);
						gr.update();
					}
				}
	})();
