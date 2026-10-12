current.std_change_producer_version = "5b7399bc53231300e321ddeeff7b1206";
if (gs.getProperty("com.snc.change_management.change_model.type_compatibility", "false") + "" === "true")
	current.type = "standard";
else
	current.chg_model = "e55d0bfec343101035ae3f52c1d3ae49";
GlideSysAttachment.copy("std_change_record_producer", "df7359bc53231300e321ddeeff7b12f9", current.getTableName(), current.getUniqueValue());
