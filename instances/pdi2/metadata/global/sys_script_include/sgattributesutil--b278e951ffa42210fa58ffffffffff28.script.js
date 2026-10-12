var SGAttributesUtil = Class.create();
SGAttributesUtil.prototype = {

    initialize: function(attributeTableName, parentField) {
        this.attributeTableName = attributeTableName;
        this.parentField = parentField;
        this.NAME_FIELD = 'name';
        this.VALUE_FIELD = 'value';
    },

    isDuplicate: function(currentAttributeGr) {
        if (!currentAttributeGr)
            return false;

        var parent = currentAttributeGr.getValue(this.parentField);
        var attributeName = currentAttributeGr.getValue(this.NAME_FIELD);
        var additionalEncodedQuery = 'sys_id!=' + currentAttributeGr.getUniqueValue();
        return this._getAttributeGr(parent, attributeName, additionalEncodedQuery).hasNext();
    },

    _getAttributeGr: function(parent, attributeName, additionalEncodedQuery) {
        var gr = new GlideRecord(this.attributeTableName);
        gr.addQuery(this.parentField, parent);
        gr.addQuery(this.NAME_FIELD, attributeName);
        if (additionalEncodedQuery)
            gr.addEncodedQuery(additionalEncodedQuery);
        gr.query();
		return gr;
    },

    getReferenceAttributeGr: function(parent, attributeName, targetTable) {
        var attributeGr = this._getAttributeGr(parent, attributeName);
		if (!attributeGr.next())
            return null;

		var value = attributeGr.getValue(this.VALUE_FIELD);
		if (!value)
			return null;

        var targetGr = new GlideRecord(targetTable);
        targetGr.get(value);
		return targetGr;
    },

    type: 'SGAttributesUtil'
};
