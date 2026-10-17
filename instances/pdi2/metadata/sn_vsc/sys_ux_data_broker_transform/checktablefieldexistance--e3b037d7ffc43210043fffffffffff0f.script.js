function transform({tableName, fieldName}) {
    return new GlideRecord(tableName).isValidField(fieldName);
}
