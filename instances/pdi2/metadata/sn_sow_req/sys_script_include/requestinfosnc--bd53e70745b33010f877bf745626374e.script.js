var RequestInfoSNC = Class.create();
RequestInfoSNC.prototype = {
    initialize: function(gr) {
        this._gr = gr;
        this._catalogSOWUtil = new sn_sow_req.CatalogSOWUtils();
    },
    getHeaderInfo: function() {
        var result = {};
        result.mainHeading = sn_i18n.Message.getMessage("sn_sow_req", "Record Information");
        var userGr = new GlideRecord('sys_user');
        userGr.addActiveQuery();
        userGr.addQuery("user_name", this._gr.getDisplayValue('sys_updated_by'));
        userGr.query();
        if (userGr.next() && userGr.getValue('name'))
            result.updateMsg = sn_i18n.Message.getMessage("sn_sow_req", "Last updated by {updatedBy}", {
                updatedBy: userGr.getValue('name')
            });
        else
            result.updateMsg = sn_i18n.Message.getMessage("sn_sow_req", "Last updated by {updatedBy}", {
                updatedBy: this._gr.getDisplayValue('sys_updated_by')
            });
        result.updatedTime = this._gr.sys_updated_on.getDisplayValue();
        return result;
    },
    getRequestedForInfo: function() {
        if (!this._gr.requested_for)
            return "";
        var requestedForGr = this._gr.requested_for.getRefRecord();
        var requestorInfo = this._catalogSOWUtil.getRequestedUserInfo(requestedForGr);
        requestorInfo.vip = requestedForGr.vip ? true : false;
        requestorInfo.sysId = requestedForGr.getUniqueValue();
        return requestorInfo;
    },
    getSourceInfo: function() {
        var requestorInfo = this.getRequestedForInfo();
        var result = {
            requestorInfo: requestorInfo,
            sourceHeading: sn_i18n.Message.getMessage("sn_sow_req", "Requested for"),
            name: this._gr.getDisplayValue('requested_for'),
            vip: requestorInfo.vip,
            assigneeDetails: [{
                label: this._gr['opened_by'].getLabel(),
                value: {
                    type: "string",
                    value: this._gr.getDisplayValue('opened_by')
                }
            }]
        };
        return result;
    },

    getOpenedByInfo: function() {
        var openedByInfo = {};
        var openedByGr = this._gr.opened_by.getRefRecord();
        openedByInfo = this._catalogSOWUtil.getRequestedUserInfo(openedByGr);
        openedByInfo.vip = openedByGr.vip ? true : false;
        openedByInfo.sysId = openedByGr.getUniqueValue();

        var result = {
            userInfo: openedByInfo,
            heading: sn_i18n.Message.getMessage("sn_sow_req", "Opened by"),
            name: openedByGr.getDisplayValue('name'),
            vip: openedByInfo.vip
        };
        return result;
    },
    getRecordInfo: function() {
        var result = {};
        result.headerInfo = this.getHeaderInfo();
        result.sourceInfo = this.getSourceInfo();
        result.openedByInfo = this.getOpenedByInfo();
        return result;
    },
    type: 'RequestInfoSNC'
};
