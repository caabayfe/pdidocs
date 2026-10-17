validateTableAndElementNames();

function validateTableAndElementNames() {
	var tu = new TableUtils();
	current.name = tu.sanitizeTableName(current.name.toString());
	var scope = current.sys_scope.toString();
	if (!scope && typeof parent != 'undefined' && parent != null && !parent.nil())
		scope = parent.sys_scope.toString();

	//separate checks for columns vs. tables
	if (current.element.nil()) { // table
		// If new table then sanitize the table name...
		if (current.isNewRecord()) {
			current.name = tu.getValidTableName(scope, current.name.toString());
		}
	} else { // column
		if (current.name.nil()) {
			current.setAbortAction(true);
			current.name.setError(gs.getMessage("Table name cannot be empty for columns."));
			gs.addErrorMessage(gs.getMessage("Table name cannot be empty for columns."));
		} else {
			//get the valid column name.  If inserting or if the name field
			//has changed, then the field needs to be valided.  If it is update
			//and the name hasn't changed, then there is no need to change the name.
			if (current.operation() == "insert" || current.element.changes()) {
				current.element = SNC.TableEditor.getValidScopedElementName(scope, current.element.toString(), current.name);
			}
			//get the valid column label
			current.column_label = SNC.TableEditor.getValidDocumentationLabel(current.column_label, current.element);

			if (current.internal_type.nil())
				current.internal_type = "string";

			//only need to check the element exists already on insert
			if (current.operation() == "insert") {
				var gr = new GlideRecord(current.name);
				//if the table name does not already exist, then
				//use getValidTableName to make sure name is proper.
				if (!gr.isValid()) {
					current.name = tu.getValidTableName(scope, current.name.toString());
					gr = new GlideRecord(current.name);
				}

				//if the table is invalid, then checking field validity does not
				//make sense.  This may happen during table insert.
				if (gr.isValid() && SNC.TableEditor.isValidInDescendants(current.name, current.element)) {
					current.setAbortAction(true);
					var errMsg = gs.getMessage("Column {0} already exists in this table or a table extended from it", current.element);
					current.element.setError(errMsg);
					gs.addErrorMessage(errMsg);
				}
				
				//check if we are coming from TableEditor and if it is table insert - need to check if element exists in parent table 
				else if (typeof parent != 'undefined' && parent != null && 
					!parent.nil() && parent.operation() == 'insert' && parent.getTableName() == 'sys_db_object' &&
					(!parent.super_class.nil())) {
					var sup = new GlideRecord('sys_db_object');
					if (sup.get(parent.super_class.toString()) && 
					   (GlideTableDescriptor.fieldExists(sup.name.toString(), current.element.toString()))) {
							current.setAbortAction(true);
							var errMsg = gs.getMessage("Column {0} already exists in this table or a table extended from it", current.element);
							current.element.setError(errMsg);
							gs.addErrorMessage(errMsg);
					}
				}
			}
		}
	}
}
