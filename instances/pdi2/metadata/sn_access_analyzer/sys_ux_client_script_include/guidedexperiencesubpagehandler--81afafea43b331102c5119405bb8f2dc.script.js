/**
 * Access Simulator Guided Experience Handler
 */
function include({ imports }, api, helpers) {

    let eventHandlers = {};

    const SubPageEvent = {
        PAGE_READY: "PAGE_READY",
        PAGE_CLOSE_REQUEST: "PAGE_CLOSE_REQUEST",
        PAGE_CLOSE_RESPONSE: "PAGE_CLOSE_RESPONSE",
        VALIDATE: "VALIDATE",
        BUTTON_CLICKED: "BUTTON_CLICKED",
        ADD_NOTIFICATIONS: "ADD_NOTIFICATIONS"
    };


    const UPDATE_CONF = "UPDATE_CONF";
    const MACROPONENT_READY = "MACROPONENT_READY";
    const MACROPONENT_PROPERTY_CHANGED = "MACROPONENT_PROPERTY_CHANGED";
    const ACCESS_SIMULATOR_EVENT = "ACCESS_SIMULATOR_EVENT";
    const STORE_DATA = "STORE_DATA";
    
    /**
     * Default page close handler, it can be overridden on script files.
     */
    eventHandlers[SubPageEvent.PAGE_CLOSE_REQUEST] = (request) => close(request);

    function sendMessage(eventName, eventPayload) {
        api.emit(ACCESS_SIMULATOR_EVENT, {
            name: eventName,
            payload: eventPayload
        });
    }

    function close(request) {
        sendMessage(SubPageEvent.PAGE_CLOSE_RESPONSE, request);
    }

    function updateConf(params) {
        sendMessage(UPDATE_CONF, params);
    }

    function onReceive(eventName, callback) {
        eventHandlers[eventName] = callback;
    }

    function addNotifications(items) {
        sendMessage(SubPageEvent.ADD_NOTIFICATIONS, items);
    }

    function enableButtons(...buttonNames) {
        _updateButtonBehaviour(buttonNames, "enabled", true);
    }

    function disableButtons(...buttonNames) {
        _updateButtonBehaviour(buttonNames, "enabled", false);
    }

    function visibleButtons(...buttonNames) {
        _updateButtonBehaviour(buttonNames, "visible", true);
    }

    function hideButtons(...buttonNames) {
        _updateButtonBehaviour(buttonNames, "visible", false);
    }

    function _updateButtonBehaviour(buttonNames, key, flag) {
        let conf = {};
        buttonNames.forEach(name => conf[`buttons[@name=${name}].${key}`] = flag);
        updateConf(conf);
    }

    function showLoader(message = null) {
    	sendMessage("SHOW_LOADER", message);
    }
    
    function hideLoader() {
    	sendMessage("HIDE_LOADER");
    }
    
    function showPageError(header = null, content = null) {
    	sendMessage("SHOW_PAGE_ERROR", {
    		header: header,
    		content: content
    	});
    }
    
    function hidePageError() {
    	sendMessage("HIDE_PAGE_ERROR");    	
    }
    
    function storeData(key, data) {
        sendMessage(STORE_DATA, {
            pageName: api.context.props.name,
            key: key,
            data: data
        });
    }

    function exit() {
        sendMessage("EXIT");
    }

    function emit(handlerName, args) {
        let handler = eventHandlers[handlerName];
        if (handler)
            return handler.apply(null, args);
    }

    function handle(event) {
        switch (event.name) {
            case MACROPONENT_READY:
                let payload = api.context.props.payload.payload;
                let p = api.state.pageParams ? api.state.pageParams : {};
                Object.keys(payload.pageParams || {}).forEach(n => p[n] = payload.pageParams[n]);
                emit(SubPageEvent.PAGE_READY, [payload]);
                break;
            case MACROPONENT_PROPERTY_CHANGED:
                let ev = event.payload.value;
                emit(ev.eventName, [ev.payload]);
                break;
        }
    }

    return {
        SubPageEvent,
        close,
        onReceive,
        sendMessage,
        updateConf,
        getPageData,
        storeData,
        handle,
        enableButtons,
        disableButtons,
        visibleButtons,
        hideButtons,
        addNotifications,
        showLoader,
        hideLoader,
        storeData,
        showPageError,
        hidePageError,
        exit
    }
}
