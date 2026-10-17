(function executeRule(current, previous /*null when async*/) {
	if (current.type == previous.type) //if type hasn't changed
		return;
	
	var abort = false;

	//go to the lower level.
	var lowerSysID = getLowerLevel(current.sys_id);
	var gr = new GlideRecord('sys_report_map_source');
	if (gr.isValid()){
		gr.addQuery('sys_id',lowerSysID);
		gr.query();
		if(gr.next()){
			while(gr.sys_id != ''){
				//gs.addInfoMessage('checking sys_id=' + gr.sys_id + ' , name=' + gr.name);
				if (checkTypeWithParent(current.type, gr)){
					abort = true;
					break;
				}
				gr = gr.parent;
			}

			if (abort){
				gs.addErrorMessage(gs.getMessage('The Level you selected already exists in this map source hierarchy. Each level can exist only once.'));
				current.setAbortAction(true);
			} else {
				current.setAbortAction(false);
			}
		}
	}
		

})(current, previous);

function checkTypeWithParent(type, gr){
	var typeSysId = type.sys_id.toString();
	var grTypeSysId = gr.type.sys_id.toString();
	//gs.addInfoMessage('type.sys_id=' + typeSysId+', type=' + type.name);
	//gs.addInfoMessage('gr.type.sys_id='+ grTypeSysId+', gr.type=' + gr.type.name);
	//gs.addInfoMessage('gr.type.sys_id === type.sys_id ->' + gr.type.sys_id === type.sys_id);
	if (grTypeSysId === typeSysId)
		return true; //abort
	else 
		return false;
}

function getLowerLevel(sysId){
	var lowerSysId = sysId;
	var gr = new GlideRecord('sys_report_map_source');
	if (gr.isValid()) {
		
		gr.addQuery('parent',sysId);
		gr.query();
		if(gr.next()) {
			lowerSysId = getLowerLevel(gr.sys_id); 
			
			//gs.addInfoMessage('lower level sys_id='+lowerSysId + ', name=' + gr.name);
		}
		
	}
	
	return lowerSysId;
}
