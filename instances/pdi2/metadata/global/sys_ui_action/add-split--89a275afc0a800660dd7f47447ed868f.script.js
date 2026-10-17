addSplitFunction();

function addSplitFunction() {
   var gr = new GlideRecord('wf_activity_variable');
   gr.addQuery('name', current.name);
   gr.addQuery('element', '.split');
   gr.query();
   if (gr.next()) {
      // already exists
      gs.addErrorMessage("The Split already exists - only one split is allowed.");
   } else {
      gr.initialize();
      gr.model = current.model;
      gr.element = '.split';
      gr.label = 'Split';
      gr.order = current.order + 10;
      gr.insert(); 
   }
}
