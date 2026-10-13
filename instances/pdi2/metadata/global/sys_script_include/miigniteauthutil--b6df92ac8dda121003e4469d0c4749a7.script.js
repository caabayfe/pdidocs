var MiIgniteAuthUtil = Class.create();
MiIgniteAuthUtil.prototype = {
    initialize: function() {
        this.CRED_TABLE = "sa_ignite_credentials";
        this.FIELD = "authentication_key";
        this.TYPE = "ignite_credentials";
    },

    refreshApiKey: function() {
        var gr = new GlideRecord(this.CRED_TABLE);
        gr.query();

        if (gr.getRowCount() > 1) {
            this.cullExcessKeys(gr);
        }
        if (gr.next()) {
            var newKey = this.generateKey();
            gr.setDisplayValue(this.FIELD, newKey);
            gr.updateRecord();
        } else {
            this.createNewKeyRecord();
        }
    },

    createNewKeyRecord: function() {
        var gr = new GlideRecord(this.CRED_TABLE);
        gr.initialize();
        gr.setValue("name", "Ignite API Key");
        gr.setValue("type", this.TYPE);
        gr.setDisplayValue(this.FIELD, this.generateKey());
        gr.insert();
    },

    cullExcessKeys: function(keyGr) {
        var count = keyGr.getRowCount();
        for (var i = 1; i < count; i++) {
            keyGr.next();
            keyGr.deleteRecord("Excess key");
        }
    },

    validateKeyCount: function() {
        var gr = new GlideRecord(this.CRED_TABLE);
        gr.query();
        if (gr.getRowCount() > 1) {
            gs.info("Multiple ignite auth keys found. There should only be one. Culling");
			this.cullExcessKeys(gr);
            return false;
        } else if (gr.getRowCount() === 0) {
            gs.info("No ignite auth keys found. Creating one.");
            this.createNewKeyRecord();
            return false;
        }
        return true;
    },

    generateKey: function() {
        return SNC.KeybasedAuthenticationUtil.getSecretKey();
    },

    type: 'MiIgniteAuthUtil'
};
