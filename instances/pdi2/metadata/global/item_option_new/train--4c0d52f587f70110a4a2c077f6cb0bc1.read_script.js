var cpUtils = new global.CPIARUtils();
var checkIntentListExists = cpUtils.checkIntentListExists(current.getValue("sys_id"));

answer = JSON.stringify({
    sysId: current.getValue('sys_id'),
	intentListExists: checkIntentListExists
});
