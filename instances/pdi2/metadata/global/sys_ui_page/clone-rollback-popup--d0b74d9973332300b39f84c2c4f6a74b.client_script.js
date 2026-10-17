var o = GlideDialogWindow.prototype.get('clone_rollback_popup');
var options = o.getPreference('options');
var rollbackReasonsList = document.getElementById("rollbackSelect");
var tarea = document.createElement('textarea');
tarea.setAttribute('id','rollbackReason');
tarea.setAttribute('placeholder','Specifying reason is mandatory.');
tarea.style.cssText = 'width:350px;height:100px;display:none';
var oDiv = document.getElementById('optionsDiv');
oDiv.appendChild(tarea);

var rollbackReasonTextArea = document.getElementById('rollbackReason');

for (var key in options) {
	var option = document.createElement("option");
	option.setAttribute("value", key);
	option.text = key;
	rollbackReasonsList.appendChild(option);
}

rollbackReasonTextArea.addEventListener("change",function onChangeReason(){
	if(this.value == '')
		document.getElementById('ok_button').disabled = true;
	else 
		document.getElementById('ok_button').disabled = false;
});

rollbackReasonsList.addEventListener("change",function onChangeReasonSelect(){
	if(this.options[this.selectedIndex].value == "Other") {
		document.getElementById('ok_button').disabled = true;
		tarea.style.display = "block";
	} else {
		document.getElementById('ok_button').disabled = false;
		tarea.style.display = "none";
	}
});

function rollback(){
	GlideDialogWindow.get().destroy();
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	var ga = new GlideAjax("InstanceCloneManagerAjax");
	ga.addParam("sysparm_name", "rollbackClone");
	ga.addParam("sysparm_sys_id", sysId); 
	ga.addParam("sysparm_table", "clone_instance");
	ga.addParam("sysparm_rollback_reason",rollbackReasonsList.options[rollbackReasonsList.selectedIndex].value);
	ga.addParam("sysparm_other_reason",tarea.value);
	ga.getXMLWait();
	if(ga.getAnswer()=='false') 
		alert("Clone cannot be rolled back since backup tables are not present");
	else 
		window.location = "clone_instance_list.do?sysparm_query=sys_id="+sysId;

	return true;	
}

function onCancel() {
   GlideDialogWindow.get().destroy();
   return false;
}
