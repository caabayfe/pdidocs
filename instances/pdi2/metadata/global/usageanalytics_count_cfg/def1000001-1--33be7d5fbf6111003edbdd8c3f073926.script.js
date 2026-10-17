answer = getCustomApplications();

/*
* Count the number of records in sys_app
* Then include the sys_store_app records that have same vendor prefix as those were developed custom apps that were shared to other instances via Make App Available
*/
function getCustomApplications() {
    var customApps = -1;
	var prefix = 'x_';
	var prefixSeperator = '_';

	if (!GlideTableDescriptor.isValid('sys_app') )
		return customApps;
	var gr = new GlideAggregate('sys_app');
	gr.addAggregate('COUNT');
	gr.query();

	if (gr.next())
		customApps = parseInt(gr.getAggregate('COUNT'));

	var customAppsShared = 0;
	if (!GlideTableDescriptor.isValid('sys_store_app') )
		return customApps;

	var companyCode = gs.getProperty('glide.appcreator.company.code');
	if (GlideStringUtil.nil(companyCode))
		return customApps;

	var vendorPrefix = prefix + companyCode + prefixSeperator;
	gr = new GlideAggregate('sys_store_app');
	gr.addQuery('scope', 'STARTSWITH', vendorPrefix);
	gr.addNullQuery('vendor').addOrCondition('vendor', '!=', 'ServiceNow');
	gr.addAggregate('COUNT');
	gr.query();

	if (gr.next())
		customAppsShared = parseInt(gr.getAggregate('COUNT'));
	customApps = customApps + customAppsShared;

	var vendorCustomApps = 0;

	gr = new GlideAggregate('sys_app');
	gr.addQuery('scope', 'STARTSWITH', prefix);
	gr.addQuery('scope', 'NOT MATCHES', vendorPrefix + '%');
	gr.addAggregate('COUNT');
	gr.query();

	if (gr.next())
		vendorCustomApps = parseInt(gr.getAggregate('COUNT'));

	customApps = customApps - vendorCustomApps;

    return customApps ;
}
