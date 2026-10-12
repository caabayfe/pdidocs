var SPFavoriteUtil;
(function() { 
	var LIMIT = 50;

	SPFavoriteUtil = {
		canView: canView,
		toggleFavorite: toggleFavorite 
    };
	
	function toggleFavorite(tableName, recordID) {
		var gr = new GlideRecord('sp_favorite');
		gr.addQuery('reference_table', tableName);
		gr.addQuery('reference_document', recordID);
		gr.addQuery('user', gs.getUserID());
		gr.query();
		if (gr.next()) { //Favorite exists, unfavorite it
			return gr.deleteRecord();
		} else { // Favorite doesnot exist, add a new favorite
			gr = new GlideRecord('sp_favorite');
			gr.addQuery('user', gs.getUserID());
			gr.query();
			if (gr.getRowCount() >= LIMIT) {
				gs.addErrorMessage(gs.getMessage('You have reached maximum number of favorites allowed'));
				return false;
			} else {
				gr.initialize();
				gr.reference_table = tableName;
				gr.reference_document = recordID;
				gr.insert();
				return true;
			}
		}
	}

	function canView(gr, portalID) {
		//First check extension point
		var extensionPoints = new GlideScriptedExtensionPoint().getExtensions('global.SPFavoriteSecurity');
		var extensionCanView = false;
		var validExtension = false;
		for (var i = 0; i < extensionPoints.length; ++i) {
			var point = extensionPoints[i];
			if (point.applies(gr)) {
				validExtension = true;
				if (point.canView(gr, portalID)) {
					extensionCanView = true;
					break;
				}
			}
		}
		if (validExtension)
			return extensionCanView;

		return gr.canRead(); // If there is no extension point, check ACL
	}

})();
