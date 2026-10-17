function transform(input) {
    var records = input.graphqlData.data.snKmWsUib.relatedContent.getRelatedArticles;
	var transformLinks = input.transformLinks;
    var externalContentLabel = gs.getMessage(gs.getProperty('sn_km_intg.glide.knowman.external.ui_label_for_external_content', 'External Content')) || gs.getMessage('External Content');


    var getFieldObject = function(field) {
        var obj = {
            tooltip: field.label,
            type: "string",
            text: field.displayValue,
            icon: ""
        };

        switch (field.name) {
            case "rating":
                obj.type = "rating";
				obj.screenReaderText = gs.getMessage("Article has average rating - {0} out of 5 stars",obj.text? obj.text: '0');
                obj.tooltip = field.label + ' ' + field.displayValue;
                break;

            case "workflow_state":
                obj.text = gs.getMessage("{0} State",obj.text);
                break;

            case "sys_view_count":
                obj.text = field.displayValue == 1 ? gs.getMessage("{0} View",obj.text) : gs.getMessage("{0} Views",obj.text);
				obj.screenReaderText = field.displayValue == 1? gs.getMessage("Article has {0} view", field.displayValue) : gs.getMessage("Article has {0} views", field.displayValue);
                break;
				
			case "author":
				if(obj.text)
					obj.screenReaderText = gs.getMessage("Authored by {0}", obj.text);
				break;

            case "external":
                if (field.value == "true")
                    obj.text = externalContentLabel;
                else
                    return null;
                break;

            default:
                if (field.type == "glide_date" || field.type == "glide_date_time") {
                    obj.type = "timeago";
                    obj.text = field.value;
					obj.screenReaderText = gs.getMessage("updated");
                }
        }
        return obj;
    };

    var output = [];

    records.forEach(function(rec) {
        var secondaryFields = [];
        rec.secondaryFields.forEach(function(item) {
            var field = getFieldObject(item);
            if (field != null) {
                secondaryFields.push(field);
            }
        });
        output.push({
            icon: "document-outline",
            title: {
                label: rec.displayField,
                href: transformLinks ? "javascript:void(0)" : rec.link,
				variant: 'primary'
            },
            id: rec.id,
            fields: secondaryFields
        });


    });
    return output;
}
