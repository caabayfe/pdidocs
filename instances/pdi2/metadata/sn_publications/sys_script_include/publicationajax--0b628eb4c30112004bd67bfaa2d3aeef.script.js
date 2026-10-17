var PublicationAjax = Class.create();
PublicationAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	getNotificationId: function(){
		var gr = new GlideRecord('sn_publications_publication');
		if(gr.canRead() && gr.get(this.getParameter('sysparm_pub_id'))){
			return gr.getValue('notification');
		}
	},
	
    type: 'PublicationAjax'
});
