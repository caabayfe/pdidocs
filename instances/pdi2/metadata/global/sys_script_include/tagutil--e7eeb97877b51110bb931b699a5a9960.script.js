var TagUtil = Class.create();
TagUtil.prototype = {
    initialize: function() {
    },
	/**
	* @description Tag a record in a table based on the input information
    * @param title {String} - title of Label Entry
	* @param tagSysId {String} - sys_id of tag
	* @param table {String} - name of the table containing the record to tag
	* @param recSysId {String} - sys_id of the record to tag
	*/
	insertTagEntry: function(title, tagSysId, table, recSysId) {
		if (!tagSysId)
			return;

		
		var gr = new GlideRecord('label_entry');
		gr.addQuery('table_key', recSysId);
		gr.addQuery('label', tagSysId);
		gr.query();
		if (gr.hasNext()) {
			return gr.sys_id + '';
		} else {
			gr.initialize();
			gr.setValue('title', title);
			gr.setValue('table', table);
			gr.setValue('table_key', recSysId);
			gr.setValue('label', tagSysId);
			gr.setWorkflow(false);
			gr.insert();
		}
	},
	/**
	* @description Delete the tag entry record with the input information
	* @param tagSysId {String} - sys_id of tag
	* @param recSysId {String} - sys_id of the record with the tag
	* @param table {String} - name of the table for the tagged record
	*/
	deleteTagEntry: function(tagSysId, recSysId, table) {
		if (!tagSysId || !tagSysId || !table)
			return;
		var gr = new GlideRecord('label_entry');
		gr.addQuery('table', table);
		gr.addQuery('table_key', recSysId);
		gr.addQuery('label', tagSysId);
		gr.query();
		if(gr.next()) {
			gr.setWorkflow(false);
			gr.deleteRecord();
		}
	},
	/**
	* @description Delete the tag record with the input sys_id
	* @param tagSysId {String} - sys_id of tag to delete
	*/
	deleteTag: function(tagSysId) {
		if (!tagSysId)
			return;
		
		var gr = new GlideRecord('label');
		gr.addQuery('sys_id', tagSysId);
		gr.query();
		if (gr.next()) {
			gr.setWorkflow(false);
			gr.deleteRecord();
		}
	},
	/**
	* @description Returns the sys_id of the tag with name = tagName or 
	*              creates a tag with the input name 
	* @param tagName {String} - name of the tag to create
	* @return {String} sys_id of the tage with name = tagName
	*/
	createTag: function(tagName) {
		var gr = new GlideRecord('label');
		gr.addQuery('name', tagName);
		gr.query();
		if (gr.next())
			return gr.sys_id + '';
		
		gr.setValue('name', tagName);
		gr.update();
		return gr.sys_id + '';
	},
	/**
	* @description Return the sys_id of the tag with name = tagName or 
	*              return null it the tag was not defined 
	* @param tagName {String} - name of the tag
	* @return {String} sys_id of the tag with name = tagName or null 
	*/
	getTagSysId: function(tagName) {
		var gr = new GlideRecord('label');
		gr.addQuery('name', tagName);
		gr.query();
		return gr.next() ? gr.sys_id + '' : null;		
	},
	/**
	* @description Return the sys_id of label entry record for a record in a table
	* @param recordSysId {String} - sys_id of the record with tag
	* @param table {String} - name of the table containing the record with the tag
	* @param tagSysId {String} - sys_id of tag
	* @return {String} - sys_id of the label-entry for the input record, and null 
	*  the tag was not assigned to that record
	*/
	getRecordEntry: function(recordSysId, table, tagSysId) {
		if (!tagSysId)
			return null;
		
		var gr = new GlideRecord('label_entry');
		gr.addQuery('table', table);
		gr.addQuery('table_key', recordSysId);
		gr.addQuery('label', tagSysId);
		gr.query();
		
		return gr.next() ? gr.sys_id + '' : null;
	},
	/**
	* @description Returns the sys_id of all tagged records in a table with the input tag 
	* @param tagSysId {String} - sys_id of tag
	* @param table {String} - name of the table containing the record with the tag
	* @return {Array} - array of sys_id's of all records in a table tagged by tagSysId
	*/
	getTaggedRecords: function(tagSysId, table) {
		var taggedRecords = [];
		var gr = new GlideRecord('label_entry');
		gr.addQuery('table', table);
		gr.addQuery('label', tagSysId);
		gr.query();
		while(gr.next()) {
			taggedRecords.push(gr.getValue('table_key'));
		}
		
		return taggedRecords;
	},
    type: 'TagUtil'
};
