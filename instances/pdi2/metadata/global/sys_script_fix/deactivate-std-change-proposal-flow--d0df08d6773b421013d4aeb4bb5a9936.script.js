if (pm.isZboot()) {
	var flowGr = new GlideRecord('sys_hub_flow');
	if (flowGr.get('665e4a627723021013d4aeb4bb5a994c')) {
		flowGr.active = true;
		flowGr.update();
	}
}
