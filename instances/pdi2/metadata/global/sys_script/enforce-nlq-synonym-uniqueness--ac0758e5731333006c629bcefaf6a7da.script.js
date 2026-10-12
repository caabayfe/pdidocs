(function executeRule(current, previous /*null when async*/) {
			var table = current.table;
			var element = current.element;
			var language = current.language;
			var record = current.record;
			if (table != previous.table || (element != previous.element) || (record != previous.record) || (language != previous.language)) {
				var synonymsRecord = new GlideRecord("nlq_synonym");
				synonymsRecord.addQuery("element", element);
				synonymsRecord.addQuery("record", record);
				synonymsRecord.addQuery("table", table);
				synonymsRecord.addQuery("language", language);
				synonymsRecord.query();

				if (synonymsRecord.hasNext()) {
					gs.addErrorMessage(gs.getMessage("Synonyms for specified table and column (or) record already exist. Please update the existing record."));
					current.setAbortAction(true);
				}
			}

		})(current, previous);
