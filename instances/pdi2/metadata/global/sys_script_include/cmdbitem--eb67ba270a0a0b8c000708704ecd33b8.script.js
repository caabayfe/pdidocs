gs.include("PrototypeServer");

var CMDBItem = Class.create();

CMDBItem.prototype = {
    initialize : function(item) {
       this.item = item;	
       this.category = null;
       this.subcategory = null;
    },

    setCategory : function() {
       if (!this.item.category.isNil())
          return null;
       
       this._getCategory();
       if (this.category == null)
          return null;

       this.item.category = this.category;
       this.item.subcategory = this.subcategory;
       return this.category;
    },

    _getCategory : function() {
       var categories = GlideCacheManager.get('CMDB_CATEGORIES_CACHE', 'CMDB_CATEGORIES_CACHE');
	   if (categories == null) {
		   categories = this._getAllCategoriesFromDb();
		   GlideCacheManager.put('CMDB_CATEGORIES_CACHE', 'CMDB_CATEGORIES_CACHE', categories);
	   }

       var sysClass = this.item.sys_class_name.toString();
       if (this.item.sys_class_name.isNil())
          sysClass = this.item.getTableName();

	   if (typeof categories[sysClass] === 'undefined' || categories[sysClass] == null)
	      return;

       this.category = categories[sysClass].category;
       this.subcategory = categories[sysClass].subcategory;
    },

    _getAllCategoriesFromDb : function() {
		var result = {};
		var cat = new GlideRecord('cmdb_categories');
		cat.query();
		while(cat.next()) {
			var obj = {};
			obj['category'] = cat.getValue('category');
			obj['subcategory'] = cat.getValue('subcategory');
			result[cat.getValue('name')] = obj;
		}
		return result;
	},

    changeCategory : function(previous, cat) {
       var dbu = new GlideDBUpdate('cmdb_ci');
       var dbq = new GlideDBQuery('cmdb_ci');
       dbq.addQuery('category', previous.category.toString());
       dbq.addQuery('sys_class_name', cat.name.toString());
       dbu.setQuery(dbq);
       dbu.setMultiple(true);
       dbu.setValue('category', cat.category.toString());
       dbu.setValue('subcategory', cat.subcategory.toString());
       dbu.execute();
       dbu.close();
       dbq.close();
    },
};
