function replaceWithMacroponentSysId(libComponentSysId) {
    var mcp = new GlideRecord('sys_ux_macroponent');
    if (mcp.get('root_component', libComponentSysId)) {
		count++;
        return mcp.getValue('sys_id');
    } else {
        logs.push('Invalid sys_ux_lib_component. sysId:' + libComponentSysId);
    }

}

var logs = [];
var count = 0;
logs.push('Replace lib_component with macroponent started');
var parWidgets = new GlideRecord('par_dashboard_widget');
parWidgets.query();
while (parWidgets.next()) {
    if (parWidgets.getDisplayValue('component') === '') {
        mcpSysId = replaceWithMacroponentSysId(parWidgets.getValue('component'));
        if (mcpSysId) {
            parWidgets.setValue('component', mcpSysId);
            parWidgets.update();
        }
    }
}
logs.push(count + ' records have been successfully updated');
logs.push('Replace lib_component with macroponent ended');
gs.log(logs.join('\n'), 'a89e695753f0a51030b7ddeeff7b12c3');
