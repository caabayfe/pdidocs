var OAuthGoogleSheetExport = Class.create();
OAuthGoogleSheetExport.prototype = Object.extendsObject(OAuthUtil, {

    preprocessAuthCode: function(requestParamMap) {
        requestParamMap.put('access_type', 'offline');
        requestParamMap.put('prompt', 'consent');
    },

    type: 'OAuthGoogleSheetExport'
});
