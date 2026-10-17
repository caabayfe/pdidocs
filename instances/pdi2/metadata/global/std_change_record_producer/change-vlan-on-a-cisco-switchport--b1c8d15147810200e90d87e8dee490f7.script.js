current.std_change_producer_version = "f1c8d15147810200e90d87e8dee490f9";
if (gs.getProperty("com.snc.change_management.change_model.type_compatibility", "false") + "" === "true")
	current.type = "standard";
else
	current.chg_model = "e55d0bfec343101035ae3f52c1d3ae49";
GlideSysAttachment.copy("std_change_record_producer", "b1c8d15147810200e90d87e8dee490f7", current.getTableName(), current.getUniqueValue());
