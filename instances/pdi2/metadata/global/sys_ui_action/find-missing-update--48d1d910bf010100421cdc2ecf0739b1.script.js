function showSourceFieldUpdate() {
	var id = typeof g_sysId != 'undefined' && g_sysId != null ? g_sysId : null;
	id = id == null && typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : id;
	
	var client = new ShowSourceFieldUpdateClient();
	client.show(id);
}

var ShowSourceFieldUpdateClient = Class.create();
ShowSourceFieldUpdateClient.prototype = {
	initialize: function() {
		this.ajax = new GlideAjax('com.glide.update.preview.problem.PreviewProblemAjaxProcessor');
		this.ajax.addParam('sysparm_function', 'getSourceFieldUpdateUrl');
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
	
	type: 'ShowSourceFieldUpdateClient'
}
