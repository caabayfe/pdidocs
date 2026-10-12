gs.include("PrototypeServer");
gs.include("AbstractList");

var SysSection = Class.create();

SysSection.prototype = Object.extendsObject(AbstractList, {

	SYS_METADATA: 'sys_metadata',
	SYS_UI_SECTION: 'sys_ui_section',
	SYS_UI_ELEMENT: 'sys_ui_element',
	HEADER: 'header',
	TITLE: 'title',

	get: function() {
		this.targetTable = this.tableName;
		var id = this.getSection();
		if (id != null)
			return id;

		if (this.view == this.defaultViewID)
			return null;

		this.targetTable = this.tableName;
		this.view = this.defaultViewID;
		return this.getSection();
	},

	getResolvedView: function() {
		return this.resolvedView;
	},

	getSectionForTable: function(tableName) {
		this.targetTable = tableName;
		return this.getSection();
	},

	getSection: function() {
		this.resolvedView = null;
		var list = this._getViewList();
		for (var i = 0; i < list.length; i++) {
			var viewID = list[i];
			var gr = new GlideRecord(this.SYS_UI_SECTION);
			gr.addQuery(this.NAME, this.targetTable);
			gr.addQuery(this.VIEW, viewID);
			gr.orderByDesc(this.TITLE);
			this.domainQuery(gr, this.domainID);
			if (gr.next()) {
				this.resolvedView = new GlideScriptViewManager(viewID, true).getViewName();
				this.section = gr;
				return gr.getUniqueValue();
			}
		}

		return this.checkParents();
	},

	// It is possible to have multiple views provided when a popup is being requested on a
	// form that already has a view.  In this case we want to first check for a pop_up view
	// and if that fails then we look for the view that matches the view displaying the
	// form.
	_getViewList: function() {
		if (this.view == this.defaultViewID)
			return [this.view];

		if (this.viewName == 'sys_popup')
			this.isPopUp = true;

		var views = this.viewName.split(",");
		if (views.length == 1)
			return [this.view];

		var answer = [];
		for (var i = 0; i < views.length; i++) {
			var viewName = views[i];
			if (viewName == 'sys_popup')
				this.isPopUp = true;

			answer.push(new GlideScriptViewManager(viewName).getID());
		}

		return answer;
	},

	checkParents: function() {
		if (this.targetTable != this.tableName)
			return null;

		var list = this.getParents();
		if (list == null)
			return null;

		for (var i = 0; i < list.length; i++) {
			if (list[i] == this.SYS_METADATA)
				continue; // Special case.  We don't ever want to copy from sys_metadata

			this.targetTable = list[i];
			var answer = this.getSection();
			if (answer != null)
				return this._clone();
		}

		return null;
	},

	_clone: function() {
		if (this._hasForm(this.targetTable, this.view) == true) {
			//create all parent table views
			this._copyForm();
			return this.getSection();
		} else {
			var fromSysid = this.section.getUniqueValue();
			var ss = new GlideSysSection(this.tableName);
			var toSysid = ss.copySection(this.section);
			if (toSysid === null)
				return;

			this._copySectionElements(toSysid, fromSysid);
			return toSysid;
		}
	},

	_hasForm: function(tableName, viewName) {
		var gr = new GlideRecord('sys_ui_form');
		gr.addQuery('name', tableName);
		if (viewName != null)
			gr.addQuery('view', viewName);
		gr.query();

		return gr.next();
	},

	_copyForm: function() {
		var grTargetform = new GlideRecord('sys_ui_form');
		grTargetform.addQuery('name', this.targetTable);
		grTargetform.query();

		while (grTargetform.next()) {
			if (this._hasForm(this.tableName, grTargetform.view) == false) {
				var frmSys = grTargetform.getUniqueValue();
				var scm2m = new GlideRecord("sys_ui_form_section");
				scm2m.addQuery("sys_ui_form", frmSys);
				scm2m.addNotNullQuery("sys_ui_section");
				scm2m.query();

				var glideform = new GlideSysForms(this.tableName);
				var nf_id = glideform.createFormInGlobalDomain(grTargetform.view);
				while (scm2m.next()) {
					scm2m.sys_ui_form = nf_id;
					var nsc_id = this._copyFormSection(scm2m.sys_ui_section, grTargetform.view);

					if (!nsc_id)
						continue;
					scm2m.sys_ui_section = nsc_id;
					scm2m.insert();
				}

				//Regenerate update payload of sys_ui_form_sections
				glideform.save();
			}
		}

	},

	_copyFormSection: function(id, view) {
		var sc = new GlideRecord("sys_ui_section");
		if (!sc.get(id))
			return;

		var ss = new GlideSysSection(this.tableName);
		var nsc_id = ss.copySection(sc);
		if (nsc_id === null)
			return;

		this._copySectionElements(nsc_id, id);

		//generate newly created sys_ui_section update payload
		var newSc = new GlideRecord("sys_ui_section");
		if (newSc.get(nsc_id)) {
			var saver = new GlideUpdateManager2();
			saver.saveRecord(newSc);
		}

		return nsc_id;
	},

	_copySectionElements: function(toID, fromID) {
		var gr = new GlideRecord(this.SYS_UI_ELEMENT);
		gr.addQuery(this.SYS_UI_SECTION, fromID);
		gr.query();
		while (gr.next()) {
			gr.sys_ui_section = toID;
			if (gr.getValue("type") == "annotation") {
				var newAnnotationID = this._cloneAnnotation(gr.getValue("element"));
				gr.setValue("element", newAnnotationID);
			}
			gr.insert();
		}
	},

	_cloneAnnotation: function(id) {
		var annotationGR = new GlideRecord("sys_ui_annotation");
		if (!annotationGR.get(id))
			return id;

		return annotationGR.insert();
	},

	z: function() {}

});
