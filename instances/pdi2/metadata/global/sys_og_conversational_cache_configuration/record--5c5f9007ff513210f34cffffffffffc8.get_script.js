(function() {
	if(!name) {
		throw new Error('invalid argument. name is empty');
	}
	if(!type) {
		throw new Error('invalid argument. type is empty');
	}
	if(!record) {
		throw new Error('invalid argument. record is empty');
	}
	let prop = null;
    if (type == 'hierarchy') {
		prop = sn_cs.VASystemObject.getCustomAdapterPropertyWithHierarchy(name, record);
    } else {
        prop = sn_cs.VASystemObject.getCustomAdapterProperty(name, type, record);
    }
	return prop;
})();
