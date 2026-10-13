var InsertRecordAjax = Class.create();
InsertRecordAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getAITabSysId:function(){ 
		var alertSysId = this.getParameter('sysparm_alert_id'); 
		var gr=new GlideRecordSecure('em_alert_insight_container');
		gr.addQuery('alert_sys_id',alertSysId);
		gr.query(); 
		if(gr.next()){
			return gr.sys_id; 
		}else{ 
			gr.initialize(); 
			gr.alert_sys_id=alertSysId;
			return gr.insert();
		} 
	} 
});
