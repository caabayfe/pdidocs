var RequestUtil = Class.create();
RequestUtil.prototype = Object.extendsObject(RequestUtilSNC, {
  initialize: function () {
    RequestUtilSNC.prototype.initialize.apply(this, arguments);
    this.isCachingEnabled = true;
  },

  type: 'RequestUtil'
});
