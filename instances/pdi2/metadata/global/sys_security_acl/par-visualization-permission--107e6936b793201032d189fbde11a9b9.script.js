if(current.isNewRecord()) {
	answer = true;
} else if (current.owner) {
	answer = answer = new global.VizDesignerUtil().ownViz(current.component);
} else {
	answer = new global.VizDesignerUtil().canShareViz(current.component);
}
