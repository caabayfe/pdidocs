var grCustActions = new GlideRecord('sn_critical_update');
grCustActions.addEncodedQuery('up_active=true');
grCustActions.query();
while (grCustActions.next()) {
    var custActionId = grCustActions.sys_id;
    grContext = new GlideRecord('sys_pd_context');
    grContext.addQuery('input_record', custActionId);
    grContext.orderByDesc('sys_created_on');
    grContext.setLimit(1);
    grContext.query();
    if (grContext.next()) {
        var contextId = grContext.sys_id;
        if (grContext.label == 'Update steps') {
            grContext.label = "Steps";
            grContext.update();
        }
        // Update sys_properties link only for Customer Action, 'Enable 3DES deprecation for Password2 Fields'
        if (custActionId == '175eecd9ffd03110684fffffffffff38') {
            var grActivityContext = new GlideRecord('sys_pd_activity_context');
            grActivityContext.addQuery('context', contextId);
            grActivityContext.addQuery('activity_type', '!=', '');
            grActivityContext.query();
            while (grActivityContext.next()) {
                var grVal = new GlideRecord('sys_variable_value');
                grVal.addEncodedQuery('document=sys_pd_activity_context^document_key=' + grActivityContext.sys_id + '^variable.label=Description^valueCONTAINShttp://system_properties_ui.do/?');
                grVal.query();
                if (grVal.next()) {
                    var updDesc = grVal.value.replace('http://system_properties_ui.do/?', '/now/nav/ui/classic/params/target/system_properties_ui.do%3F');
                    grVal.setValue('value', updDesc);
                    grVal.update();
                    break;
                }
            }
        }
    }
}
