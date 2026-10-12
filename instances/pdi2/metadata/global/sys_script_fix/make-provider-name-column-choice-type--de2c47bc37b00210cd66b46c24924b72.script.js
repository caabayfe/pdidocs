// Define the table name and the field name
var tableName = 'mp_provider_detail';
var providerDetailName = 'provider_detail_name';

// Start a GlideRecord query to find the dictionary entry
var provDetailDictGR = new GlideRecord('sys_dictionary');
provDetailDictGR.addQuery('name', tableName);
provDetailDictGR.addQuery('element', providerDetailName);
provDetailDictGR.query();

if (provDetailDictGR.next()) {
    provDetailDictGR.mandatory = true;
    provDetailDictGR.update();
}

var fieldName = 'provider_name';

// Change the column type in the database
var gr = new GlideRecord(tableName);
if (gr.isValidField(fieldName)) {
    // Start a GlideRecord query to find the dictionary entry
    var grDictionary = new GlideRecord('sys_dictionary');
    grDictionary.addQuery('name', tableName);
    grDictionary.addQuery('element', fieldName);
    grDictionary.query();
    // If the dictionary entry exists
    if (grDictionary.next()) {
        // Update the 'type' field to 'choice'
        grDictionary.setValue('internal_type', 'choice');
        grDictionary.mandatory = true;
        grDictionary.choice = '1';
        // Update the dictionary entry
        grDictionary.update();
        gs.info("Provider Name column changed successfully to choice type.");
        if (GlidePluginManager.isActive("com.sn.documents.onedrive")) {
            // Add default choice option
            var odValue = 'onedrive'; // Replace with your default choice value
            var odLabel = 'OneDrive'; // Replace with your default choice label
            var choiceGR = new GlideRecord("sys_choice");
            choiceGR.initialize();
            choiceGR.setValue('name', tableName);
            choiceGR.setValue('element', fieldName);
            choiceGR.setValue('label', odLabel);
            choiceGR.setValue('sequence', '1');
            choiceGR.setValue('value', odValue);
            // Update the choice list
            choiceGR.insert();
            gs.info("Successfully added " + odValue + " choice type to provider_name column.");
        }

        if (GlidePluginManager.isActive("com.sn.docs.gdrive")) {
            // Add default choice option
            var gdValue = 'googledrive'; // Replace with your default choice value
            var gdLabel = 'GoogleDrive'; // Replace with your default choice label
            choiceGR = new GlideRecord("sys_choice");
            choiceGR.initialize();
            choiceGR.setValue('name', tableName);
            choiceGR.setValue('element', fieldName);
            choiceGR.setValue('label', gdLabel);
            choiceGR.setValue('sequence', '2');
            choiceGR.setValue('value', gdValue);
            // Update the choice list
            choiceGR.insert();
            gs.info("Successfully added " + gdValue + " choice type to provider_name column.");
        }
        // Clear the metadata cache
        GlideSystem.clearMetadataCache(tableName);
    } else
        gs.error("Dictionary entry not found for table: " + tableName + " and field: " + fieldName);
}

var detailGR = new GlideRecord(tableName);
detailGR.query();
while (detailGR.next()) {
    var provName = detailGR.getValue(fieldName);
    if (provName &&
        (provName.toLowerCase().includes("onedrive") || provName.toLowerCase().includes("sharepoint") ||
            provName.toLowerCase().includes("one drive"))) {
        detailGR.setValue(fieldName, "onedrive");
        detailGR.update();
    } else if (provName &&
        (provName.toLowerCase().includes("googledrive") || provName.toLowerCase().includes("google drive"))) {
        detailGR.setValue(fieldName, "googledrive");
        detailGR.update();
    }
}
