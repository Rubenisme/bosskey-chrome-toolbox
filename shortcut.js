var Shortcut = function() {}

Shortcut.prototype.createTable = function() {
  var sql = 'create table if not exists shortcut_table(' +
            'id integer,' +
            'shortcut varchar,' +
            'type bool,' +
            'relationId varchar,' +
            'operation varchar,' +
            'extensionId varchar,' +
            'date datetime)';
  db.executeSqlCommand(sql, null, null);
};

Shortcut.prototype.executeSqlCommand = function(sql, args, callback) {
  var self = this;
  db.executeSqlCommand(sql, args, function(tx, results) {
    if (isFunction(callback)) {
      callback(tx, results);
    }
    self.selectAllToNP();
  })
}

Shortcut.prototype.selectAllToNP = function() {
  var sql = 'select * from shortcut_table';
  db.executeSqlCommand(sql, null, function(tx, results) {
    var shortcutList = [];
    for (var i = 0; i < results.rows.length; i++) {
      var record = {id: '', shortcut: '', relationId: '', operation: '', type: '', extensionId: ''};
      record.id = results.rows.item(i).id;
      record.shortcut = results.rows.item(i).shortcut;
      record.relationId = results.rows.item(i).relationId;
      record.operation = results.rows.item(i).operation;
      record.type = results.rows.item(i).type;
      record.extensionId = results.rows.item(i).extensionId;

      shortcutList.push(record);
    }
    var bg = chrome.extension.getBackgroundPage();
    bg.plugin.updateShortCutList(shortcutList);
    bg.custom_shortcut_list = shortcutList;
  });
}

Shortcut.prototype.selectAllExceptId = function(id, resultsCallback) {
  var sql = 'select * from shortcut_table where id != ?';
  db.executeSqlCommand(sql, [id], resultsCallback);
}

Shortcut.prototype.insert = function(obj) {
  var sql = 'insert into shortcut_table(id, shortcut, type, operation, ' +
      'extensionId, date) values (?, ?, ?, ?, ?, ?)';
  this.executeSqlCommand(sql, [obj.id, obj.shortcut,
      obj.type, obj.operation, obj.extensionId, getDate()], null);
};

Shortcut.prototype.selectById = function(id, resultsCallback) {
  var sql = 'select * from shortcut_table where id = ?';
  db.executeSqlCommand(sql, [id], resultsCallback);
};

Shortcut.prototype.updateShortcut = function(shortcut, id) {
  var sql = 'update shortcut_table set shortcut = ? where id = ?';
  this.executeSqlCommand(sql, [shortcut, id]);
}

Shortcut.prototype.updateRelationId = function(relationId, id) {
  var sql = 'update shortcut_table set relationId = ? where id = ?';
  this.executeSqlCommand(sql, [relationId, id]);
}

Shortcut.prototype.insertRecord = function(table, row) {
  var self = this;
  if (table.length > row) {
    var shortcutObj = table[row];
    this.selectById(shortcutObj.id, function(tx, results) {
      if (results.rows.length == 0) {
        self.insert(shortcutObj);
      } else if (JSON.parse(localStorage['isFirstInstallThisVer'] === true) &&
          results.rows.length == 1) {
        var id = results.rows.item(0).id;
        var shortcut = results.rows.item(0).shortcut;
        shortcut = key_util.getVirtualKey(shortcut);
        self.updateShortcut(shortcut, id);
      }
      if (results.rows.length == 1) {
        var virtualKey = results.rows.item(0).shortcut;
        if (/\+$/.test(virtualKey)) {
          var shortcutItem = key_util.getCustomShortcutItemById(
              key_util.extension_support_shortcut_map, shortcutObj.id);
          if (shortcutItem) {
            virtualKey = shortcutItem.shortcut;
            self.updateShortcut(shortcutItem.shortcut, shortcutObj.id);
          }
        }
      }
      row++;
      self.insertRecord(table, row);
    });
  } else {
    self.selectAllToNP();
    localStorage['isFirstInstallThisVer'] = 'false';
  }
}

Shortcut.prototype.updateShortcutToVirtualKey = function(id, shortcut) {
  var spl =
  this.executeSqlCommand()
}

Shortcut.prototype.showTable = function(categorySelect, browserSelect, isCompare) {
  var self = this;
  var function_table = key_util.function_table;
  var table = document.createElement('table');
  table.id = 'shortcutTable';
  var tr = document.createElement('tr');
  var field1 = document.createElement('th');
  field1.width = 300;
  field1.appendChild(categorySelect);
  tr.appendChild(field1);
  var field2;
  if (isCompare) {
    field2 = document.createElement('th');
    field2.appendChild(browserSelect);
    tr.appendChild(field2);
  }
  var field3 = document.createElement('th');
  field3.innerHTML = chrome.i18n.getMessage('shortcut_chrome_key');
  tr.appendChild(field3);
  var field4 = document.createElement('th');
  field4.innerText = chrome.i18n.getMessage('shortcut_add_to_menu');;
  field4.style.cssText = 'text-align: center; padding-left: 0;';
  tr.appendChild(field4);
  table.appendChild(tr);
  for (var i = 1; i < function_table.length; i++) {
    var row = function_table[i];
    if (row.category == categorySelect.value) {
      tr = document.createElement('tr');
      field1 = document.createElement('td');
      field1.title = chrome.i18n.getMessage(row.function_description);
      field1.innerHTML = chrome.i18n.getMessage(row.function_name);
      tr.appendChild(field1);
      if (isCompare) {
        field2 = document.createElement('td');
        field2.style.minWidth = '150px';
        field2.style.color = '#5F759A';
        field2.innerHTML = row[browserSelect.value];
        tr.appendChild(field2);
      }
      field3 = document.createElement('td');
      field3.style.minWidth = '140px';
      field3.className = 'font_gray';
      field3.innerHTML = row.chrome_key;
      (function(element, id) {
        self.canEditable(element, id)
      })(field3, row.id);
      tr.appendChild(field3);

      var field4 = document.createElement('td');
      field4.style.textAlign = 'center';
      field4.style.width = '150px';
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      if (row.isQuickly) {
        checkbox.checked = initQuicklyVisitMenu(row.id);
        checkbox.value = row.id;
        (function(id, checkbox){
          checkbox.addEventListener('change', function() {
            if (checkbox.checked) {
              setQuicklyVisitMenu(checkbox, id);
            } else {
              delQuicklyVisitMenu(id);
            }
          }, false);
        })(row.id, checkbox);
      } else {
        checkbox.disabled = true;
      }
      field4.appendChild(checkbox);
      tr.appendChild(field4);
      table.appendChild(tr);
    }
  }
  return table;
}

Shortcut.prototype.createSelect = function(table) {
  var muteAvailable = 1;
  if (table == key_util.category_table) {
    var bg = chrome.extension.getBackgroundPage();
    muteAvailable = bg.plugin.checkMuteAvailable();
  }
  var select = document.createElement('select');
  for(var name in table) {
    if (muteAvailable == 2 && table[name] == 'mute_shortcuts')
      continue;
    var option = document.createElement('option');
    option.innerText = chrome.i18n.getMessage(table[name]);
    option.value = table[name];
    select.appendChild(option);
  }
  return select;
}

Shortcut.prototype.canEditable = function(element, id) {
  var self = this;
  var addInputBox = function(parentElement) {
    if ($('keyboardInput')) {
      $('keyboardInput').parentNode.removeChild($('keyboardInput'));
    }
    var input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.className = 'shortcutPad';
    input.id = 'keyboardInput';
    input.style.width = parentElement.clientWidth + 'px';
    input.style.height = parentElement.clientHeight - 2 + 'px';
    var top = 0;
    var left = 0;
    while(parentElement && parentElement != document.body) {
      top += parentElement.offsetTop;
      left += parentElement.offsetLeft;
      parentElement = parentElement.offsetParent;
    }
    input.style.left = left + 'px';
    input.style.top = top + 'px';
    return input;
  }
  var bg = chrome.extension.getBackgroundPage();
  this.selectById(id, function(tx, results) {
    if (results.rows.length > 0) {
      element.className = 'font_black';
      var span = document.createElement('SPAN');
      var virtualKey = results.rows.item(0).shortcut;
      span.id = span.innerText = key_util.keyCodeToShowName(virtualKey);
      var a = document.createElement('A');
      a.innerText = chrome.i18n.getMessage('shortcut_redefine');
      a.href = 'javascript:void(0)';
      a.onclick = function() {
        var inputText = chrome.i18n.getMessage('shortcut_please_input');
        var inputBox = addInputBox(element);
        inputBox.value = inputText;
        element.appendChild(inputBox);
        inputBox.focus();
        var onKeyDown = document.body.onkeydown;
        inputBox.addEventListener('blur', function() {
          bg.plugin.removeKeyboardListener();
          removeInputBox(inputBox);
        }, true);
        document.addEventListener('keyup', function() {
          if ($(inputBox.id)) {
            var curElement = event.target;
            if (curElement == inputBox) {
              if (/\+$/.test(inputBox.value)) {
                showSavingFailedTip('tip_failed4');
                removeInputBox(inputBox);
                return;
              }
              var isRepetitive = checkRepetitiveShortcut(inputBox.value);
              if (isRepetitive) {
                inputText = chrome.i18n.getMessage('tip_failed3');
                showSavingFailedTip('tip_failed3');
                bg.plugin.removeKeyboardListener();
                removeInputBox(inputBox);
              } else {
                self.selectAllExceptId(id, function(tx, results) {
                  for (var i = 0; i < results.rows.length; i++) {
                    if (inputBox.name == results.rows.item(i).shortcut) {
                      inputText = chrome.i18n.getMessage('tip_failed3');
                      showSavingFailedTip('tip_failed3');
                      inputBox.value = inputText;
                      break;
                    }
                  }
                  if (inputBox.value != inputText) {
                    span.innerText = inputBox.value;
                    self.updateShortcut(inputBox.name, id);
                    showSavingSucceedTip();
                  }
                  document.body.onkeydown = onKeyDown;
                  bg.plugin.removeKeyboardListener();
                  removeInputBox(inputBox);
                });
              }
            }
          }
        }, false);
        bg.plugin.addKeyboardListener(inputBox);
        document.body.onkeydown = function() {
          event.returnValue = false;
        }
      }
      element.appendChild(span);
      element.appendChild(a);
    }
  });
}

function initQuicklyVisitMenu(id) {
  var quicklyVisitMenu = localStorage['quicklyVisitMenu'];
  var returnValue = false;
  if (quicklyVisitMenu) {
    var menuList = quicklyVisitMenu.split(',');
    returnValue = menuList.indexOf(id.toString()) > -1 ? true : false;
  }
  return returnValue;
}

function setQuicklyVisitMenu(element, id) {
  var quicklyVisitMenu = localStorage['quicklyVisitMenu'];
  var menus = quicklyVisitMenu ? quicklyVisitMenu.split(',') : [];
  if (menus.length >= 10) {
    showSavingFailedTip('tip_failed');
    element.checked = false;
  } else {
    menus.push(id);
    localStorage['quicklyVisitMenu'] = menus.join(',');
    showSavingSucceedTip();
  }
}

function checkRepetitiveShortcut(shortcut) {
  var index = key_util.chrome_shortcuts.indexOf(shortcut);
  return index > -1 ? true : false;
}

function delQuicklyVisitMenu(id) {
  var quicklyVisitMenu = localStorage['quicklyVisitMenu'];
  if (quicklyVisitMenu) {
    var menuList = quicklyVisitMenu.split(',');
    var index = menuList.indexOf(id.toString());
    menuList.splice(index, 1);
    localStorage['quicklyVisitMenu'] = menuList.join(',');
  }
  showSavingSucceedTip();
}

function removeInputBox (element) {
  if (element) {
    element.parentNode.removeChild(element);
    element = null;
  }
}

function setShortcutsToInputBox(inputBox, virtualKey) {
  var keys = virtualKey.split('+');
  for (var i = 0; i < keys.length; i++) {
    if (keys[i]) {
      keys[i] = key_util.key_code_map[keys[i]].name;
    }
  }
  
  inputBox.name = virtualKey;
  inputBox.value = keys.join('+');
}
