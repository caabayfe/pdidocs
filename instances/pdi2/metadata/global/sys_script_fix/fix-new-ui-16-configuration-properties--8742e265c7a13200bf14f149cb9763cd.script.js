function fixNewUI16ConfigProps() {
      if (pm.isZboot())
          return;

      var unselectedColor = gs.getProperty('css.$navpage-nav-unselected-color', '#d1d6d8'); // #bec1c6 was the previous value used in London and earlier
      var colorSub = gs.getProperty('css.$navpage-nav-color-sub', '#ffffff'); // #bec1c6 was also the previous value used in London but both diverged in M

      // OOB London, set to Madrid values
      if (unselectedColor == '#bec1c6')
          unselectedColor = '#d1d6d8';

      if (colorSub == '#bec1c6')
          colorSub = '#ffffff';

      gs.setProperty('css.$navpage-nav-color-sub', colorSub, 'Module text color for UI16');
      gs.setProperty('css.$navpage-nav-unselected-color', unselectedColor, 'Unselected navigation tab icon and favorite icons color');
}

fixNewUI16ConfigProps();
