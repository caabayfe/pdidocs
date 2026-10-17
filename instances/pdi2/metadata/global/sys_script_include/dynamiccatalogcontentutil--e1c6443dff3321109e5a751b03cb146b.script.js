var DynamicCatalogContentUtil = Class.create();
DynamicCatalogContentUtil.prototype = {
    initialize: function() {},
    /* returns the url of the dynamic content item, using model, content and uiType */
    getURL: function(model, content, uiType) {
        var extensionPoint = _getExtensionPoint(model);
        if (extensionPoint && typeof extensionPoint.getURL === 'function') {
            var url = extensionPoint.getURL(content, uiType);
            if (url && url.trim())
                return url.trim();
        }
        return '';
    },

    /* returns true if the content is accessible to user*/
    canView: function(model, content) {
        var extensionPoint = _getExtensionPoint(model);
        if (extensionPoint && typeof extensionPoint.canView === 'function')
            return !!extensionPoint.canView(content);

        return false;
    },

    /* returns the portal configuration for dynamic content item */
    getServicePortalConfig: function(model, content) {
        var extensionPoint = _getExtensionPoint(model);
        if (extensionPoint && typeof extensionPoint.getServicePortalConfig === 'function') {
            var portalConfig = extensionPoint.getServicePortalConfig(content);
            if (portalConfig && portalConfig.id)
                return portalConfig;
        }
        return {};
    },

	getServicePortalUrl: function(model, content) {
		var portalConfig = this.getServicePortalConfig(model, content);
		if (portalConfig && Object.keys(portalConfig).length > 0) {
			var portalUrl = '?';
			for (var prop in portalConfig) {
				if (portalUrl !== '?')
					portalUrl += '&';

				var pair = prop + '=' + portalConfig[prop];
				portalUrl += pair;
			}
			return portalUrl;
		}
		return '';
	},
    
    type: 'DynamicCatalogContentUtil'
};

function _getExtensionPoint(model) {
    if (!GlideStringUtil.isEligibleSysID(model)) {
        gs.debug('Invalid model {0}', model);
        return null;
    }

    function _getExtensionPoints() {
        var extName = 'global.CatalogItemDynamicContentTypes';
        var extensionPoints = new GlideScriptedExtensionPoint().getExtensions(extName);
        return extensionPoints;
    }

    var extensionPoints = _getExtensionPoints();
    for (var i = 0; i < extensionPoints.length; ++i) {
        var point = extensionPoints[i];
        if (point && point.MODEL_ID === model)
            return point;
    }

    gs.debug('Unable to find the extension point for the model {0}', model);
    return null;
}
