(function executeRule(current, previous /*null when async*/) {
	if(!current.preview_fields) 
		return ;
	var fieldsArr = current.preview_fields.split(','); 
	if(fieldsArr.length>4)
	{ current.setAbortAction(true); 
	gs.addInfoMessage(gs.getMessage('Preview Fields can include a maximum of four fields'));
	}

})(current, previous);
