var TaxonomyCategoriesDataModel = Class.create();
TaxonomyCategoriesDataModel.prototype = {
    taxonomyCategoryTable: "sn_app_eng_studio_taxonomy_category",

    initialize: function() {},

    generate: function() {
        var taxonomyCategory = new GlideRecord(this.taxonomyCategoryTable);
        taxonomyCategory.orderBy("order");
        taxonomyCategory.query();

        var taxonomies = [];
        if (!taxonomyCategory.hasNext())
            return taxonomies;

        while (taxonomyCategory.next()) {
            var category = {
                "name": taxonomyCategory.getDisplayValue("category") || "",
                "sys_id": taxonomyCategory.getUniqueValue(),
                "description": ValueDisplayValueModel(taxonomyCategory, "description") || "",
                "help_text": taxonomyCategory.getDisplayValue("help_text") || "",
                "icon": this._getImageUrl(taxonomyCategory, "icon"),
                "order": parseInt(taxonomyCategory.getValue("order"), 10)
            };
            taxonomies.push(category);
        }

        return taxonomies;
    },

    _getImageUrl: function(taxonomyCategory, imageColumn) {
        var imageFieldValue = taxonomyCategory.getValue(imageColumn);
        var _imageAttachmentValidator = new ImageAttachmentValidator();
        if (!gs.nil(imageFieldValue)) {
            // ensure that even though there is a sys_id on the image field, that that image is not deleted from 
            // sys_attachment
            if (_imageAttachmentValidator.attachmentExists(taxonomyCategory.getUniqueValue(), imageColumn))
                return "/" + imageFieldValue + ".iix";
        }

        // An icon/illustration may not exist in the Taxonomy Category table -- in this case, return an empty string.
        // The UI for creator studio will render a default image in this case.
        return "";
    },

    type: 'TaxonomyCategoriesDataModel'
};
