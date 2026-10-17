if (current.role && !gs.hasRole('viz_admin'))
	answer = false;
else 
	answer = new global.VizDesignerUtil().canShareViz(current.component);
