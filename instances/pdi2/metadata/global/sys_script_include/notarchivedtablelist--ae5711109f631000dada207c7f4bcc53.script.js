    gs.include("PrototypeServer");
    var NotArchivedTableList = Class.create();

    NotArchivedTableList.prototype = Object.extendsObject(AbstractAjaxProcessor, {

        process: function() {
            this.currentTable = current ? current.table : null;
            this.currentApiOnly = current ? current.api_only : null;
            this.tableList = this._getTableList();

            return this.tableList;
        },

		//As part of Stories (STRY56652736 & STRY56570069) we multiple archive rules on same table as well as in the hierarchy.
		//We dont restrict any tables for both regular and API_ONLY.
        _getTableList: function() {
            var currentAppScope = gs.getCurrentApplicationId();

            var dd = new GlideRecordSecure('sys_dictionary');
            dd.addNullQuery('element');
            dd.addQuery('name', 'NOT MATCHES', 'ar\\_%');
            dd.addQuery('name', 'NOT MATCHES', 'ts\\_%');
            dd.addQuery('name', 'NOT MATCHES', 'cidx\\_%');

            var qc = dd.addQuery('attributes', 'DOES NOT CONTAIN', 'update_synch=true');
            qc.addOrCondition('attributes', '=', '');
            dd.orderBy('name');
            dd.query();

            var tableList = new Array();
            while (dd.next()) {
                var scope = dd.getValue('sys_scope');
                //only add tables belongs to the given application scope to the table list
                if (scope == currentAppScope) {
                    var tableName = dd.name + '';

                    //check if the table has no_archive attribute set
                    var td = GlideTableDescriptor.get(tableName);
                    if (td.getED().getBooleanAttribute('no_archive') || td.isDataFabricTable())
                        continue;

                    if (SncTableRotationExtensions.isRotationExtension(tableName) || SncTableRotationExtensions.isRotated(tableName))
                        continue;

                    tableList.push(tableName);
                }
            }

            return tableList;
        },

        type: "NotArchiveTableList"
    });
