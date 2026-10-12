var files = [
    'pa_scripts_efb9db72531403000d620d0323dc3469.xml',
];
for (var i=0; i<files.length; i++)
    sn_applyonce.ApplyOnce.allowOneMoreUpdate(files[i]);
gs.info("Assessment Core Benchmark apply once API called");
