var EvtMgmtAssignmentGroupChoiceListBuilder = Class.create();
EvtMgmtAssignmentGroupChoiceListBuilder.prototype = {

    TBL_SYS_USER_GROUP: "sys_user_group",
    FIELD_NAME: "name",

    initialize: function() {
        // maximum number of group names to display in 'Assignment Group' choice list
        this.maxNumberOFGroupsToShowInChoiceList = Number(gs.getProperty("evt_mgmt.rule_assignment_group.max_number_of_choices", '1000'));
    },

    build: function() {
        var choiceList = new GlideChoiceList();
        var gr = new GlideRecord(this.TBL_SYS_USER_GROUP);
        gr.orderBy(this.FIELD_NAME);
        gr.setLimit(this.maxNumberOFGroupsToShowInChoiceList);
        gr.query();
        while (gr.next()) {
            var grpName = gr.getValue(this.FIELD_NAME);
            choiceList.add(grpName, grpName);
        }
        return choiceList;
    },

    type: 'EvtMgmtAssignmentGroupChoiceListBuilder'
};
