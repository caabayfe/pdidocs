			var gr = new GlideRecord(current.name);
			if (!gr.isValidField('sys_class_name')) {
				//Set the use parent app flag so that when the column is created it will
				//always be in sync with the table.
				try {
					SNC.Apps.setUseParentApp(true);
					new TableUtils().createClassField(current.name, current.sys_scope);
				} finally {
					SNC.Apps.setUseParentApp(false);
				}
			}
			
