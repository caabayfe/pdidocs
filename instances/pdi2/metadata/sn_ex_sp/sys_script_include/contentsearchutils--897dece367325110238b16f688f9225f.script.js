var ContentSearchUtils = Class.create();
    ContentSearchUtils.prototype = Object.extendsObject(ContentSearchUtilsSNC, {
    initialize: function () {
        ContentSearchUtilsSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ContentSearchUtils'
    });
