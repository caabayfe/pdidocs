(function(context){
    /*
        context = {
            'block_id': @sysId,
            'name': @String,
            'title': @String,
            'subtitle': @String,
            'order': @Number,
            'type': @Object,
            'children': @Array[context],
            'props_details': @Object
        };
    */

    context.props_details.plugin_details = {
        'com.glide.cs.custom.adapter': {
            name: 'Glide Virtual Agent',
            version: '1.0.0',
            hasDemoData: true,
			type: 'plugin'
        },
        'com.glide.interaction.awa': {
            name: 'Agent Chat',
            version: '1.0.0',
            hasDemoData: true,
			type: 'plugin'
        },
        'com.sn_openframe' : {
            name: 'Openframe',
            version: '1.0.0',
            hasDemoData: true,
			type: 'plugin'
        },
		'62c44c6353311010ad77ddeeff7b120c': {
			name: 'Virtual Agent API',
			app_scope: 'sn_va_as_service'
		},
        '9acfc72f535230103c2cddeeff7b12f1': {
			name: 'Conversational IVR with Amazon Connect',
			app_scope: 'sn_va_amz_connect'
		}
    };
	context.props_details.configure_demo_data=true;
    context.props_details.variant="secondary";
	context.props_details.size ="sm";
})(context);
