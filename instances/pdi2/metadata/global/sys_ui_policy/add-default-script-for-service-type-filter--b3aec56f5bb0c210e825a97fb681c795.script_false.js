function onCondition() {
    var scriptValue = "try {\n" +
            "   this.process();\n" +
            "} catch(err) {\n" +
            "   this.parentSkipAll = false;\n" +
            "   this.parentSysClassName = null;\n" +
            "   this.parentTypesToAdd = [];\n" +
            "   this.parentTypesToRemove = [];\n" +
            "   this.childSkipAll = false;\n" +
            "   this.childSysClassName = null;\n" +
            "   this.childSTypesToAdd = [];\n" +
            "   this.childSTypesToRemove = [];\n" +
            "}\n" +
            "var rtrnObj = {\n" +
            "   'parent' : {\n" +
            "       'skipAll' : this.parentSkipAll,\n" +
            "       'sysClassName' : this.parentSysClassName,\n" +
            "       'typesToAdd' : this.parentTypesToAdd,\n" +
            "       'typesToRemove' : this.parentTypesToRemove\n" +
            "       },\n" +
            "   'child' : {\n" +
            "       'skipAll' : this.childSkipAll,\n" +
            "       'sysClassName' : this.childSysClassName,\n" +
            "       'typesToAdd' : this.childSTypesToAdd,\n" +
            "       'typesToRemove' : this.childSTypesToRemove\n" +
            "       }\n" +
            "   };\n" +
            "rtrnObj;\n" +
            "\n" +
            "// overwrite default values, if needed\n" +
            "// note input map is called filterInput and contains these keys:\n" +
            "// relationType, parent, child\n" +
            "// fields parentClass and childClass may appear in map if already calculated by previous filter\n" +
            "function process() {\n" +
            "   this.parentSkipAll = false;\n" +
            "   this.parentSysClassName = null;\n" +
            "   this.parentTypesToAdd = [];\n" +
            "   this.parentTypesToRemove = [];\n" +
            "   this.childSkipAll = false;\n" +
            "   this.childSysClassName = null;\n" +
            "   this.childSTypesToAdd = [];\n" +
            "   this.childSTypesToRemove = [];\n" +
            "   //write your code here\n" +
            "}";

	g_form.setValue('script',scriptValue);
}
