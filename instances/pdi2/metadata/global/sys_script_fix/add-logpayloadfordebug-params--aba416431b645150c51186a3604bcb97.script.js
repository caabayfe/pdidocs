var connectorDefinitionID;
var connectorDefinitionGR = new GlideRecord("em_connector_definition");
//here looking for opsview connector in this release
connectorDefinitionGR.addQuery("sys_id", "IN", "08fe44594fb84300d0c278e18110c764");
connectorDefinitionGR.query();

while (connectorDefinitionGR.next()) {
    connectorDefinitionID = connectorDefinitionGR.getValue('sys_id');
    var connectorInstance = new GlideRecord('em_connector_instance');
    var connectorInstanceParam = new GlideRecord('em_connector_instance_value');

    connectorInstance.addQuery('connector_definition', connectorDefinitionID);
    connectorInstance.query();

    //For each of the instances of opsview connector add  logPayloadForDebug params if it doesn't exists.
    while (connectorInstance.next()) {
        var connectorInstanceId = connectorInstance.sys_id;

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
