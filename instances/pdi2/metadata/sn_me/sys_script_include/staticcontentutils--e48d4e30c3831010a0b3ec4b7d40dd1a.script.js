var StaticContentUtils = Class.create();
StaticContentUtils.prototype = Object.extendsObject(StaticContentUtilsSNC, {
    initialize: function() {
        StaticContentUtilsSNC.prototype.initialize.call(this);
    },
    type: 'StaticContentUtils'
});
