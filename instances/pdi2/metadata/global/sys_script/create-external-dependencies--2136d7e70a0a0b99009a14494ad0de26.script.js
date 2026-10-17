(function executeRule(current, previous /*null when async*/ ) {
    gs.include('ExternalDependencyGenerator');
    var gen = new ExternalDependencyGenerator(current);
    gen.generate();
})(current, previous);
