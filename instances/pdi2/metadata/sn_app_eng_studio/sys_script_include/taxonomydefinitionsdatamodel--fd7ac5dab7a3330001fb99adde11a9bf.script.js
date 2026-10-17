var TaxonomyDefinitionsDataModel = Class.create();
TaxonomyDefinitionsDataModel.prototype = {
    taxonomyTable: "sn_app_eng_studio_taxonomy",

    initialize: function() {},

    generate: function() {
        var taxonomyDefinitions = [];
        var taxonomy = new GlideRecord(this.taxonomyTable);
        taxonomy.query();

        if (!taxonomy.hasNext())
            return taxonomyDefinitions;

        while (taxonomy.next()) {
            taxonomyDefinitions.push(this._getTaxonomy(taxonomy));
        }

        return taxonomyDefinitions;
    },

    generateSingleTaxonomy: function(taxonomySysId) {
        var taxonomy = new GlideRecord(this.taxonomyTable);
        taxonomy.get('sys_id', taxonomySysId);

        if (!taxonomy) {
            return null;
        }

        return this._getTaxonomy(taxonomy);
    },


    // Expects a taxonomy record
    _getTaxonomy: function(taxonomy) {
        var tableName = taxonomy.getValue("table") || "";
        var tableNameOverride = taxonomy.getDisplayValue("table_name_override") || "";
        var singleTaxonomy = {
            "sys_id": taxonomy.getUniqueValue(),
            "table_name": tableName,
            "type": this._getTableType(tableName, tableNameOverride),
            "description": this._getDescription(taxonomy.getValue("use_description"), ValueDisplayValueModel(taxonomy, "description"), tableName),
            "taxonomy_category": ValueDisplayValueModel(taxonomy, "category"),
            "creator_url": this._getCreatorUrl(taxonomy.getValue("creator_url"), tableName),
            "help_text": taxonomy.getDisplayValue("help_text") || "",
            "icon": this._getImageUrl(taxonomy, "icon")
        };

        return singleTaxonomy;
    },

    _getTableType: function(tableName, tableNameOverride) {
        if (tableNameOverride)
            return tableNameOverride;

        var sysDbObject = new GlideRecord("sys_db_object");
        if (!sysDbObject.get("name", tableName))
            return "";

        return sysDbObject.getDisplayValue("label") || "";
    },

    _getDescription: function(useDescription, description, tableName) {
        if (useDescription == 1)
            return description || "";

        var sysDocumentation = new GlideRecord("sys_documentation");
        sysDocumentation.addQuery("name", tableName);
        sysDocumentation.addNullQuery("element");
        sysDocumentation.query();

        if (!sysDocumentation.next())
            return "";

        return ValueDisplayValueModel(sysDocumentation, "help") || "";
    },

    _getCreatorUrl: function(creatorUrl, tableName) {
        return !gs.nil(creatorUrl) ? UriUtil.createCanonicalizedUri(creatorUrl) : this._getDefaultTableUri(tableName);
    },

    _getDefaultTableUri: function(tableName) {

        var queryParams = {
            "sys_id": "-1",
            "sysparm_referring_url": this._createReferringUrl(tableName)
        };

        return UriUtil.createDefaultTableUri(tableName, queryParams);
    },

    _createReferringUrl: function(tableName) {

        // Have to do some building of the URL by hand because of the client side interpolation tokens
        var baseReferringUrl = UriUtil.createDefaultTableUri(tableName, {}, false);

        baseReferringUrl = gs.urlEncode(baseReferringUrl);
        baseReferringUrl = baseReferringUrl + gs.urlEncode("?sys_id=$sys_id_ui11");
        baseReferringUrl = baseReferringUrl + gs.urlEncode("&sysparm_nameofstack=") + "{client:StackName}";
        baseReferringUrl = baseReferringUrl + gs.urlEncode("&sysparm_transaction_scope=") + "{client:ScopeId}";

        return baseReferringUrl;

    },

    _getImageUrl: function(taxonomy, imageColumn) {
        var _imageAttachmentValidator = new ImageAttachmentValidator();
        var imageFieldValue = taxonomy.getValue(imageColumn);
        if (!gs.nil(imageFieldValue)) {
            // ensure that even though there is a sys_id on the image field, that that image is not deleted from 
            // sys_attachment
            if (_imageAttachmentValidator.attachmentExists(taxonomy.getUniqueValue(), imageColumn))
                return "/" + imageFieldValue + ".iix";
        }


        // if the image for the associated field is not included in the taxonomy, 
        // use the associated taxonomy category's image
        var taxonomyCategory = new GlideRecord("sn_app_eng_studio_taxonomy_category");

        // if the category doesn't exist, then return back an empty string (the UI will then use a default image)
        if (!taxonomyCategory.get(taxonomy.getValue("category")))
            return "";

        var imageByColumnInTaxCat = taxonomyCategory.getValue(imageColumn);
        // An icon may not exist in the Taxonomy Category table -- in this case, return an empty string.
        // The UI for creator studio will render a default image in this case.
        if (!gs.nil(imageByColumnInTaxCat)) {
            // ensure that even though there is a sys_id on the image field in the category table, that that image 
            // is not deleted from sys_attachment
            if (_imageAttachmentValidator.attachmentExists(taxonomyCategory.getUniqueValue(), imageColumn))
                return "/" + imageByColumnInTaxCat + ".iix";
        }

        return "";
    },

    type: 'TaxonomyDefinitionsDataModel'
};
