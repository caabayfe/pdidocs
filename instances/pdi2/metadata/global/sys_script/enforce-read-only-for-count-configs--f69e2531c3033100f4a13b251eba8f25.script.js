function onBefore(current, previous) {
	
	var baseTbls = GlideDBObjectManager.getTables('usageanalytics_count_cfg');
	if ( !(baseTbls.contains('sys_metadata')) )
		return;
			
	var currScope = current.sys_scope.scope;
	var scopeObj = new GlideScopeAPI();
	
	if (current.getValue('count_type') == 'PublicCatalog'){
		current.setValue('sys_policy', '');  
	} else if (JSUtil.notNil(currScope) && (currScope == 'global' || scopeObj.isServiceNowScope(currScope))){
		current.setValue('sys_policy', 'read');
	}
}
