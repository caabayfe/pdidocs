var DiscoveryMSSQLSensor = Class.create();

DiscoveryMSSQLSensor.prototype = Object.extendsObject(DiscoverySensor, {

    process: function(result) {
        this.dataArray = [];
        this.parseResult(result);
    },

    parseResult: function(result) {
        current.version = result.version;
        current.tcp_port = result.port;
        current.short_description = result.description;

        this.populateDBCatalogs(result);

    },

    populateDBCatalogs: function(result) {
        var nodeArray = g_array_util.ensureArray(result.databases.database);

        for (var i = 0; i < nodeArray.length; i++) {
            var dataObj = {};
            dataObj.name = nodeArray[i]['@id'];
            dataObj.database_instance = this.getCmdbCi();

            this.dataArray.push(dataObj);
        }

        this.addToRelatedList('cmdb_ci_db_mssql_catalog', this.dataArray, 'database_instance', 'name');
    },

    zeroResults: function() {
        // do nothing; it's ok to have zero results from this sensor...
    },

    type: 'DiscoveryMSSQLSensor'
});
