var GroupByRecommendation = Class.create();
GroupByRecommendation.prototype = {
    initialize: function(ruleContextGR) {
		if(NextBestActionUtil.isValidRecord(ruleContextGR))
			this.groups = this.getAllGroups(ruleContextGR.getUniqueValue());
    },
	getId: function(){
		return "2cd6cdab9766111016c576d917890dce"; // sys id of corresponding grouping strategy record
	},
    groupRecommendations: function(recommendationsArray) {
        var groupedRecommendations = [];

        if (gs.nil(this.groups) || Object.keys(this.groups).length <= 0) {
            this.addAllToDefaultGroup(recommendationsArray);
            groupedRecommendations.push(this.defaultGroup);
            return groupedRecommendations;
        }

        for (var i in recommendationsArray) {
            if (!gs.nil(recommendationsArray[i]) && (gs.nil(recommendationsArray[i].actionGroups) || recommendationsArray[i].actionGroups.length <= 0)) {
                this.addToDefaultGroup(recommendationsArray[i]);
                continue;
            }
            var recommendationGroups = recommendationsArray[i].actionGroups.split(",");
            var j = 0;
            while (j < recommendationGroups.length) {
                var recommendationGroup = recommendationGroups[j];
                j += 1;
                if (gs.nil(recommendationGroup) || gs.nil(this.groups[recommendationGroup])) {
                    this.addToDefaultGroup(recommendationsArray[i]);
                    continue;
                }
                if (gs.nil(this.groups[recommendationGroup].actions)) this.groups[recommendationGroup].actions = [];
                this.groups[recommendationGroup].actions.push(recommendationsArray[i]);
            }

        }
		
        for (var g in this.groups) {
            if (!this.groups.hasOwnProperty(g) ||
                gs.nil(this.groups[g].actions) ||
                this.groups[g].actions.length <= 0
            ) continue;
            groupedRecommendations.push(this.groups[g]);
        }
        if (!gs.nil(this.defaultGroup) && !gs.nil(this.defaultGroup.actions) && this.defaultGroup.actions.length > 0)
            groupedRecommendations.push(this.defaultGroup);
		
		groupedRecommendations.sort(this.sortGroupsByOrderAsc);
        return groupedRecommendations;
    },
    getAllGroups: function(ruleContext) {
        var groupsGR = new GlideRecord(sn_nb_action.Constants.TBL_CONTEXT_GROUP);
        groupsGR.addActiveQuery();
        groupsGR.addQuery("context", ruleContext);
		groupsGR.query();

        var groups = {};
        while (groupsGR.next()) {
			var isDefaultGroup = groupsGR.getValue("default");
			if('1' === isDefaultGroup){
				this.initializeDefaultGroup(groupsGR);
				continue;
			}
            var sysId = groupsGR.getUniqueValue();
            groups[sysId] = {
                name: groupsGR.name.getDisplayValue(),
				order: groupsGR.getValue("order"),
                actions: []
            };
        }
        return groups;
    },
    initializeDefaultGroup: function(defaultGroupGr) {
        this.defaultGroup = {
			name: defaultGroupGr.name.getDisplayValue(),
			order: defaultGroupGr.getValue("order"),
            actions: []
        };
    },
    addAllToDefaultGroup: function(recommendationArray) {
        if (gs.nil(recommendationArray) || recommendationArray.length <= 0) return;
		if (gs.nil(this.defaultGroup)) return;
        for (var i in recommendationArray) {
            this.addToDefaultGroup(recommendationArray[i]);
        }
    },
    addToDefaultGroup: function(recommendationObject) {
        if (gs.nil(this.defaultGroup)) return;
        if (gs.nil(this.defaultGroup.actions)) this.defaultGroup.actions = [];

        this.defaultGroup.actions.push(recommendationObject);
    },
	sortGroupsByOrderAsc: function(group1, group2){
		return group1.order - group2.order;
	},

    type: 'GroupByRecommendation'
};
