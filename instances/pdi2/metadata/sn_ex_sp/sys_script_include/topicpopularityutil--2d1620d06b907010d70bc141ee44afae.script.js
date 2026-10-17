var TopicPopularityUtil = Class.create();
TopicPopularityUtil.prototype = Object.extendsObject(TopicPopularityUtilSNC,{
	initialize: function() {
		TopicPopularityUtilSNC.prototype.initialize.apply(this, arguments);
	},
    type: 'TopicPopularityUtil'
});
