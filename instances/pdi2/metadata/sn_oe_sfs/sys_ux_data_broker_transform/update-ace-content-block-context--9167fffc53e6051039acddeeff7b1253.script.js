function transform(input) {
	gs.debug("[Update ACE Content Block Context] Inputs: {0}", JSON.stringify(input));
	
    if (input.fields == {}) {
        return;
    }
	var contentBlockId = input.recordId;
	var contextValuesToSet = input.fields;
	
	var ciUtil = new sn_oe_sfs.CIUtil();
	ciUtil.setContentBlockContext(contentBlockId, contextValuesToSet);
}
