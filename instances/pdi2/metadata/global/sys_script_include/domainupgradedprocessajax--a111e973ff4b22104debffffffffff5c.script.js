var DomainUpgradedProcessAjax = Class.create();
DomainUpgradedProcessAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /**
     * Get the sys id (Stored in record_guid column) of the upgraded overridden record
     */
    getOverriddenRecordGuid: function() {
        return this._getRecordGuid('upgraded_overridden_process');
    },

    /**
     * Returns the HTML diff between two records in a given table using their sys_ids.
     * Uses DiffHelper and GlideRecordXMLSerializer to produce the comparison.
     */
    diffTwoAny: function() {
        var table = (this.getParameter('sysparm_table') || '').trim();
        var id1 = (this.getParameter('sysparm_id1') || '').trim();
        var id2 = (this.getParameter('sysparm_id2') || '').trim();

        var diffHelper = new DiffHelper();

        if (!table || !id1 || !id2)
            return diffHelper.noCompare();

        var left = new GlideRecordSecure(table);
        var right = new GlideRecordSecure(table);

        if (!left.get(id1) || !right.get(id2))
            return diffHelper.noCompare();

        if (!left.canRead() || !right.canRead())
            return diffHelper.noCompare();

        var diff, html;

        var serializer = new GlideRecordXMLSerializer();
        var xmlLeft = serializer.serialize(left);
        var xmlRight = serializer.serialize(right);

        diff = diffHelper.diffRecord(xmlLeft, xmlRight, left.getTableName());
        if (diff == null) return diffHelper.noCompare();

        html = diffHelper.getTemplate(diff, "Overridden Version", "Override Version");
        return html;
    },

    /**
     * Get the sys id (Stored in record_guid column) of the selected override
     */
    getOverrideRecordGuid: function() {
        return this._getRecordGuid('override_process');
    },


    /**
     * Shared internal method to retrieve 'record_guid' from a given table using sys_id.
     */
    _getRecordGuid: function(table) {
        var sysId = this.getParameter('sysparm_sys_id');
        if (!sysId || !table) return '';

        var gr = new GlideRecordSecure(table);
        return gr.get(sysId) ? gr.getValue('record_guid') : '';
    },

    type: 'DomainUpgradedProcessAjax'
});
