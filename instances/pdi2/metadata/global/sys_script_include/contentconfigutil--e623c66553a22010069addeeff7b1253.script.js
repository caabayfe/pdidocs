var ContentConfigUtil = Class.create();
ContentConfigUtil.prototype = Object.extendsObject(ContentConfigUtilSNC, {
    initialize: function() {
      ContentConfigUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ContentConfigUtil'
});
