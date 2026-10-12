		begin();

		function begin() {
			var gr = new GlideRecord(current_table);

			if (SNC.MetadataLinkUtil.isTableMetadataLinkExempt(current_table)) {
				gs.addInfoMessage(
					gs.getMessage('ServiceNow prevents publishing records for the table "{0}" because they can potentially cause a security risk when installed on other instances', current_table));
				refresh();
				return;
			}

			if (sys_id_list) {
				var selectedRecords = sys_id_list.split(',');
				gr.addQuery('sys_id', selectedRecords);
			}
			if (current_query) {
				gr.addQuery(current_query);
			}
			gr.query();

			var recCntr = 0;
			var invRecCntr = 0;
			while (gr.next()) {
				if (!this.metadataAlreadyExists(gr)) {
					this.addMetadata(gr);
					recCntr++;
				} else {
					if (this.overwriteMetadata(gr))
						invRecCntr++;
				}
			}
			this.printInfoMessage(recCntr, invRecCntr);
			refresh();
		}

		function metadataAlreadyExists(gr) {
			var output = new GlideRecord('sys_metadata_link');
			output.query();

			// Searches for current record in metadata table, outputs false if it doesn't exist
			while (output.next()) {
				// Checking if the record already exists in the metadata link table
				if (output.documentkey == gr.sys_id && output.sys_scope == gs.getCurrentApplicationId() &&
						output.directory == dir_choicelist && output.tablename == current_table) {
					return true;
				}
			}
			return false;
		}

		function addMetadata(linkedRecord) {
			var payloadStr = gs.unloadRecordToXML(linkedRecord, true);
			var output = new GlideRecord('sys_metadata_link');
			output.query();
			output.initialize();
			output.payload = payloadStr;
			output.documentkey = linkedRecord.sys_id;
			output.tablename = current_table;
			output.sys_name = linkedRecord.getDisplayValue();
			output.directory = dir_choicelist;
			output.insert();
		}

		function overwriteMetadata(linkedRecord) {
			var payloadStr = gs.unloadRecordToXML(linkedRecord, true);
			var output = new GlideRecord('sys_metadata_link');
			output.addQuery('documentkey', linkedRecord.sys_id);
			output.addQuery('sys_scope', gs.getCurrentApplicationId());
			output.addQuery('tablename', current_table);
			output.addQuery('directory', dir_choicelist);
			output.query();

			if (output.next()) {
				output.payload = payloadStr;
				output.sys_name = linkedRecord.getDisplayValue();
				return output.update();
			}

			return null;
		}

		function printInfoMessage(insertCount, updateCount) {
			var msg = '';
			var href = 'sys_scope.do?sys_id=' + gs.getCurrentApplicationId();
			if (insertCount > 0 && updateCount <= 0) {
				if (insertCount > 1)
					msg = gs.getMessage('Created {0} new application files in <a href="{1}">{2}</a>',
							[String(insertCount), href, gs.getCurrentApplicationName()]);
				else
					msg = gs.getMessage('Created one new application file in <a href="{0}">{1}</a>',
							[href, gs.getCurrentApplicationName()]);
			}
			if (updateCount > 0 && insertCount <= 0) {
				if (updateCount > 1)
					msg = gs.getMessage('Updated {0} existing application files in <a href="{1}">{2}</a>',
							[String(updateCount), href, gs.getCurrentApplicationName()]);
				else
					msg = gs.getMessage('Updated one existing application file in <a href="{0}">{1}</a>',
							[href, gs.getCurrentApplicationName()]);
			}
			if (insertCount > 0 && updateCount > 0) {
				msg = gs.getMessage('Created {0} new and updated {1} existing application files in <a href="{2}">{3}</a>',
						[String(insertCount), String(updateCount), href, gs.getCurrentApplicationName()]);
			}

			if (msg !== '') gs.addInfoMessage(msg);
		}

		function refresh() {
			var urlOnStack = GlideSession.get().getStack().bottom();
			response.sendRedirect(urlOnStack);
		}
		
