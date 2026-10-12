gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'Started executing the Fix script: Fix Capability attribute label and info '));

var labelGr = new GlideRecord("sys_dictionary");
labelGr.addQuery("name", "sys_one_extend_definition_attribute");
labelGr.addQuery("element", "label");
labelGr.query();
if (labelGr.next()) {
    var internalType = labelGr.getValue("internal_type") || "";
    var attributes = labelGr.getValue("attributes") || "";
    if (internalType != "translated_text" || attributes.includes("serializer=com.glide.script.TranslatedTextXMLSerializer")) {
        labelGr.setValue("internal_type", "translated_text");
        labelGr.setValue("attributes", "serializer=com.glide.script.TranslatedTextXMLSerializer");
        labelGr.update();
        gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'OneExtendCapabilityAttribute: Successfully ensured the type of label column to translated_text and added serializer=com.glide.script.TranslatedTextXMLSerializer to attributes.'));
    }
}

var infoGr = new GlideRecord("sys_dictionary");
infoGr.addQuery("name", "sys_one_extend_definition_attribute");
infoGr.addQuery("element", "info");
infoGr.query();
if (infoGr.next()) {
    var infoInternalType = infoGr.getValue("internal_type") || "";
    var infoAttributes = infoGr.getValue("attributes") || "";
    if (infoInternalType != "translated_text" || infoAttributes.includes("serializer=com.glide.script.TranslatedTextXMLSerializer")) {
        infoAttributes.push("serializer=com.glide.script.TranslatedTextXMLSerializer");
        infoGr.setValue("internal_type", "translated_text");
        infoGr.setValue("attributes", "serializer=com.glide.script.TranslatedTextXMLSerializer");
        infoGr.update();
        gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'OneExtendCapabilityAttribute: Successfully ensured the type of info column to translated_text and added serializer=com.glide.script.TranslatedTextXMLSerializer to attributes.'));
    }
}

gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'Completed executing the Fix script: Fix Capability attribute label and info '));
