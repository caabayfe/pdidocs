var MobileCardViewMigrationConstants = Class.create();
MobileCardViewMigrationConstants.prototype = {
	SYS_SG_ITEM_VIEW_MAP: {},
	initialize: function () {
		/*
		"sys_id_of_the_legacy_card":{
		sys_sg_form_screen:"<comma separated list of form screens where the legacy card is referred>"
		sys_sg_master_item:"<comma separated list of master items or List item config where the legacy card is referred>"
		}
		*/
		this.SYS_SG_ITEM_VIEW_MAP = {
			"fffb22e987521010420e5cdac5cb0b18": {
				"sys_sg_form_screen": "c80c22e987521010420e5cdac5cb0b27",
				"sys_sg_master_item": ""
			},
			"cca4f0ba73423300ff25e1d28bf6a7ba": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "11f4425087302010420e5cdac5cb0b98,8087f03e73423300ff25e1d28bf6a7c0"
			},
			"3bfb6ea987521010420e5cdac5cb0b86": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "1aa1467287071010420e5cdac5cb0b7f,440c22e987521010420e5cdac5cb0b43"
			},
			"d0de08bb531323004c36ddeeff7b1262": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "2e02e42a9f10330088aebde8132e7066,7fdbb3e1530033004c36ddeeff7b126d"
			},
			"67fa933553213300ff25ddeeff7b1245": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "437cd37553213300ff25ddeeff7b127b,847b573553213300ff25ddeeff7b1280"
			},
			"23e43cba73423300ff25e1d28bf6a76d": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "8127fcfa73423300ff25e1d28bf6a700"
			},
			"06fc5b7553213300ff25ddeeff7b1220": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "971ddb7553213300ff25ddeeff7b127f"
			},
			"926d549653c323004c36ddeeff7b1296": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "9a113816530033004c36ddeeff7b122e"
			},
			"74bba27b87071010420e5cdac5cb0b42": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "b4bba27b87071010420e5cdac5cb0b96"
			},
			"fbfea339530033004c36ddeeff7b123d": {
				"sys_sg_form_screen": "",
				"sys_sg_master_item": "efe8083d530033004c36ddeeff7b127f"
			}
		};
	},
	type: 'MobileCardViewMigrationConstants'
};
