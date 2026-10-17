var StaticContentUtil = Class.create();
StaticContentUtil.prototype = Object.extendsObject(StaticContentUtilSNC, {
    initialize: function() {
		StaticContentUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'StaticContentUtil'
});
