(function(context) {
    var status = sn_lef.GlideEntitlement.hasLicenseForApp('com.glide.awa') ? gs.getMessage('Included') : gs.getMessage('Excluded');
    var items = [{
            label: gs.getMessage('Licensing'),
            value: {
                type: 'highlighted-value',
                label: status,
                status: 'positive'
            }
        },
        {
            label: gs.getMessage('Status'),
            value: {
                type: 'highlighted-value',
                label: gs.getMessage('Not installed'),
                status: 'warning'
            }
        },
        {
            label: gs.getMessage('Business impact'),
            value: {
                type: 'highlighted-value',
                label: gs.getMessage('High'),
                status: 'high'
            }
        },
        {
            label: gs.getMessage('Estimated setup'),
            value: {
                type: 'highlighted-value',
                label: gs.getMessage('45-60 min'),
                status: 'info'
            }
        }
    ];
	context.props_details.items = items;
})(context);
