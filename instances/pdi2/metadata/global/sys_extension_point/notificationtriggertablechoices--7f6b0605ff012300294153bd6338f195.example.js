var NotificationTriggerTableChoices = Class.create();
NotificationTriggerTableChoices.prototype = {
    initialize: function(view) {
		// View is passed in to initialize function
		this.view = view;
    },
	
	handles: function(){
		// Determine if this is a view that you handle
		return ['some_view_i_handle', 'another_view_i_handle'].indexOf(this.view) > -1
	},

    process: function() {
		// Set table conditions, optionally based on this.view
		var tl = new GlideTableChoiceList();
		tl.setSelectedOnly(false);
		tl.setSelectedField(null);
		tl.setSelected(null);
		tl.setForceSelected(false);
		tl.setNoViews(true);
		tl.setNoSystemTables(true);
		tl.setCurrentTableName(null);
		tl.setNoIndexTables(true);
		
		// Return object, not results
		return tl;
    },

    type: 'NotificationTriggerTableChoices'
};
