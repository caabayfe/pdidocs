    // Prevent duplicates and convert name
	if (current.operation() == 'insert') {
			// Prevent nil names
             if (current.name.nil()) {
                current.setAbortAction(true);
                var errorMessage = gs.getMessage('Table name cannot be nil');
                current.name.setError(errorMessage);
                gs.addErrorMessage(errorMessage);
            } else if (/^[0-9]/.test(current.name)) {
				current.setAbortAction(true);
				errorMessage = gs.getMessage('Table name cannot start with numeric value');
                current.name.setError(errorMessage);
                gs.addErrorMessage(errorMessage);
			} else {
            //Logic for to make sure the table name is valid.  Starts with "u_" or the scope prefix,
			//is less than 80 characters, and is alphanumeric lowercase or underscores.
			current.name = new TableUtils().getValidTableName(current.sys_scope.toString(), current.name.toString());

			var dup = new GlideRecord('sys_db_object');
			dup.addQuery('name', current.name);
			dup.query();
			if (dup.hasNext()) {
				current.setAbortAction(true);
				current.name.setError(gs.getMessage('Table name {0} is already in use', current.name));
				gs.addErrorMessage(gs.getMessage('Table name {0} is already in use', current.name));
			}

			//make sure the super class is extensible
			if (!current.super_class.nil()) {
				var sup = new GlideRecord('sys_db_object');
				var extendable = false;
				if (sup.get(current.super_class))
					extendable = sup.is_extendable;

				if (!extendable) {
					current.setAbortAction(true);
					current.super_class.setError(gs.getMessage('{0} is not currently marked as extensible', sup.name));
					gs.addErrorMessage(gs.getMessage('{0} is not currently marked as extensible', sup.name));
				}
			}
			var prevLabel = current.label.toString();
			current.label = SNC.TableEditor.getValidDocumentationLabel(current.label, current.name);
			// Table labels are Title Case, so do that if we're auto-generating the label
			if (GlideStringUtil.nil(prevLabel))
				current.label = GlideStringUtil.toTitleCase(current.label);
            }

		} else if (current.operation() == 'update') {
			//name is enter once
			if (previous.name != current.name) {
				current.setAbortAction(true);
				current.name.setError(gs.getMessage('Cannot change the name of a table after it is created', current.name));
				gs.addErrorMessage(gs.getMessage('Cannot change the name of a table after it is created', current.name));
			}

			//super class is enter once
			if (previous.super_class != current.super_class) {
				current.setAbortAction(true);
				current.super_class.setError(gs.getMessage('Cannot change what a table extends after it is created'));
				gs.addErrorMessage(gs.getMessage('Cannot change what a table extends after it is created'));
			}

			//make sure the "notExtended" tables are not made extensible.
			if (current.is_extendable == true) {
				if (SNC.TableEditor.notExtended(previous.name)) {
					current.setAbortAction(true);
					current.is_extendable.setError(gs.getMessage('{0} is a reserved table that cannot be extended', previous.name));
					gs.addErrorMessage(gs.getMessage('{0} is a reserved table that cannot be extended', previous.name));
				}
			}
			current.label = SNC.TableEditor.getValidDocumentationLabel(current.label, current.name);
		}
