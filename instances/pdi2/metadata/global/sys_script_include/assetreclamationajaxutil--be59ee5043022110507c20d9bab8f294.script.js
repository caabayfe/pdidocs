var AssetReclamationAjaxUtil = Class.create();
AssetReclamationAjaxUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getAssetsAssignedTo: function() {
		var requestedFor = this.getParameter('sysparm_userVal');
		var assetsGr = new GlideRecordSecure('alm_asset');
		assetsGr.addQuery('assigned_to', requestedFor);
		var qryCondition = assetsGr.addQuery('sys_class_name', 'alm_consumable');
		qryCondition.addOrCondition('sys_class_name', 'alm_hardware');
		assetsGr.addQuery('sys_id', 'NOT IN', new global.AssetReclamationUtil().getAssetsToExclude(requestedFor));
		var listToPopulate = [];
		assetsGr.query();
		while (assetsGr.next()) {
			listToPopulate.push(assetsGr.getUniqueValue());
		}
		return listToPopulate.toString();
	},

	type: 'AssetReclamationAjaxUtil',
});
