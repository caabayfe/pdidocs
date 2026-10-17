if (current.name.nil()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('No table name exists. The table name cannot be deleted.'));
		} else {
			var has_extensions = SNC.TableEditor.hasExtensions(current.name);
			var isDeletable = new DictionaryUtils().isDeletable(current);
			if (has_extensions) {
				current.setAbortAction(true);
				var exts = SNC.TableEditor.getTableExtensions(current.name);
				gs.addErrorMessage(gs.getMessage('The following tables extend this one: {0} Tables extended by other tables cannot be deleted.', exts));
			} else if (!current.canDelete() || !isDeletable) {
			  current.setAbortAction(true);
			  gs.addErrorMessage(gs.getMessage('Insufficient rights to delete table {0}. User does not have delete access.', current.name));
			}
		}
