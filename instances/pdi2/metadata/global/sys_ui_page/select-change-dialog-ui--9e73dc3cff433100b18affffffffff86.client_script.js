function actionOK() {
	var glideAjax = new GlideAjax("AssociateCIsToChangeUtil");
	glideAjax.addParam("sysparm_name", "addManyRelatedAjax");
	glideAjax.addParam("sysparm_task_sys_id", $("change_sysid").value);
	glideAjax.addParam("sysparm_selected_cis", $("selected_cis").value);
	glideAjax.getXMLAnswer(function(answer) {
		CustomEvent.fireAll("chg.addToExisting.associate", answer);
	});
}

function actionCancel() {
	CustomEvent.fireAll("chg.addToExisting.cancel");
}

// This code can be deleted once PRB626738 is fixed.
function invokeWorkaroundForPRB626738() {
    AJAXReferenceCompleter.addMethods({
        setDropDownSize: function() {
            // This is an almost exact copy of code at AJAXReferenceCompleter->setDropDownSize.
            var e, mLeft, mTop;

            // Use jquery if it is available - it should be except in old UI with UI11 turned off       
            if (window.$j) {
                e = $j(this.element);
                var offset = e.offset();
                var parent = $j(getFormContentParent());
                var parentOffset = parent.offset();
                var parentScrolltop = 0; // This line is different from actual code.
                mLeft = offset.left - parentOffset.left + 1 + 'px';
                mTop = offset.top - parentOffset.top + 1 + (e.outerHeight() - 1) + parentScrolltop + 'px';
            } else {
                e = this.element;
                mLeft = grabOffsetLeft(e) + "px";
                mTop = grabOffsetTop(e) + (e.offsetHeight - 1) + "px";
            }
            var mWidth = this.getWidth();

            var dd = this.dropDown;
            if (dd.offsetWidth > parseInt(mWidth))
                mWidth = dd.offsetWidth;

            this.setTopLeft(dd.style, mTop, mLeft);
            this.setTopLeft(this.iFrame.style, mTop, mLeft);
            this.setWidth(mWidth);
        }
    });
}

if (window.$j) {
    invokeWorkaroundForPRB626738();
}
