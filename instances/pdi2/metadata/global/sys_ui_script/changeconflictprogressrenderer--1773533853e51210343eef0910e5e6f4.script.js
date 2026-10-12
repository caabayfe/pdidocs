var ChangeConflictProgressRenderer = function() {
	ChangeConflictProgressRenderer.prototype.initialize.apply(this, arguments);
};

ChangeConflictProgressRenderer.prototype = {
	TIMEOUT_INTERVAL : 1000, // ms
	translator : nowapi.g_i18n,

	hideDurationMsg : false, //if true, the time it takes to complete will not be shown.
	
	id : "",
	progressTitle : "",

	executionStartHandler : null, // callback function to handle execution start event
	executionCompleteHandler : null, // callback function to handle execution complete event
		
	initialize : function() {
		var container = nowapi.g_document.getElement("#container");
		this._setContainerStyles(container);
	},
	
	start : function(glideAjax) {
		if (this.id) {
			this.getStatus();
			return;
		}
		var processor = glideAjax ? glideAjax.getProcessor() : null;		
		nowapi.log("ChangeConflictProgressRenderer::start: ajax processor = " + processor);
		glideAjax.getXML(this.handleStart.bind(this));
	},
	
	handleStart : function(response) {
		if (this.executionStartHandler) 
			this.executionStartHandler(response);
		this.id = response.responseXML.documentElement.getAttribute("answer");
		nowapi.log("ChangeConflictProgressRenderer::handleStart: id = " + this.id);
		this.updatePositionMessage();
		this.getStatus();
	},
	
	checkStatus : function(id) {
		nowapi.log("ChangeConflictProgressRenderer::checkStatus for id = " + id);
		this.id = id;
		this.getStatus();
    },
	
	getStatus : function() {
		var ga = new nowapi.GlideAjax('ChangeConflictWorkerAJAXProcessor');
		ga.addParam('sysparm_name', 'getStatus');
		ga.addParam('sysparm_worker_id', this.id);
		nowapi.log("ChangeConflictProgressRenderer::getStatus for id = " + this.id);
		
		if (this.id == "")
			return;
		if (typeof this.id != "string") {
			nowapi.log("ChangeConflictProgressRenderer::getStatus typeof this.id  = " + typeof this.id);
			return;
		}
		ga.getXML(this.handleGetStatus.bind(this));
		var self = this;
		ga.errorCallbackFunction = function () {
			setTimeout(self.getStatus.bind(self), self.TIMEOUT_INTERVAL);
		};
	},
	
	handleGetStatus : function(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		eval("var so = " + answer);
		this.renderStatus(so);
		if (this.renderStatusHandler)
			this.renderStatusHandler(so);
		// Fetch the container again from the DOM. if null window is closed
		// and we should stop looping here in the UI regardless of execution
		// completion
		var container = nowapi.g_document.getElement("#container");
		if (!container)
			return;
		
		if (so.state == "1" || so.state == "2")
			setTimeout(this.getStatus.bind(this), this.TIMEOUT_INTERVAL);
		else if (this.executionCompleteHandler) {
			// give it third a second delay before transiting to the next view
			// so that users have chance to notice the completed progress bar
			setTimeout(this.executionCompleteHandler.bind(this, so), 300);
		}
	},
	
	renderStatus : function(so) {
		if (!so)
			return;
		var container = nowapi.g_document.getElement("#container");
		if (!container)
			return;
		var newContainer = nowapi.g_document.createElement("div");

		newContainer.paddingLeft ='5px';
		newContainer.paddingRight = '5px';
		newContainer.paddingBottom = '5px';
		newContainer.paddingTop = '10px';
		this._setContainerStyles(newContainer);
		var hasContent = this.renderProgress(so, newContainer);
		// don't inject body if it doesn't have content
		if (hasContent) {
			var scrollTop = container.scrollTop;
			var scrollLeft = container.scrollLeft;
			container.outerHTML = newContainer.outerHTML;
			container = newContainer;
			container.scrollTop = scrollTop;
			container.scrollLeft = scrollLeft;
		}
	},
	
	renderProgress : function(obj, parentElement) {
		var name = obj.name;
		var state = obj.state;
		var duration = obj.duration;
		var percent = 0;
		if (obj.percent_complete)
			percent = parseInt(obj.percent_complete);

		var rootContainer = nowapi.g_document.createElement("div");

		if (parentElement)
			parentElement.appendChild(rootContainer);

		var tableEl = nowapi.g_document.createElement('table');
		tableEl.style.cellspacing = 0;
		tableEl.style.width = '100%';

		var tableCol1 = nowapi.g_document.createElement('td');
		tableCol1.style.textAlign = 'left';

		var table = rootContainer.appendChild(tableEl);
		var row = table.appendChild(nowapi.g_document.createElement("tbody")).appendChild(nowapi.g_document.createElement("tr"));
		var col1 = row.appendChild(tableCol1);
		col1.appendChild(this._getItemTitleElement(name));

		var progressLabel = "";
		if (this.progressTitle !== "" && percent > 0)
			progressLabel = this.translator.format("{0} is {1}% complete", this.progressTitle, percent);

		if (progressLabel !== "") {
			var col2El = nowapi.g_document.createElement('td');
			col2El.style.textAlign = 'right';

			var col2 = row.appendChild(col2El);
			col2.appendChild(this._getMessageContainer(progressLabel));
		}

		var deepestRunningChild = this._findDeepestRunningChild(obj);
		// first check if we have detail message
		var message = deepestRunningChild ? deepestRunningChild.detail_message : "";

		if (message) {
			var pos = message.indexOf(':');
			if (pos > -1) // cut off any prefixes
				message = message.substring(pos + 1);
		}

		var progAndMsgContainer = this._getProgressAndMessageContainer(state, percent, duration, message);
		if (progAndMsgContainer)
			rootContainer.appendChild(progAndMsgContainer);

		return progAndMsgContainer !== null;
	},

	_findDeepestRunningChild : function (obj) {
		for ( var i = 0; i < obj.children.length; i++) {
			if (obj.children[i].state == "2") // in-progress
				return this._findDeepestRunningChild(obj.children[i]);
		}
		return obj;
	},

	_getProgressAndMessageContainer : function(state, percent, duration, detailMessage) {
		if ( isNaN(percent) )
			percent = 0;
			
		var progAndMsgParentCnt = nowapi.g_document.createElement('div');
		var progAndMsgCnt = nowapi.g_document.createElement('div');

		progAndMsgParentCnt.appendChild(progAndMsgCnt);
		// Progress Bar
		progAndMsgCnt.appendChild(this._getProgressBar(state, percent));
		
		// Details Message
		if (detailMessage && detailMessage !== "") {
			var dtlMsgCnt = nowapi.g_document.createElement('div');
			dtlMsgCnt.style.textAlign = 'right';
			dtlMsgCnt.appendChild(this._getMessageContainer(detailMessage));
			progAndMsgCnt.appendChild(dtlMsgCnt);
		}

		return progAndMsgParentCnt;
	},

	_getMessageContainer : function(message) {
		var newMessage = nowapi.g_document.createElement('span');
		newMessage.style.width = '100%';
		newMessage.innerHTML = message;
		return newMessage;
	},
	
	_getItemTitleElement : function (name) {
		var nameTag = nowapi.g_document.createElement('b');
		nameTag.innerHTML = name;
		var span = nowapi.g_document.createElement('span');
		span.appendChild(nameTag);
		return span;
	},

	_getProgressBar : function (state, percent) {
		percent = Math.max(0, Math.min(100, percent));
		
		var progress = nowapi.g_document.createElement('div');
		progress.className = 'progress';
		
		//Adds the heisenberged progress bar
		var innerProgress = nowapi.g_document.createElement('div');
		innerProgress.className = 'progress-bar';
		innerProgress.style.width = percent + '%';
		innerProgress.setAttribute('id', 'change_conflict_progress_renderer');
		innerProgress.setAttribute('role', 'progressbar');
		innerProgress.setAttribute('aria-valuemin', 0);
		innerProgress.setAttribute('aria-valuenow', percent);
		innerProgress.setAttribute('aria-valuemax', 100);
		// get rid of progress min-width
		innerProgress.style.minWidth = '0px';
		
		
		//Adds percentage for accessibility
		var span = nowapi.g_document.createElement('span');
		span.className = 'sr-only';
		span.innerHTML = percent + '%';

		if (state == "4"){ // error
			progress.className += ' progress-danger';
			innerProgress.className += " progress-bar-danger";
			span.innerHTML = percent + "% (danger)";
		} else if (state == "5") { // cancelled
			progress.className += ' progress-warning';
			innerProgress.className += " progress-bar-warning";
			span.innerHTML = percent + "% (warning)";
		} else { // success
			span.innerHTML = percent + '% (success)';
		}
		
		innerProgress.appendChild(span);
		progress.appendChild(innerProgress);
			
		return progress;
	},

	_getFloatClear : function (which) {
		var br = nowapi.g_document.createElement('br');
		br.style.clear = which;
		return br;
	},
	
	_setContainerStyles : function(container) {
		container.id = "container";
		container.style.overflowY = 'auto';
		container.style.maxHeight = '25em';
		container.style.marginRight = '.25em';
		container.style.marginLeft = '.25em';
	},

	updatePositionMessage : function () {
		var ga = new GlideAjax('ChangeConflictWorkerAJAXProcessor');
		ga.addParam('sysparm_name', 'updatePositionMessage');
		ga.addParam('sysparm_worker_id', this.id);
		jslog("ChangeConflictProgressRenderer::update position message for id = " + this.id);

		if (this.id == "")
			return;
		if (typeof this.id != "string") {
			jslog("ChangeConflictProgressRenderer::update position message typeof this.id  = " + typeof this.id);
			return;
		}
		ga.getXML(this.handleUpdatePositionMessage.bind(this));
	},

	handleUpdatePositionMessage : function(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");

		if (answer === "true")
			setTimeout(this.updatePositionMessage.bind(this), 10000);
	},

	type : 'ChangeConflictProgressRenderer'
}
