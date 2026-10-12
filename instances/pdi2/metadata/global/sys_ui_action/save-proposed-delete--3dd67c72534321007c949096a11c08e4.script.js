function proposeDelete(){
	var sysId = gel('sys_uniqueValue').value;
	var changeSet = gel('sysparm_changeset').value;
	
	var ajax = new GlideAjax('DeleteRelationshipAjax');
	ajax.addParam("sysparm_type", "deleteRelationship");
    ajax.addParam("sysparm_value", sysId);
	ajax.addParam("sysparm_changeset", changeSet);
	ajax.getXML(success);
	
	function success(){
		history.go(-1);
	}
}
		
