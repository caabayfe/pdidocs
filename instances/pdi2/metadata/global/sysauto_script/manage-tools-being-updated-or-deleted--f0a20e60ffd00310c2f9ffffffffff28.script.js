var mapping = new GlideRecord('aig_scope_tool_mapping');
mapping.query();
while (mapping.next()) {
    var rawToolName = mapping.getValue('tool_name');
    if (!rawToolName)
        continue;

    var parts = rawToolName.split(':');
    var toolName = parts.length > 1 ? parts[1] : parts[0];

    var tool = new GlideRecord('sn_ent_ai_tool');
    tool.addQuery('name', toolName);
    tool.setLimit(1);
    tool.query();

    if (!tool.next()) {
        gs.info('Removing orphaned tool mapping for tool: ' + rawToolName);
        mapping.deleteRecord();
    }
}
