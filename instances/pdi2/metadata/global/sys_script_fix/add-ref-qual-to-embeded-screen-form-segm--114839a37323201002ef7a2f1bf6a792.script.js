var sysDictionaryGr = new GlideRecord("sys_dictionary");
	sysDictionaryGr.addQuery("name", "sys_sg_form_segment");
	sysDictionaryGr.addQuery("element", "embedded_screen");
	sysDictionaryGr.query();

	if(sysDictionaryGr.next()) {
		sysDictionaryGr.setValue("reference_qual", "javascript: new SgReferenceQualifiers().filterEmbeddedScreensForFormSegment()");
		sysDictionaryGr.update();
		gs.info(gs.getMessage("{0}: a new value for reference_qual was set", "[addRefQualToEmbeddedScreen]"));
	}
