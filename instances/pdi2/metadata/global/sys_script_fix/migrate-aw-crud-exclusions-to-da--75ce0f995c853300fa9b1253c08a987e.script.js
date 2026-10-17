var crudGr = new GlideRecord('sys_aw_crud_exclusions');
crudGr.query();

while (crudGr.next()) {

    var tableName = crudGr.getValue('table');
    var isActive = crudGr.getValue('active');

    var daGr = new GlideRecord('sys_declarative_action_assignment');
    daGr.addQuery('table', tableName);
    daGr.addQuery('action_name', 'create-new');
    daGr.addQuery('model', 'c3547169534723003eddddeeff7b126c');
    daGr.query();

    if (!daGr.next()) {
        var actionPayload = {
            "table": "{{table}}",
            "row": {
                "sys_id": {
                    "value": "-1"
                }
            },
            "parent_table": "{{parentTable}}",
            "additional_data": {
                "query": "{{query}}"
            }
        };

        var daNewRecord = new GlideRecord('sys_declarative_action_assignment');
        daNewRecord.initialize();
        daNewRecord.setValue('script_condition', 'current.getTableName() !== "' + tableName + '";');
        daNewRecord.setValue('action_name', 'create-new');
        daNewRecord.setValue('label', 'New');
        daNewRecord.setValue('action', 'adcad24753732300099addeeff7b122a');
        daNewRecord.setValue('client_action', '5fd66665532333003eddddeeff7b122a');
        daNewRecord.setValue('declarative_action_type', 'dispatch_action');
        daNewRecord.setValue('model', 'c3547169534723003eddddeeff7b126c');
        daNewRecord.setValue('active', isActive);
        daNewRecord.setValue('enabled', isActive);
        daNewRecord.setValue('icon', 'button');
        daNewRecord.setValue('order', 300);
        daNewRecord.setValue('tooltip', 'New');
        daNewRecord.setValue('table', tableName);
        daNewRecord.setValue('action_payload', JSON.stringify(actionPayload));
        daNewRecord.setValue('create_access', true);
        daNewRecord.insert();
    }

    daRelatedListGr = new GlideRecord('sys_declarative_action_assignment');
    daRelatedListGr.addQuery('table', tableName);
    daRelatedListGr.addQuery('action_name', 'create-new');
    daRelatedListGr.addQuery('model', 'd91731a9534723003eddddeeff7b121c');
    daRelatedListGr.query();

    if (!daRelatedListGr.next()) {
        var relatedListActionPayload = {
            "table": "{{table}}",
            "sys_id": "-1",
            "params": {
                "query": "{{query}}"
            }
        };

        var daNewRelatedListRecord = new GlideRecord('sys_declarative_action_assignment');
        daNewRelatedListRecord.initialize();
        daNewRelatedListRecord.setValue('script_condition', 'current.getTableName() !== "' + tableName + '";');
        daNewRelatedListRecord.setValue('action_name', 'create-new');
        daNewRelatedListRecord.setValue('label', 'New');
        daNewRelatedListRecord.setValue('action', '364720b553213300ffa9ddeeff7b12ad');
        daNewRelatedListRecord.setValue('client_action', '14966265532333003eddddeeff7b12e3');
        daNewRelatedListRecord.setValue('declarative_action_type', 'dispatch_action');
        daNewRelatedListRecord.setValue('model', 'd91731a9534723003eddddeeff7b121c');
        daNewRelatedListRecord.setValue('active', isActive);
        daNewRelatedListRecord.setValue('enabled', isActive);
        daNewRelatedListRecord.setValue('icon', 'button');
        daNewRelatedListRecord.setValue('order', 300);
        daNewRelatedListRecord.setValue('tooltip', 'New');
        daNewRelatedListRecord.setValue('table', tableName);
        daNewRelatedListRecord.setValue('action_payload', JSON.stringify(relatedListActionPayload));
        daNewRelatedListRecord.setValue('create_access', true);

        daNewRelatedListRecord.insert();
    }
}
