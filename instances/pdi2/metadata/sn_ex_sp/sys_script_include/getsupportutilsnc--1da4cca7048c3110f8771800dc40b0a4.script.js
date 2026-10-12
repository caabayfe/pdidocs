var GetSupportUtilSNC = Class.create();
GetSupportUtilSNC.prototype = {
    initialize: function(portal) {
        this.GETSUPPORT_TABLE = 'sn_ex_sp_get_support';
        this.QUICKLINK_TABLE = 'sn_ex_sp_quick_link';
        this.STATICCONTENT_TABLE = 'sn_ex_sp_static_content';
        this.quickLinkUtil = new sn_ex_sp.QuickLinkUtil();
        this.staticContentUtil = new sn_ex_sp.StaticContentUtil();
        this.portal = portal;
    },

    /**
     * This function returns support records
     * @returns List of objects
     */
    fetchSupportRecords: function() {
        var quickLinksObjectList = this._fetchSupportRecordsJSON('quicklink', this.QUICKLINK_TABLE);
        var staticContentObjectList = this._fetchSupportRecordsJSON('static_content', this.STATICCONTENT_TABLE);
        return this._mergeObjectsByOrder([quickLinksObjectList, staticContentObjectList]);
    },

    /**
     * This function merges the given list of objects with respect to order
     * @param {Array} lists
     * @returns mergedList
     */
    _mergeObjectsByOrder: function(lists) {
        if (lists.length === 0) {
            return [];
        }
        var mergedList = lists[0];
        for (var i = 1; i < lists.length; i++) {
            mergedList = this._mergeTwoLists(mergedList, lists[i]);
        }
        return mergedList;
    },

    /**
     * This function returns support records in JSON format
     * @param {String} support_type
     * @param {String} table
     * @returns supportItemsObjectList
     */
    _fetchSupportRecordsJSON: function(support_type, table) {
        var supportItems = this._getListAndOrderMap(table);
        var supportItemsList = supportItems[0];
        var supportItemsOrderMap = supportItems[1];
        var supportItemsObjectList = this._getSupportItemsObjectList(support_type, supportItemsList);
        this._insertOrderAndSupportType(supportItemsObjectList, supportItemsOrderMap, support_type);
        return supportItemsObjectList;
    },

    /**
     * This function returns SupportItemsObjectList for a given support_type.
     * @param {String} support_type
     * @param {String} supportItemsList
     * @returns Object
     */
    _getSupportItemsObjectList: function(support_type, supportItemsList) {
        if (support_type === 'quicklink') {
            return this.quickLinkUtil.fetchQuicklinksForGetSupport(supportItemsList);
        } else if (support_type === 'static_content') {
            return this.staticContentUtil.fetchStaticContent(supportItemsList);
        }
    },

    /**
     * This function returns String of comma separated Sys IDs of support records and an orderMap related to a support record.
     * @param {String} table
     * @returns Array
     */
    _getListAndOrderMap: function(table) {
        var supportRecord = new GlideRecord(this.GETSUPPORT_TABLE);
        supportRecord.addQuery('table', table);
        var qc = supportRecord.addNullQuery('portal');
        if(!gs.nil(this.portal))
            qc.addOrCondition('portal','CONTAINS', this.portal);
        supportRecord.orderBy('order');
        supportRecord.query();
        var orderMap = {};
        var supportList = '';
        while (supportRecord.next()) {
            orderMap[supportRecord.getValue('content')] = parseInt(supportRecord.getValue('order'),10);
            supportList = supportList + supportRecord.getValue('content') + ',';
        }
        return [supportList, orderMap];
    },

    /**
     * This function inserts order and support_type in the formed json.
     * @param {String} obj
     * @param {String} orderMap
	 * @param {String} support_type
     */
    _insertOrderAndSupportType: function(obj, orderMap, support_type) {
        for (var i = 0; i < obj.length; i++) {
            obj[i]['order'] = orderMap[obj[i]['id']];
            obj[i]['support_type'] = support_type;
			if(support_type === 'quicklink'){
				obj[i]['content'] = obj[i]['shortDescription'];
			}
			else if(support_type === 'static_content'){
				obj[i]['content'] = obj[i]['richText'];
			}
        }
    },
	
    /**
     * This is a utility function for merge objects function.
     * @param {String} list1
     * @param {String} list2
     * @returns mergedList
     */
    _mergeTwoLists: function(list1, list2) {
        var mergedList = [];
        var i = 0;
        var j = 0;
        while (i < list1.length && j < list2.length) {
            if (list1[i].order <= list2[j].order) {
                mergedList.push(list1[i]);
                i++;
            } else {
                mergedList.push(list2[j]);
                j++;
            }
        }
        while (i < list1.length) {
            mergedList.push(list1[i]);
            i++;
        }
        while (j < list2.length) {
            mergedList.push(list2[j]);
            j++;
        }
        return mergedList;
    },

    type: 'GetSupportUtilSNC'
};
