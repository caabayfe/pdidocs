var script;
if (gs.getProperty(AssetandCI.ASSET_ASYNC_PROPERTY) === 'true') {
	gs.addInfoMessage(gs.getEscapedMessage('Job submitted to create records in queue for category {0}', current.name));
	script = "var ci = new AssetandCI(); ci.createAssetQueueForModelCategory('" + current.getUniqueValue() + "');";
} else {
	gs.addInfoMessage(gs.getEscapedMessage('Job submitted to create assets for category {0}', current.name));
	script = "var ci = new AssetandCI(); ci.createMultipleAssets('" + current.getUniqueValue() + "');";
}
var label = 'Generate Assets for category: ' + current.name;
global.ModelUtils.submitJobwithDupCheck('Generate Assets', label, script, current.getUniqueValue());
