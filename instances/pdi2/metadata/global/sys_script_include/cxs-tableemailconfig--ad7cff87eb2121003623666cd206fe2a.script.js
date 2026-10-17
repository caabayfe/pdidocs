var cxs_TableEmailConfig = Class.create();

cxs_TableEmailConfig.prototype = {
	initialize: function(gr) {
		this._gr = gr;
	},
	
    setName: function(emailConfigName) {
        if (!this._gr)
            return false;

        if (emailConfigName) {
            this._gr.name = emailConfigName;
            return true;
        }

        if (!this._gr.getValue("sysevent_email_action"))
            return false;

        this._gr.name = "Email configuration for \"" + this._gr.sysevent_email_action.getDisplayValue() + "\" notification";

        return true;
    },
		
	isDuplicate: function() {
        if (!this._gr)
            return false;

		if (this.getDuplicate())
			return true;

		return false;
	},	

	getDuplicate: function() {
		if (!this._gr)
			return null;

		var emailConfigGr = new GlideRecord("cxs_table_email_config");
		emailConfigGr.addQuery("sys_id", "!=", this._gr.getUniqueValue());
		emailConfigGr.addQuery("cxs_table_config.table", this._gr.cxs_table_config.table);
		emailConfigGr.addQuery("sysevent_email_action", this._gr.getValue("sysevent_email_action"));
		emailConfigGr.query();

		if (emailConfigGr.next())
			return emailConfigGr;

		return null;
	},

	type: 'cxs_TableEmailConfig'
};
