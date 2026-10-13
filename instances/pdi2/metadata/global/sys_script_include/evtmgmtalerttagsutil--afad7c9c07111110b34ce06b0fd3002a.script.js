var EvtMgmtAlertTagsUtil = Class.create();
EvtMgmtAlertTagsUtil.prototype = {
    initialize: function() {
        this.ALERT_TAGS_TABLE_NAME = 'em_alert_tags';
        this.GLOBAL = 'global';
        this.ALERT_TAGS_PREFIX = gs.getProperty('evt_mgmt.alert_tags_prefix', 't_'); 
	this.evtMgmtCommons = new EvtMgmtCommons();
    },

    /**
     ** Returns true if alert tags feature is enabled by property AND em_alert_tags table exists.
     **/
    canUseEmAlertTagsTable: function() {
        //evt_mgmt.alert_tags_state options: true, partial,false
        var alertState = gs.getProperty('evt_mgmt.alert_tags_state', 'true');
        if (alertState === 'true' || alertState === 'partial') {
            var gr = new GlideRecord(this.ALERT_TAGS_TABLE_NAME);
            return gr.isValid();
        }
        return false;
    },

    /**
     ** Returns a list of all tags defined rules in current or father domains,
     ** The number of results is limited by the value of the property evt_mgmt.max_alert_tags_for_event_rule
     **/
    getAlertTags: function() {
        var tagsList = [];
        if (this.canUseEmAlertTagsTable()) {
            var tagsLimit = gs.getProperty('evt_mgmt.max_alert_tags_for_event_rule', '100');
            tagsLimit = parseInt(tagsLimit) || 100;

            var alertTagsGr = new GlideRecord(this.ALERT_TAGS_TABLE_NAME);
            alertTagsGr.orderByDesc('sys_updated_on');
            alertTagsGr.addQuery('tag_name', 'STARTSWITH', this.ALERT_TAGS_PREFIX);
            alertTagsGr.setLimit(tagsLimit);
            alertTagsGr.query();
            while (alertTagsGr.next()) {
                var tagName = alertTagsGr.getValue('tag_name');
                tagsList.push(tagName);
            }
        }
        return tagsList;
    },

    /**
     ** Validate alert tag and insert to em_alert_tags table only if doesn't exist.
     ** If alert tag allready exists - update submit_counter value by 1.
     **/
    addNewAlertTagIfDoesntExistInTable: function(tagName) {
        if (this.canUseEmAlertTagsTable() && this.isValidAlertTagName(tagName)) {
            //if the tag doesn't exists allready in the table, add to table
            var alertTagsGr = this.getAlertTagsGr(tagName);
            if (alertTagsGr.next()) {
				//increment the count by 1 to change the sys_updated field.
                var count = alertTagsGr.getValue('submit_counter');
                count = parseInt(count);
                alertTagsGr.setValue('submit_counter', count + 1);
                alertTagsGr.update();
            } else {
                this.insertToAlertTagsTable(tagName);
            }
        }
    },

    addNewAlertTag: function(tagName) {
        if (this.isValidAlertTagName(tagName)) {
            //if the tag doesn't exists allready in the table, add to table
			var record = this.doesAlertTagExist(tagName);
            if (!record) {
                this.insertToAlertTagsTable(tagName);
                this.evtMgmtCommons.addDebugLogNoPrefix('EvtMgmtAlertTagsUtil New alert tag was added to table: ' + tagName);
            }
        }
    },

    insertToAlertTagsTable: function(tagName) {
        var gr = new GlideRecord(this.ALERT_TAGS_TABLE_NAME);
        gr.setValue('tag_name', tagName);
        gr.setValue('submit_counter', 1);
        gr.insert();
    },

    /**
     ** Returns true if the alert tag name begins with "t_" prefix
     **/
    isValidAlertTagName: function(tagName) {
        return !gs.nil(tagName) && (tagName.startsWith(this.ALERT_TAGS_PREFIX));
    },

    /**
     ** Returns alert tags Glide Record
     **/
    getAlertTagsGr: function(tagName) {
        var alertTagsGr = new GlideRecord(this.ALERT_TAGS_TABLE_NAME);
        alertTagsGr.addQuery('tag_name', tagName);
        alertTagsGr.setLimit(1);
        alertTagsGr.query();
        return alertTagsGr;
    },


    /**
     ** Returns true if the tagName allready exists in em_alert_tags table.
     **/
    doesAlertTagExist: function(tagName) {
        return this.getAlertTagsGr(tagName).next();
    },

    type: 'EvtMgmtAlertTagsUtil'
};
