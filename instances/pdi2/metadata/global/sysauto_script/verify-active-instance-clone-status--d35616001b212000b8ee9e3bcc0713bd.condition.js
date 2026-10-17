// Do not run unless we have at least one active clone 

var gr = new GlideRecord("clone_instance");
gr.addQuery("state", "active");
gr.query();
gr.next();
