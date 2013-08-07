var key_util = {};

key_util.category_table = {
  CAT_BOSS_KEY: 'boss_key'
}

key_util.function_table_record = function() {
  this.id = 0;
  this.functionName = '';
  this.category = 0;
  this.isSupport = false;
  this.chromeKey = '';
  this.browser360Key = '';
  this.maxthonKey = '';
  this.ttKey = '';
  this.sogouKey = '';
};

key_util.browser = {
  browser360Key: 'browser360_key',
  maxthonKey: 'maxthon_key',
  ttKey: 'tt_key',
  sogouKey: 'sogou_key',
  ie6Key: 'ie6_key',
  ie7Key: 'ie7_key',
  ie8Key: 'ie8_key',
  operaKey: 'opera_key',
  safariKey: 'safari_key',
  firefoxKey: 'firefox_key'
}

key_util.function_table = [];
key_util.function_table[1] = {
  id: 48, function_name: 'hide_restore_all_windows',
  function_description: 'hide_restore_all_windows',
  category: key_util.category_table.CAT_BOSS_KEY,
  isQuickly: true, isSystem: false, isSupport: true,
  chrome_key: '',
  browser360_key: 'Alt+`', maxthon_key: 'Alt+`',
  tt_key: 'Alt+`', sogou_key: 'Alt+`',
  ie6_key: '', ie7_key: '',
  ie8_key: '', opera_key: '',
  safari_key: '', firefox_key: ''
};
key_util.function_table[2] = {
  id: 62, function_name: 'hide_current_window',
  function_description: 'hide_current_window',
  category: key_util.category_table.CAT_BOSS_KEY,
  isQuickly: true, isSystem: false, isSupport: true,
  chrome_key: '',
  browser360_key: '', maxthon_key: '',
  tt_key: '', sogou_key: '',
  ie6_key: '', ie7_key: '',
  ie8_key: '', opera_key: '',
  safari_key: '', firefox_key: ''
};
key_util.function_table[3] = {
  id: 63, function_name: 'restore_last_hidden_window',
  function_description: 'restore_last_hidden_window',
  category: key_util.category_table.CAT_BOSS_KEY,
  isQuickly: true, isSystem: false, isSupport: true,
  chrome_key: '',
  browser360_key: '', maxthon_key: '',
  tt_key: '', sogou_key: '',
  ie6_key: '', ie7_key: '',
  ie8_key: '', opera_key: '',
  safari_key: '', firefox_key: ''
};

key_util.extension_support_shortcut_map = [
  {
    id: 48, shortcut: '18+192', type: true, relationId: '',
    operation: 'bossKey', extensionId: ''
  }, {
    id: 62, shortcut: '18+72', type: false, relationId: '',
    operation: 'hideCurrentWindow', extensionId: ''
  }, {
    id: 63, shortcut: '18+82', type: true, relationId: '',
    operation: 'restoreLastHiddenWindow', extensionId: ''
  }
];

key_util.custom_shortcut_id_list = [
    48, 62, 63];

key_util.key_code_map = [];
for (var i = 0; i < 222; i++) {
  key_util.key_code_map[i] = { keyCode: '', name: '' };
}

key_util.key_code_map[8] = { keyCode: 8, name: 'Backspace' };
key_util.key_code_map[9] = { keyCode: 9, name: 'Tab' };
key_util.key_code_map[12] = { keyCode: 12, name: 'Clear' };
key_util.key_code_map[13] = { keyCode: 13, name: 'Enter' };
key_util.key_code_map[16] = { keyCode: 16, name: 'Shift' };
key_util.key_code_map[17] = { keyCode: 17, name: 'Ctrl' };
key_util.key_code_map[18] = { keyCode: 18, name: 'Alt' };
key_util.key_code_map[20] = { keyCode: 20, name: 'CapsLock' };
key_util.key_code_map[27] = { keyCode: 27, name: 'Esc' };
key_util.key_code_map[32] = { keyCode: 32, name: 'Spacebar' };
key_util.key_code_map[33] = { keyCode: 33, name: 'PageUp' };
key_util.key_code_map[34] = { keyCode: 34, name: 'PageDown' };
key_util.key_code_map[35] = { keyCode: 35, name: 'End' };
key_util.key_code_map[36] = { keyCode: 36, name: 'Home' };
key_util.key_code_map[37] = { keyCode: 37, name: 'Left' };
key_util.key_code_map[38] = { keyCode: 38, name: 'Up' };
key_util.key_code_map[39] = { keyCode: 39, name: 'Right' };
key_util.key_code_map[40] = { keyCode: 40, name: 'Down' };
key_util.key_code_map[45] = { keyCode: 45, name: 'Insert' };
key_util.key_code_map[46] = { keyCode: 46, name: 'Delete' };
key_util.key_code_map[47] = { keyCode: 47, name: 'Help' };
key_util.key_code_map[48] = { keyCode:48, name:'0' };
key_util.key_code_map[49] = { keyCode:49, name:'1' };
key_util.key_code_map[50] = { keyCode:50, name:'2' };
key_util.key_code_map[51] = { keyCode:51, name:'3' };
key_util.key_code_map[52] = { keyCode:52, name:'4' };
key_util.key_code_map[53] = { keyCode:53, name:'5' };
key_util.key_code_map[54] = { keyCode:54, name:'6' };
key_util.key_code_map[55] = { keyCode:55, name:'7' };
key_util.key_code_map[56] = { keyCode:56, name:'8' };
key_util.key_code_map[57] = { keyCode:57, name:'9' };
key_util.key_code_map[65] = { keyCode:65, name:'A' };
key_util.key_code_map[66] = { keyCode:66, name:'B' };
key_util.key_code_map[67] = { keyCode:67, name:'C' };
key_util.key_code_map[68] = { keyCode:68, name:'D' };
key_util.key_code_map[69] = { keyCode:69, name:'E' };
key_util.key_code_map[70] = { keyCode:70, name:'F' };
key_util.key_code_map[71] = { keyCode:71, name:'G' };
key_util.key_code_map[72] = { keyCode:72, name:'H' };
key_util.key_code_map[73] = { keyCode:73, name:'I' };
key_util.key_code_map[74] = { keyCode:74, name:'J' };
key_util.key_code_map[75] = { keyCode:75, name:'K' };
key_util.key_code_map[76] = { keyCode:76, name:'L' };
key_util.key_code_map[77] = { keyCode:77, name:'M' };
key_util.key_code_map[78] = { keyCode:78, name:'N' };
key_util.key_code_map[79] = { keyCode:79, name:'O' };
key_util.key_code_map[80] = { keyCode:80, name:'P' };
key_util.key_code_map[81] = { keyCode:81, name:'Q' };
key_util.key_code_map[82] = { keyCode:82, name:'R' };
key_util.key_code_map[83] = { keyCode:83, name:'S' };
key_util.key_code_map[84] = { keyCode:84, name:'T' };
key_util.key_code_map[85] = { keyCode:85, name:'U' };
key_util.key_code_map[86] = { keyCode:86, name:'V' };
key_util.key_code_map[87] = { keyCode:87, name:'W' };
key_util.key_code_map[88] = { keyCode:88, name:'X' };
key_util.key_code_map[89] = { keyCode:89, name:'Y' };
key_util.key_code_map[90] = { keyCode:90, name:'Z' };
key_util.key_code_map[106] = { keyCode: 106, name: '*' };
key_util.key_code_map[107] = { keyCode: 107, name: '+' };
key_util.key_code_map[108] = { keyCode: 108, name: 'Enter' };
key_util.key_code_map[109] = { keyCode: 109, name: '-' };
key_util.key_code_map[110] = { keyCode: 110, name: '.' };
key_util.key_code_map[111] = { keyCode: 111, name: '/' };
key_util.key_code_map[112] = { keyCode:112, name:'F1' };
key_util.key_code_map[113] = { keyCode:113, name:'F2' };
key_util.key_code_map[114] = { keyCode:114, name:'F3' };
key_util.key_code_map[115] = { keyCode:115, name:'F4' };
key_util.key_code_map[116] = { keyCode:116, name:'F5' };
key_util.key_code_map[117] = { keyCode:117, name:'F6' };
key_util.key_code_map[118] = { keyCode:118, name:'F7' };
key_util.key_code_map[119] = { keyCode:119, name:'F8' };
key_util.key_code_map[120] = { keyCode:120, name:'F9' };
key_util.key_code_map[121] = { keyCode:121, name:'F10' };
key_util.key_code_map[122] = { keyCode:122, name:'F11' };
key_util.key_code_map[123] = { keyCode:123, name:'F12' };
key_util.key_code_map[186] = { keyCode: 186, name: ';' };
key_util.key_code_map[187] = { keyCode: 187, name: '=' };
key_util.key_code_map[188] = { keyCode: 188, name: ',' };
key_util.key_code_map[189] = { keyCode: 189, name: '-' };
key_util.key_code_map[190] = { keyCode: 190, name: '.' };
key_util.key_code_map[191] = { keyCode: 191, name: '/' };
key_util.key_code_map[192] = { keyCode: 192, name: '`' };
key_util.key_code_map[219] = { keyCode: 219, name: '[' };
key_util.key_code_map[220] = { keyCode: 220, name: '\\' };
key_util.key_code_map[221] = { keyCode: 221, name: ']' };
key_util.key_code_map[222] = { keyCode: 222, name: '\'' };

key_util.keyCodeToShowName = function(keyCode) {
  var keyCodeList = '';
  if (keyCode) {
    keyCodeList = keyCode.split('+');
    for (var i = 0; i < keyCodeList.length; i++) {
      if (keyCodeList[i]) {
        keyCodeList[i] = key_util.key_code_map[keyCodeList[i]].name;
      }
    }
    keyCodeList = keyCodeList.join('+');
  }
  return keyCodeList;
}

key_util.getVirtualKey = function(shortcut) {
  var returnKey = '';
  if (shortcut) {
    var virtualKey = shortcut.split('+');
    for (var i = 0; i < virtualKey.length; i++) {
      for (var m = 0; m < key_util.key_code_map.length; m++) {
        if (virtualKey[i] == key_util.key_code_map[m].name) {
          virtualKey[i] = key_util.key_code_map[m].keyCode;
          break;
        }
      }
    }
    returnKey = virtualKey.join('+');
  }
  return returnKey;
}


key_util.getObject = function(array, name, value) {
  for (var i = 0; i < array.length; i++) {
    var object = array[i];
    if (object[name] && object[name] == value) {
      return object;
    }
  }
}

key_util.getAllChromeShortcut = function() {
  var chromeShortcutsList = [];
  for (var i = 1; i < key_util.function_table.length; i++) {
    if (key_util.function_table[i].chrome_key) {
      chromeShortcutsList.push(key_util.function_table[i].chrome_key);
    }
  }
  return chromeShortcutsList.join(', ').split(', ');
}

key_util.getCustomShortcutItemById = function(customShortcutList, id) {
  var shortcutItem = '';
  for (var i = 0; i < customShortcutList.length; i++) {
    if (customShortcutList[i].id == id) {
      shortcutItem = customShortcutList[i];
      break;
    }
  }
  return shortcutItem;
}

key_util.chrome_shortcuts = key_util.getAllChromeShortcut();


