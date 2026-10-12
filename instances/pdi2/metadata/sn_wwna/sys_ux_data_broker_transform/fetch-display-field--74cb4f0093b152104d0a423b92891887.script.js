function transform(input) {
    if (!input.tableName) {
        return {
            success: false,
            message: "Table Name is required"
        };
    }
    var gr = new GlideRecord(input.tableName);
    var displayField = gr.getDisplayName();
    return {
        success: true,
        displayField: displayField
    };
}
