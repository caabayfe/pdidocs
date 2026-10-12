var CheckTableAccessForLogFormatting = Class.create();
CheckTableAccessForLogFormatting.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    hasReadAccess: function() {
        var tableName = this.getParameter('sysparm_table');
        if (!tableName) return false;

        // CheckTableAccessForLogFormatting read access using GlideRecordSecure
        var gr = new GlideRecordSecure(tableName);
        if (!gr.isValid()) return false;

        return gr.canRead();
    },
    type: 'CheckTableAccessForLogFormatting'
});
