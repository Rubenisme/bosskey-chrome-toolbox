var bg = chrome.extension.getBackgroundPage();
  
  function init() {
    if (isWindowsPlatform()) {
      createQuicklyVisitItem();
    } else {
      setWindowOnlyElement();
    }
  }
  function i18nReplace(id, messageName) {
    $(id).innerText = chrome.i18n.getMessage(messageName);
  }

  function createQuicklyVisitItem() {
    var quickAccessMenu = localStorage['quicklyVisitMenu'] || '';
    var items = quickAccessMenu.split(',');
    var ul = document.createElement('ul');
    ul.id = 'quicklyCommand';
    for (var i = 0; i < items.length; i++) {
      var item = key_util.function_table[items[i]];
      var id = item.id;
      var name = chrome.i18n.getMessage(item.function_name);
      var showKey = ''
      var virtualKey = '';
      if (item.chrome_virtual_key) {
        virtualKey = item.chrome_virtual_key;
      }
      if (key_util.custom_shortcut_id_list.indexOf(item.id) > -1) {
        item = key_util.getCustomShortcutItemById(bg.custom_shortcut_list, id);
        virtualKey = item.shortcut;
      }
      virtualKey = virtualKey.indexOf(',') < 0 ?
           virtualKey : virtualKey.substring(0, virtualKey.indexOf(','));
      showKey = key_util.keyCodeToShowName(virtualKey);
      var li = document.createElement('li');
      li.value = id;
      li.innerHTML = '<div class="left">' + name +
          '</div><div class="right">' + showKey + '</div>';
      (function(virtualKey) {
        li.addEventListener('click', function() {
          bg.plugin.triggerChromeShortcuts(virtualKey);
          window.close();
        }, false);
      })(virtualKey);
      ul.appendChild(li);
    }
    $('quicklyMenu').appendChild(ul);
  }

  function setWindowOnlyElement() {
    var elements = document.getElementsByName('isWindowsOnly');
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display = 'none';
    }
  }
  init();
