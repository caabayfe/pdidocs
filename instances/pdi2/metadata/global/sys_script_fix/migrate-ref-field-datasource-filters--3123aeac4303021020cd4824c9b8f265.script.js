
		function fixMigratedFilters() {
			if (pm.isZboot()) {
				return;
			}

			var fixScript = "Migrate ref. field datasource filters";

			function getReferenceTable(table, field) {
				var gr = new GlideRecord(table);
				if (gr.isValid()) {
					var ge = gr.getElement(field);
					if (ge != null) {
						var ed = ge.getED();
						if (ed != null && ed.isReference())
							return ed.getReference();
					}
				}
				gs.error(table + '.' + field + ' is not valid or not a reference field', fixScript);
				return null;
			}

			function migrateDatasource(oldDatasource) {
				// only update if the datasource is a reference field, in which case we need to convert to table source.

				// migration for filters configurations pre-Xanadu
				if (oldDatasource.type === 'table' &&
					oldDatasource.table && oldDatasource.table.id &&
					oldDatasource.field && oldDatasource.field.id &&
					oldDatasource.field.type === 'reference' && !oldDatasource.field.reference) {

					var reference = getReferenceTable(oldDatasource.table.id, oldDatasource.field.id);
					if (reference) {
						return {
							type: oldDatasource.type,
							table: {
								id: reference
							},
							encodedQuery: oldDatasource.encodedQuery,
							emptyOption: oldDatasource.emptyOption,
							choices: oldDatasource.choices
						};
					}
				}

				// migration for Xanadu filters that may have been converted from an reference field configuration
				if (oldDatasource.type === 'table' &&
					oldDatasource.payload &&
					oldDatasource.payload.table &&
					oldDatasource.payload.field &&
					oldDatasource.payload.fieldType === 'reference'
				) {
					reference = getReferenceTable(oldDatasource.payload.table, oldDatasource.payload.field);
					if (reference) {
						return {
							type: oldDatasource.type,
							payload: {
								table: reference
							},
							encodedQuery: oldDatasource.encodedQuery,
							emptyOption: oldDatasource.emptyOption,
							choices: oldDatasource.choices
						};
					}
				}

				return oldDatasource;
			}

			function updateFilterConfiguration(gr, table, field) {
				gr.query();

				gs.log(gr.getRowCount() + ' filters found in table ' + table + '. Updating filters in need of migration.', fixScript);
				while (gr.next()) {
					var properties = gr.getValue(field);
					if (properties) {
						var parsedProperties = JSON.parse(properties);
						var oldDatasource = parsedProperties.datasource;
						if (oldDatasource) {
							var migratedDatasource = migrateDatasource(oldDatasource);
							if (migratedDatasource !== oldDatasource) {
								parsedProperties.datasource = migratedDatasource;
								gs.log('Migrating datasource for filter ' + gr.getUniqueValue() + ' stored in ' + table, fixScript);
								gr.setValue(field, JSON.stringify(parsedProperties));
								gr.update();
							}
						}
					}
				}
			}

			gs.log('Filter datasource update started', fixScript);
			// Update filters in par_dashboard_widget
			var table = 'par_dashboard_widget';
			var filterGr = new GlideRecord(table);
			if (filterGr.isValid()) {
				filterGr.addQuery('component.name', 'Filter');
				updateFilterConfiguration(filterGr, table, 'component_props');
			}

			// Update filters in par_component_filter
			table = 'par_component_filter';
			filterGr = new GlideRecord(table);
			if (filterGr.isValid()) {
				filterGr.addQuery('macroponent.name', 'Filter');
				updateFilterConfiguration(filterGr, table, 'properties');
			}
			gs.log('Filter datasource update completed', fixScript);
		}

		fixMigratedFilters();
