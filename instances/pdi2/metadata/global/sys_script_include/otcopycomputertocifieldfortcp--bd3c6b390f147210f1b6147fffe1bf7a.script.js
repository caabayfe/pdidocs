var OTCopyComputerToCIFieldForTCP = Class.create();
OTCopyComputerToCIFieldForTCP.prototype = {
    initialize: function() {},

    copyComputerToConfigurationItem: function() {
        try {
            gs.info("[OTCopyComputerToCIFieldForTCP][copyComputerToConfigurationItem] Copying computer field value to CI field started");
            var table = 'cmdb_tcp';
            var sourceField = 'computer';
            var targetField = 'cmdb_ci';
            var dbChunkSize = 500;
            var batchLimit = 1000;

            while (true) {
                var tcpGr = new GlideRecord(table);
                tcpGr.addEncodedQuery(sourceField + 'ISNOTEMPTY^' + targetField + 'ISEMPTY');
                tcpGr.setLimit(batchLimit);
                tcpGr.query();
                if (!tcpGr.hasNext()) {
                    break;
                }
                var computerVsTcpMap = {}; // key: computer sys_id, value: array of TCP records sys_ids
                while (tcpGr.next()) {
                    var computerSysId = tcpGr.getValue(sourceField);
                    if (gs.nil(computerSysId)) {
                        continue;
                    }
                    var tcpSysId = tcpGr.getUniqueValue();
                    if (gs.nil(computerVsTcpMap[computerSysId])) {
                        computerVsTcpMap[computerSysId] = [];
                    }
                    computerVsTcpMap[computerSysId].push(tcpSysId);
                }

                for (var computerId in computerVsTcpMap) {
                    var tcpSysIdArray = computerVsTcpMap[computerId];
                    if (!tcpSysIdArray || tcpSysIdArray.length === 0) {
                        continue;
                    }

                    var dbQuery = new GlideDBQuery(table);
                    dbQuery.addQuery(sourceField, computerId);

                    var dbu = new GlideDBUpdate(table);
                    dbu.setQuery(dbQuery);
                    dbu.setValue(targetField, computerId);
                    dbu.setChunkSize(dbChunkSize);
                    dbu.execute();
                }
            }
            gs.info("[OTCopyComputerToCIFieldForTCP][copyComputerToConfigurationItem] Copying computer field value to CI field completed");
        } catch (e) {
            gs.error("[OTCopyComputerToCIFieldForTCP][copyComputerToConfigurationItem] Exception occurred while copying records on 'cmdb_tcp' table : " + e.message);
        }
    },

    type: 'OTCopyComputerToCIFieldForTCP'
};
