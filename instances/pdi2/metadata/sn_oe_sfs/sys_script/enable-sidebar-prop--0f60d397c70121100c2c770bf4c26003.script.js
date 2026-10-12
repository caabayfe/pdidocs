(function executeRule(current, previous /*null when async*/) {

	var propGR = new GlideRecord("sys_properties");
	propGR.addQuery("name", "com.glide.cs.collab.enabled");
	propGR.query();
	if(propGR.next()){
		var sidebarbEnabled = propGR.getBooleanAttribute("value");
		if(!sidebarbEnabled){
			propGR.value = true;
			propGR.update();
		}
	}

})(current, previous);
