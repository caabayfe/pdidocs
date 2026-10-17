(function executeRule(current, previous /*null when async*/ ) {
    // get user interaction record
    var interaction = new GlideRecord("help_user_interaction");
    interaction.addQuery("guidance", current.sys_id);
    interaction.query();

    // delete user interaction step records
    if (interaction.next()) {
        var stepInteraction = new GlideRecord("help_user_interaction_step");
        stepInteraction.addQuery("user_interaction", interaction.sys_id);
        stepInteraction.query();
        stepInteraction.deleteMultiple();

        // delete user interaction record
        interaction.deleteRecord();
    }
})(current, previous);
