function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || newValue == '') {
      return;
   }
    var questionTypeMap = JSON.parse(g_form.getValue('question_type_helper_variable'));
    var excludedQuestions = [];
    if (this.localStorage.excluded_question_types)
        excludedQuestions = this.localStorage.excluded_question_types.split(',');
        
    var noneChoice = getNoneChoice('content_type');
    var questionType = g_form.getValue('question_type');
    g_form.clearOptions('content_type');
    if (noneChoice)
        g_form.addOption('content_type', noneChoice.value, noneChoice.displayValue);
    var questions = questionTypeMap[questionType];
    for (var index = 0; index < questions.length; index++) {
        if (excludedQuestions.indexOf(questions[index].id + '') == -1)
            g_form.addOption('content_type', questions[index].id, questions[index].value);
    }
    g_form.setValue('content_type', '');
}
function getNoneChoice(field) {
    if (!field)
        return null;

    var choiceField = g_form.$private.getField(field);
    if (!choiceField)
        return null;

    var choices = choiceField.choices || [];
    for (var index = 0; index < choices.length; index++) {
        var val = choices[index].value;
        if (val == '')
            return choices[index];
    }
    return null;
}
