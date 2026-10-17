var ExcludeMetadataAjax = Class.create();
ExcludeMetadataAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	getTableNames : function(tableName) {
		var tableUtil = new global.UtilScript();
		var tableArr =  tableUtil.getTables(tableName);
		return tableArr;
	},

	getCategory : function() {
		var tableName = this.getParameter("sysparm_table_name");
		var tableArr = this.getTableNames(tableName);
		var categories = [];
		tableArr.forEach(function(name) {
			var flag = true;
			var gr = new GlideRecord('itom_lu_metadata');
			gr.addQuery('table',name);
			gr.query();
			if(gr.canRead() && gr.getRowCount() > 0) {
				while(gr.next() && flag && categories.indexOf(gr.getValue('category')) == -1)
					categories.push(gr.getValue('category'));

				if(categories.length)
				flag = false;
			}
		});
		return JSON.stringify(categories);
	},

	getParentTable : function() {
		var tableName = this.getParameter("sysparm_table_name");
		var category = this.getParameter("sysparm_category");
		var tableArr = this.getTableNames(tableName);
		var res = '';
		tableArr.forEach(function(name) {
			var gr = new GlideRecord('itom_lu_metadata');
			gr.addQuery('table',name);
			gr.addQuery('category',category);
			gr.query();

			if(gr.canRead() && gr.getRowCount() > 0)
				res = name;
		});
		return res;
	},

    getCategoriesForSKUType: function() {
        var skuTypes = this.getParameter("sysparm_skuType");
        var skuTypeList = skuTypes.split(',');
        var categoryList = [];
        skuTypeList.forEach(function(sku) {
            var gr = new GlideRecord('itom_lu_category_metadata');
            gr.addQuery('sku_type', sku);
            gr.query();
            while (gr.canRead() && gr.next()) {
                if (categoryList.indexOf(gr.getValue('category')) == -1)
                    categoryList.push(gr.getValue('category'));
            }
        });
        return JSON.stringify(categoryList);
    },


	type: 'ExcludeMetadataAjax'
});
