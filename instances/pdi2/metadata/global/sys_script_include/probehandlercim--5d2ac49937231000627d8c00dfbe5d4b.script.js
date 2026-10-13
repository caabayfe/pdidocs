// Discovery
/**
 * Called for setup of a CIM Probe.
 * @author roy.laurie
 */
gs.include('PrototypeServer');

var ProbeHandlerCim = Class.create();

ProbeHandlerCim.PARAMETER_STATEMENTS = 'queries';
ProbeHandlerCim.PARAMETER_STATEMENT_NAMES = 'statement_names';
ProbeHandlerCim.PARAMETER_NAMESPACE = 'namespace';
ProbeHandlerCim.PARAMETER_INTEROP_NAMESPACES = 'interop_namespaces';
ProbeHandlerCim.PARAMETER_CIDATA = 'cidata';
ProbeHandlerCim.CIDATA_INTEROP_NAMESPACE = 'interopNamespace';
ProbeHandlerCim.STATEMENT_PARAMETER_DELIMITER = ';;';
ProbeHandlerCim.TOPIC = 'CimProbe';

ProbeHandlerCim.prototype = {
    initialize: function(probe) {
        this.probe = probe;
    },
    
    run: function() {
//        this.probe.setTopic(ProbeHandlerCim.TOPIC);
		
		// configure all necessary parameters
        var params = this.getParameters();
        this.setProbeParameters(params);
		
		// override parameters with anything found in discovery_probe_parameters
		this.probe.addParameters(this.probe.getId());
    },
    
    /**
     * Returns a hash map of the parameters added by this probe handler.
     */
    getParameters: function() {
        var result = {};
        result[ProbeHandlerCim.PARAMETER_STATEMENTS] = this.getCimStatements();
		result[ProbeHandlerCim.PARAMETER_STATEMENT_NAMES] = this.getCimStatementNames();
		
        var namespace = this.getNamespace();
        if (namespace !== null)
            result[ProbeHandlerCim.PARAMETER_NAMESPACE] = namespace;
        
		var interopNamespaces = this.getInteropNamespaces();
		if (interopNamespaces !== null)
			result[ProbeHandlerCim.PARAMETER_INTEROP_NAMESPACES] = interopNamespaces;
		
        return result;
    },
    
    setProbeParameters: function(params) {
        for (var name in params)
            this.probe.addParameter(name, params[name]);
    },

    /**
     * Generate a string containing the CIM fields to fetch
     * @return string
     * @throws IllegalStateException If no CIM statements available.
     */
    getCimStatements: function() {
        var existing = this.probe.getParameter(ProbeHandlerCim.PARAMETER_STATEMENTS);
        if (!gs.nil(existing))
            return existing;
          
        var statements = new CimProbe(this.probe.getId()).getStatements();
        var parameter = statements.join(ProbeHandlerCim.STATEMENT_PARAMETER_DELIMITER);
//        if (gs.nil(parameter))
//            throw new IllegalStateException('No CIM statements specified for CIM probe.');
		
        return parameter;
    },
	
    /**
     * Generate a string containing the CIM field names to fetch, in the same order as getCimStatements
     * @return string
     * @throws IllegalStateException If no CIM statements available.
     */
    getCimStatementNames: function() {
        var existing = this.probe.getParameter(ProbeHandlerCim.PARAMETER_STATEMENT_NAMES);
        if (!gs.nil(existing))
            return existing;
          
        var statementNames = new CimProbe(this.probe.getId()).getStatementNames();
        var parameter = statementNames.join(ProbeHandlerCim.STATEMENT_PARAMETER_DELIMITER);
//        if (gs.nil(parameter))
//            throw new IllegalStateException('No CIM statement names specified for CIM probe.');
		
        return parameter;
    },
    
    /**
     * @return string|null
     */
    getNamespace: function() {
        var namespace = this.probe.getParameter(ProbeHandlerCim.PARAMETER_NAMESPACE);
        if (!gs.nil(namespace))
            return namespace;
        
        namespace = this.getCiDataInteropNamespace();
        return namespace;
    },
	
	getCiDataInteropNamespace: function() {
		var cidata = new CIData();
        cidata.fromXML(this.probe.getParameter(ProbeHandlerCim.PARAMETER_CIDATA));
        cidata = cidata.getData();
        var namespace = cidata[ProbeHandlerCim.CIDATA_INTEROP_NAMESPACE];
        return ( gs.nil(namespace) ? null : namespace );
	},
	
	getInteropNamespaces: function() {
		var namespaces = this.probe.getParameter(ProbeHandlerCim.PARAMETER_INTEROP_NAMESPACES);
        if (gs.nil(namespaces))
			namespaces = gs.getProperty('mid.cim.interop.namespaces');
		if (gs.nil(namespaces))
			return null;
		
        return namespaces;
	},

    type: 'ProbeHandlerCim'
};
