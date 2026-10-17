function openOpsView() {
		var id = '';
	if (typeof rowSysId == 'undefined')
     id = gel('sys_uniqueValue').value;
	else
     id = rowSysId;

    window.open('/$flow-designer.do#/operations/context/'+id,"_new");

}
