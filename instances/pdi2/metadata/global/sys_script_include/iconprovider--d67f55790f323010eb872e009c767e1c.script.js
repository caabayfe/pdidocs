var IconProvider = Class.create();
IconProvider.prototype = {
    initialize: function() {
    },
    getFontIcons: function() {
		return 'type=font';
    },
    getImageIcons: function() {
		return 'type=image^iconCONTAINSImageRef';
    },
    type: 'IconProvider'
};
