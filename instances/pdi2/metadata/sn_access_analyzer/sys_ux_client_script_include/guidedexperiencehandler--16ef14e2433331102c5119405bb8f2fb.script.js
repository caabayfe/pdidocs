/**
 * 
 * The Guided Experience Component can be used to create multi-step wizard-like experiences for information intake.
 * 
 * Sample Data Model:
 * 
 * {
 *     "buttons": [
 *         {
 *             "action": "reset",
 *             "enabled": true,
 *             "eventName": "ON_START_OVER_BUTTON_CLICKED",
 *             "label": "",
 *             "modalWindowName": "startOverModal",
 *             "name": "startOver",
 *             "position": "top-right",
 *             "showConfirmation": true,
 *             "tooltip": "",
 *             "variant": "secondary",
 *             "visible": true
 *         }
 *     ],
 *     "contentTree": {
 *         "completedIcon": "circle-check-fill",
 *         "defaultIcon": "circle-outline"
 *     },
 *     "modalWindow": [
 *         {
 *             "description": "",
 *             "name": "exitModal",
 *             "primaryButton": {
 *                 "label": "",
 *                 "variant": "negative-primary"
 *             },
 *             "secondaryButton": {
 *                 "label": "Close"
 *             },
 *             "title": "",
 *             "action": "exit"
 *         },
 *         {
 *             "description": "",
 *             "name": "startOverModal",
 *             "primaryButton": {
 *                 "label": "",
 *                 "variant": "primary"
 *             },
 *             "secondaryButton": {
 *                 "label": "Close"
 *             },
 *             "title": "",
 *             "action": "reset"
 *         }
 *     ],
 *     "pageHeader": {
 *         "css": null,
 *         "title": ""
 *     },
 *     "subPages": [
 *         {
 *             "buttonBehaviour": {
 *                 "complete": "disabled",
 *                 "skipAndExit": "visible",
 *                 "startOver": "visible"
 *             },
 *             "data": null,
 *             "getDataFrom": [
 *                 "criteria"
 *             ],
 *             "label": "",
 *             "name": "takeAction",
 *             "route": "simulator-take-action",
 *             "visible": true
 *         }
 *     ]
 * }
 * 
 *
 */

function include({ imports }, api, helpers) {

	const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
	
    let GEConf = api.state.guidedExperienceConf;

    let eventHandlers = {};

    /**
     * handlers to handled events from subpages
     */
    let messageReceiveHandlers = {};

    const NAV_PAGE = "NAV_PAGE";
    const PAGE_OPEN = "PAGE_OPEN";
    const UPDATE_CONF = "UPDATE_CONF";
    const SHOW_LOADER = "SHOW_LOADER";
    const HIDE_LOADER = "HIDE_LOADER";
    const BUTTON_CLICKED = "BUTTON_CLICKED";
    const ADD_NOTIFICATIONS = "ADD_NOTIFICATIONS";
    const PAGE_CLOSE_REQUEST = "PAGE_CLOSE_REQUEST";
    const PAGE_CLOSE_RESPONSE = "PAGE_CLOSE_RESPONSE";
    const MACROPONENT_VIEWPORT_LOAD_REQUESTED = "MACROPONENT_VIEWPORT_LOAD_REQUESTED";
    const STORE_DATA = "STORE_DATA";
    
    const JSONQuery = imports["sn_access_analyzer.JSONQuery"]();

    const GE_MODAL_WINDOW = "geModalWindow";
    const MODAL_WINDOW_BUTTON_EXIT = "GEMW_ButtonExit";
    const MODAL_WINDOW_BUTTON_CLOSE = "GEMW_ButtonClose";


    function onPageReady() {
        openPage(0);
    }

    /**
     * Generate content tree from sub pages
     */
    function init() {
    	
        let listItems = [];
        let selectedItemId = null;
        let icon = GEConf.contentTree.defaultIcon;

        GEConf.activePageIndex = 0;
        GEConf.activeModalWindow = null;
        GEConf.contentTree.listItems = [];
        GEConf.contentTree.selectedItem = [];

        /**
         * Prepare data for content tree
         */
        GEConf.subPages.map(attrs => new SubPage(attrs)).forEach((subPage, index) => {
            if (!subPage.isVisible())
                return;
            listItems.push({
                disabled: !subPage.isEnabled(),
                id: subPage.getName(),
                index: index,
                label: subPage.getLabel(),
                statuses: [{
                    icon: icon,
                    type: "icon"
                }]
            });
            subPage.getAttrs().data = {};
            if(selectedItemId == null && subPage.isEnabled())
                selectedItemId = subPage.getName();
        });
        updateConf({
            "contentTree.listItems": listItems,
            "contentTree.selectedItem": [[selectedItemId]]
        });
    }

    function gotoPrevPage() {
        gotoPage(GEConf.activePageIndex - 1);
    }

    function gotoNextPage() {
        gotoPage(GEConf.activePageIndex + 1);
    }

    /**
     * Reset the conent tree and goto first page
     */
    function reset() {
        init();
        openPage(0);
    }

    function exit() {
        simUtil.hideLoader();
        GEConf.activePageIndex = 0;
        let li = GEConf.contentTree.listItems;
        li.forEach( (item, index) => {
                item.disabled = index > 0,
                item.statuses[0].icon = GEConf.contentTree.defaultIcon
        });
        updateConf({
                "contentTree.listItems": li,
                "contentTree.selectedItem": [[li[0].id]]
        });
        simUtil.updateScreenStatus(false);
        let redirectURI = GEConf.homeURI;
        helpers.navigate.to(redirectURI.route, redirectURI.params, redirectURI.fields);
    }

    function gotoPage(pageIndex) {
        let activePageIndex = GEConf.activePageIndex;
        if (pageIndex < 0 || activePageIndex == pageIndex || pageIndex >= GEConf.contentTree.listItems.length) {
            return;
        }
        let currPage = getPageByIndex(activePageIndex);

        /**
         * call nav_page handler from client script
         */
        let res = emit(NAV_PAGE, currPage, getPageByIndex(pageIndex));
        if (!res) {
            return updateConf("contentTree.selectedItem", [[GEConf.contentTree.listItems[activePageIndex].id]]);
        }


        /**
         * Send message to sub-page to process something before open other pages
         * As part of the request sending activePageIndex & pageIndex
         */
        closePage({
            activePageIndex: activePageIndex,
            nextPageIndex: pageIndex
        });
    }

    /**
     * Once PAGE_CLOSE_REQUEST event send to the sub-page, the sub-page will emit the
     * PAGE_CLOSE_RESPONSE event with request and result data
     */
    function _pageCloseResponseHandler(request) {
        simUtil.hideLoader();

        let nIds = GEConf.notificationIds || [];
        let obj = nIds.map(id => ({ id: id }));
        if (obj.length > 0) {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: obj
            });
        }
        GEConf.notificationIds = [];

        GEConf.activePageIndex = request.nextPageIndex;

        let contentTreeListItems = GEConf.contentTree.listItems;
        let currPageItem = contentTreeListItems[request.nextPageIndex];
        currPageItem.disabled = false;

        /**
         * Change the selected icon, if we move forward
         */
        if (request.nextPageIndex > request.activePageIndex) {
            contentTreeListItems[request.activePageIndex].statuses[0].icon = GEConf.contentTree.completedIcon;
        }

        updateConf({
            "contentTree.listItems": contentTreeListItems,
            "contentTree.selectedItem": [[currPageItem.id]]
        });

        openPage(request.nextPageIndex);
    }

    function openPage(pageIndex) {

        GEConf.activePageIndex = pageIndex;
        let page = getPageByIndex(pageIndex)
        if(page.showInitialLoader()) {
        	simUtil.showLoader();
        }
        
        /**
         * Get the data based on configuration and prepare dataSet
         * this dataSet will be passed as part of MACROPONENT_READY event
         */
        var dataSet = {};
        dataSet[page.getName()] = page.getData();
        page.getDataFrom().forEach(pageName => {
            let pg = getPageByName(pageName);
            dataSet[pageName] = pg.getData();
        });

        /**
         * sendMessage should be called after GEConf.activePageIndex, since
         * the route is being taken from activePage, activePage depends on activePageIndex
         */
        
        var pageParams = {};
        Object.keys(api.context.props)
        	.filter(name => api.context.props[name])
        	.forEach(propName => pageParams[propName] = api.context.props[propName]);

        sendMessage(PAGE_OPEN, {
            conf: page.getAttrs(),
            pageParams: pageParams,
            dataSet: dataSet
        });

        var buttonBehaviour = page.getButtonBehaviour();
        /**
         * Adjust button based of active page
         */
        GEConf.buttons.forEach(button => {
            if (!buttonBehaviour[button.name]) {
                button.visible = false;
                return;
            }
            let beh = buttonBehaviour[button.name];
            button.visible = true;
            switch(buttonBehaviour[button.name]) {
                case "hidden":
                    button.visible = false;
                    break;
                case "disabled":
                    button.enabled = false;
                    break;
            }
        });
        refreshEmbeddedHelp(pageIndex);
    }

    function closePage(req) {
        sendMessage(PAGE_CLOSE_REQUEST,req);
    }

    function getActivePage() {
        return getPageByIndex(GEConf.activePageIndex);
    }

    function getPageByIndex(pageIndex) {
        return new SubPage(GEConf.subPages[pageIndex]);
    }

    function getPageByName(name) {
        return new SubPage(getConf(`subPages[@name=${name}][0]`));
    }

    /**
     * Send message to sub page.
     */
    function sendMessage(eventName, payload) {
        let activePage = getActivePage();

        /**
         * In data object "timestamp" is required in order to MACROPONENT_PROPERTY_CHANGE event handler to receive th event.
         */

        let data = {
            eventName: eventName,
            payload: payload,
            timestamp: Date.now()
        }

        /**
         * Emit below event with route id which subpage is currently active
         */
        api.emit(MACROPONENT_VIEWPORT_LOAD_REQUESTED, {
            viewportElementId: 'viewport_1',
            route: activePage.getRoute(),
            fields: {
                payload: data
            }
        });
    }

    /**
     * Get config data by key
     * ie: button.back.label
     */
    function getConf(key) {
        return JSONQuery.find(GEConf, key);
    }

    /**
     * Update GEConf state variable
     */
    function updateConf(key, value) {
        api.setState("guidedExperienceConf", ctx => {
            let cv = {...ctx.currentValue};
            JSONQuery.update(cv, key, value);
            return cv;
        });
    }

    function _buttonClickHandler(event) {

        if (event.elementId == MODAL_WINDOW_BUTTON_CLOSE)
            return closeModal();

        if (event.elementId == MODAL_WINDOW_BUTTON_EXIT) {
            let activeModal = GEConf.activeModalWindow;
            closeModal();
            _takeAction(activeModal.action);
            return;
        }

        let button = event.context.item.value;
        let eventName = button.eventName ? button.eventName : BUTTON_CLICKED;
        /**
         * Send event to active subpage
         */
        sendMessage(eventName, button);

        if (_hasEventHandler(eventName)) {
            emit(eventName, button)
            return;
        }

        if (button.showConfirmation)
            return openModal(button.modalWindowName);

        _takeAction(button.action);
    }

    function _takeAction(action) {
        /**
         * Handle for default buttons (next & back)
         */
        switch (action) {
            case "next":
                return gotoNextPage();
            case "back":
                return gotoPrevPage();
            case "reset":
                return reset();
            case "exit":
                return exit();

        }
    }

    function onReceive(eventName, handler) {
        messageReceiveHandlers[eventName] = handler
    }

    function _onReceiveHandler(event) {
        let eventName = event.payload.name;
        let handler = messageReceiveHandlers[eventName];
        if (handler)
            handler(event.payload.payload);
    }

    function addEventHandler(eventName, handler) {
        eventHandlers[eventName] = handler;
    }

    function _hasEventHandler(eventName) {
        return eventHandlers.hasOwnProperty(eventName);
    }

    function emit(eventName, ...args) {
        return eventHandlers[eventName] ? eventHandlers[eventName].apply(this, args) : null;
    }

    /**
     * Add notification on main page
     * the "result" parameter has a configuration of notifications
     */
    function _addNotifications(result) {
        result = result || [];
        let notificationIds = [];
        result.forEach(item => notificationIds.push(item.id));
        GEConf.notificationIds = notificationIds;
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: result
        });
    }
    
    function _storeDataHandler({pageName, key, data}) {
        let currPage = getPageByName(pageName);
        if(!data) {
            for(let id in key)
                currPage.setData(id, key[id]);
        } else {
            currPage.setData(key, data);
        }
    }

    function openModal(name) {
        updateConf("activeModalWindow", { ...JSONQuery.find(GEConf, `modalWindow[@name=${name}][0]`) });
        helpers.modal.open(GE_MODAL_WINDOW, {
            bare: true
        });
    }

    function refreshEmbeddedHelp(pageIndex) {
         let page = getPageByIndex(pageIndex);
         if(page.getAttrs().embeddedHelpDocId == undefined)
             return;
         api.emit('SN_HELP_PANEL#REFRESH_REQUESTED', {
                docId: page.getAttrs().embeddedHelpDocId
         });
    }

    function closeModal() {
        GEConf.activeModalWindow = null;
        helpers.modal.close(GE_MODAL_WINDOW);
    }
    
    onReceive(PAGE_CLOSE_RESPONSE, _pageCloseResponseHandler);
    onReceive(STORE_DATA, _storeDataHandler);
    onReceive(UPDATE_CONF, updateConf);
    onReceive(ADD_NOTIFICATIONS, _addNotifications);
    onReceive(SHOW_LOADER, simUtil.showLoader);
    onReceive(HIDE_LOADER, simUtil.hideLoader);

    onReceive("SHOW_PAGE_ERROR", (payload) => {
    	simUtil.hideLoader();
    	simUtil.showPageError(payload.header, payload.content);
    });
    
    onReceive("HIDE_PAGE_ERROR", () => {
    	simUtil.hideLoader();
    	simUtil.removeNotification();
    });

    onReceive("EXIT", exit);

    function handle(event) {
        if (event.name == "NOW_BUTTON#CLICKED")
            return _buttonClickHandler(event);
        let fn = {
            MACROPONENT_READY: onPageReady,
            contentTree: () => gotoPage(event.payload.item.index),
            ACCESS_SIMULATOR_EVENT: _onReceiveHandler
        }[event.elementId || event.name];
        if (fn)
            fn(event);
    }

    /**
     * --------------------------------------------------
     */
    class SubPage {
        #attrs;
        constructor(attrs) {
            this.#attrs = attrs;
        }
        getName = () => this.#attrs.name;
        getLabel = () => this.#attrs.label;
        getOrder = () => this.#attrs.order;
        getRoute = () => this.#attrs.route;
        isEnabled = () => this.#attrs.enabled;
        isVisible = () => this.#attrs.visible;
        getData = () => this.#attrs.data;
        setData = (key, data) => this.#attrs.data[key] = data;
        getButtonBehaviour = () => this.#attrs.buttonBehaviour;
        getDataFrom = () => this.#attrs.getDataFrom || [];
        showInitialLoader = () => this.#attrs.showInitialLoader
        getAttrs = () => this.#attrs;
    }
    /**
     * --------------------------------------------------
     * Exposed public methods
     */
    return {
        init,
        exit,
        reset,
        handle,
        getConf,
        gotoPage,
        openModal,
        onReceive,
        closeModal,
        updateConf,
        sendMessage,
        gotoPrevPage,
        gotoNextPage,
        getActivePage,
        getPageByName,
        getPageByIndex,
        addEventHandler
    }
}
