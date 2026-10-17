//if its not a zboot
if (!pm.isZboot()) {
    var tableDesc = GlideTableDescriptor.get("sys_hub_trigger_template");
    //promote the sys_domain column if the column exists in sys_hub_trigger_template table
    if (tableDesc.isValid() && tableDesc.getElementDescriptor("sys_domain", false)) {
        gs.log("Promoting sys_domain column of sys_hub_trigger_template to sys_hub_trigger_definition started");
        GlideDBUtil.promoteColumn('sys_hub_trigger_template', 'sys_hub_trigger_definition', 'sys_domain');
        gs.log("Promoting sys_domain column of sys_hub_trigger_template to sys_hub_trigger_definition completed");
    }
}
