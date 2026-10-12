			function openSchemaMap() {
				var tableName = g_form.getElement("name").value;
				window.location = 'generic_hierarchy_erd.do?' +
						'sysparm_attributes=table_history=,table=' + tableName + ',show_internal=true,' +
						'show_referenced=false,show_referenced_by=false,show_extended=true,show_extended_by=true,' +
						'table_expansion=,spacing_x=60,spacing_y=90,nocontext';
			}
			
