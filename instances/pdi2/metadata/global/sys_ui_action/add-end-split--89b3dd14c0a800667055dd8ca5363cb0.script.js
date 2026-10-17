addEndSplitFunction();

function addEndSplitFunction() {
   var gr = new GlideRecord('wf_activity_variable');
   gr.addQuery('name', current.name);
   gr.addQuery('element', '.end_split');
   gr.query();
   if (gr.next()) {
      // already exists
      gs.addErrorMessage("The End Split already exists - only one split is allowed.");
   } else {
      gr.initialize();
      gr.model = current.model;
      gr.element = '.end_split';
      gr.label = 'End Split';
      gr.order = current.order + 10;
      gr.insert(); 
   }
}
