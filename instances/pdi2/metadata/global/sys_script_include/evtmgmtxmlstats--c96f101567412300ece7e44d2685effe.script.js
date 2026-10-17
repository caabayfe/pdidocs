var EvtMgmtXmlStats = Class.create();
EvtMgmtXmlStats.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	initialize: function() {
		this.generator  = new EvtMgmtXmlGenerator();
	},

    type: 'EvtMgmtXmlStats',
	
	createXml: function(markupWriter, gr, product) {
		var map = {};
		while(gr.next()) {
			key = gr.metric_name;
			map[key] = {};
			map[key]["category"] = gr.category.getValue();
			map[key]["value"] = gr.value.getValue();
			map[key]["record_time"] = gr.record_time.getValue();					
		}
				
		this.generator.produceXml(map, product, markupWriter);
		
		return "OK";
	}
});
