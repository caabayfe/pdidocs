(function() {
	
	var sysDictionaryGr = new GlideRecord("sys_dictionary");
	sysDictionaryGr.addQuery("name", "sys_sg_grouped_input");
	sysDictionaryGr.addQuery("element", "ui_parameters");
	sysDictionaryGr.query();
	
	if(sysDictionaryGr.next()) {
		sysDictionaryGr.setValue("reference_qual", "javascript:new SgReferenceQualifiers().getGroupedInputReferenceQualifier();");
		sysDictionaryGr.update();
	}
})();
        
