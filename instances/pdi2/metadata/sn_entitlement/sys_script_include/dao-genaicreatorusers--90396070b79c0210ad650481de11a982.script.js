var dao_GenAICreatorUsers = Class.create();
dao_GenAICreatorUsers.prototype = {
    initialize: function() {
        this.LOGGER = new sn_log.GlideLogger("sn_entitlement.dao_GenAICreatorUsers");
        this.GEN_AI_CREATOR_USERS_TABLE_NAME = "sn_entitlement_genai_creator_users";
		this.FEDERATED_ID = "federated_id";
        this.CONFIMED = "confirmed"; // boolean: is confirmed
        this.instance_id = gs.getProperty("instance_id");
    },

    updateUsers: function(usersIterator /*AllocatedUsersIterator*/) {
        if (!this.instance_id) {
            this.LOGGER.error("Unable to find instance_id");
            return;
        }

        this._deleteUsers();
        while(usersIterator.hasNext()) {
            let user = usersIterator.next();
            let gr = new GlideRecord(this.GEN_AI_CREATOR_USERS_TABLE_NAME);
            gr.setValue(this.FEDERATED_ID, user.getFederatedId());
            gr.setValue(this.CONFIMED, user.isConfirmed());
            // base fields set by MIF
            gr.insert();
        }
    },

    _deleteUsers: function() {
        let gr = new GlideRecord(this.GEN_AI_CREATOR_USERS_TABLE_NAME);
        gr.addQuery("instance_id", this.instance_id);
        gr.query();
        gr.deleteMultiple();
    },

    type: 'dao_GenAICreatorUsers'
};
