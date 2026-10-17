var ContentPopularityUtil = Class.create();
ContentPopularityUtil.prototype = Object.extendsObject(ContentPopularityUtilSNC, {
    initialize: function () {
        ContentPopularityUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ContentPopularityUtil'
});
