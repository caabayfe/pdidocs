var AJAXClothoConnectionTest = Class.create();
AJAXClothoConnectionTest.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	start: function (){
		var configId = this.getParameter("sysparm_ajax_processor_config_id");
		var worker = new sn_clotho.ClothoConnectionTestWorker(configId);
		worker.start();
		return worker.getProgressID();
	},
	
    type: 'AJAXClothoConnectionTest'
});
