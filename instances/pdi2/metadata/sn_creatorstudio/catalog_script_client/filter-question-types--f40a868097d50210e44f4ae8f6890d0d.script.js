function onLoad() {
    // Not all question types have a subtype. Heading is an example of that
    var subType = g_form.getValue('sub_type');
    var unavailableQuestions = g_form.getValue('unavailable_questions_helper') || "[]";
    var parsedUnavailableQuestions = JSON.parse(unavailableQuestions);

    // Don't remove unavailable questions from the content type menu 
    // if the type does not have a subtype or there are no unavailableQuestions to remove
    if (!subType || !parsedUnavailableQuestions.length)
        return;

    parsedUnavailableQuestions.forEach(function(type) {
        g_form.removeOption('sub_type', type);
    });
}
