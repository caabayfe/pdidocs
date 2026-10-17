(function executeRule(current, previous /*null when async*/ ) {
    var unsupported_db_type = SNC.CollationUtil.getDBType() !== 'RaptorDB';
    if (unsupported_db_type) {
        current.setAbortAction(true);
        gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Attribute not supported in databases other than RaptorDB"));
    }
    gs.info(current.schema.internal_type + "Check here");
    var schema_internal_type = current.schema.internal_type;
    var supported_type = schema_internal_type == 'string' || schema_internal_type == 'translated_text' || schema_internal_type == 'translated_field' || schema_internal_type == 'translated_html' || schema_internal_type == 'documentation_field';
    if (!supported_type) {
        current.setAbortAction(true);
        gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Attribute not supported for field type other than string or translated text or translated field or translated html"));
    }

	var tableName = current.schema.name;
	var is_rotated_table = SncTableRotationExtensions.isRotated(tableName);
	if (is_rotated_table) {
		current.setAbortAction(true);
        gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Attribute not supported for rotated tables."));
	}

	var is_sharded_table = SncTableRotationExtensions.isSharded(tableName);
	if (is_sharded_table) {
		current.setAbortAction(true);
		gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Attribute not supported for sharded tables."));
	}

	var is_extended_table = SncTableRotationExtensions.isExtension(tableName);
	if (is_extended_table) {
		current.setAbortAction(true);
		gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Attribute not supported for extended tables."));
	}

	var is_rotated_table = SncTableRotationExtensions.isRotated(current.schema.name);
	if (is_rotated_table) {
		current.setAbortAction(true);
        gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Attribute not supported for rotated tables."));
	}
})(current, previous);
