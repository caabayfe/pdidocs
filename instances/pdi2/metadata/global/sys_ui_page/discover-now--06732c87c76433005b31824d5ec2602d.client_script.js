function startDiscoverNow() {
    if ($('start_discovery').value == 'true') {
        var ga = new GlideAjax('DiscoveryAjax');
        ga.addParam('sysparm_name', 'discoverNow');
        ga.addParam('sysparm_schedule_sysId', $('schedule_sys_id').value);
        ga.getXML(redirectToStatus);
    } else {
		var message = $('error_message').value || $('warn_message').value;
		notifyError(message);

		if (isWorkspace != 'true') {
			GlideDialogWindow.get().destroy();
			reloadWindow(window);
		}
    }
}

function redirectToStatus(response) {
    var sys_id = response.responseXML.documentElement.getAttribute('answer');
    var auto_refresh_sub_accounts_and_ldcs = response.responseXML.documentElement.getAttribute('auto_refresh_sub_accounts_and_ldcs');
	var isCloudDiscovery = response.responseXML.documentElement.getAttribute('isCloudDiscovery');
    if (sys_id) {
        notifySuccess(sys_id);
    } else if (auto_refresh_sub_accounts_and_ldcs && auto_refresh_sub_accounts_and_ldcs == 'true' && isCloudDiscovery) {
        notificationMessage(getMessage('Discovery Status will be refreshed in few seconds'), 'info');
        setTimeout(function() {
            self.location = 'discovery_status_list.do';
        }, '5000');
    } else {
        notifyError(getMessage('Could not redirect to Discovery status.'));
    }

	if (isWorkspace != 'true')
		GlideDialogWindow.get().destroy();
}

function notifySuccess(statusSysId) {
    if (isWorkspace == 'true')
        iframeMsgHelper.confirm({statusSysId: statusSysId});
    else
        self.location = 'discovery_status_list.do?sysparm_query=sys_id=' + statusSysId;
}

function notifyError(errorMessage) {
    if (isWorkspace == 'true')
        iframeMsgHelper.cancel({error: errorMessage});
	else
        notificationMessage(errorMessage);
}

function notificationMessage(msg, type) {
    var options = {};
    options.text = "<b style='color:red;'>" + msg + "</b>";
    if (type && type == 'info')
        options.text = msg;
    options.fadeIn = 0;
    options.fadeOut = 500;
    options.closeDelay = 5000;
    options.sticky = false;
    options.type = type ? type : "warn";

    new NotificationMessage(options);
}

var iframeMsgHelper = (function() {
    function createPayload(action, modalId, data) {
        return {
            messageType: 'IFRAME_MODAL_MESSAGE_TYPE',
            modalAction: action,
            modalId: modalId,
            data: (data ? data : {})
        };
    }

    function pm(window, payload) {
        if (window.parent === window)
            return;
        window.parent.postMessage(payload, location.origin);
    }

    function IFrameMessagingHelper(window) {
        this.window = window;
        this.src = location.href;
        this.messageHandler = this.messageHandler.bind(this);
        this.window.addEventListener('message', this.messageHandler);
		this.queuedPayload = null;
    }

    IFrameMessagingHelper.prototype.messageHandler = function(e) {
        if (e.data.messageType !== 'IFRAME_MODAL_MESSAGE_TYPE' || e.data.modalAction !== 'IFRAME_MODAL_ACTION_INIT')
            return;
        this.modalId = e.data.modalId;

		// If confirm or cancel were called before modalId was initialized, send the queued message now.
		if (this.queuedPayload) {
			// Add missing modalId
			this.queuedPayload.modalId = e.data.modalId;

			pm(this.window, this.queuedPayload);
		}
    };

    IFrameMessagingHelper.prototype.confirm = function(data) {
        var payload = createPayload('IFRAME_MODAL_ACTION_CONFIRMED', this.modalId, data);

		if (!this.modalId)
			this.queuedPayload = payload;
		else
			pm(this.window, payload);
    };

    IFrameMessagingHelper.prototype.cancel = function(data) {
        var payload = createPayload('IFRAME_MODAL_ACTION_CANCELED', this.modalId, data);
        
		if (!this.modalId)
			this.queuedPayload = payload;
		else
			pm(this.window, payload);
    };

    return new IFrameMessagingHelper(window);
}());

startDiscoverNow();
