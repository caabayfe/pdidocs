gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'Started executing the Fix script: Change CapabilityDef metadata column'));
var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_one_extend_capability_definition");
gr.addQuery("element", "metadata");
gr.query();
if (gr.next()) {
    var internalType = gr.getValue("internal_type");
    var maxLength = parseInt(gr.getValue("max_length") || "0");
    if (internalType != "json" || maxLength != 8000) {
		gs.info(internalType);
		gs.info(maxLength);
        gr.setValue("internal_type", "json");
        gr.setValue("max_length", "8000");
        gr.update();
        gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'OneExtendCapabilityDefinition: Successfully ensured the type of column to json and maxLength to 8000.'));
    }
}
gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'Completed executing the Fix script: Change CapabilityDef metadata column'));
