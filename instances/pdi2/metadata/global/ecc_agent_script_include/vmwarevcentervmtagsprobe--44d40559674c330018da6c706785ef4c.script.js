var VMWarevCenterVMTagsProbe = Class.create();

(function() {

//////////////////////////////////////////////////////////////////////////
VMWarevCenterVMTagsProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {

		var	vmMorIds = '' + probe.getParameter('mor_ids');

		// Call for discovering the tags information
		var output = this.getTagsForResources(vmMorIds);

		// If any error received
		if (output.error) {
			this.setError(output.error);
			return;
		}

		this.output = JSON.stringify(output, function(key, value) { if (key != "mo") return value; });
	},

	type : 'VMWarevCenterVMTagsProbe'
});

})();
