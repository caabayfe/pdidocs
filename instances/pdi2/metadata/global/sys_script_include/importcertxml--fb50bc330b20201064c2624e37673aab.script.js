var ImportCertXML = Class.create();
ImportCertXML.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	fireEvent: function() {
		if(gs.hasRole('sn_kmf.cryptographic_auditor') || gs.hasRole('sn_kmf.cryptographic_manager') || gs.hasRole('sn_kmf.admin') || gs.hasRole('admin'))
			gs.eventQueue('instance.key.registry', current, 'Certificate XML Imported');
	},
    type: 'ImportCertXML'
});
