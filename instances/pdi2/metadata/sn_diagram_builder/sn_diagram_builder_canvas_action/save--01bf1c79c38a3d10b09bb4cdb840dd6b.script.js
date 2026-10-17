(function(instance) {
    var instanceGr = new DiagramInstanceUtils(instance.instance.getUniqueValue(), instance.diagramJSON);
    instanceGr.save();

})(instance);
