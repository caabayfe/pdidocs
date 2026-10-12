gs.include("PrototypeServer");
gs.include("AbstractList");

var SysForm = Class.create();

SysForm.prototype = Object.extendsObject(AbstractList, {

  SYS_UI_FORM : 'sys_ui_form',

  get : function() {
     var answer = this.getForm();
     if (answer != this.NOT_FOUND_ID)
        return answer;
      
     if (this.view == this.defaultViewID)
        return answer;

     // specific form not found, check for a section
     var section = new SysSection(this.tableName, this.view, this.viewName);
     answer = section.getSectionForTable(this.tableName);
     if (answer != null)
        return this.NOT_FOUND_ID;

     // Section was not found so see if we have a default form
     this.view = this.defaultViewID;
     return this.getForm();
  },

  getResolvedView: function() {
     return this.resolvedView;
  },

  getForm : function() {
     this.resolvedView = null;
     var gr = new GlideRecord(this.SYS_UI_FORM);
     gr.addQuery(this.NAME, this.tableName);
     gr.addQuery(this.VIEW, this.view);
     this.domainQuery(gr, this.domainID);
     if (!gr.next())
        return this.NOT_FOUND_ID;
     this.resolvedView = new GlideScriptViewManager(this.view, true).getViewName();
     return gr.sys_id.toString();
  },

  z : function() {
  }

});
