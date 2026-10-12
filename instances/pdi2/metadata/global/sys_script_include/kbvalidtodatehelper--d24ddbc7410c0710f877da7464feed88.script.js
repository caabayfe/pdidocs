var KBValidToDateHelper = Class.create();
KBValidToDateHelper.prototype = {
    initialize: function() {
    },
	
	getMaxValidTo: function() {
		var d = new GlideDate();
		d.setValue('2100-01-01');
		return d.getDisplayValue();
	},

    type: 'KBValidToDateHelper'
};
