angular.module("sn.app_common.aisa.utils", ["sn.app_common"]);
angular.module("sn.app_common.aisa.utils").service("aisaUtils", ["$log", function($log) {
	var aisaUtils = this;

	aisaUtils.buildCatalogKBFacetFilters = function(catalogDisplayValues, kbDisplayValues) {
		var catalogValues = [];
		var knowledgeBaseValues = [];
		catalogDisplayValues.forEach(function(e1) {
			if (e1)
				catalogValues.push(e1);
		});
		
		kbDisplayValues.forEach(function(e2) {
			if (e2)
				knowledgeBaseValues.push(e2);
		});
		return ["_sc_cat_item.sc_catalogs_s:FACET(" + catalogValues + ")", "_kb_knowledge.kb_knowledge_base_s:FACET(" + knowledgeBaseValues + ")"];
	};

	aisaUtils.getResultField = function(result, fieldName) {
		var field = {value: '', displayValue: ''};
		if (!result)
			return field;

		result.columns.forEach(function(column) {
			if (column.fieldName === fieldName)
				field = column;
		});
		return field;
	};

}]);
