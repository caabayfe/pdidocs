function loadMoreQBResults() {
	var query = g_list.getQuery();
	var queryIndex = -1;
	query = query.split("=");
	for (var i = 0; i < query.length; i++) {
		if (query[i] === 'query' && query[i + 1]) {
			queryIndex = i + 1;
			break;
		}
	}
	if(queryIndex < 0){
		g_GlideUI.addOutputMessage({
			'msg': getMessage('Error Loading more. Please set the filter with the query Id that you want to use to load more.'),
			'type': 'error'
		});
		return;
	}
	
	var loadMoreAPI = 'api/now/cmdbquerybuilder/queries/bg/' + query[queryIndex] + '/execute';
	var queryStatusAPI = 'api/now/cmdbquerybuilder/queries/bg/status/';
	var cancelProgressWorkerAPI = 'api/now/cmdbquerybuilder/queries/bg/cancel/';
	var statusCheckInterval = null; //holds polling function interval object
	var intervalThreshold = 5;
	var loadingModalId = 'loadingMore_title';
	var loadingModalTitle = getMessage('Running Query');
	var cancelButtonId = 'cancel_load_more_job';
	var cancelButtonTitle = getMessage('Cancel job');
	var isParallelFailure = false;
	
	//clears the interval & destroy the loading window
	var onDone = function (){
		if (statusCheckInterval !== null) {
			clearInterval(statusCheckInterval);
		}
		jQuery('#'+loadingModalId).hide();
	};
	
	//`load more`execution is complete now refresh the list
	var refreshList = function() {
		g_list.refresh();
		onDone();
	};
	
	//execute whenever things fails
	var executionFailed = function() {
		onDone();
		if (isParallelFailure) {
			var errMsg = getMessage('Error Loading more');
			errMsg += ': ';
			errMsg += getMessage('One of your queries is still running. You must cancel the query that is running or wait for it to complete, before running this query.');
			g_GlideUI.addOutputMessage({
				'msg': errMsg,
				'type': 'error'
			});
		} else {
			g_GlideUI.addOutputMessage({
				'msg': getMessage('Error Loading more. Please set the filter with the query Id that you want to use to load more.'),
				'type': 'error'
			});
		}
	};

	var ga = new GlideAjax('QBBGThreadUtil');
	//popup loading window
	ga.addParam('sysparm_name', 'getLoadingHTML');
	ga.addParam('modal_id', loadingModalId);
	ga.addParam('modal_title', loadingModalTitle);
	ga.addParam('cancel_id', cancelButtonId);
	ga.addParam('cancel_label', cancelButtonTitle);
	ga.getXML(function (serverResponse){
		disableCancelBtn(cancelButtonId, false);
		//display loading modal
		var loadingHtml = serverResponse.responseXML.documentElement.getAttribute("answer");
		jQuery('.outputmsg_container').after(loadingHtml);
		
		//get polling threshold value from sys_property & then start the execution
		ga.addParam('sysparm_name', 'getPollingInterval');
		ga.getXML(function (serverResponse){

			var result = serverResponse.responseXML.documentElement.getAttribute("answer");
			if (result) {
				result = result * 1; //string to int
				intervalThreshold = result;
			}
			var workerId = 0, queryId = query[queryIndex];

			//initiate `load more` query execution
			jQuery.ajax(loadMoreAPI, {
				method: "GET",
				headers: {
					'X-UserToken': g_ck,
				}
			})
			.done(function (response) {
				isParallelFailure = false;
				if (response.result && response.result.status === 'READY') {
					workerId = response.result.worker_id;
				} else {
					isParallelFailure = (response.result.worker_id === '-1');
					executionFailed();
					return;
				}

				if (isExecutionComplete(response, executionFailed)) { //if query finised execution display more results
					refreshList();
				} else if (isExecutionFailed(response, executionFailed)) { //if query fails to execute(time-out/failed/max_limit) display error message
					executionFailed();
				} else {
					//execute `load more` query status polling function on every 5 seconds
					statusCheckInterval = setInterval(function () {
						doStatusPoll(refreshList, executionFailed);
					}, (intervalThreshold * 1000));
				}
			})
			.fail(function (jqXHR, textStatus, error) {
				executionFailed();
			});
			showCancelBtn(cancelButtonId);

			//`load more` query execution status check function
			var doStatusPoll = function(fnRefreshList, fnExecutionFailed){
				if (workerId == 0) return;
				jQuery.ajax(queryStatusAPI+workerId+'/'+queryId, {
					method: "GET",
					headers: {
						'X-UserToken': g_ck,
					}
				})
				.done(function (response) {
					if (isExecutionComplete(response, fnExecutionFailed)) {
						fnRefreshList();
					} else if (isExecutionFailed(response, fnExecutionFailed)) {
						fnExecutionFailed();
					}
				})
				.fail(function (jqXHR, textStatus, error) {
					fnExecutionFailed();
				});
			};

			//cancel progress worker
			jQuery('body').on('click', '#'+cancelButtonId, function(){
				if (workerId == 0) return;
				disableCancelBtn(cancelButtonId, true);
				jQuery.ajax(cancelProgressWorkerAPI+workerId+'/'+queryId, {
					method: "PUT",
					headers: {
						'X-UserToken': g_ck,
						'Content-Type': 'application/json; charset=UTF-8'
					}
				}).done(function (response) {
					if (isExecutionComplete(response, executionFailed)) {
						refreshList();
					} else if (isExecutionFailed(response, executionFailed)) {
						executionFailed();
					} else {
						onDone();
					}
				}).fail(function (jqXHR, textStatus, error) {
					executionFailed();
				});
			});
		});
	});
}

// returns true if execution state is completed
function isExecutionComplete(response, errCallback){
	if (response && response.result) {
		var state = response.result;
		return state === 'COMPLETE'|| state === 'MAX_LIMIT';
	}	
	errCallback();
}

// returns true if execution state is failed
function isExecutionFailed(response, errCallback) {
	if (response && response.result) {
		var state = response.result;
		return state === 'FAILED' || state === 'TIME_OUT';
	} 
	errCallback();
}

function disableCancelBtn(btnId, isDisable){
	jQuery('#'+btnId).prop('disabled', isDisable);
}

function showCancelBtn(btnId){
	var timeout = (15 * 1000);
	var timer = setTimeout(function(){
		jQuery('#'+btnId).css('display', 'inline');
		clearTimeout(timer);
	}, timeout);
}
