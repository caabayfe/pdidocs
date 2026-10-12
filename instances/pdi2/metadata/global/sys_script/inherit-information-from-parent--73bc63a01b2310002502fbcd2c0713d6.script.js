var parentGr = new GlideRecord('alm_asset');
parentGr.get(current.parent);
(new AssetandCI()).inheritInfoFromParentAsset(current, parentGr);
