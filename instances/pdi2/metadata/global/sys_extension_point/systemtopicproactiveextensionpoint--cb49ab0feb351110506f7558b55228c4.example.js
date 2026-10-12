var SystemTopicProactiveExtensionPoint = Class.create();
SystemTopicProactiveExtensionPoint.prototype = {
    initialize: function() {
    },

    process: function(/*array*/ data) {
        return data;
    },

    type: 'SystemTopicProactiveExtensionPoint'
};
