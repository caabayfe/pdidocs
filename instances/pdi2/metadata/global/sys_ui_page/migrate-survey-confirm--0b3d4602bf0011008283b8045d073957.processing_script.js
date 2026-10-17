/*
 * Script that takes the UI Page's parameters and calls a Script Include with them 
 * to perform the real actions.
 */
// Get the parameters from form; assessable_id may be null
var survey = request.getParameter("survey_id");

// Call migrate script
var migrateScript = new MigrateSurveyToAssessment();
migrateScript.migrateSurvey(survey);

// Get the URL and return browser to calling location
var urlOnStack = GlideSession.get().getStack().bottom();
response.sendRedirect(urlOnStack);
