var ActionBarConfig = Class.create();

ActionBarConfig.prototype = {
  initialize : function() {
  },

  getModel: function(source) {
	switch(source) {
		case "list":
			return "c3547169534723003eddddeeff7b126c";
		case "related_list":
			return "d91731a9534723003eddddeeff7b121c";
		default:
			return "360935e9534723003eddddeeff7b127d";
	}
  },

  getFormPosition: function(source) {
	switch(source) {
		case "list":
		case "related_list":
			return null;
		default:
			return "action_bar";
	}
  },
};
