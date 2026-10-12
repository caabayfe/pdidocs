var VaCallbackPropertyUtil = Class.create();
VaCallbackPropertyUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    setCallbackEnabled: function(value) {
        if (!gs.hasRole('admin')) {
            return false;
        }
        var callbackGR = new GlideRecord("sys_properties");
        callbackGR.addQuery("name", 'com.glide.cs.callback.enabled');
        callbackGR.query();
        if (callbackGR.next()) {
            callbackGR.setValue('value', value);
            callbackGR.update();
        }
    },

    isCallbackEnabled: function() {
        return gs.getProperty('com.glide.cs.callback.enabled', "false");
    },

    type: 'VaCallbackPropertyUtil'
});
