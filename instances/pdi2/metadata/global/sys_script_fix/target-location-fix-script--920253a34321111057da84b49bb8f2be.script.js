var smartLinkGr = new GlideRecord("sys_cs_smart_link");
smartLinkGr.addQuery("target", "Popup");
smartLinkGr.addQuery("width", "");
smartLinkGr.addQuery("height", "");
smartLinkGr.query();
	
while(smartLinkGr.next()) {
	smartLinkGr.setValue('width', "large");
	smartLinkGr.setValue('height', "large");
	smartLinkGr.update();
}

gs.info("Successfully executed Target Location Fix Script");
