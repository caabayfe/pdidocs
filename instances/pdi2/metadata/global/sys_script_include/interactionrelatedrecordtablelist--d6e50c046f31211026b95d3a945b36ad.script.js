gs.include("PrototypeServer");

var InteractionRelatedRecordTableList = Class.create();

InteractionRelatedRecordTableList.prototype = {

    process: function() {

        var allowedParents = ["kb_knowledge", "task"];
        var ans = [];

        for (var i in allowedParents) {
            var tableUtil = new TableUtils(allowedParents[i]);
            var tableList = tableUtil.getAllExtensions();

            for (var j = 0; j < tableList.size(); j++) {
                var table = tableList.get(j);
                ans.push(table);
            }
        }
        return ans;
    },

    type: "InteractionRelatedRecordTableList"
};
