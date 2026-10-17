		var LOG_PREFIX = 'fix_csdm5_service_auto_label: ';

		/**
		 *
		 * @param {String} table the name of the table in the schema.
		 * @param {String} prevLabel if current label isn't equal this value, the renaming is skipped.
		 * @param {String} newLabel
		 * @returns
		 */
		function renameTableLabel(table, prevLabel, newLabel) {
		    var dbObj = new GlideRecord("sys_db_object");
		    dbObj.addQuery("name", table);
		    dbObj.query();

		    if (!dbObj.next()) {
		        gs.info(LOG_PREFIX + 'table ' + table + ' not found on sys_db_object.\nSkipping label change.');
		        return;
		    }

		    var currLabel = String(dbObj.getValue('label'));

		    //already changed, skip
		    if (currLabel === newLabel)
		        return;

		    if (currLabel !== prevLabel) {
		        gs.info(LOG_PREFIX + 'table ' + table + ' appears to have customized label. Expected: ' + prevLabel + ', having: ' + currLabel +
		            '\nSkipping label change.');
		        return;
		    }

		    dbObj.setValue('label', newLabel);
		    dbObj.update();
		    gs.info(LOG_PREFIX + 'Modified label for table ' + table + ' from \'' + currLabel + '\' to \'' + newLabel + '\'.');
		}

		/**
		 *
		 * @param {String} table the name of the table in the schema.
		 * @param {Array} expectedLabels put all expected labels here.
		 * If current plural label doesn't match any of the expected, then renaming is skipped.
		 * When changing singular label on sys_db_object, the plural label may update automatically on sys_documentation.
		 * Because of that, expectedLabels should contain the original plural bale, and the new singular label with 's' appended at the end.
		 * @param {String} newLabel
		 */
		function renameTableLabelPlural(table, expectedLabels, newLabel) {
		    var docObj = new GlideRecord("sys_documentation");
		    docObj.addQuery("name", table);
		    docObj.addQuery('language', 'en');
		    docObj.addNullQuery("element");
		    docObj.query();

		    if (!docObj.next()) {
		        gs.info(LOG_PREFIX + 'table ' + table + ' not found on sys_documentation.\nSkipping plural label change.');
		        return;
		    }

		    var currLabel = String(docObj.getValue("plural"));

		    //already changed, skip
		    if (currLabel === newLabel)
		        return;

		    if (expectedLabels.indexOf(currLabel) === -1) {
		        gs.info(LOG_PREFIX + 'table ' + table + ' appears to have customized plural label. Expected one of: [' + expectedLabels.join(',') + '], having: ' + currLabel +
		            '\nSkipping plural label change.');
		        return;
		    }

		    docObj.setValue("plural", newLabel);
		    docObj.update();
		    gs.info(LOG_PREFIX + 'Modified plural label for table ' + table + ' from \'' + currLabel + '\' to \'' + newLabel + '\'.');
		}


		/**
 		* @param {String} tableName the table in which the field is in.
 		* @param {String} fromLabel the current label
 		* @param {String} toLabel the new label to set
 		*/
		function changeColumnLabel(tableName, fromLabel, toLabel) {
            var dictGr = new GlideRecord("sys_dictionary");
            dictGr.addQuery("name", tableName);
            dictGr.addQuery("column_label", fromLabel);
            dictGr.query();
            if (dictGr.next()) {
                dictGr.setValue("column_label", toLabel);
                dictGr.update();
                gs.log(LOG_PREFIX + "The column label '" + fromLabel + "' of '" + tableName + "' table has been changed to '" + toLabel + "'.");
                return;
            }
            gs.log(LOG_PREFIX + "The column label '" + fromLabel + "' of '" + tableName + "' table wasn't found.");
        }


		function execute() {
		    if (pm.isZboot()) {
		        gs.info(LOG_PREFIX + "skipping on z-boot. Relevant only for upgrade flow.");
		        return;
		    }

		    var scope = gs.getCurrentScopeName();
		    if ("rhino.global" != scope) {
		        gs.info(LOG_PREFIX + 'skipping because not in global scope: ' + scope);
		        return;
		    }

		    gs.info(LOG_PREFIX + 'started fix run.');
		    var table = 'cmdb_ci_service_auto';
		    renameTableLabel(table, 'Application Service', 'Service Instance');
		    var expectedPluralLabels = [
		        'Application Services'
		    ];
		    renameTableLabelPlural(table, expectedPluralLabels, 'Service Instances');

			changeColumnLabel('sa_service_group_member', 'Application Service', 'Service Instance');
		    gs.info(LOG_PREFIX + 'finished fix run.');
		}

		execute();
