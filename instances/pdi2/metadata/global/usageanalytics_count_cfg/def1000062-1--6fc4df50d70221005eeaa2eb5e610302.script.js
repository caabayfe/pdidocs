answer = getStoreApplications();

/*
* Count the number of records in sys_store_app
* Then exclude the sys_store_app records that have same vendor prefix as those were developed custom apps that were shared to other instances via Make App Available
*/
function getStoreApplications() {
    var storeApps = -1;
	var prefix = 'x_';
	var prefixSeperator = '_';

	if (!GlideTableDescriptor.isValid('sys_store_app') )
		return storeApps;

	//count total records in sys_store_app
	var gr = new GlideAggregate('sys_store_app');
	gr.addAggregate('COUNT');
	gr.query();

	if (gr.next())
		storeApps = parseInt(gr.getAggregate('COUNT'));

	//Get all service now apps - check the scope as well as the vendor
	var snApps = 0;
	gr = new GlideAggregate('sys_store_app');
	gr.addQuery('scope', 'STARTSWITH', 'sn_').addOrCondition('scope', 'STARTSWITH', 'x_snc_').addOrCondition('vendor', 'ServiceNow');
	gr.addAggregate('COUNT');
	gr.query();
	if (gr.next())
		snApps = parseInt(gr.getAggregate('COUNT'));

	storeApps = storeApps - snApps;

	var companyCode = gs.getProperty('glide.appcreator.company.code');
	if (GlideStringUtil.nil(companyCode))
		return storeApps;

	var customAppsShared = 0;
	var vendorPrefix = prefix + companyCode + prefixSeperator;
	gr = new GlideAggregate('sys_store_app');
	gr.addQuery('scope', 'STARTSWITH', vendorPrefix);
	gr.addAggregate('COUNT');
	gr.query();

	if (gr.next())
		customAppsShared = parseInt(gr.getAggregate('COUNT'));
	storeApps = storeApps - customAppsShared;

    return storeApps;
}
