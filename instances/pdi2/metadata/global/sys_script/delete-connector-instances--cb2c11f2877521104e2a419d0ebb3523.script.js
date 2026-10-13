deleteConnectorInstances();

function deleteConnectorInstances() {
    gs.addInfoMessage(gs.getMessage("Deleting the Pull Connector definition deletes all existing Pull Connector instances associated with this definition."));
    var sysId = current.sys_id;
	var gr = new GlideRecord('em_connector_instance');
	gr.addQuery('connector_definition', sysId);
	gr.query();
	gr.deleteMultiple();
}
