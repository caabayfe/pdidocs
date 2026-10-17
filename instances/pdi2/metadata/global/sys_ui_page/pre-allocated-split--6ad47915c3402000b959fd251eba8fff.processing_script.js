if ('false' == cancelled) {
   gs.include('PreAllocatedAssets');
   var paa = new PreAllocatedAssets();
   var sys_id = paa.splitRecord(asset, parseInt(split_quantity));
   response.sendRedirect('alm_asset.do?sys_id=' + sys_id);
}
