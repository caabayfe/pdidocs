var cancelReasonSelect = document.getElementById('cancelSelect');
var o = GlideDialogWindow.prototype.get('clone_cancel_popup');
var options = o.getPreference('options');
var tarea = document.createElement('textarea');
tarea.setAttribute('id','cancelReason');
tarea.setAttribute('placeholder','Specifying reason is mandatory.');
tarea.style.cssText = 'width:350px;height:100px;display:none';
var oDiv = document.getElementById('optionsDiv');
oDiv.appendChild(tarea);

var cancelReasonTextArea = document.getElementById('cancelReason');

for (var key in options) {
	var option = document.createElement("option");
	option.setAttribute("value", key);
	option.text = key;
	cancelReasonSelect.appendChild(option);
}

cancelReasonTextArea.addEventListener("change",function onChangeReason(){
	if(this.value == '')
		document.getElementById('ok_button').disabled = true;
	else 
		document.getElementById('ok_button').disabled = false;
});

cancelReasonSelect.addEventListener("change",function onChangeReasonSelect(){
	if(this.options[this.selectedIndex].value == "Other") {
		document.getElementById('ok_button').disabled = true;
		tarea.style.display = "block";
	} else {
		document.getElementById('ok_button').disabled = false;
		tarea.style.display = "none";
	}
});

function onOk() {
	GlideDialogWindow.get().destroy();
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId; 	
	var ga = new GlideAjax("InstanceCloneManagerAjax");
	ga.addParam("sysparm_name", "cancelClone");
	ga.addParam("sysparm_sys_id", sysId); 
	ga.addParam("sysparm_table", "clone_instance");
	ga.addParam("sysparm_cancel_reason",cancelReasonSelect.options[cancelReasonSelect.selectedIndex].value);
	ga.addParam("sysparm_cancel_other_reason",tarea.value);
	ga.getXMLWait();
	if(ga.getAnswer()=='false') 
		alert("Clone cannot be Canceled");
	else 
		window.location = "clone_instance_list.do?sysparm_query=sys_id="+sysId;

}

function onCancel() {
	 GlideDialogWindow.get().destroy();
}
