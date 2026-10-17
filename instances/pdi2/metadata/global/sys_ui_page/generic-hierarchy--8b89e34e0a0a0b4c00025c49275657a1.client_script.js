var g_hierarchy;

addRenderEvent(GHchartOnload);
addUnloadEvent(GHchartUnload);

function GHchartOnload() {
        var gh_attributes_split = generic_hierarchy_attributes.split(',');
        var processor = 'GenericHierarchyProcessor';
        for (var i=0; i< gh_attributes_split.length; i++) {
           var attribute = gh_attributes_split[i];
           if (attribute.startsWith("processor=")){
              var equals = attribute.indexOf("=");
              if (equals > -1)
                 processor = attribute.substring(equals+1);
           }
        }
        g_hierarchy = new GenericHierarchy('diagram_area', processor);
        g_hierarchy.load(gh_attributes_split);
}

function GHchartUnload() {
        if (g_hierarchy)
             g_hierarchy.destroy();
}
