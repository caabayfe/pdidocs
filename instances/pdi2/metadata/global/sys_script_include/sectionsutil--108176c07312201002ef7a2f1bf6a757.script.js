var SectionsUtil = Class.create();
SectionsUtil.prototype = {
    initialize: function() {
    },
	filterSectionsForSectionsScreen: function(){
		return this._filterItemSections();
	},
	filterSectionsForSectionCardInstance: function(){
		return this._filterItemSections();
	},
	_filterItemSections: function(){
		return "sys_class_name=sys_sg_item_section";
	},
    type: 'SectionsUtil'
};
