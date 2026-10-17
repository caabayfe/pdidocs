var CapabilityTagUtil = Class.create();
CapabilityTagUtil.prototype = {
 
    initialize: function() {},

    /**
     * Retrieves all security tags that are marked active and, if they have
     * a group, have an active security tag group.
     * @returns Returns a query GlideRecord object
     */
    getAvailableSecurityTags: function() {
        var tagGr = new GlideRecord('cmdb_data_classification');
        tagGr.orderBy('order');
        tagGr.query();
        return tagGr;
    },

    getAvailableSecurityTagIdsForCurrentUser: function() {
        var tagIds = [];
        var tagGr = this.getAvailableSecurityTags();
        while (tagGr.next()) {
            tagIds.push(tagGr.getUniqueValue() + '');
        }
        return tagIds;
    },

    /**
     * Convenience method to get all tags applied to a record by
     * the record itself.
     * @param recordGr: GlideRecord for which the tags will be retrieved
     * @returns Returns a query GlideRecord object
     */
    getSecurityTagsByRecord: function(recordGr) {
        return this.getSecurityTags(recordGr.getUniqueValue(), recordGr.getTableName());
    },

    /**
     * Retrieves all security tags applied to a record by using the
     * record's SysID and the record's table name.
     * @param recordSysId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns a query GlideRecord object
     */
    getSecurityTags: function(recordSysId, recordTableName) {
        var tagIds = [];

        var m2m = new GlideRecord('cmdb_data_classification_mapping');
        m2m.addQuery('information_object', recordSysId);
        m2m.query();
        while (m2m.next())
            tagIds.push(m2m.data_classification + '');

        var tagGr = new GlideRecord('cmdb_data_classification');
        tagGr.addQuery('sys_id', 'IN', tagIds.join(','));
        tagGr.addQuery('active', true);
        tagGr.orderBy('order');
        tagGr.query();
        return tagGr;
    },

    /**
     * Removes a 'sn_sec_cmn_applied_security_tag' record from the
     * database based on given SysID.
     * @param m2mSysId: SysID of the record
     * @returns Returns whether record was deleted successfully
     */
    removeSecurityTagM2m: function(m2mSysId) {
        var m2m = new GlideRecord('cmdb_data_classification_mapping');
        if (m2m.get(m2mSysId))
            return m2m.deleteRecord();
        return false;
    },

    /**
     * Adds a 'sn_sec_cmn_applied_security_tag' record to the database
     * for a given security tag and a given record. Additionally this method
     * takes care of handling the 'allow_multi' setting of security tag group.
     * If a group does not allow multiples, the method can either
     * delete all existing applied tag from the record or simply not
     * add the new one.
     * @param tagId: SysID of the security tag
     * @param recordSysId: SysID of the record
     * @param recordTableName: Table name of the record
     * @param deleteInSameSecurityTagGroup: Whether to delete security tag within
     * the same group as the given tag
     * @returns Returns the inserted record
     */
    addSecurityTagM2m: function(tagId, recordSysId, recordTableName, deleteInSameSecurityTagGroup, userBased) {
        userBased = userBased || false;
        if (!deleteInSameSecurityTagGroup) {
            if (!this.allowInSameSecurityTagGroup(tagId, recordSysId, recordTableName))
                return null;
        } else
            this.deleteAllInSameSecurityTagGroup(tagId, recordSysId, recordTableName, userBased);

        var m2m = new GlideRecord('cmdb_data_classification_mapping');
        m2m.initialize();
        m2m.setValue('information_object', recordSysId);
        m2m.setValue('data_classification', tagId);
        return m2m.insert() ? m2m : null;
    },

    /**
     * This method determines whether another security tag with the same
     * group as the given tag is allowed on the record.
     * @param tagId: SysID of the security tag
     * @param recordSysId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns whether another security tag with the same
     * group as the given tag is allowed on the record
     */
    allowInSameSecurityTagGroup: function(tagId, recordSysId, recordTableName) {
        var tagGr = this._getAllInSameSecurityTagGroup(tagId, recordSysId, recordTableName);
        if (tagGr && tagGr.hasNext()) {
            return false;
        }
        return true;
    },

    /**
     * This method deletes all other tags with the same
     * security tag group as the given tags on the record.
     * @param tagId: SysID of the tags
     * @param recordSysId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns whether all other tags with the same
     * security tag group have been deleted
     */
    deleteAllInSameSecurityTagGroup: function(tagId, recordSysId, recordTableName, userBased) {
        var appliedTagGr = this._getAllInSameSecurityTagGroup(tagId, recordSysId, recordTableName);
        if (appliedTagGr) {
            var retVal = true;
			var infoObjGr = new GlideRecordSecure('cmdb_ci_information_object');
			infoObjGr.get(recordSysId);
			var classifications = infoObjGr.classification.toString().split(',');
            while (appliedTagGr.next() && retVal){
				var pos = classifications.indexOf(unescape(appliedTagGr.data_classification.toString()));
				if(pos!=-1)
					classifications.splice(pos, 1);
                retVal = !userBased || true ? appliedTagGr.deleteRecord() : false;
				infoObjGr.setValue('classification', classifications.toString());
			}
			infoObjGr.update();
            return retVal;
        }
        return false;
    },

    /**
     * This method retrieves all tag records on the given record
     * that share a security tag group with the given tag.
     * @param tagId: SysID of the security tag
     * @param recordSysId: SysID of the record
     * @param recordTableName: Table name of the record
     * @returns Returns a query GlideRecord object
     */
    _getAllInSameSecurityTagGroup: function(tagId, recordSysId, recordTableName) {
        var tagGr = new GlideRecord('cmdb_data_classification');
        if (tagGr.get(tagId) && !gs.nil(tagGr.getValue('classification_group'))) {
            var groupGr = new GlideRecord('cmdb_data_classification_group');
            if (groupGr.get(tagGr.getValue('classification_group'))) {
                if (groupGr.allow_multi == false) {
                    var gr = new GlideRecord('cmdb_data_classification_mapping');
                    gr.addQuery('data_classification.classification_group', groupGr.getUniqueValue());
                    gr.addQuery('data_classification.active', true);
                    gr.addQuery('information_object', recordSysId);
                    gr.query();
                    return gr;
                }
            }
        }
        return null;
    },

    type: 'CapabilityTagUtil'
};
