var g_hierarchy;
if (typeof showit != "undefined") {        
	addRenderEvent(GHchartOnload);
	addUnloadEvent(GHchartUnload);
}
        
function GHchartOnload() {
        var gh_attributes_split = generic_hierarchy_attributes.split(',');
        var processor = 'GenericHierarchyProcessor';
        g_hierarchy = new GenericHierarchy('diagram_area', processor);
        g_hierarchy.load(gh_attributes_split);
}

function GHchartUnload() {
        if (g_hierarchy)
             g_hierarchy.destroy();
}
