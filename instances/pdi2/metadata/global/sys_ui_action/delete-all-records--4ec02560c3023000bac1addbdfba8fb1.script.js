			function deleteAllRecords() {
				var tableName = g_form.getElement("name").value;
				var tableLabel = g_form.getElement("label").value || tableName;
	
				var keyword = new GwtMessage().getMessage("delete").toLowerCase();
				var msg = new GwtMessage().format("Type the word \"{0}\" here", keyword);
				var name = prompt(new GwtMessage().format("To delete all records from table {0}", tableLabel), msg);
				if (!name || name.toLowerCase() != keyword) {
					alert(new GwtMessage().format("No record(s) deleted"));
					return;
				}

				var ga = new GlideAjax('RecordUtils');
				ga.addParam("sysparm_type", "deleteRecords");
				ga.addParam('sysparm_name', tableName);
				ga.getXMLAnswer(function (answer) {
					if (answer == null || answer == 0) {
						alert(new GwtMessage().format("Table {0} is already empty. No record(s) deleted.", tableLabel));
					} else {
						alert(new GwtMessage().format("{0} record(s) deleted from table {1}", answer, tableLabel));
					}
				});
			}
			
