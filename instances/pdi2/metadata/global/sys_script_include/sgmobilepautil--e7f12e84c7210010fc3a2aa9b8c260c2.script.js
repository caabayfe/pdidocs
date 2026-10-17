var SGMobilePAUtil = Class.create();
SGMobilePAUtil.prototype = {
    initialize: function() {},

    selectLatestScoreWidget: function() {
        if (current.type == "PA")
            return "type=score^visualization=latest";

        else
            return "";

    },
	
    type: 'SGMobilePAUtil'
};
