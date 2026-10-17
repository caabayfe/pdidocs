(function executeRule(current, previous /*null when async*/ ) {

    if (current.getValue('label_table') === 'sys_nlu_intent') {
        current.setValue('correct_label', current.correct_label_reference ? NLUExpertFeedbackUtil.getLabelFromReference(current.correct_label_reference) : '');
    }

})(current, previous);
