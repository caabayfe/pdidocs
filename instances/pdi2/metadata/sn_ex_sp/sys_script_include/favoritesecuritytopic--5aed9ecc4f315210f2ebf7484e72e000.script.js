var FavoriteSecurityTopic = Class.create();
FavoriteSecurityTopic.prototype = Object.extendsObject(FavoriteSecurityTopicSNC, {
    initialize: function() {
      FavoriteSecurityTopicSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'FavoriteSecurityTopic'
});
