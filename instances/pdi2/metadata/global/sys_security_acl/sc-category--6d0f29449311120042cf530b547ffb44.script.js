if(current.parent.toString()){
	if(gs.getUserID()==current.parent.sc_catalog.manager.toString()||(current.parent.sc_catalog.editors.toString()).indexOf(gs.getUserID())!=-1)
		answer = true;
}
else{
	if(!current.sc_catalog.toString())
		answer = true;
	else if(gs.getUserID()==current.sc_catalog.manager.toString()||(current.sc_catalog.editors.toString()).indexOf(gs.getUserID())!=-1)
		answer = true;
}
