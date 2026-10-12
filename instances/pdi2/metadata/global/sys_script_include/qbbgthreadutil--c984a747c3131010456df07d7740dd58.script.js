var QBBGThreadUtil = Class.create();
QBBGThreadUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getPollingInterval: function(){
		var _result = this.newItem("result");
		var interval = gs.getProperty('glide.ui.cmdb_qb.bg.polling.interval', 5);
		if (interval <= 0){ //if value is <= 0 then make it 5
			interval = 5;
		}
		_result.setAttribute("interval", interval);
		return interval;
	},
	getLoadingHTML: function(){
		var _result = this.newItem("result");
		var modalId = this.getParameter('modal_id'),
			modalTitle = this.getParameter('modal_title'),
			cancelId = this.getParameter('cancel_id'),
			cancelLabel = this.getParameter('cancel_label');

		var loadingHtml = '<div id="'+modalId+'" tabindex="-1" class="sn-modal-frame modal"'+
			'style="display: block; background-color: rgba(0, 0, 0, 0.4);">'+
			'<div class="modal-dialog modal-sm">'+
				'<div id="run-query-modal-content" class="modal-content">'+
					'<header class="modal-header">'+
						'<h4 id="loadingModal_title" class="modal-title">'+modalTitle+'</h4>'+
					'</header>'+
					'<div class="modal-body">'+
						'<div class="loadingResultsContainer" style="text-align: center;">'+
							'<div>'+
								'<span class="icon icon-loading"></span>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<footer class="modal-footer">'+
						'<button id="'+cancelId+'"'+
							'tab-index="-1"'+
							'data-dismiss="modal"'+
							'class="btn-cancel-transaction btn btn-danger"'+
							'style="display:none;"'+
							'ng-click="cancelProgressWorker()">'+cancelLabel+
						'</button>'+
					'</footer>'+
				'</div>'+
			'</div>'+
		'</div>';

		_result.setAttribute("loadingHtml", loadingHtml);
		return loadingHtml;
	},
    type: 'QBBGThreadUtil'
});
