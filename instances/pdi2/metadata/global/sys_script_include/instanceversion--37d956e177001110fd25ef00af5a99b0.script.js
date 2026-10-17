var InstanceVersion = Class.create();
InstanceVersion.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getVersion: function(){
		var version = 'unknown';
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', 'com.glide.embedded_help.version');
        gr.query();
        if (gr.next()) {
            version = gr.getValue('value');
        }
        return version;
	}, 
    type: 'InstanceVersion'
});
