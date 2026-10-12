function showSourceReferenceUpdate() {
	var id = typeof g_sysId != 'undefined' && g_sysId != null ? g_sysId : null;
	id = id == null && typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : id;
	
	var client = new ShowSourceReferenceUpdateClient();
	client.show(id);
}

var ShowSourceReferenceUpdateClient = Class.create();
ShowSourceReferenceUpdateClient.prototype = {
	initialize: function() {
		this.ajax = new GlideAjax('com.glide.update.preview.problem.PreviewProblemAjaxProcessor');
		this.ajax.addParam('sysparm_function', 'getSourceReferenceUpdateUrl');
	},
	
	show: function(problemId) {
		this.ajax.addParam('sysparm_sys_id', problemId);
		this.ajax.getXMLAnswer(this._callback.bind(this));
	},
	
	_callback: function(url) {
		if(typeof url == 'undefined' || url == null || url.length == 0)
			return;
		
		window.open(url);
	},
	
	type: 'ShowSourceReferenceUpdateClient'
}
