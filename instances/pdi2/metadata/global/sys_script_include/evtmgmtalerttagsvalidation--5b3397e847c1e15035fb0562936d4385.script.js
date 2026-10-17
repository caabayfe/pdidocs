var EvtMgmtAlertTagsValidation = Class.create();
EvtMgmtAlertTagsValidation.prototype = {
    initialize: function() {
        this.evtMgmtAlertTagsUtil = new global.EvtMgmtAlertTagsUtil();
    },

    validateTagsExistance: function() {
        if (!this.evtMgmtAlertTagsUtil.canUseEmAlertTagsTable()) {
            return;
        }
		// we want to concatinate the tags from 3 tables and make them unique
        var tagList = this.getValidTagListFromTableField("em_compose_field", "field");
        tagList = this.uniqueArray(tagList.concat(this.getValidTagListFromTableField("em_mapping_rule", "to_field")));
        tagList = this.uniqueArray(tagList.concat(this.getValidTagListFromTableField("em_match_field", "mapping")));
        this.addTagsToTable(tagList);

    },

    getValidTagListFromTableField: function(table, field) {
        var listOfTags = [];
        var gr = new GlideRecord(table);
        gr.query();
        while (gr.next()) {
            var value = gr.getValue(field);
            if (!gs.nil(value)) {
                var mappingFields = value.split(',');
                for (var i = 0; i < mappingFields.length; i++) {
                    if (!gs.nil(mappingFields[i].trim())) {
                        if (this.evtMgmtAlertTagsUtil.isValidAlertTagName(mappingFields[i])) 
							listOfTags.push(mappingFields[i]);
                    }
                }
            }
        }
        return listOfTags;
    },

    addTagsToTable: function(tags) {
     if (!tags || !Array.isArray(tags))
         return;
     if (this.evtMgmtAlertTagsUtil.canUseEmAlertTagsTable()) {
         for (var i = 0; i < tags.length; i++) {
             this.evtMgmtAlertTagsUtil.addNewAlertTag(tags[i]);
         }
     }
    },

    uniqueArray: function(arrArg) {
        return arrArg.filter(function(elem, pos, arr) {
            return arr.indexOf(elem) == pos;
        });
    },
    type: 'EvtMgmtAlertTagsValidation'
};
