var migrationSuccess = true;
try {
    migrateData();
} catch (e) {
    migrationSuccess = false;
}

if (migrationSuccess) {
    var prop = new GlideRecord("sys_properties");
    prop.addQuery("name", "glide.sc.masked_migration_success");
    prop.setWorkflow(false);
    prop.setUseEngines(false);
    prop.query();
    if (prop.next()) {
        prop.setValue("value", "true");
        prop.update();
    }
}

function migrateData() {
    var options = new GlideRecord("sc_item_option");
    options.addEncodedQuery("item_option_new.type=25^valueISNOTEMPTY");
    options.setWorkflow(false);
    options.setUseEngines(false);
    options.query();

    while (options.next()) {
        updateGr(options, "item_option_new");
    }

    var quesAns = new GlideRecord("question_answer");
    quesAns.addEncodedQuery("question.type=25^valueISNOTEMPTY");
    quesAns.setWorkflow(false);
    quesAns.setUseEngines(false);
    quesAns.query();

    while (quesAns.next()) {
       updateGr(quesAns, "question");
    }

    //Making the script action inactive 

    var gr = new GlideRecord("sysevent_script_action");
    gr.get("675eb9ca37802a10a88832a254924b64");
    gr.active = false;
    gr.update();
}

function updateGr(gr, fieldName) {
    var value = gr.getValue("value");
    var question = GlideappQuestion.getQuestion(gr.getValue(fieldName));
    var decrptValue = question.decrypt(value);
    question.setValue(decrptValue); // this will encrypt the value
    gr.setValue("value", question.getValue()); // populating with the newly encrypted value.
    gr.update();
}
