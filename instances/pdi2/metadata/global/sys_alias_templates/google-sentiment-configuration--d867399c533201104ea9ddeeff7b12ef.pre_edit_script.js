(function execute(aliasId, connectionSysId, jsonDefaultData, jsonDynamicData) {
   // aliasId: sys_id of the alias record.
   // connectionSysId: sys_id of the connection record created by using the default and dynamic data.
   // jsonDefaultData (String): The default JSON template data from template table.
   // e.g. var jsonDefaultParsed = JSON.parse(jsonDefaultData);
   //      gs.info("default connection url = " + jsonDefaultParsed["connection"]["connection_url"]);
   // jsonDynamicData (String): Current values of Connection and Credential fields (except Password fields) based on the key-value pairs defined in "Dynamic Data".
   // e.g. var jsonDynamicParsed = JSON.parse(jsonDynamicData);
   //      gs.info("dynamic connection url = " + jsonDynamicParsed["connection.connection_url"]);

   //returns array of objects. Each object has name-value pairs for populating additional fields values in connections dashboard in the edit view.
   //In this example script, additionalField1, additionalField2 are additional fields.
   //Here we define calcAdditionalField1(), calcAdditionalField2() functions in the script
   //to calculate current values for additionalField1, additionalField2.

   //return [{
   //         name: "additionalField1"
   //         value: calcAdditionalField1(),
   //    },
   //    {
   //         name: "additionalField2"
   //         value: calcAdditionalField2(),
   //    }
   //];
})(aliasId, connectionSysId, jsonDefaultData, jsonDynamicData);
