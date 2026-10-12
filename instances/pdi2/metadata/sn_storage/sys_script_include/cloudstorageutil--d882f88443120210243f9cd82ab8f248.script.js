var CloudStorageUtil = Class.create();
CloudStorageUtil.prototype = {
    initialize: function() {
    },

	convertToTeraByte: function(bytes) {
        const teraBytes = Math.pow(1024, 4);
        const tb = (+bytes / teraBytes);
        return Math.round((tb + Number.EPSILON) * 100) / 100;
    },

    type: 'CloudStorageUtil'
};
