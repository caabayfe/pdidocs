gs.include("PrototypeServer");

var Schedule = Class.create();

Schedule.prototype = {
	initialize: function() {
		this.time = 0;
		this.document = null;
		this.document_key = null;
		this.system_id = null;
		this.trigger_type = 0; // override (this is one time)
		this.script = "gs.print('missing script');";
		this.job_id = '81c92ce9c0a8016400e5f0d2f784ea78';
		this.label = "Schedule";
		this.upgrade_safe = null;
	},

	setDocument: function(gr) {
		this.document = gr.getTableName();
		this.document_key = gr.sys_id;
	},

	setLabel: function(name) {
		this.label = name;
	},

	setSystemID: function(systemID) {
		this.system_id = systemID;
	},

	cancel: function() {
		var t = new GlideRecord('sys_trigger');
		t.addQuery('name', this.label);
		t.addQuery('document', this.document);
		t.addQuery('document_key', this.document_key);
		t.query();
		if (t.next()) {
			gs.print('INFO Schedule: [cancel] deleting trigger records found for: ' + this.label + ' document: ' + this.document + ' document_key: ' + this.document_key);
			t.deleteMultiple();
		} else
			gs.print('WARNING Schedule: [cancel] trigger record not found for: ' + this.label + ' sys_trigger encodedQuery: ' + t.getEncodedQuery());
	},

	// call after variables are setup
	_getTrigger: function() {
		var t = new GlideRecord('sys_trigger');
		t.initialize();
		t.name = this.label;
		t.document = this.document;
		t.document_key = this.document_key;
		t.script = this.script;
		t.job_id = this.job_id;
		if (!gs.nil(this.upgrade_safe))
			t.upgrade_safe = this.upgrade_safe; 
		if (!gs.nil(this.system_id))
			t.system_id = this.system_id;
		return t;
	},

	schedule: function() {
		gs.print("Schedule: this function should be overriden");
	},

	setUpgradeSafe: function(upgradeSafe) {
		this.upgrade_safe = upgradeSafe;  
	}

};
