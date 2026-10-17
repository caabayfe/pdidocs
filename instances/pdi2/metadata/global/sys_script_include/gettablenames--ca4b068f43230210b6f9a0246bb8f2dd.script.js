var GetTableNames = Class.create();

GetTableNames.prototype = {
    initialize: function() {},

    process: function() {
        var tableNames = new GlideTableChoiceList();
        tableNames.setShowLabels(false);
        tableNames.setShowTableNames(true);
        tableNames.setCanRead(true);
        tableNames.setShortList(true);
        tableNames.generateChoices();
        var tableChoiceList = [];
        for (var i = 0; i < tableNames.size(); i++) {
            var tableChoice = tableNames.getChoice(i);
            tableChoiceList.push({
                label: tableChoice.getLabel(),
                value: tableChoice.getValue()
            });
        }
        return JSON.stringify(tableChoiceList);
    },

    type: 'GetTableNames'
};
