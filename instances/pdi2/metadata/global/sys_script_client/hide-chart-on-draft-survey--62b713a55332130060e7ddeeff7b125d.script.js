function onLoad() {
	var objView = document.getElementById('sysparm_view').getAttribute('value'); 
	if (objView && objView.toLowerCase() === 'survey' && g_scratchpad.state === 'draft') {
		var chartRight = document.getElementById('chartonform_chart_container_6341c72567333200a8532b505685ef58');
		var chartLeft = document.getElementById('chartonform_chart_container_5180cbe167333200a8532b505685ef55');

		findAndHideParent(chartLeft.parentNode);
		findAndHideParent(chartRight.parentNode);
	}
}

function findAndHideParent(parent) {
	while (parent) {
		if (parent.nodeName.toLowerCase() === 'tr') { // Works for UI11 to 16
			hide(parent);
			break;
		}
		parent = parent.parentNode;
	}
}
