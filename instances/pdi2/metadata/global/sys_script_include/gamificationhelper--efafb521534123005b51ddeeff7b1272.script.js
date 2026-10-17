var GamificationHelper = Class.create();
GamificationHelper.prototype = {
	initialize: function() {
	},

	updateTableDictionary : function(){
		if (GlidePluginManager.isUpgradeSystemBusy()){
			gs.info("Changing value of read_only attribute of id field of sn_gamification_modules table to true and mandatory attribute as false");
			var dictionary_table = new GlideRecord("sys_dictionary");
			dictionary_table.addQuery("name","sn_gamification_modules");
			dictionary_table.addQuery("element","id");
			dictionary_table.query();
			if(dictionary_table.next()){
				dictionary_table.read_only = true;
				dictionary_table.mandatory = false;
				dictionary_table.update();
				gs.info("Completed Changing value of read_only attribute of member_table field to true");
			}
			else
				gs.error("Unable to find sn_gamification_modules in sys_dictionary");
		}
	},
	type: 'GamificationHelper'
};
