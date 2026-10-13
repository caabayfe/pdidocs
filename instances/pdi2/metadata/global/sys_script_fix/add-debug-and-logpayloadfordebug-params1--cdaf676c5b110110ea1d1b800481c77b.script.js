var connectorDefinitionID;
var connectorDefinitionGR = new GlideRecord("em_connector_definition");
//here looking for vCenter, Solarwinds, vRealize, scom and zabbix connectors in this release
connectorDefinitionGR.addQuery("sys_id", "IN", "b98a4a914fc30300c95d38a18110c727,7e9fcf10eb6221006a668c505206feaf,60ae61d193201200c7a7b67a357ffb94,38996c33c332210039a3553a81d3aeab,804428c84f202200331efd218110c7c6");
connectorDefinitionGR.query();

while (connectorDefinitionGR.next()) {
    connectorDefinitionID = connectorDefinitionGR.getValue('sys_id');
    var connectorInstance = new GlideRecord('em_connector_instance');
    var connectorInstanceParam = new GlideRecord('em_connector_instance_value');

    connectorInstance.addQuery('connector_definition', connectorDefinitionID);
    connectorInstance.query();

    //For each of the instances of  vCenter, Solarwinds and vRealize connectors add debug and logPayloadForDebug params if it doesn't exists.
    while (connectorInstance.next()) {
        var connectorInstanceId = connectorInstance.sys_id;

        //For each of the instances of scom and zabbix add logPayloadForDebug params if it doesn't exists. debug is already there for these connectors.
        if (connectorInstance.connector_definition != "38996c33c332210039a3553a81d3aeab" && connectorInstance.connector_definition != "804428c84f202200331efd218110c7c6") {

            //check for existence of debug param, if it doesnt exist add it
            connectorInstanceParam.initialize();
            connectorInstanceParam.addQuery("connector_instance", connectorInstanceId);
            connectorInstanceParam.addQuery("name", "debug");
            connectorInstanceParam.query();

            //As debug param doesn't exist, adding it
            if (!connectorInstanceParam.next()) {
                //add debug param for instance
                connectorInstanceParam.initialize();
                connectorInstanceParam.connector_instance = connectorInstanceId;
                connectorInstanceParam.name = "debug";
                connectorInstanceParam.value = "false";
                connectorInstanceParam.insert();
            }
        }

        //check for existence of logPayloadForDebug param, if it doesn't exist add it
        connectorInstanceParam.initialize();
        connectorInstanceParam.addQuery("connector_instance", connectorInstanceId);
        connectorInstanceParam.addQuery("name", "logPayloadForDebug");
        connectorInstanceParam.query();

        //As logPayloadForDebug doesn't exist, adding it
        if (!connectorInstanceParam.next()) {
            //add logPayloadForDebug param for instance
            connectorInstanceParam.initialize();
            connectorInstanceParam.connector_instance = connectorInstanceId;
            connectorInstanceParam.name = "logPayloadForDebug";
            connectorInstanceParam.value = "false";
            connectorInstanceParam.insert();
        }

    }
}
