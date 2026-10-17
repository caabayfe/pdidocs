(function() {
	gs.log("Event Management: EM - DelSyncAttrOnConnectorInstanceValue fix script initiated to remove the update_synch attribute from em_connector_instance_value table");
	SNC.DictionaryAttribute.remove("em_connector_instance_value", "", "update_synch");
	gs.log("Event Management: EM - DelSyncAttrOnConnectorInstanceValue fix script has finished");
})();
