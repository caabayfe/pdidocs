if (!pm.isZboot()) {
    // ULT
    addChoiceRecord("ml_labeled_data", "label_type", "Irrelevant to this model", "irrelevant_to_this_model", 5);
    updateChoiceRecordLabel("ml_labeled_data", "label_type", "Irrelevant to any model", "irrelevant");

    addChoiceRecord("ml_labeled_data", "source", "Manual", "manual", 3);
    addChoiceRecord("ml_labeled_data", "source", "Issue Auto Resolution", "issue_auto_resolution", 4);
    addChoiceRecord("ml_label_candidate", "source", "Issue Auto Resolution", "issue_auto_resolution", 3);
}


/**
 * Adds a new choice record for  records with the same table name and choice value,
 * for all languages. Translations of choice records have different labels, but share 
 * the same choice value.
 * @param {string} tableName	the name of the table that the choice record is associated with
 * @param {string} element		the name of the table element with choices
 * @param {string} choiceLabel	the label of the choice
 * @param {string} choiceValue	the value of the choice
 * @return {void}
 */
function addChoiceRecord(tableName, element, choiceLabel, choiceValue, sequence) {
    var choiceGr = new GlideRecord("sys_choice");
    choiceGr.initialize();
    choiceGr.setValue("element", element);
    choiceGr.setValue("name", tableName);
    choiceGr.setValue("label", choiceLabel);
    choiceGr.setValue("value", choiceValue);
    choiceGr.setValue("sequence", sequence);
    choiceGr.setValue("language", "en");
    var choiceId = choiceGr.insert();

    if (gs.nil(choiceId))
        gs.error("Error inserting new choice record for element {0} with choice value {1} on table {2}", element, choiceValue, tableName);

    gs.info("Choice value {0} has successfully been inserted for element {1} on table {2}", choiceValue, element, tableName);
}

function updateChoiceRecordLabel(tableName, element, choiceLabel, choiceValue) {
    var choiceGr = new GlideRecord("sys_choice");
    choiceGr.addQuery("name", tableName);
    choiceGr.addQuery("element", element);
    choiceGr.addQuery("value", choiceValue);
    choiceGr.query();
    if (choiceGr.next()) {
        choiceGr.setValue("label", choiceLabel);
        choiceGr.update();
    }

    gs.info("Choice value {0} for element {1} on table {2} has choice label updated to {3}", choiceValue, element, tableName, choiceLabel);
}
