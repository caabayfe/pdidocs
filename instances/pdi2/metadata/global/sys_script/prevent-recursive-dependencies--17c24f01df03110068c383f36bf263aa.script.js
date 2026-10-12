var dependsOn = current.depends_on;
while (dependsOn) {
	if (dependsOn.sys_id == current.sys_id) {
		gs.addErrorMessage(gs.getMessage('Setting Depends on to that metric would create up a circular dependency'));
		current.setAbortAction(true);
		break;
	}
	dependsOn = dependsOn.depends_on;
}
