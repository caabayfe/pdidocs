if (gs.hasRole("assessment_admin"))
    // don't remove new button
    answer = false;
else if (gs.hasRole("survey_creator")) {
    if ((parent.survey_owners + "").indexOf(gs.getUserID()) !== -1) {
        // don't remove new button
        answer = false;
    } else
        // remove new button
        answer = true;
} else
    answer = true;
answer;
