var CredentiallessDiscoveryAjax = Class.create();

CredentiallessDiscoveryAjax.prototype = Object.extendsObject(AbstractAjaxProcessor,{
	
	ajaxFunction_installNmap: function(){		
		var nmap_url = this._getNmapInstallerUrl();
		if (!nmap_url) 
			return gs.getMessage('error: Unable to install Nmap. The Nmap version is not specified.');
		
		var gr = this._getMidGr();
		if (!gr)
			return gs.getMessage('error: Unable to install Nmap. There is not any MID Server Up and Validated with sys_id = {0}', [this.getParameter('sysparm_agent_sys_id')]) ;
		
		var mid_name = gr.getValue('name');
		
		if (this._isAnotherNmapProcessRunning(mid_name))
			return gs.getMessage('error: Unable to install Nmap. Another Nmap installation/uinstallation is in progress on this MID Server.');
		
		var output_sys_id = new MIDServerManage().installNmap(mid_name, nmap_url, this._getMidProperty('mid.nmap.npcap.version'), this._getMidProperty('mid.nmap.safe.scripts'));
		
		return output_sys_id;
	},
	
	ajaxFunction_uninstallNmap: function(){
		var gr = this._getMidGr();
		if (!gr)
			return gs.getMessage('error: Unable to uninstall Nmap. There is not any MID Server Up and Validated with sys_id = {0}', [this.getParameter('sysparm_agent_sys_id')]);
		
		var mid_name = gr.getValue('name');
		
		if (this._isAnotherNmapProcessRunning(mid_name))
			return gs.getMessage('error: Unable to uninstall Nmap. There is another Nmap installation/uinstallation is in progress on this MID Server.');
		
		var output_sys_id = new MIDServerManage().uninstallNmap(mid_name);
		return output_sys_id;
	},
	
	ajaxFunction_checkNmapActionProgress: function(){
		var gr = new GlideRecord('ecc_queue');
		gr.addQuery('queue', 'input');
		gr.addQuery('response_to', this.getParameter('sysparm_output_sys_id'));
		gr.query();
		
		if (!gr.next() || gr.getValue('state') == 'ready' || gr.getValue('state') == 'processing')
			return 'Processing';
		
		if (gr.getValue('state') == 'error')
			return 'Error: ' + gr.getValue('error_string');
		
		return this._processResult(gr.getValue('payload'));
	},
	
	ajaxFunction_cancelNmapInstallation: function() {
		var gr = new GlideRecord('ecc_queue');
		var sys_id = this.getParameter('sysparm_output_sys_id');
		if (!sys_id || !gr.get('sys_id', sys_id))
			return;
		
		if (gr.getValue('state') != 'processed') {
			gr.setValue('state', 'error');
			gr.setValue('payload', 'Probe time out');
			gr.update();
		}
		
	},
	
	
	/**
 	* Process the result and in the case that there is an error reported by the probe
 	* retrun the error message, otherwise returns processed
 	**/
	_processResult: function(payload){
		var XMLUtil = GlideXMLUtil;
		var g_doc = XMLUtil.parse(payload);
		var parent = g_doc.getDocumentElement();
		var resultElement = XMLUtil.getElementByTagName(parent,'result');
		var it = XMLUtil.childElementIterator(resultElement);
		while (it.hasNext()) {
			var el = it.next();
			if ((el.getTagName() == 'error') && XMLUtil.getText(el)){
				return 'Error: ' + XMLUtil.getText(el);
			}
		}
		
		return 'Processed';
	},
	
	_getMidProperty: function (propertyName){
		var gr = new GlideRecord('ecc_agent_property');
		gr.addQuery('name', propertyName);
		gr.query();
		
		if (gr.next())
			return gr.getValue('value');
		
		return null;
	},
	
	/**
 	* Based on the Nmap version, it returns the url to download the installer
 	**/
	_getNmapInstallerUrl: function(){
		
		var nmap_version = this._getMidProperty('mid.nmap.version');
		if (!nmap_version)
			return null;
		
		var nmap_file_name = 'nmap-setup-' + nmap_version + '-windows.exe';
		var nmap_path = '/glide/distribution/builds/package/thirdparty/nmap'; 
		var nmap_url = new DistDownloadUriFactory(nmap_file_name, nmap_path).getDownloadUris()[0];
		return nmap_url;
	},
	
	_getMidGr: function(){
		var mid_id = this.getParameter('sysparm_agent_sys_id');
		var gr = new GlideRecord ('ecc_agent');
		if (!mid_id || !gr.get('sys_id', mid_id))
			return null;
		
		if (gr.getValue('status') != 'Up' || gr.getValue('validated') != 'true')
			return null; 
		
		return gr; 
		
	},
	
	/**
	 * Verify if another Nmap installation/uninstallation is in progress
	 **/
	_isAnotherNmapProcessRunning: function(mid_name){
		
		var gr = new GlideRecord('ecc_queue');
		gr.addQuery('topic','SystemCommand');
		var qc = gr.addQuery('source', 'installNmap');
		qc.addOrCondition('source', 'uninstallNmap');
		gr.addQuery('agent', 'mid.server.' + mid_name);
		qc = gr.addQuery('state', 'processing');
		qc.addOrCondition('state', 'ready');
		gr.query();
		
		return gr.hasNext();
	},
	
	type: 'CredentiallessDiscoveryAjax'
});
