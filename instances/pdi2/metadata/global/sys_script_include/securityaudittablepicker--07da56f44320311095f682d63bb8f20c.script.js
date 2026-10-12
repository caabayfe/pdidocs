var SecurityAuditTablePicker = Class.create();
SecurityAuditTablePicker.prototype = {
    initialize: function() {
    },
    process: function() {
        var tableArray = [];
	    var tables = GlideProperties.get("glide.security.audit.tables");
        var tableList = GlideStringUtil.split(tables);
        for(var i = 0; i < tableList.size(); i++) {
            tableArray.push( tableList.get(i) );
        }
	return tableArray;
    },

    type: 'SecurityAuditTablePicker'
};
