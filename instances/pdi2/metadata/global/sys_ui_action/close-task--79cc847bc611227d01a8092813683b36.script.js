function closeTask(){
	g_form.setValue('state', 3);
	//Call the UI Action and skip the 'onclick' function
	gsftSubmit(null, g_form.getFormElement(), 'close_sc_task');
}
//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
   updateTask();

function updateTask(){
current.state = 3;
current.update();
}
