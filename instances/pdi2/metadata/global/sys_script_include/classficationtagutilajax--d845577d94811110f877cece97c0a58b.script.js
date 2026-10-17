var ClassficationTagUtilAjax = Class.create();
ClassficationTagUtilAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    _TAGGING_UTIL: new CapabilityTagUtil(),
    //_TAG_RULES_UTIL: new ClassificationTagRulesUtil(),
    _UNCATEGORIZED_TAG_LABEL: gs.getMessage("Uncategorized"),
    _JSON_UTIL: new global.JSON(),
    _SYS_ID_REGEX: /^[0-9a-fA-F]{32}$/,

    /**
     * Retrieves all tags that are marked active and, if they have
     * a group, have an active security tag group.
     * @returns Returns a simplified JSON string of the security tags
     */
    getSecurityTagMap: function() {
        var tagGr = new GlideRecord('cmdb_data_classification');
        if (!tagGr.canRead())
            return this._createJsonResponse('error');

        var resultMap = {};
        resultMap[this._UNCATEGORIZED_TAG_LABEL] = [];

        var tagIds = this._TAGGING_UTIL.getAvailableSecurityTagIdsForCurrentUser();

        tagGr.addQuery('sys_id', 'IN', tagIds.join(','));
        tagGr.orderBy('order');
        tagGr.query();
        while (tagGr.next()) {
            if (gs.nil(tagGr.getValue('classification_group')))
                resultMap[this._UNCATEGORIZED_TAG_LABEL].push({
                    'sys_id': tagGr.getUniqueValue(),
                    'name': tagGr.getValue('name'),
                    'allow_multi': false,
                    'order': tagGr.getValue('order')
                });
            else {
                var gr = new GlideRecordSecure('cmdb_data_classification_group');
                if (gr.get(tagGr.getValue('classification_group'))) {
                    if (!resultMap.hasOwnProperty(gr.getValue('name')))
                        resultMap[gr.getValue('name')] = [];

                    resultMap[gr.getValue('name')].push({
                        'sys_id': tagGr.getUniqueValue(),
                        'name': tagGr.getValue('name'),
                        'allow_multi': gr.getValue('allow_multi') + '',
                        'order': tagGr.getValue('order')
                    });
                }
            }
        }
        return this._createJsonResponse('ok', resultMap);
    },

    /**
     * Retrieves all security tags applied to a record by using the
     * record's SysID and the record's table name.
     * @param recordId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns a simplified JSON string of the security tags
     */
    getSecurityTagsByRecord: function(recordId, recordTableName) {
        var rtnGr = new GlideRecord(recordTableName);
        rtnGr.get(recordId);
        if (!rtnGr.isValidRecord() && !rtnGr.canRead())
            return this._createJsonResponse('error');

        var resultSet = [];
        var tags = this._TAGGING_UTIL.getSecurityTags(recordId, recordTableName);

        while (tags.next())
            resultSet.push(this._convertSecurityTagToJson(tags));
        return this._createJsonResponse('ok', resultSet);
    },

    /**
     * Convienence method that retrieves the tags on
     * a given record and is accessible through client-side invocation.
     * @param recordId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns a simplified JSON string of the tags
     */
    getSecurityTagsByRecordAjax: function() {
        var recordId = this.getParameter('sysparm_recordId');
        var table = this.getParameter('sysparm_table');
        return this.getSecurityTagsByRecord(recordId, table);
    },

    /**
     * Adds or removed the given security tag from the given record
     * depending on whether the tag already exists on the record.
     * @param tagId: SysID of the tag
     * @param recordId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns a simplified JSON string of the added tag
     * or returns whether the record was deleted successfully
     */
    manageSecurityTagOnRecord: function(tagId, recordId, recordTableName) {
        var result = {};
        var m2m = new GlideRecordSecure('cmdb_data_classification_mapping');
        m2m.addQuery('information_object', recordId);
        m2m.addQuery('data_classification', tagId);
        m2m.setLimit(1);
        m2m.query();
        var infoObjGr = new GlideRecordSecure('cmdb_ci_information_object');
        var classifications;
        if (m2m.next()) {
            result.status = this._TAGGING_UTIL.removeSecurityTagM2m(m2m.getUniqueValue()) ? 'ok' : 'error';
            if (infoObjGr.get(recordId)) {
                classifications = infoObjGr.classification.toString().split(','); // convert to array
				for (var i = 0; i < classifications.length; i++) {
				if (classifications[i] === tagId) {
					classifications.splice(i, 1);
					i--;
				}
				}
                infoObjGr.setValue('classification', classifications.toString());
            }
            infoObjGr.setWorkflow(false);
            infoObjGr.update(); 
        } else {
            var gr = this._TAGGING_UTIL.addSecurityTagM2m(tagId, recordId, recordTableName, true, true);
            if (gr != null) {
                gr = new GlideRecordSecure('cmdb_data_classification');
                if (gr.get(tagId)) {
                    result.status = 'ok';
                    result.content = this._convertSecurityTagToJson(gr);
                }
                if (infoObjGr.get(recordId)) {
                    classifications = infoObjGr.classification.toString();
                    if (classifications != '')
                        classifications += ',' + tagId;
                    else classifications = tagId;
                    infoObjGr.setValue('classification', classifications);
                }
                infoObjGr.setWorkflow(false);
                infoObjGr.update();
            } else {
                result.status = 'error';
            }
        }
        return this._createJsonResponse(result.status, result.content);
    },

    /**
     * Convienence method to add or remove tags from
     * a given record and is accessible through client-side invocation.
     * @param tagId: SysID of the security tag
     * @param recordId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns a simplified JSON string of the added security tag
     * or returns whether the record was deleted successfully
     */
    manageSecurityTagOnRecordAjax: function() {
        var tagId = unescape(this.getParameter('sysparm_securityTagId').toString()).trim();
        var recordId = unescape(this.getParameter('sysparm_recordId').toString()).trim();
        var table = unescape(this.getParameter('sysparm_table').toString()).trim();
        return this.manageSecurityTagOnRecord(tagId, recordId.toString(), table.toString());
    },

    /**
     * Converts a response status and content from Javascript objects
     * to a plain JSON string to be transmitted to the client-side.
     * @param status: Status of the response, can be 'ok' or 'error'
     * @param content: Actual content that will be evaluated on the client-side
     * @returns Returns a JSON string of the given parameters
     */
    _createJsonResponse: function(status, content) {
        return this._JSON_UTIL.encode({
            'status': status,
            'content': content
        });
    },

    /**
     * Converts a given tag record into a simplified
     * Javascript object.
     * @param tagGr: Security tag GlideRecord
     * @returns Returns a simplified Javascript object of the security tag
     */
    _convertSecurityTagToJson: function(tagGr) {
        return {
            'sys_id': tagGr.sys_id + '',
            'name': tagGr.name + '',
            'description': tagGr.description ? tagGr.description + '' : null,
            'color': tagGr.color + '',
            'order': tagGr.order
        };
    },

    removeDuplicatesOfSameGroup: function() {
        var newValue = this.getParameter('sysparm_newValue');
        var recordId = this.getParameter('sysparm_recordId');
        var newClassifications = newValue.split(",");
        var newClass = newClassifications[newClassifications.length - 1];
        var gr = new GlideRecord('cmdb_data_classification');
        gr.get(newClass);
        var newGrpId = gr.classification_group;
        var mapGr = new GlideRecord('cmdb_data_classification_group');
        mapGr.get(newGrpId);
        var isMultiAllowed = mapGr.allow_multi;
        if (!isMultiAllowed) {
            for (var i = 0; i < newClassifications.length - 1; i++) {
                var temp = new GlideRecord('cmdb_data_classification');
                temp.get(newClassifications[i]);
                if (newGrpId.toString() === temp.classification_group.toString()) {
                    newClassifications[i] = '';
                    break;
                }
            }
        }
        var result = newClassifications.join(",").toString().replace(",,", ",");
        return this._createJsonResponse('ok', result);
    },

    type: 'ClassficationTagUtilAjax'
});
