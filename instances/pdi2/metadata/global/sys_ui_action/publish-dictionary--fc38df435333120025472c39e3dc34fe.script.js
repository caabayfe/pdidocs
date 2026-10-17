if(typeof window == 'undefined')
	serverSchedule();
 

function serverSchedule(){
   gs.eventQueue('text_index.build_synonym_mapping',current,current.sys_id, null,"text_index");
   gs.addInfoMessage(gs.getMessage("Publishing of dictionary has been scheduled"));
   action.setRedirectURL(current);
}
