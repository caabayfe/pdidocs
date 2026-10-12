// To be able to write you need to have 'viz_creator' and be a new visualization (new)  or be the owner (edit)
if (current.isNewRecord())
	answer = true;
else 
	// check if you are the owner. For that it needs to be an entry for the user for the visualization with owner column = true
	answer = new global.VizDesignerUtil().ownViz(current.sys_id);
