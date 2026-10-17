(function executeRule(current, previous /*null when async*/) {
    if (shouldFlushCache(current, previous)) {
        const recordSysId = current?.getUniqueValue() || previous?.getUniqueValue() || null;
        if (!recordSysId)
            return;

        GlideCacheManager.prefixFlush('sm_mapped_service_properties_cache', recordSysId);
    }
})(current, previous);


function isCalculatedService(serviceGr) {
	return SNC.ClassModel.isInstanceOf(serviceGr.getValue('sys_class_name'), 'cmdb_ci_service_calculated');
}

function hasValueChanged(current, previous, fieldName) {
    return current.getValue(fieldName) !== previous.getValue(fieldName);
}

function shouldFlushCache(current, previous) {
    const isDeleteOperation = !current || !previous;

    if (isDeleteOperation ||
        hasValueChanged(current, previous, 'name') ||
        hasValueChanged(current, previous, 'sys_class_name') ||
        hasValueChanged(current, previous, 'type')) {
        return true;
    }

    if (!isCalculatedService(previous) || !isCalculatedService(current)) {
        return false;
    }

    if (!hasValueChanged(current, previous, 'metadata')) {
        return false;
    }

    let previousMetadata;
    let currentMetadata;

    try {
        previousMetadata = JSON.parse(previous.metadata);
        currentMetadata = JSON.parse(current.metadata);
        
    } catch (ex) {
        return false;
    }

    if (String(previousMetadata?.modelDisabled) !== String(currentMetadata?.modelDisabled)) {
        return true;
    }

    return false;
}
