var GeomapUtil = Class.create();
GeomapUtil.prototype = {
    initialize: function() {},

    getManualDataMapParams: function(table, field, mapSysId) {
        var mapGr = new GlideRecord('sys_report_map');
        mapGr.addQuery('sys_id', mapSysId);
        mapGr.setLimit(1);
        queryExecutor(mapGr);

        if (!mapGr.next())
            return null;

        var gr = new GlideRecord(table);
        if (!gr.isValid())
            return null;


        var element = gr.getElement(field);
        if (element == null || element == undefined)
            return null;

        if (element.getED() == null || element.getED() == undefined)
            return null;

        var fieldType = element.getED().getInternalType() + "";
        if (fieldType === 'reference')
            return null;

        var fieldParts = field.split(".");
        var parents = fieldParts.slice(0, fieldParts.length - 1);

        if (!parents.length)
            return null;

        var parentField = parents.join(".");
        var parentElement = gr.getElement(parentField);
        if (parentElement == null || parentElement == undefined)
            return null;

        var refTable = parentElement.getED().getReference();

        var vizMapSourceGr = new GlideRecord('viz_map_source');
		vizMapSourceGr.addActiveQuery();
        vizMapSourceGr.addQuery('table', refTable);
        vizMapSourceGr.addQuery('aggregate_field', fieldParts[fieldParts.length - 1]);
        vizMapSourceGr.setLimit(1);
        queryExecutor(vizMapSourceGr);

        if (!vizMapSourceGr.next())
            return null;

        return {
            field: parentField,
            mapKey: mapGr.getValue('key'),
            useLatLon: vizMapSourceGr.getValue('type_mapping') === 'use_lat_lon'
        };
    },

    getGeoMapData: function(table, field, mapSysId, mapKey, useLatLon) {
        validateRequestParams(table, field, mapSysId, mapKey);

        var refTable = getReferenceTable(table, field);
        var reportMapResponse = getReportMapResponse(mapSysId, mapKey);
        var mapSourceResponse = getMapSourceResponse(refTable, reportMapResponse.level, useLatLon);

        var filterQuery = getFilterQuery(field, mapSourceResponse.parentField, reportMapResponse.key, mapSourceResponse.parentMappingSysId);

        var result = {
            "mapName": reportMapResponse.mapName,
            "mapSysId": reportMapResponse.mapSysId,
            "filterQuery": filterQuery,
            "mapSourceField": mapSourceResponse.field,
            "joinByColumn": mapSourceResponse.joinByColumn,
            "typeMapping": mapSourceResponse.typeMapping,
            "mapJSON": reportMapResponse.mapJSON,
			"finalGroupByField": field + "." + mapSourceResponse.field
        };

        if (mapSourceResponse.typeMapping === 'use_lat_lon') {
            var locationResponse = getLocationResponse(mapSourceResponse.parentField, reportMapResponse.key);
            result.locationData = locationResponse;
        } else {
            var locationMappingsResponse = getLocationMappingsResponse(
                mapSourceResponse.reportMapSourceMapping,
                reportMapResponse);

            result.locationMappings = locationMappingsResponse;
        }

        return result;
    },

    type: 'GeomapUtilApi'
};

function queryExecutor(gr) {
    gr.setCategory('reporting');
    gr.query();
}

function isValidObj(obj) {
    return obj != null && obj != undefined;
}

function validateRequestParams(table, field, mapSysId, mapKey) {
    if (!isValidObj(table))
        throw getErrorMessage('MISSING_PARAM', 'table');

    if (!isValidObj(field))
        throw getErrorMessage('MISSING_PARAM', 'field');

    if (!isValidObj(mapSysId) && !isValidObj(mapKey))
        throw getErrorMessage('MISSING_PARAM', 'mapSysId or mapKey');
}

function getReferenceTable(table, field) {
    var gr = new GlideRecord(table);
    if (gr.isValid()) {
        var fieldElement = gr.getElement(field);
        if (fieldElement == null || fieldElement == undefined)
            throw getErrorMessage('INVALID_REF_FIELD', field);

        return fieldElement.getED().getReference();
    }
    throw getErrorMessage('INVALID_TABLE', table);
}

function executeGR(gr, fieldMap, table) {
    if (gr.isValid()) {
        queryExecutor(gr);

        return buildRecords(gr, fieldMap);
    }
    return [];
}

function buildRecords(gr, fieldMap) {
    var results = [];
    var sourceFields = Object.keys(fieldMap);
    while (gr.next()) {
        var result = {};
        sourceFields.forEach(function(sourceField) {
            var targetField = fieldMap[sourceField];
            result[targetField] = gr.getValue(sourceField);
        });
        results.push(result);
    }
    return results;
}

/*
Returns the level sys id, map JSON and key from sys_report_map table
*/
function getReportMapResponse(mapSysId, mapKey) {
    var reportMap = new GlideRecord('sys_report_map');
    reportMap.addActiveQuery();
    if (isValidObj(mapSysId))
        reportMap.addQuery('sys_id', mapSysId);
    else
        reportMap.addQuery('key', mapKey);

    var reportMapFieldMap = {
        name: 'mapName',
        type: 'level',
        json_map: 'mapJSON',
        key: 'key',
        sys_id: 'mapSysId'
    };
    var reportMapResponse = executeGR(reportMap, reportMapFieldMap, 'sys_report_map');
    if (reportMapResponse.length === 0)
        throw getErrorMessage('INVALID_REPORT_MAP', isValidObj(mapSysId) ? mapSysId : mapKey);

    return reportMapResponse[0];

}

/*
Returns the map configurations from viz_map_source table.
MapSourceResponse include Field name, How to Use data, Use these mappings and Use this key.
Return the parent level field name to use it for fetching location maps
*/
function getMapSourceResponse(table, level, useLatLon) {
    var mapSource = new GlideRecord("viz_map_source");
    mapSource.addActiveQuery();
    mapSource.addQuery('table', table);
    if (useLatLon)
        mapSource.addQuery('type_mapping', 'use_lat_lon');
    else
        mapSource.addQuery('type', level);

    var mapSourceFieldMap = {
        aggregate_field: 'field',
        report_map_source_mapping: 'reportMapSourceMapping',
        type_mapping: 'typeMapping',
        join_by_column: 'joinByColumn',
        parent: 'parentSysId',
        sys_id: 'mapSourceSysId'
    };
    var mapSourceResponse = executeGR(mapSource, mapSourceFieldMap, 'viz_map_source');
    if (mapSourceResponse.length == 0)
        throw getErrorMessage('NO_MAP_SOURCE', table);

    if (mapSourceResponse[0].parentSysId != null) {
        mapSourceResponse[0].parentField = getParentField(useLatLon, mapSource);
        mapSourceResponse[0].parentMappingSysId = mapSource.parent.report_map_source_mapping.toString();
    }

    return mapSourceResponse[0];
}

/*
When useLatLon is true, return grand-parent level field name
Else, return parent level field name
Returns the field name used for fetching location maps
*/
function getParentField(useLatLon, mapSource) {
    if(mapSource.parent == null)
        return '';

    var field = mapSource.parent.aggregate_field.toString();

    if (useLatLon && mapSource.parent.parent != null) {
        field = mapSource.parent.parent.aggregate_field.toString();
    }

    return field;
}

/*
Return key, value from Locations Mappings table
*/
function getLocationMappingsResponse(reportMapSourceMapping, reportMapResponse) {
    var reportSourceMappings = new GlideRecord("sys_report_map_source_mappings");
    reportSourceMappings.addQuery('report_map_source_mapping', reportMapSourceMapping);
    var mapping = getMappingName(reportMapSourceMapping);

    // For country mappings, do not add the query for map. sys_report_map_source_mappings does not have map populated correctly for Level 1(country mappings)
    if (mapping != 'Country mappings')
        reportSourceMappings.addQuery('map', reportMapResponse.mapSysId);

    var locationFieldMap = {
        key: 'key',
        value: 'value'
    };
    return executeGR(reportSourceMappings, locationFieldMap, 'sys_report_map_source_mappings');
}

function getMappingName(reportMapSourceMapping) {
    var mapping = new GlideRecord("sys_report_map_source_mapping");
    mapping.addQuery('sys_id', reportMapSourceMapping);
    if (!mapping.isValid())
        return;

    queryExecutor(mapping);
    if (mapping.next())
        return mapping.getValue('name');

    return '';
}

/*
Returns locations data from cmn_location table
Apply filter to cmn_location table. If it does not return any result, fetch all records from cmn_location table
*/
function getLocationResponse(mapSourceParentField, reportMapKey) {
    var locationResponse = getLocationResponseWithFilters(mapSourceParentField, reportMapKey);
    if (locationResponse.length === 0)
        return getLocationResponseWithFilters();

    return locationResponse;
}

function getLocationResponseWithFilters(mapSourceParentField, reportMapKey) {
    var location = new GlideRecord("cmn_location");
    if (reportMapKey != null && mapSourceParentField != null) {
        var key = getLocationMappingKey(reportMapKey);
        location.addQuery(mapSourceParentField, key);
    }
    var locationFieldMap = {
        latitude: 'latidude',
        longitude: 'longitude',
        name: 'name',
        city: 'city',
        state: 'state',
        country: 'country'
    };
    return executeGR(location, locationFieldMap, 'cmn_location');
}

function getLocationMappingKey(key) {
    var reportSourceMappings = new GlideRecord("sys_report_map_source_mappings");
    reportSourceMappings.addQuery('value', key);
    if (!reportSourceMappings.isValid())
        return;

    queryExecutor(reportSourceMappings);
    if (reportSourceMappings.next())
        return reportSourceMappings.getValue('key');

    return '';
}

function getFilterQuery(field, parentField, reportMapKey, reportMapSourceMapping) {
    if (!parentField)
        return '';

    var reportSourceMappings = new GlideRecord("sys_report_map_source_mappings");
    reportSourceMappings.addQuery('value', reportMapKey);
    reportSourceMappings.addQuery('report_map_source_mapping', reportMapSourceMapping);

    if (!reportSourceMappings.isValid())
        return;

    queryExecutor(reportSourceMappings);
    if (!reportSourceMappings.next())
        return;

    return field + "." + parentField + "=" + reportSourceMappings.getValue('key');
}

function getErrorMessage(errorCode, param) {
    if (errorCode === 'MISSING_PARAM') {
        return {
            "status": "failure",
            "msg": gs.getMessage("Unable to fetch geomap data due to missing {0}", param),
            "errorCode": errorCode
        };
    } else if (errorCode === 'INVALID_TABLE') {
        return {
            "status": "failure",
            "msg": gs.getMessage("Invalid Table {0}", param),
            "detail": gs.getMessage("Table {0} is not valid", param),
            "errorCode": errorCode
        };
    } else if (errorCode === 'INVALID_REF_FIELD') {
        return {
            "status": "failure",
            "msg": gs.getMessage("No reference table found for {0}", param),
            "detail": gs.getMessage("Field {0} is not a valid reference field", param),
            "errorCode": errorCode
        };
    } else if (errorCode === 'NO_MAP_SOURCE') {
        return {
            "status": "failure",
            "msg": gs.getMessage("No Map Source found"),
            "detail": gs.getMessage("Map Source does not exist for {0} table", param),
            "errorCode": errorCode
        };
    } else if (errorCode === 'INVALID_REPORT_MAP') {
        return {
            "status": "failure",
            "msg": gs.getMessage("Report Map not found"),
            "detail": gs.getMessage("Report map does not exist for {0}", param),
            "errorCode": errorCode
        };
    }
}
