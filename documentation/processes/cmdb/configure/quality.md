---
title: Quality and sources - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sysauto_script/7a2c4ba1d7001200c1ed0fbc5e6103ac
    how: read CMDB Health Dashboard - Correctness Score Calculation
    result: inactive
    hash: 0b2ae6f2e1b30d8a83e7df2d61ceef689fc8a6432645120908edd7c1bb27852b
  E02:
    record: cmdb_identifier/a1d19344c3b33100d8d4bea192d3aedc
    how: read the Hardware Rule
    result: matches on product instance id, serial number, name, then MAC and name
    hash: aaba9b4f0fe30b8b50f5e1be0fd737bb9407e5e95f5520a47959e1abb723ea0d
  E03:
    record: sys_properties/6fd83eec5b020110693e7da52d81c738
    field: value
    how: read glide.identification_engine.multisource_enabled
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E04:
    record: sys_transform_map/4e3548e2c0a80094002e0c1550d11a26
    how: read the transform map Computer
    result: an import into computers, for import sets
    hash: dacc16e2a8dd12105b106df650746e9e7745c74aa385ce8295b147cc74728041
---
## Health

All five score jobs are inactive [E01]: no health scores are calculated.

## Where CIs come from {label=OPEN-QUESTION}

Discovery and Service Graph connectors aren't installed, so nothing discovers CIs: they come from
manual entry, demo data, assets and imports such as the *Computer* transform map. [E04]
Identification uses the standard rules, such as the Hardware Rule [E02]; multisource is off. [E03]
How will the CMDB be kept current?
