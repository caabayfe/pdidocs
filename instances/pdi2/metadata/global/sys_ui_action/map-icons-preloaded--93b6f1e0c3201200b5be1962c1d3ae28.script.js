(function() {
	var url = window.location.href;
		
	if (url.indexOf("cmdb_ci_service_discovered_list") === -1 &&
	   url.indexOf("cmdb_ci_service_manual_list") === -1) {
		return;
	}
 
	var specialIcons = [
		"images/sa.topologyMap/special_node_icons/entry_point.svg",
		"images/sa.topologyMap/special_node_icons/boundary_node.svg",
		"images/sa.topologyMap/special_node_icons/error_node.svg",
		"images/sa.topologyMap/special_node_icons/related_bs.svg",
		"images/sa.topologyMap/special_node_icons/unspecified_device.svg"
	];
	
	var preload = [];
	var img;
	
	for (var i = 0; i < specialIcons.length; i++) {
		img = new Image();
		img.src = specialIcons[i];
		preload.push(img);
	}
	
	var rec = new GlideRecord('ngbsm_ci_icons');
	rec.query(recResponse);

	function recResponse(rec) {
		
		while (rec.next()) {
			img = new Image();
			img.src = rec.getValue('url');
			preload.push(img);
		}
	}
	
})();

function MapIconsPreload(){}
