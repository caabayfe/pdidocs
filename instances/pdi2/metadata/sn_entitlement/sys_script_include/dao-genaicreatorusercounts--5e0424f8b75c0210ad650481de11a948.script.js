var dao_GenAICreatorUserCounts = Class.create();
dao_GenAICreatorUserCounts.prototype = {
    initialize: function() {
        this.LOGGER = new sn_log.GlideLogger("sn_entitlement.dao_GenAICreatorUserCounts");
        this.GEN_AI_CREATOR_USER_COUNTS_TABLE_NAME = "sn_entitlement_genai_creator_user_counts";
        this.TOTAL_CONFIRMED = "total_confirmed";
        this.TOTAL_UNCONFIRMED = "total_unconfirmed";
        this.instance_id = gs.getProperty("instance_id");
    },

    /**
     * Updates the counts in the MIF client side tables
     * @param {*} confirmedUsersCount  Number of confirmed (allocated) users
     * @param {*} unconfirmedUsersCount Number of unconfirmed (unallocated) users
     */
    updateCounts: function(confirmedUsersCount, unconfirmedUsersCount) {
        if (!this.instance_id) {
            this.LOGGER.error("Unable to find instance_id");
            return;
        }

        this._deleteAll();
        this._insertCounts(confirmedUsersCount, unconfirmedUsersCount);
    },

    _insertCounts: function(confirmedUsersCount, unconfirmedUsersCount) {
        let gr = new GlideRecord(this.GEN_AI_CREATOR_USER_COUNTS_TABLE_NAME);
        gr.setValue(this.TOTAL_CONFIRMED, confirmedUsersCount);
        gr.setValue(this.TOTAL_UNCONFIRMED, unconfirmedUsersCount);
        // base table fields are populated by the MIF BRs
        gr.insert();
    },

    _deleteAll: function() {
        let gr = new GlideRecord(this.GEN_AI_CREATOR_USER_COUNTS_TABLE_NAME);
        gr.addQuery("instance_id", this.instance_id);
        gr.query();
        gr.deleteMultiple();
    },


    type: 'dao_GenAICreatorUserCounts'
};
