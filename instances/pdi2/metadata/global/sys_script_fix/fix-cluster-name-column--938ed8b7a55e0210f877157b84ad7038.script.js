
            
            var tableName = 'cmdb_resource_location';
            var columnName = 'cluster_name';
            var newLabel = 'Cluster Name';
            var dictionaryTable = 'sys_dictionary';
            var sysDictGR = new GlideRecord(dictionaryTable);
            sysDictGR.addQuery('name', tableName);
            sysDictGR.addQuery('element', columnName);
            sysDictGR.addQuery('column_label', '!=', newLabel);
            sysDictGR.query();

            if (sysDictGR.next()) {
                sysDictGR.setValue('column_label', newLabel);
                sysDictGR.update();
                gs.info("DEF0473730: Column label for column name '{0}' in table '{1}' is updated to '{2}' ", columnName, tableName, newLabel);
            } else {
                gs.info("DEF0473730: Record not found for query: table = '{3}', name = '{0}', element = '{1}', column_label != '{2}' ", tableName, columnName, newLabel, dictionaryTable);
            }
