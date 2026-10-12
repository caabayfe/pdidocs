var helper =  new GlideappScriptHelper();
var remoteCatalogItemValue;
if (current.isValidField("remote_catalog_item")) {
	remoteCatalogItemValue = current.remote_catalog_item;
	current.remote_catalog_item = false;
}

var cR = helper.copyItem(current);
if (JSUtil.notNil(remoteCatalogItemValue))
	current.remote_catalog_item = remoteCatalogItemValue;

if (JSUtil.nil(cR)) {
	gs.addErrorMessage(gs.getMessage('Failed to copy the catalog item'));
	action.setRedirectURL(current);
} else {
	gs.addInfoMessage(gs.getMessage('Catalog item copied successfully'));
	action.setRedirectURL(cR);
}
