function rollback(){
   GlideDialogWindow.get().destroy();
   if (typeof rowSysId == 'undefined')
      sysId = gel('sys_uniqueValue').value;
   else
      sysId = rowSysId; 
   
   var ga = new GlideAjax("InstanceCloneManagerAjax");
   ga.addParam("sysparm_name", "rollback");
   ga.addParam("sysparm_sys_id",sysId); 
   ga.addParam("sysparm_table", "clone_instance");
   ga.getXMLWait();
	if(ga.getAnswer()=='false') {
		alert("Cannot be rolled back since backup tables are not present");
	} else {
		window.location = "clone_instance_list.do?sysparm_query=sys_id="+sysId;
	}
   return true;	
}  

function onCancel() {
   GlideDialogWindow.get().destroy();
   return false;
}
