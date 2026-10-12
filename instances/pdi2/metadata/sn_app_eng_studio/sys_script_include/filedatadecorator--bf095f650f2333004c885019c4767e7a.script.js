var FileDataDecorator = Class.create();

FileDataDecorator.prototype = {

    initialize: function( /* GlideRecord */ fileObjectRecord, /* GlideRecord */ taxonomyDefinitionRecord, /* Object */ referencedData) {
        if (!fileObjectRecord || !taxonomyDefinitionRecord) {
            throw "Invalid taxonomy or file object record";
        }

        this.fileObjectRecord = fileObjectRecord;
        this.taxonomyDefinitionRecord = taxonomyDefinitionRecord;
        this.referencedData = referencedData;
        this.taxonomyEditorRecord = getTaxonomyEditorRecord(fileObjectRecord, taxonomyDefinitionRecord);
        this.taxonomyDetailsScript = getTaxonomyScript(fileObjectRecord, taxonomyDefinitionRecord);
        this.editorDetailsScript = getTaxonomyScript(fileObjectRecord, this.taxonomyEditorRecord);
    },

    decorate: function() {
        this.logTaxonomyEditorOverrides();

        return {
            "application": this.fileObjectRecord.getValue("sys_scope"),
            "description": this.getFileDescriptionFromEditor() || this.getFileDescriptionFromTaxonomy(),
            "details": getFileObjectDetails(this.fileObjectRecord, this.taxonomyDefinitionRecord),
            "editor_url": this.getFileObjectEditorUrl(),
            "editor_name": (this.taxonomyEditorRecord && this.taxonomyEditorRecord.getValue("name")) || this.taxonomyDefinitionRecord.getValue("table"),
            "generated_by_ai": false, // value is overridden in FileDataBuilder.validateAndDecorateFiles()
            "group_id": this.editorDetailsScript.group_id || this.fileObjectRecord.getUniqueValue(),
            "icon": this.getFileObjectIconFromEditor(),
            "in_review": false, // value is overridden in FileDataBuilder.validateAndDecorateFiles()
            "is_referenced": this.referencedData.isReference,
            "launch_url": this.getFileObjectLaunchUrl(),
            "name": this.getFileNamefromDetails() || this.getFileNameFromEditor() || this.getFileNameFromTaxonomy(),
            "name_value": this.fileObjectRecord.getValue("name"),
            "scope": {
                value: this.fileObjectRecord.getValue("sys_scope"),
                display_value: this.fileObjectRecord.getDisplayValue("sys_scope"),
            },
            "sys_id": this.fileObjectRecord.getValue("sys_id"),
            "taxonomy_category": this.taxonomyDefinitionRecord.getValue("category"),
            "taxonomy_definition": this.taxonomyDefinitionRecord.getValue("sys_id"),
            "type": this.taxonomyEditorRecord && this.taxonomyEditorRecord.getDisplayValue('table_name_string'),
            "updated": ValueDisplayValueModel(this.fileObjectRecord, "sys_updated_on"),
            "updated_by": ValueDisplayValueModel(this.fileObjectRecord, "sys_updated_by"),
        };
    },

    logTaxonomyEditorOverrides: function() {
        if (!this.taxonomyEditorRecord) {
            return;
        }

        var aesUtils = new AesUtils();
        var taxonomyEditor = aesUtils.getObjectFromGlideRecord(this.taxonomyEditorRecord, ['table', 'taxonomy', 'name', 'sys_id']);

        var fileName = this.getFileNameFromEditor() || null;
        var fileDescription = this.getFileDescriptionFromEditor();
        var fileEditorURL = this.getFileObjectEditorUrl();
        var fileLaunchURL = this.getFileObjectLaunchUrl();
        var fileIcon = this.getFileObjectIconFromEditor();

        gs.debug("AES FileDataDecorator: \n" +
            "Object:  " + taxonomyEditor.table + " " + taxonomyEditor.taxonomy + "\n" +
            "Editor:  " + taxonomyEditor.name + " " + taxonomyEditor.sys_id + "\n" +
            "Name:  " + fileName + "\n" +
            "Description:  " + fileDescription + "\n" +
            "Editor URL:  " + fileEditorURL + "\n" +
            "Launch URL:  " + fileLaunchURL + "\n" +
            "Icon:  " + fileIcon
        );
    },

    getFileNamefromDetails: function() {
        if (this.referencedData.taxonomyDetailRecord) {
            return evaluateScript(this.fileObjectRecord, this.referencedData.taxonomyDetailRecord, 'name_override');
        }

        return null;
    },

    getFileNameFromEditor: function() {
        if (this.editorDetailsScript.name) {
            return this.editorDetailsScript.name;
        }

        if (this.taxonomyEditorRecord && this.taxonomyEditorRecord.getValue('record_name_field')) {
            var record_name_field = ValueDisplayValueModel(this.fileObjectRecord, this.taxonomyEditorRecord.getValue('record_name_field'));

            if (validDescription(record_name_field)) {
                return record_name_field.display_value;
            }
        }

        return null;
    },

    getFileNameFromTaxonomy: function() {
        if (this.taxonomyDetailsScript.name) {
            return this.taxonomyDetailsScript.name;
        }

        if (!this.taxonomyDefinitionRecord.getValue('override_name') || gs.nil(this.taxonomyDefinitionRecord.getValue('name_override'))) {
            return getDisplayValue(this.fileObjectRecord, this.taxonomyDefinitionRecord.getValue('name'));
        } else {
            return evaluateScript(this.fileObjectRecord, this.taxonomyDefinitionRecord, 'name_override');
        }
    },

    getFileDescriptionFromEditor: function() {
        if (!this.taxonomyEditorRecord) {
            return null;
        }

        if (this.editorDetailsScript.description) {

            return {
                value: this.editorDetailsScript.description,
                display_value: this.editorDetailsScript.description
            };
        }

        if (this.taxonomyEditorRecord.getValue('record_description_display_type') === "field") {
            var taxonomyDescriptionField = this.taxonomyEditorRecord.getValue('record_description_field');
            var record_description_field = ValueDisplayValueModel(this.fileObjectRecord, taxonomyDescriptionField);

            if (validDescription(record_description_field)) {
                return record_description_field;
            }
        }

        if (this.taxonomyEditorRecord.getValue('record_description_string')) {
            var record_description_string = ValueDisplayValueModel(this.taxonomyEditorRecord, "record_description_string");

            if (validDescription(record_description_string)) {
                return record_description_string;
            }
        }

        return null;
    },

    getFileDescriptionFromTaxonomy: function() {
        if (this.taxonomyDetailsScript.description) {
            return {
                value: this.taxonomyDetailsScript.description,
                display_value: this.taxonomyDetailsScript.description
            };
        }

        if (this.taxonomyDefinitionRecord.getValue('use_description') && this.taxonomyDefinitionRecord.getValue('record_description_display_type') === "field") {
            var taxonomyDescriptionField = this.taxonomyDefinitionRecord.getValue('record_description_field');
            var file_record_description_field = ValueDisplayValueModel(this.fileObjectRecord, taxonomyDescriptionField);
            if (validDescription(file_record_description_field)) {
                return file_record_description_field;
            }
        }

        var file_description = ValueDisplayValueModel(this.fileObjectRecord, "description");
        if (validDescription(file_description)) {
            return file_description;
        }

        var file_short_description = ValueDisplayValueModel(this.fileObjectRecord, "short_description");
        if (validDescription(file_short_description)) {
            return file_short_description;
        }

        return ValueDisplayValueModel(this.taxonomyDefinitionRecord, "description");
    },

    getFileObjectEditorUrl: function() {
        var editorFormat;

        if (!this.taxonomyEditorRecord) {
            editorFormat = this.taxonomyDefinitionRecord.getValue("editor_url");
        } else {
            editorFormat = this.editorDetailsScript.editor_url || this.taxonomyEditorRecord.getValue("editor_url");
        }

        if (!gs.nil(editorFormat)) {
            var editorUrl = getInterpolatedUrl(editorFormat, this.fileObjectRecord);
            var queryParams = {};
            queryParams[CreatorStudioConstants.sysparms.REFERRING_URL] = CreatorStudioConstants.clientParams.REFERRING_URL;
            return UriUtil.createCanonicalizedUri(editorUrl, queryParams);
        }

        return getFormViewUrl(this.fileObjectRecord, this.taxonomyEditorRecord || this.taxonomyDefinitionRecord);
    },

    getFileObjectLaunchUrlFromTaxonomy: function() {
        return this.taxonomyDetailsScript.launch_url || this.taxonomyDefinitionRecord.getValue("launch_url");
    },

    getFileObjectLaunchUrlFromEditor: function() {
        if (!this.taxonomyEditorRecord) {
            return null;
        }

        return this.editorDetailsScript.launch_url || this.taxonomyEditorRecord.getValue("launch_url");
    },

    getFileObjectLaunchUrl: function() {
        var launchFormat = this.getFileObjectLaunchUrlFromEditor() || this.getFileObjectLaunchUrlFromTaxonomy();
        var launchUrl = getInterpolatedUrl(launchFormat, this.fileObjectRecord, this.taxonomyDefinitionRecord);

        return UriUtil.createCanonicalizedUri(launchUrl, {}) || "";
    },

    getFileObjectIconFromEditor: function() {
        if (!this.taxonomyEditorRecord) {
            return null;
        }

        var imageFieldValue = this.taxonomyEditorRecord.getValue("icon");

        return imageFieldValue && ("/" + imageFieldValue + ".iix");
    },

    type: 'FileDataDecorator',
};

function getTaxonomyScript(fileObjectRecord, taxonomyRecord) {
    if (!taxonomyRecord || !taxonomyRecord.advanced_details) {
        return {};
    }

    return evaluateScript(fileObjectRecord, taxonomyRecord, 'details_script');
}

function validDescription(descriptionObj) {
    return descriptionObj.display_value && descriptionObj.value;
}

function evaluateScript( /* GlideRecord */ fileObjectRecord, /* GlideRecord */ recordWithScript, /* String */ fieldName) {
    var evaluator = new GlideScopedEvaluator();
    return evaluator.evaluateScript(
        recordWithScript,
        fieldName, {
            globalFileObjectRecord: fileObjectRecord
        }
    );
}

function getFileObjectDetails(fileObjectRecord, taxonomyDefinitionRecord) {
    var details = {};
    var commaSeparatedDetails = taxonomyDefinitionRecord.getValue("details");
    var fieldNames = !gs.nil(commaSeparatedDetails) ? commaSeparatedDetails.split(',') : [];
    for (i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        var fieldLabel = gs.nil(fileObjectRecord.getElement(fieldName)) ? fieldName : fileObjectRecord.getElement(fieldName).getLabel();
        var detailsObj = {
            "label": fieldLabel,
            "value": "",
            "display_value": ""
        };
        if (AccessValidator.canReadField(fileObjectRecord, fieldName)) {
            detailsObj["value"] = fileObjectRecord.getValue(fieldName);
            detailsObj["display_value"] = fileObjectRecord.getDisplayValue(fieldName);
        }
        details[fieldName] = detailsObj;
    }
    return details;
}

function getFormViewUrl(fileObjectRecord, taxonomyRecord) {
    var tableName = taxonomyRecord.getValue("table");
    var formView = "";
    if (!gs.nil(taxonomyRecord.getElement("form_view")))
        formView = taxonomyRecord.getElement("form_view").getRefRecord().getValue("name") || "";
    var queryParams = {};
    queryParams["sys_id"] = fileObjectRecord.getValue("sys_id");
    queryParams[CreatorStudioConstants.sysparms.VIEW] = formView;
    queryParams[CreatorStudioConstants.sysparms.REFERRING_URL] = CreatorStudioConstants.clientParams.REFERRING_URL;
    return UriUtil.createDefaultTableUri(tableName, queryParams);
}

function getInterpolatedUrl(rawUrl, fileObjectRecord) {
    var interpolatedUrl = rawUrl;
    // Find the ${} parameters embedded in the url
    var interpolatedFieldsRegEx = /\$\{(.*?)}/g;
    var skipEncodeRegex = /skipencode:/i;
    var match = interpolatedFieldsRegEx.exec(rawUrl);
    while (match !== null) {
        var replacementStr = match[0];
        /**
         * If the string contains 'skipencode:', we will not call gs.urlEncode.
         * This is required if we want to include slashes in a path param and want
         * that param to extend the url.
         *
         * Ex. launch_url: '/now/${skipencode:path}'
         *     with encoding: '/now/uxf%2Fdemo'
         *.    without encoding: '/now/uxf/demo'
         */
        var skipEncode = match[1].search(skipEncodeRegex) !== -1;
        var interpolatedFieldName = match[1].replace(skipEncodeRegex, '');
        if (AccessValidator.canReadField(fileObjectRecord, interpolatedFieldName)) {
            // TODO: Do we need an canRead() check here for the value?
            var interpolatedFieldValue = fileObjectRecord.getValue(interpolatedFieldName);
            if (!skipEncode) {
                interpolatedFieldValue = gs.urlEncode(interpolatedFieldValue);
            }
            interpolatedUrl = interpolatedUrl.replace(replacementStr, interpolatedFieldValue);
        } else {
            gs.info("Field '" + interpolatedFieldName + "' could not be found'");
        }
        match = interpolatedFieldsRegEx.exec(rawUrl);
    }
    return interpolatedUrl;
}

function getDisplayValue(record, fieldName) {
    return AccessValidator.canReadField(record, fieldName) ? record.getDisplayValue(fieldName) : "";
}

function getTaxonomyEditorRecord( /* GlideRecord */ fileObjectRecord, /* GlideRecord */ taxonomyDefinitionRecord) {
    var taxonomySysId = taxonomyDefinitionRecord.getUniqueValue();

    var aesTaxonomyEditorGR = new GlideRecord('sn_app_eng_studio_taxonomy_editor');
    aesTaxonomyEditorGR.addQuery('taxonomy', taxonomySysId);
    aesTaxonomyEditorGR.orderBy('order');
    aesTaxonomyEditorGR.query();
    while (aesTaxonomyEditorGR.next()) {
        if (aesTaxonomyEditorGR.getValue('advanced_condition') === '1') {
            if (evaluateScript(fileObjectRecord, aesTaxonomyEditorGR, 'condition_script')) {
                return aesTaxonomyEditorGR;
            }
        } else {
            var condition = aesTaxonomyEditorGR.getValue('condition');

            if (!condition || GlideFilter.checkRecord(fileObjectRecord, condition)) {
                return aesTaxonomyEditorGR;
            }
        }
    }
    return null;
}
