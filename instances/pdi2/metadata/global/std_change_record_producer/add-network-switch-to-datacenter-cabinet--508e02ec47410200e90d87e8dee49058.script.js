current.std_change_producer_version = "a08e02ec47410200e90d87e8dee4905a";
if (gs.getProperty("com.snc.change_management.change_model.type_compatibility", "false") + "" === "true")
	current.type = "standard";
else
	current.chg_model = "e55d0bfec343101035ae3f52c1d3ae49";
GlideSysAttachment.copy("std_change_record_producer", "508e02ec47410200e90d87e8dee49058", current.getTableName(), current.getUniqueValue());
