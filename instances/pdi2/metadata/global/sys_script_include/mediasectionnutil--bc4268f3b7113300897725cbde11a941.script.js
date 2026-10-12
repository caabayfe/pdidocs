var MediaSectionnUtil = Class.create();
MediaSectionnUtil.prototype = {
    initialize: function() {
    },

	getImageAttachments: function() {
		return "content_typeSTARTSWITHimage^table_name=sys_sg_media_section";
	},
	
    type: 'MediaSectionnUtil'
};
