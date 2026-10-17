function include({ imports }, typeaheadConf, api, helpers) {

    const typeaheads = typeaheadConf.typeaheads;
    const config = typeaheadConf.config;
    const JSONQuery = imports["sn_access_analyzer.JSONQuery"]();
    let eventHandlers = {};

    const TypeaheadEvent = {
        ON_VALUE_SET: "NOW_TYPEAHEAD#VALUE_SET",
        ON_SELECTED_ITEM_SET: "NOW_TYPEAHEAD#SELECTED_ITEM_SET",
        ON_DATA_FETCH_SUCCEEDED: "DATA_FETCH_SUCCEEDED",
        ON_DATA_FETCH_FAILED: "DATA_FETCH_FAILED",
        ON_DATA_OP_FAILED: "DATA_OP_FAILED",
        ON_ENTER_KEY_DOWN: "NOW_TYPEAHEAD#ENTER_KEYDOWN"
    }

    function init() {
        clear();
        config.thDSIndexMap = {};
        for (let typeaheadID in typeaheads) {
            let thConf = getConf(typeaheadID);
            thConf.searchKeyword = "";
            config.thDSIndexMap[thConf.dataSource] = typeaheadID;
            if (thConf.loadData == true)
                loadData(typeaheadID);
        }
    }

    function addEventHandler(eventName, handler) {
        eventHandlers[eventName] = handler;
    }

    function getConf(typeaheadID, key = null) {
        let conf = typeaheads[typeaheadID];
        return key != null ? conf[key] : conf;
    }

    function getProps(typeaheadID) {
        return api.state[typeaheadID];
    }

    function updateConf(typeaheadID, key, value) {
        let data = typeof key === "string" ? { [key]: value } : key;
        let thConf = getConf(typeaheadID);
        for (let id in data)
            thConf[id] = data[id];
    }

    function updateProps(typeaheadID, key, value) {
        let data = (typeof key == "string") ? { [key]: value } : key;
        let thProps = getProps(typeaheadID);
        if (!thProps)
            return;
        api.setState(typeaheadID, ctx => ({ 
        	...ctx.currentValue, 
        	...data 
        }));
    }

    function update(typeaheadID, data) {
        if (!data)
            return;
        updateProps(typeaheadID, {
            loading: false,
            listItems: [data],
            selectedItemId: data.id,
            selectedItemValue: data.label
        });
    }

    function clear(...typeaheadIDs) {
        _clear.apply(null, (typeaheadIDs != null && typeaheadIDs.length > 0) ? typeaheadIDs : Object.keys(typeaheads));
    }

    function _clear(...typeaheadIDs) {
        typeaheadIDs.forEach(typeaheadID => {
            updateProps(typeaheadID, {
                loading: false,
                listItems: [],
                selectedItemId: null,
                selectedItemValue: null
            });
        });
    }

    function loadData(typeaheadID, table = null) {
        updateProps(typeaheadID, "loading", true);
        let thConf = getConf(typeaheadID);
        if (table != null)
            thConf.table = table;
        thConf.condition = null;
        api.data[thConf.dataSource].refresh();
    }


    function _dataFetchHandler(event) {
        if(event.name == TypeaheadEvent.ON_DATA_FETCH_FAILED || event.name == TypeaheadEvent.ON_DATA_OP_FAILED) {
            emit(event.name);
            return;
        }

        let dataSourceID = event.elementId;
        let typeaheadID = config.thDSIndexMap[dataSourceID];
        if (!typeaheadID)
            return;
        api.state[typeaheadID].loading = false;
        emit(TypeaheadEvent.ON_DATA_FETCH_SUCCEEDED, dataSourceID, typeaheadID, api.data[dataSourceID], event);

        updateProps(typeaheadID, {
            loading: false,
            listItems: _getResult(dataSourceID),
            selectedItemId: null
        });
    }

    function _serializeData(result, serilizeMapper) {
        if (!result)
            return [];
        let serMap = serilizeMapper || {
            id: "_row_data.uniqueValue",
            label: "_row_data.displayValue",
        }
        return result.map(row => {
            let rowObj = {};
            for (let id in serMap)
                rowObj[id] = JSONQuery.find(row, serMap[id]);
            return rowObj;
        });
    }


    function _valueSetHandler(event) {
        if (event.payload.actionSource == "select")
            return;
        let typeaheadID = event.elementId;
        let thConf = getConf(typeaheadID);
        if(!thConf.required) 
            event.payload.value ? showError(typeaheadID) : clearError(typeaheadID);
        
        if (thConf.searchKeyword != "" && event.payload.value == thConf.searchKeyword)
            return;

        if (event.payload.value != "") {
            thConf.searchKeyword = event.payload.value;
            thConf.condition = thConf.encodedSearchQuery.replaceAll("%s", event.payload.value);
        } else {
            thConf.condition = null;
        }
        api.data[thConf.dataSource].refresh();
    }

    function _getResult(dataSource) {
        let typeaheadID = config.thDSIndexMap[dataSource];
        let conf = getConf(typeaheadID);
        let result = JSONQuery.find(api.data[dataSource], conf.dataSourceResultKey || "results");
        return _serializeData(result, conf.dataRowSerilizeMapper);
    }

    function _selectedItemSetHandler(event) {
        let thProps = getProps(event.elementId);
        let item = event.payload.item;
        if (thProps.selectedItemId == item.id)
            return;
        let typeaheadID = event.elementId;
        let selectedItemId = item.id;
        let prevItemId = thProps.selectedItemId || thProps.previousSelectedItemId;
        let thConf = getConf(typeaheadID);
        let hasError = selectedItemId == null && thConf.required == true;
        let props =  {
            selectedItemId: selectedItemId,
            selectedItemValue: selectedItemId == null ? "" : item.label,
            listItems: thProps.listItems.filter(item => item.id == selectedItemId),
            error: null,
            hasUpdated: false
        };

        if(item.id) {
        	props.previousSelectedItemId = prevItemId == undefined ?  selectedItemId : prevItemId
            props.hasUpdated = selectedItemId != prevItemId;
        	if(props.hasUpdated)
        		props.previousSelectedItemId = selectedItemId;
        }
        
        updateProps(typeaheadID, props);
        
        if(hasError) {
        	let err = _validate(typeaheadID);
        	showError(typeaheadID, err.error);
        }

        emit(TypeaheadEvent.ON_SELECTED_ITEM_SET, typeaheadID, item);
    }

    function _enterKeyDownHandler(event) {
        let text = event.payload.value;
        if (text.trim() == "")
            return;
        let typeaheadID = event.elementId;
        let thProps = getProps(typeaheadID);
        let list = thProps.listItems.filter(item => item.label.includes(text) || item.sublabel.includes(text));
        updateProps(typeaheadID, {
            selectedItemId: list.length == 0 ? null : list[0].id,
            selectedItemValue: list.length == 0 ? text : list[0].label
        });
        if (list.length > 0)
            emit(TypeaheadEvent.ON_SELECTED_ITEM_SET, typeaheadID, list[0]);
    }

    function getSelectedItems() {
        let res = {};
        for (let typeaheadID in typeaheads)
            res[typeaheadID] = getSelectedItem(typeaheadID);
        return res;
    }

    function getSelectedItem(typeaheadID) {
        let thProps = getProps(typeaheadID);
        let sid = thProps.selectedItemId;
        return thProps.listItems.find(item => item.id == sid) || {};
    }

    function hasUpdated() {
    	let res = false;
    	for (let typeaheadID in typeaheads)
    		res = res || getProps(typeaheadID).hasUpdated;
    	return res;
    }
    
    function clearUpdateState() {
    	for (let typeaheadID in typeaheads) {
    		let t = getProps(typeaheadID);
    		updateProps(typeaheadID, {
    			previousSelectedItemId: t.selectedItemId,
    			hasUpdated: false
    		});
    	}
    }
    
    function hasError(typeaheadID) {
    	return _validate(typeaheadID).hasError;
    }
    
    function isEmpty(typeaheadID) {
    	return emptyString(getProps(typeaheadID).selectedItemId);
    }
    
    function validate(typeaheadID) {
        if (typeaheadID)
            return _validate(typeaheadID);
        let answer = {
            typeaheads: {},
            hasError: false
        }
        for (let typeaheadID in typeaheads) {
            let vr = _validate(typeaheadID);
            answer.hasError = vr.hasError || answer.hasError;
            answer.typeaheads[typeaheadID] = vr;
        }
        return answer;
    }

    function _validate(typeaheadID) {
        let thConf = getConf(typeaheadID);
        let item = getSelectedItem(typeaheadID);
        let thProps = getProps(typeaheadID);
        let hasError;
        let error = "";
        if ((thConf.required && emptyString(item.id)) || (!thConf.required && emptyString(item.id) && !emptyString(thProps.selectedItemValue)) || (!thConf.required && thProps.error != null)) {
            error = thConf.errors["default"];
            showError(typeaheadID, error);
            hasError = true;
        } else {
            hasError = false;
            clearError(typeaheadID);
        }
        return Object.assign({ hasError: hasError, error: error }, item);
    }

    function showError(typeaheadID, message = null) {
        let thConf = getConf(typeaheadID);
        let thProps = getProps(typeaheadID);
        let err = { ...config.errorTemplate };
        err.content = message || thConf.errors["default"];
        thProps.error = [err];
        updateProps(typeaheadID, thProps);
    }

    function clearError(typeaheadID) {
        let thProps = getProps(typeaheadID);
        thProps.error = null;
        updateProps(typeaheadID, thProps);
    }

    function emit(eventName, ...args) {
        return eventHandlers[eventName] ? eventHandlers[eventName].apply(this, args) : null;
    }

    function handle(event) {
        switch (event.name) {
            case TypeaheadEvent.ON_VALUE_SET:
                return _valueSetHandler(event);
            case TypeaheadEvent.ON_SELECTED_ITEM_SET:
                return _selectedItemSetHandler(event);
            case TypeaheadEvent.ON_DATA_FETCH_SUCCEEDED:
            case TypeaheadEvent.ON_DATA_FETCH_FAILED:
            case TypeaheadEvent.ON_DATA_OP_FAILED:
                return _dataFetchHandler(event);
            case TypeaheadEvent.ON_ENTER_KEY_DOWN:
                return _enterKeyDownHandler(event);
        }
    }

    const emptyString = (val) => val == null || val.trim().length == 0;

    return {
        TypeaheadEvent,
        init,
        addEventHandler,
        getConf,
        getProps,
        updateConf,
        updateProps,
        loadData,
        showError,
        clearError,
        clear,
        update,
        getSelectedItems,
        getSelectedItem,
        validate,
        handle,
        hasUpdated,
        clearUpdateState,
        hasError,
        isEmpty
    }
}
