/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    api.setState('parFilters', ({ currentValue }) => {
		const { payload: { appliedFilters } } = event;
		return imports['global.mergePARFilters']()(currentValue, appliedFilters);
	});

	var typeState = api.state.typeFilter;
	var vendorState = api.state.vendorFilter;
	var domainState = api.state.domainFilter;
	var flag = event.elementId;
	if(flag == 'filter_1'){
		var values = event.payload.appliedFilters[0].values;
    	if(values == undefined) {
        	typeState = '';
    	}
    	else {
        	var query = [];
        	for(var i = 0; i < values.length; i++){
            	query[i] = 'contract_model=' + values[i];
        	}
        	typeState = query.join('^OR');
    	}
    	api.setState('typeFilter', typeState);
	}

	if(flag == 'filter_2'){
		var values = event.payload.appliedFilters[0].values;
    	if(values == undefined) {
        	vendorState = '';
    	}
    	else {
        	var query = [];
        	for(var i = 0; i < values.length; i++){
            	query[i] = 'vendor=' + values[i];
        	}
        	vendorState = query.join('^OR');
    	}
    	api.setState('vendorFilter', vendorState);
	}
	if(flag == 'domain_filter_1'){
		var value = event.payload.appliedFilters[0].sys_id;
		var domainValues = api.state.domainValues;
    	if(value == undefined || value == null) {
        	domainState = '';
    	}
    	else {
			var query = [];
			var data = [];
			data.push(value);
			query[0] = 'sys_domain=' + value;
			var i = 1, j = 0;
			var flag = '';
			while( j < data.length){
				flag = true;
				for (var key of Object.keys(domainValues)) {
					if(domainValues[key] == data[j]) {
						query[i] = 'sys_domain=' + key;
						i++;
						data.push(key);
					}
				}
				j++;
			}
			domainState = query.join('^OR');
    	}
    	api.setState('domainFilter', domainState);
	}

	var currState = '';
	if(vendorState != null && vendorState != ''){
		currState = currState + vendorState + '^';
	}
	if(typeState != '' && typeState != null){
		currState = currState + typeState + '^';
	}
	if(domainState != '' && domainState != null){
		currState = currState + domainState + '^';
	}
	if(currState != ''){
		currState = currState + 'EQ';
	}
	api.setState('listFilter', currState);
}
