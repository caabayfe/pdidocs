function transform(inputs) {
    var gr = new GlideRecord('sys_script_include');
    gr.get('014115813720200003c78c00dfbe5dff');
    var eval_midPackage = new GlideScopedEvaluator().evaluateScript(gr, 'script');

    var gr1 = new GlideRecord('sys_script_include');
    gr1.get('710241413720200003c78c00dfbe5d5d');
    var eval_midPackageUriFactory = new GlideScopedEvaluator().evaluateScript(gr1, 'script');

    var buildstamp = gs.getProperty('mid.buildstamp');
    var mid_package = new global.MIDPackage(inputs.name, buildstamp, inputs.os_type, inputs.arch);
    var uri = new global.MIDPackageUriFactory(mid_package, 'attachment_download').getUris(1)[0];

    if (inputs.packName == 'linux64RPMSign')
        uri = uri.replace('.rpm', '-rpm.zip');
    else if (inputs.packName == 'linux64DEBSign')
        uri = uri.replace('.deb', '-deb.zip');

    return uri;
}
