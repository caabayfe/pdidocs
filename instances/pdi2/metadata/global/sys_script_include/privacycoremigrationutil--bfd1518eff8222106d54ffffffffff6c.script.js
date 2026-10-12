var PrivacyCoreMigrationUtil = Class.create();
PrivacyCoreMigrationUtil.prototype = {
	//mapping of sn_data_discovery_data_pattern.sys_id to dp_data_pattern.sys_id
	PATTERN_SYS_IDS: {
		'0029a2b5539202104debddeeff7b12c0':'4162846dff8222106d54ffffffffff4e',
		'0afc22b9539202104debddeeff7b122a':'4562846dff8222106d54ffffffffff52',
		'395c2679539202104debddeeff7b1277':'4162c46dff8222106d54ffffffffff67',
		'4964417ceb0561107977d256385228b8':'4162c46dff8222106d54ffffffffff6a',
		'4cbc6e39539202104debddeeff7b1266':'4162c46dff8222106d54ffffffffff6d',
		'4e25417ceb0561107977d25638522890':'4162c46dff8222106d54ffffffffff70',
		'5806c1bceb0561107977d256385228ce':'4162c46dff8222106d54ffffffffff73',
		'5e0a66b5539202104debddeeff7b1273':'4162c46dff8222106d54ffffffffff76',
		'70bd22b9539202104debddeeff7b122f':'4162c46dff8222106d54ffffffffff79',
		'782685bceb0561107977d25638522823':'4162c46dff8222106d54ffffffffff7c',
		'84d501bceb0561107977d25638522853':'5162c46dff8222106d54ffffffffff7f',
		'8e5605bceb0561107977d256385228e6':'5162c46dff8222106d54ffffffffff82',
		'a2beeaf9539202104debddeeff7b126d':'5162c46dff8222106d54ffffffffff85',
		'cc9a6eb5539202104debddeeff7b12a6':'5162c46dff8222106d54ffffffffff88',
		'ce1feaf9539202104debddeeff7b1272':'5162c46dff8222106d54ffffffffff8b',
		'd17162b1539202104debddeeff7b1272':'5162c46dff8222106d54ffffffffff8e',
		'de65417ceb0561107977d256385228a6':'5162c46dff8222106d54ffffffffff91',
		'e5ebaa39539202104debddeeff7b12b7':'5162c46dff8222106d54ffffffffff94',
		'f2958d7ceb0561107977d25638522822':'5162c46dff8222106d54ffffffffff97'
	},

    initialize: function() {
    },

    getNewPatternSysId: function(oldSysId) {
		if (!oldSysId)
			return null;

		var answer = this.PATTERN_SYS_IDS[oldSysId];
		return answer ? answer : null;
	},

    type: 'PrivacyCoreMigrationUtil'
};
