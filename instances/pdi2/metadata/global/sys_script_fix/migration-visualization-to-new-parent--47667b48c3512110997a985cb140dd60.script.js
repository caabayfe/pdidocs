		if (!pm.isZboot()) {
			var originalValue = gs.getProperty('glide.db.table.hierarchy_editor.live', true);
		    try {
		    	gs.setProperty('glide.db.table.hierarchy_editor.live', false);
				reparentServicePortalTable("par_visualization", "par_component", 'sys_metadata');
				var succ = reparentServicePortalTable("par_visualization_permission", "par_component_permission", '');
				if(succ) {
					migrationToComponentColumn();
				}
		    } finally {
				gs.setProperty('glide.db.table.hierarchy_editor.live', originalValue);
			}
		} else
		    gs.log('Upgrade: no need to re-parent Service Portal tables, zbooting');

		function reparentServicePortalTable(table, parent, oldParent) {
		    gs.log('Upgrade: starting ' + table + ' re-parent to ' + parent);
		    var tpc = new GlideTableParentChange(table);
		    if(tpc.change(oldParent, parent)) {
		    	gs.log('Upgrade: completed ' + table + ' re-parent to ' + parent);
		    	return true;
		    }
			else {
				gs.log('Upgrade: Failed to reparent ' + table + ' re-parent to ' + parent);
				return false;
			}
		}

		function migrationToComponentColumn() {
		    var gr = new GlideRecord('par_visualization_permission');
		    gr.addNullQuery('component');
		    gr.addNotNullQuery('visualization');
		    gr.query();
		    while (gr.next()) {
				gs.log('Upgrade: Migrating visualization to component for ' + gr.getUniqueValue());
		        gr.component = gr.visualization;
		        gr.visualization = undefined;
		        gr.update();
		    }
		}
