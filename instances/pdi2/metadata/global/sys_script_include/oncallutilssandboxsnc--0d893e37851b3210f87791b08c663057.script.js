var OnCallUtilsSandboxSNC = Class.create();
OnCallUtilsSandboxSNC.prototype = {
    initialize: function() {},
    getDateTimePlusHours: function() {
        var gdt = new GlideDateTime();
        gdt.addSeconds(3600);
        return gdt.getDisplayValue();
    },
    type: 'OnCallUtilsSandboxSNC'
};
