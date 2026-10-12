var currentProfileId = current.getValue('profile');
var relevancyGr = new GlideRecord('ais_search_profile_relevancy_model');
relevancyGr.addQuery('profile', currentProfileId);
relevancyGr.addQuery('current', true);
relevancyGr.setValue('current', false);
relevancyGr.updateMultiple();

current.setValue('current', ture);
current.update();
action.setRedirectURL(current);
