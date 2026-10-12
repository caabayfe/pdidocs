answer = getVendorCustomApplications();

/*
* Count the number of possible store app records in sys_app
* Then consist of records that have different vendor prefix as those that belongs to the customer
*/
function getVendorCustomApplications() {
    var vendorCustomApps = -1;
	var prefix = 'x_';
	var prefixSeperator = '_';

	if (!GlideTableDescriptor.isValid('sys_app') )
		return vendorCustomApps;

	var companyCode = gs.getProperty('glide.appcreator.company.code');
	if (GlideStringUtil.nil(companyCode))
		return vendorCustomApps;

	var vendorPrefix = prefix + companyCode + prefixSeperator;

	gr = new GlideAggregate('sys_app');
	gr.addQuery('scope', 'STARTSWITH', prefix);
	gr.addQuery('scope', 'NOT MATCHES', vendorPrefix + '%');
	gr.addAggregate('COUNT');
	gr.query();

	if (gr.next())
		vendorCustomApps = parseInt(gr.getAggregate('COUNT'));

    return vendorCustomApps ;
}
