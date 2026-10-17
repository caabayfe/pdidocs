(function(){
	var uia = new GlideRecord("sys_ui_action");
	if (uia.get("b6fd9e04bf6030007a6d257b3f073959")) {
		uia.active = false;
		uia.update();
	}	
})();
