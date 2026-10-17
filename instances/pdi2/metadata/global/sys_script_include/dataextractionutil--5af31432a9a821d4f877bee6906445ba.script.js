var DataExtractionUtil = Class.create();
DataExtractionUtil.prototype = {
    initialize: function() {
        this.CONSTANTS = new DataExtractionConstants();
    },

    isJSONObject: function(jsonObject) {
        try {
            if (typeof jsonObject === 'string')
                jsonObject = JSON.parse(jsonObject);
            else
                JSON.stringify(jsonObject);
            if (this.isNullOrEmpty(jsonObject))
                return false;
        } catch (e) {
            return false;
        }
        return true;
    },

    isValidJSONKey: function(jsonObject, key) {
        try {
            if (this.isNullOrEmpty(jsonObject) ||
                !jsonObject.hasOwnProperty(key) ||
                gs.nil(jsonObject[key]))
                return false;
        } catch (e) {
            return false;
        }
        return true;
    },

    isValidJSONArrayKey: function(jsonObject, key) {
        return this.isValidArray(jsonObject[key]);

    },

    isNullOrEmpty: function(obj) {
        return gs.nil(obj) || Object.keys(obj).length <= 0;
    },

    isValidArray: function(obj) {
        try {
            if (!Array.isArray(obj) || obj.length <= 0)
                return false;

        } catch (e) {
            return false;
        }
        return true;
    },

    convertKeysToUpperCase: function(jsonObject) {
        if (typeof jsonObject === 'string')
            jsonObject = JSON.parse(jsonObject);

        var newJsonObject = Object.keys(jsonObject).reduce(function(acc, key) {
            acc[key.toUpperCase()] = jsonObject[key];
            return acc;
        }, {});
        return newJsonObject;
    },

    // Converting all JSON keys to upper case
    ConvertContractKeysToUpperCase: function(jsonObject) {
        jsonObject = this.convertKeysToUpperCase(jsonObject);
        jsonObject.TARGET = this.convertKeysToUpperCase(jsonObject.TARGET);

        if (this.isValidJSONKey(jsonObject.TARGET, "OTHER_FEATURES")) {
            for (i = 0; i < jsonObject.TARGET.OTHER_FEATURES.length; i++) {
                jsonObject.TARGET.OTHER_FEATURES[i] = this.convertKeysToUpperCase(jsonObject.TARGET.OTHER_FEATURES[i]);
            }
        }

        if (this.isValidJSONKey(jsonObject, "SOURCE")) {
            jsonObject.SOURCE = this.convertKeysToUpperCase(jsonObject.SOURCE);

            if (this.isValidJSONKey(jsonObject.SOURCE, "OTHER_FEATURES")) {
                for (i = 0; i < jsonObject.SOURCE.OTHER_FEATURES.length; i++) {
                    jsonObject.SOURCE.OTHER_FEATURES[i] = this.convertKeysToUpperCase(jsonObject.SOURCE.OTHER_FEATURES[i]);
                }
            }
            if (this.isValidJSONKey(jsonObject.SOURCE, "JOIN"))
                jsonObject.SOURCE.JOIN = this.convertKeysToUpperCase(jsonObject.SOURCE.JOIN);
        }
        return jsonObject;
    },

    // Security check by Table
    hasTableAccess: function(tableName) {
        if (gs.nil(tableName))
            return false;

        try {
            var _gr = new GlideRecordSecure(tableName.toLowerCase());
            if (gs.nil(_gr) || !_gr.isValid())
                return false;

            if (gs.getUserName() == global.MLBaseConstants.SHARED_SERVICE_USER_NAME)
                return true;
            else
                return _gr.canRead();

        } catch (err) {
            return false;
        }
    },

    isValidEncodedQuery: function(tableName, encodedQuery) {
        if (gs.nil(tableName))
            return false;

        try {
            var gr = new GlideRecordSecure(tableName);
            if (!gs.nil(encodedQuery) && !gr.isValidEncodedQuery(encodedQuery))
                return false;

        } catch (err) {
            return false;
        }

        return true;
    },

    areFieldsValid: function(tableName, fields) {
        if (gs.nil(tableName))
            return false;

        try {
            var gr = new GlideRecord(tableName);
            gr.setLimit(1);
            gr.query();
            if (!gr.hasNext())
                return false;

            while (gr.next()) {
                for (i = 0; i < fields.length; i++) {
                    if (fields[i].includes('.')) { //1 level dot walking is supported
                        var dotWalking = fields[i].split(".");
                        var dotWalkingRef = gr.getElement(dotWalking[0]);
                        if (gs.nil(dotWalkingRef))
                            return false;
                    } else if (!gs.nil(fields[i]) && !gr.hasOwnProperty(fields[i]))
                        return false;
                }
            }

        } catch (err) {
            return false;
        }

        return true;
    },

    getOtherFeatureTable: function(otherFeature) {
        if (gs.nil(otherFeature))
            return null;

        if (otherFeature.TYPE == "ATTACHMENT" &&
            !this.isValidJSONKey(otherFeature, "TABLE"))
            return this.CONSTANTS.TABLES.SYS_ATTACHMENT;
        else
            return otherFeature.TABLE;
    },

    //Function to get single value fields (features/labels) from target and source
    //Input: recordGR : GlideRecord from where the single value field is being extracted
    //       fieldNames  : Vector with the name of the fields to extract
    //       singleFieldArray : Array of previously collected single value fields
    getSingleValueFields: function(recordGR, fieldNames, singleFieldArray) {
        if (gs.nil(singleFieldArray))
            singleFieldArray = [];

        if (gs.nil(recordGR) || gs.nil(fieldNames) || fieldNames.length == 0)
            return singleFieldArray;

        try {
            var svName;
            var svValue;

            for (i = 0; i < fieldNames.length; i++) {
                svName = fieldNames[i];
                svValue = null;

                if (svName.includes('.')) { //1 level dot walking is supported
                    var dotWalking = svName.split(".");
                    var dotWalkingRef = recordGR.getElement(dotWalking[0]);
                    if (!gs.nil(dotWalkingRef))
                        svValue = dotWalkingRef.getRefRecord().getValue(dotWalking[1]);
                } else
                    svValue = recordGR.getValue(svName);

                singleFieldArray.push({
                    name: recordGR.getTableName() + "." + svName,
                    value: gs.nil(svValue) ? "" : svValue
                });
            }
        } catch (err) {
            return singleFieldArray;
        }
        return singleFieldArray;
    },


    getMultiValueFields: function(type, label, multiValueArray) {
        if (gs.nil(label))
            return null;

        if (gs.nil(multiValueArray))
            multiValueArray = [];

        if (type == "ATTACHMENT")
            return {
                "name": label,
                "attachmentList": multiValueArray
            };
        else
            return {
                "name": label,
                "values": multiValueArray
            };
    },

    getAttachmentMetadata: function(gr) {
        if (gs.nil(gr))
            return null;

        return {
            "attachmentSysId": gr.getUniqueValue(),
            "attachmentType": gr.getValue("content_type"),
            "attachmentName": gr.getValue("file_name"),
            "attachmentByteSize": gr.getValue("size_bytes")
        };
    },

    getMIMEType: function(attachmentType) {
        return new DataExtractionConstants().ALL_SUPPORTED_ATTACHMENT_TYPES[attachmentType];
    },

    getTableListFromContract: function(contract, useCase) {
        var tableNames = [];
        if (!this.isJSONObject(contract))
            return tableNames;

        tableNames.push(contract.TARGET.TABLE);
        if (this.isValidJSONKey(contract.TARGET, "OTHER_FEATURES"))
            tableNames = tableNames.concat(this.getTableListFromOtherFeatures(contract.TARGET.OTHER_FEATURES));

        if (useCase != "SINGLE_TABLE") {
            tableNames.push(contract.SOURCE.TABLE);

            if (this.isValidJSONKey(contract.SOURCE, "OTHER_FEATURES"))
                tableNames = tableNames.concat(this.getTableListFromOtherFeatures(contract.SOURCE.OTHER_FEATURES));
        }
        return tableNames;
    },

    getTableListFromOtherFeatures: function(otherFeatures) {
        var otherFeaturesTableNames = [];

        if (!this.isValidArray(otherFeatures))
            return otherFeaturesTableNames;

        for (var i = 0; i < otherFeatures.length; i++)
            if (this.isValidJSONKey(otherFeatures[i], "TABLE"))
                otherFeaturesTableNames.push(otherFeatures[i].TABLE);

        return otherFeaturesTableNames;
    },

    getRotationSysId: function(tableNames) {
        if (!this.isValidArray(tableNames))
            return null;

        var gr = new GlideRecord(this.CONSTANTS.TABLES.SYS_TABLE_ROTATION);
        gr.addQuery("name", "IN", tableNames);
        gr.addQuery("type", "IN", this.CONSTANTS.VALID_ROTATION_TYPES.join(","));
        gr.orderBy("duration");
        gr.setLimit(1);
        gr.query();
        if (gr.next())
            return gr.getUniqueValue();

        return null;
    },


    getTargetInfoForRotation: function(tableName, encodedQuery) {
        if (gs.nil(tableName))
            return null;

        var ga = new GlideAggregate(tableName);
        if (!gs.nil(encodedQuery))
            ga.addEncodedQuery(encodedQuery);
        ga.addAggregate('COUNT');
        ga.addAggregate('MIN', 'sys_created_on');
        ga.setGroup(false);
        ga.query();

        if (ga.next()) {
            targetInfo = {
                "min_date": new GlideDateTime(ga.getAggregate('MIN', 'sys_created_on')).getDisplayValue(),
                "record_count": parseInt(ga.getAggregate('COUNT'), 0)
            };
            return targetInfo;
        }
        return null;
    },

    getNextRotationSchedule: function(rotationGroup, startDate) {
        if (gs.nil(rotationGroup))
            return null;

        var gr = new GlideRecord(this.CONSTANTS.TABLES.SYS_TABLE_ROTATION_SCHEDULE);

        if (!gs.nil(startDate))
            gr.addEncodedQuery("name=" + rotationGroup + "^valid_from<=javascript:gs.dateGenerate('" +
                startDate.substring(0, 10) + "','" + startDate.substring(10, 19) +
                "')^valid_to>=javascript:gs.dateGenerate('" +
                startDate.substring(0, 10) + "','" + startDate.substring(10, 19) + "')");
        else {
            var schedule = this.getRotationSchedule(rotationGroup);

            gr.addEncodedQuery("name=" + schedule.name +
                "^valid_from=javascript:gs.dateGenerate('" + schedule.valid_to.substring(0, 10) + "','" +
                schedule.valid_to.substring(10, 19) + "')");


        }
        gr.orderBy("valid_to");
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {

            var rotationSchedule = {
                "from": gr.valid_from.toString(),
                "to": gr.valid_to.toString(),
                "encoded_query": this.createDateEncodedQuery(gr.valid_from.getDisplayValue(), gr.valid_to.getDisplayValue()),
                "sys_id": gr.getUniqueValue()
            };
            return rotationSchedule;
        }
        return null;
    },

    getRotationSchedule: function(rotationScheduleSysId) {
        if (gs.nil(rotationScheduleSysId))
            return null;

        var gr = new GlideRecord(this.CONSTANTS.TABLES.SYS_TABLE_ROTATION_SCHEDULE);
        gr.addQuery("sys_id", rotationScheduleSysId);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var rotationSchedule = {
                "name": gr.name.toString(),
                "valid_to": gr.valid_to.getDisplayValue(),
                "encoded_query": this.createDateEncodedQuery(gr.valid_from.getDisplayValue(), gr.valid_to.getDisplayValue()),
                "sys_id": gr.getUniqueValue()
            };
            return rotationSchedule;
        }

        return null;
    },

    createDateEncodedQuery: function(min_date, max_date) {
        return "sys_created_on>=javascript:gs.dateGenerate('" +
            min_date.substring(0, 10) + "','" + min_date.substring(10, 19) +
            "')^sys_created_on<=javascript:gs.dateGenerate('" +
            max_date.substring(0, 10) + "','" + max_date.substring(10, 19) + "')";
    },

    isValidDomain: function(domainSysId) {
        var domainGr = new GlideRecord("domain");
        if (!domainGr.isValid()) return false;
        if (domainSysId == "global") return true;
        domainGr.get(domainSysId);
        if (!domainGr.isValidRecord()) return false;
        return true;
    },

    type: 'DataExtractionUtil'
};
