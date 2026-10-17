/* global GlideScriptedExtensionPoint */
var AssetLifecycleEventsUtil = Class.create();
AssetLifecycleEventsUtil.prototype = {
	initialize: function() {
	},
	getSortOrder: function(prop) {
		return function(a, b) {
			if (a[prop] > b[prop]) {
				return 1;
			} if (a[prop] < b[prop]) {
				return -1;
			}
			return 0;
		};
	},
	getLifecycleJSON: function(table, assetId) {
		var allAssetLifecycleExtPts = new GlideScriptedExtensionPoint()
			.getExtensions('sn_itam_workspace.AssetLifecycleExtPoint');
		var assetLifeCycleEvents = [];
		for (var i = 0; i < allAssetLifecycleExtPts.length; i++) {
			var result = allAssetLifecycleExtPts[i].getJSON(table, assetId);
			if (result != null) {
				assetLifeCycleEvents.push(result);
			}
		}
		assetLifeCycleEvents.sort(this.getSortOrder('order'));
		return assetLifeCycleEvents;
	},
	type: 'AssetLifecycleEventsUtil',
};
