var WrapUpInteractionUtil = Class.create();

WrapUpInteractionUtil.prototype = {
    initialize: function() {},

    /* This function iterates through the wrap up configurations and finds the first active
       internal configuration with conditions that are true for a given interaction. Empty
       conditions are true for all interactions. Configurations are cached. */
    getWrapUpConfiguration: function(interaction){
        return sn_interaction.WrapUpUtil.getWrapUpConfiguration(interaction);
    },

    isWrapUpEnabled: function(interaction) {
        var cfg = sn_interaction.WrapUpUtil.getWrapUpConfiguration(interaction);
        return !!cfg;
    },

    getWrapUpConfigurationSysId: function(interaction) {
        var cfg = sn_interaction.WrapUpUtil.getWrapUpConfiguration(interaction);
        return cfg.sys_id;
    },

    isWrapUpDurationEnforced: function(interaction) {
        var cfg = sn_interaction.WrapUpUtil.getWrapUpConfiguration(interaction);
        return cfg.enforce_duration;
    },

    getWrapUpDuration: function(interaction) {
        var cfg = sn_interaction.WrapUpUtil.getWrapUpConfiguration(interaction);
		return cfg.enforce_duration ? cfg.duration : -1;
    },

    isShowWrapUpTimerEnabled: function(interaction) {
        var cfg = sn_interaction.WrapUpUtil.getWrapUpConfiguration(interaction);
        return cfg.show_timer;
    },

    /**
     * Show 'End Wrap Up' button if the Interaction is Assigned to the Current Logged in
     * User, interaction is in wrap_up state, and the matching config does not enable codes.
     */
    showEndWrapUpButton: function(interaction) {
		var showEndWrapUp =  sn_interaction.WrapUpUtil.showEndWrapUpButton(interaction, true);
        return showEndWrapUp;
    },

    closeStaleInteractions: function(maxWrapupDuration) {
        sn_interaction.WrapUpUtil.closeStaleInteractions(maxWrapupDuration);
    },

    type: 'WrapUpInteractionUtil'
};
