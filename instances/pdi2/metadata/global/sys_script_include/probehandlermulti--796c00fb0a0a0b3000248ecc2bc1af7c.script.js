// Discovery Probe Handler for MultiProbes

/*
 * Known limitations:
 *   -- will not work with probe parameters that have value_scripts
 *   -- will not work with JavaScript probes (this could be easily added; just haven't done it)
 */
var XMLUtil = GlideXMLUtil;
var Document = Packages.org.w3c.dom.Document;

var ProbeHandlerMulti = Class.create();
ProbeHandlerMulti.prototype = {
    initialize: function(probe) {
        this.probe = probe;
        this.classic_mode = false;
    },

    run: function() {
        var doc = XMLUtil.newDocument('probes');
        var root = doc.getDocumentElement();
        this.addProbes(root, this.probe.getId());
        this.addParameters(root, this.probe.getId());

        this.probe.setTopic('MultiProbe');
        this.probe.setMultiProbe(true);
        this.probe.setMultiProbeDoc(doc);
    },

    /*
     * Add the probes for this multiprobe to the document.
     *
     * parent: the XML parent element to add probes to
     * sys_id: the sys_id of the multi probe
     */
    addProbes: function(parent, sys_id) {
        // iterate through the multi probe entries for this multi probe...
        var multi_probe_gr = new GlideRecord('discovery_probes_multi_probe');
        multi_probe_gr.addQuery('probe', sys_id);
        multi_probe_gr.orderBy('order');
        multi_probe_gr.addActiveQuery();
        multi_probe_gr.query();
        var probeCache = new SNC.ProbeCache();

        while (multi_probe_gr.next()) {
            // add this sub-probe to our document...
            var probe_element = XMLUtil.newElement(parent, 'probe');

            // get the sub-probe record...
            var sub_id = '' + multi_probe_gr.getValue('child');      
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted(multi_probe_gr.child.sys_class_name + '', sub_id, 'ecc_queue');
            if (result) {
                var sub_probe_gr = probeCache.getBySysId(sub_id);

                // populate the sub-probe element...
                probe_element.setAttribute('topic', sub_probe_gr.getValue('ecc_queue_topic'));
                probe_element.setAttribute('name', sub_probe_gr.getValue('ecc_queue_name'));
                probe_element.setAttribute('order', multi_probe_gr.getValue('order'));
                probe_element.setAttribute('id', multi_probe_gr.getValue('child'));

                // populate the parameters...
                this.addParameters(probe_element, sub_id, sub_probe_gr);
            }
        }
    },

    /*
     * Add the probe parameters to the given XML parent element, taken from the given probe's parameter table.
     *
     * parent: the XML parent element to add parameters to
     * sys_id: the sys_id of the probe to get parameters from
     * probe_gr: optional GlideRecord of a probe; if present and there is a probe handler, it is called
     */
    addParameters: function(parent, sys_id, probe_gr) {
        var params = XMLUtil.newElement(parent, 'parameters');
        this.runProbeHandler(params, sys_id, probe_gr);
        var gr = new GlideRecord('discovery_probe_parameter');
        gr.addQuery('probe', sys_id);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted('discovery_probe_parameter', gr.getUniqueValue(), 'ecc_queue');
            if (result) {
                var name = '' + gr.getValue('name');
                var value = '' + gr.getValue('value');
                var script = '' + gr.getValue('value_script');

                if (value == "null") {
                    // only evaluate the value_script if the value is null
                    if (script != "null")
                        value = GlideController.evaluateString(script);
                    else
                        continue;
                }
                this.setParameter(params, name, value);
            }
        }

        // check the probe's execute_script_remotely field since there is no record for this parameter
        if (JSUtil.getBooleanValue(probe_gr, 'execute_script_remotely'))
            this.setParameter(params, "executeRemote", "true");

        // check the probe's copy_script_to_target field since there is no record for this parameter
        if (JSUtil.getBooleanValue(probe_gr, 'copy_script_to_target'))
            this.setParameter(params, "copy_script_to_target", "true");

        // add the post processor script to parameters if needed...
        this.addPostProcessorScript(params, probe_gr);
    },

    /*
     * Add the post processor script to the parameters in the XML element.
     * Normally these parameters will be skipped unless mid probe cache is disabled.
     *
     * params: the XML element for parameters
     * probe_gr: the GlideRecord of the subprobe
     */
    addPostProcessorScript: function(params, probe_gr) {
        if (SncDiscoveryCodeSigningUtil.isCodeSigningEnabled() || gs.getProperty('glide.discovery.disable_mid_probe_cache', 'false') == 'true') {
            // disable the MID probe cache
            this.setParameter(params, 'disable_mid_probe_cache', 'true');

            // Add the post-processing probe parameter
            // If probe_gr, then it is sub_probe, otherwise it is parent
            // Note this is dependant on addProbes running before addParameter
            if (probe_gr) {
                var cm = JSUtil.getBooleanValue(probe_gr, 'classic_mode');
                if (cm) {
                    this.setParameter(params, 'classic_mode', cm);
                    this.classic_mode = cm;
                }

                // Always pass the 3P script
                this.setParameter(params, 'post_processor_script', probe_gr.getValue('post_processor_script'));
            } else if (this.classic_mode) {
                this.setParameter(params, 'parent_classic_mode', this.classic_mode);
            }
        }
    },

    /*
     * If the given probe glide record is present and contains a probe handler, that probe hander is run and any parameters it creates
     * are added to the given parameter element.
     *
     * params: the XML params element to add parameters to
     * sys_id: the sys_id of the probe to get parameters from
     * probe_gr: optional GlideRecord of a probe; if present and there is a probe handler, it is called
     */
    runProbeHandler: function(params, sys_id, probe_gr) {
        // figure out whether we have a handler, and what it's name is...
        if (!probe_gr)
            return;

        var klass = probe_gr.getRecordClassName();
        var td = GlideTableDescriptor.get(klass);
        if (td == null || td.getED() == null)
            return;

        var handlerName = td.getED().getAttribute('probeHandler');
        if (gs.nil(handlerName))
            return;

        // now invoke our handler to get the parameters it creates...
        var probe = new SncProbe(probe_gr);
        var script = 'new ' + handlerName + '(probe);';
        var handler = eval(script);
        var sub_params = handler.getParameters();

        // and finally, lets add those parameters to our document...
        for (var name in sub_params) {
            var value = sub_params[name];
            this.setParameter(params, name, value);
        }
    },

    setParameter: function(parent, name, value) {
        var param_element = XMLUtil.newElement(parent, 'parameter');
        param_element.setAttribute('name', name);
        param_element.setAttribute('value', value);
    },

    type: 'ProbeHandlerMulti'
}
