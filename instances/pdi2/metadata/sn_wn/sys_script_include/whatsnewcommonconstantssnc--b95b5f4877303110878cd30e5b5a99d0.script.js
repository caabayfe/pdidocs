var WhatsNewCommonConstantsSNC = Class.create();
WhatsNewCommonConstantsSNC.prototype = {
    initialize: function() {},
    type: 'WhatsNewCommonConstantsSNC'
};

WhatsNewCommonConstantsSNC.SCOPE = 'sn_wn';
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_OK = 200;
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_CREATED = 201;
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_NO_CONTENT = 204;
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_UNAUTHORIZED = 401;
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_FORBIDDEN = 403;
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_NOT_FOUND = 404;
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_BAD_REQUEST = 400;
WhatsNewCommonConstantsSNC.HTTP_RESPONSE_STATUS_CODE_CONFLICT = 409;
WhatsNewCommonConstantsSNC.RECORD_INSERTED_SUCCESSFULLY = gs.getMessage("Record inserted successfully");
WhatsNewCommonConstantsSNC.RECORD_ALREADY_EXISTS = gs.getMessage("Record already exists");
WhatsNewCommonConstantsSNC.INVALID_REQUEST_PAYLOAD = gs.getMessage("Invalid request payload");

WhatsNewCommonConstantsSNC.TABLE = {
	SN_WN_APP_CONFIG: "sn_wn_app_config",
	SN_WN_CONTENT: "sn_wn_content",
	SN_WN_APP_CONFIG_CONTENT_M2M: "sn_wn_app_config_content_m2m",
	SN_WN_MEDIA: "sn_wn_media",
	SN_WN_CONTENT_MEDIA_M2M: "sn_wn_content_media_m2m",
	SN_WN_USER_APP_ACTIVITY: "sn_wn_user_app_activity",
	SN_WN_USER_CONTENT_ACTIVITY: "sn_wn_user_content_activity",
};

// This mapping must be updated with each release.
WhatsNewCommonConstantsSNC.VERSION_MAPPING = {
	'h': 'h', 'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 
	'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 
	'x': 'x', 'y': 'y', 'z': 'z', 'a': 'za'
};

// Update the version default in each release.
WhatsNewCommonConstantsSNC.DEFAULT_VERSION_CHAR="a";
