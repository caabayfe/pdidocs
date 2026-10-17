if (GlideStringUtil.nil(current.inputs.field_values) && GlideStringUtil.notNil(current.inputs.table)) {
		var encQuery = SNC.ATFFormUtil.getEncodedMandatoryFields(new GlideRecord(current.inputs.table));
		current.inputs.field_values = encQuery;
}
