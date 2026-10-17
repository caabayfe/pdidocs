var layerId = current.layer;

var layerGr = new GlideRecord('svc_layer');
layerGr.get(layerId);

var env = sn_svcmod.ServiceContainerFactory.loadEnvironment(layerGr.environment);
var allLayers = env.layers();
for (var i = 0 ; i < allLayers.length ; i++) {
	var layer = allLayers[i];
	layer.markRecomputationNeeded();
}

SNC.ServiceMappingFactory.recomputeLayer(layerGr);

var uri = action.getGlideURI() + "";
if (uri.indexOf("_list.do") == -1) {
	action.setRedirectURL(current);
}
