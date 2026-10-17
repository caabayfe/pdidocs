var Text2Analytics = Class.create();
Text2Analytics.prototype = {
    initialize: function() {},
    getAllTableColumns: function(tableName) {
        var gr = new GlideRecord(tableName);
        // Secured.
        if (!gr.canRead()) {
            gs.logWarning("Security restricted: cannot read", "Text2Analytics.getAllTableColumns");
            return;
        }
        var sl = new GlideSysList(tableName);
        return sl.getAllListColumns();
    },
    getTableSchemaMap: function(tableName, fieldName) {
        var gr = new GlideRecord(tableName);
        // Secured
        if (!gr.canRead()) {
            gs.logWarning("Security restricted: cannot read", "Text2Analytics.getTableSchemaMap");
            return {};
        }
        var tableDescription = new GlideTableDescriptor.get(tableName);
        return tableDescription.getSchema().get(fieldName);
    },
    _isNumericField: function(element) {
        var internal_type = String(element.getInternalType());
        return (internal_type === 'numeric' || internal_type === 'float' ||
            internal_type === 'decimal' || internal_type === 'integer' ||
            internal_type === 'domain_number' || internal_type === 'auto_increment' ||
            internal_type === 'percent_complete');
    },
    _isDateTimeField: function(element) {
        var internal_type = String(element.getInternalType());
        return (internal_type === 'date' || internal_type === 'datetime' ||
            internal_type === 'due_date' || internal_type === 'glide_date' ||
            internal_type === 'glide_date_time' || internal_type === 'glide_precise_time');
    },
    canSum: function(element) {
        var internal_type = String(element.getInternalType());
        return this._isNumericField(element) || internal_type === 'glide_duration' ||
            internal_type === 'timer' || internal_type === 'currency' || internal_type === 'price' || internal_type === 'currency2';
    },
    canCountDistinct: function(element) {
        var internal_type = String(element.getInternalType());
        var name = element.getName();
        return (internal_type === "reference" || internal_type === 'domain_id' ||
            internal_type === 'choice' || internal_type === 'document_id' || name.endsWith("sys_id"));
    },
    _canSort: function(element) {
        if (element.getBooleanAttribute("cansort")) return true;
        if (element.getName().contains("password")) return false;
        if (element.getName() === 'sys_id') return false;
        if (element.getInternalType() === 'journal' || element.getInternalType() === 'journal_input') return false;
        if (element.isList()) return false;
        return true;
    },
    canGroup: function(element) {
        var internal_type = String(element.getInternalType());
        if (internal_type === 'variables' || internal_type === 'variable') return true;
        if (this._isDateTimeField(element)) return true;
        if (element.getBooleanAttribute('can_group')) return true;
        if (element.isEdgeEncrypted() && element.getBooleanAttribute("canmatch")) return true;
        if (element.isMultiText() || internal_type === 'glide_list' || !this._canSort(element)) return false;
        return true;
    },
    type: 'Text2Analytics'
};
