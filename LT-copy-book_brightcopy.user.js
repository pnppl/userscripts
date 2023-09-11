// ==UserScript== 
// @name           LT Copy Book (fixed) - LibraryThing 
// @namespace      http://userscripts.org/users/brightcopy 
// @description    Copies book data and automatically pastes it to a manual entry. 
// @include        http*://*.librarything.tld/work*/details/* 
// @include        http*://*.librarything.tld/work*/workdetails* 
// @include        http*://*.librarything.tld/addnew.php 
// @grant          GM_setValue 
// @grant          GM_getValue 
// @grant          GM_deleteValue 
// @version        2.2 
// @license        Public domain
// ==/UserScript==  
 
var ltcbTitle       = { key:'ltcbTitle'       , id:'bookedit_title'         , field:'form_title'          }; 
var ltcbAuthor      = { key:'ltcbAuthor'      , id:'bookedit_authorunflip'  , field:'form_authorunflip'   }; 
var ltcbDate        = { key:'ltcbDate'        , id:'bookedit_date'          , field:'form_date'           }; 
var ltcbPublication = { key:'ltcbPublication' , id:'bookedit_publication'   , field:'form_publication'    }; 
var ltcbISBN        = { key:'ltcbISBN'        , id:'bookedit_ISBN'          , field:'form_ISBN'           }; 
var ltcbLCCN        = { key:'ltcbLCCN'        , id:'bookedit_lccallnumber'  , field:'form_lccallnumber'   }; 
var ltcbDewey       = { key:'ltcbDewey'       , id:'bookedit_dewey'         , field:'form_dewey'          }; 
var ltcbLanguage    = { key:'ltcbLanguage'    , id:'bookedit_lang'          , field:'field_lang'          }; 
var ltcbLanguage2   = { key:'ltcbLanguage2'   , id:'bookedit_lang2'         , field:'field_lang2'         }; 
var ltcbLanguageO   = { key:'ltcbLanguageO'   , id:'bookedit_lang_original' , field:'field_lang_original' }; 
//var ltcbVolumes     = { key:'ltcbVolumes'     , id:'bookedit_numVolumes'    , field:'numVolumes'          , path:'//td[text()="Number of Volumes"]/../td[@class="bookeditfield"]'}; 
//var ltcbPages       = { key:'ltcbPages'       , id:'bookedit_pagecount'     , field:'pagecount'           , path:'//td[text()="Pages"]/../td[@class="bookeditfield"]'}; 
 
var ltcbCollection       = { key:'ltcbCollection'       }; 
var ltcbAddToLibrary     = { key:'ltcbAddToLibrary'     }; 
var ltcbAddToWishlist    = { key:'ltcbAddToWishlist'    }; 
 
var ltcbOtherAuthorCount = { key:'ltcbOtherAuthorCount'                     }; 
var ltcbOtherAuthorRole  = { key:'ltcbOtherAuthorRole'  , field:'person_role-' }; 
var ltcbOtherAuthorName  = { key:'ltcbOtherAuthorName'  , field:'person_name-' }; 
var ltcbAuthorRole       = { key:'ltcbAuthorRole'       , field:'person_role_main' }; 
 
function getById(setting) { 
  var e = document.getElementById(setting.id); 
 
  // kludge for title on work page 
  if (e == null && setting === ltcbTitle) { 
      e = $x1('//table[@id="book_bookInformationTable"]/tbody/tr[1]/td[2]/b'); 
  } 
 
  return e ? e.textContent : ''; 
} 
 
function save(setting, callback) { 
  var value = getById(setting); 
  if (callback) 
    value = callback(value); 
 
  GM_setValue(setting.key, value); 
} 
 
function setNonGreen(setting) { 
  var e = document.getElementById(setting.id); 
  var value = (e && e.innerHTML == e.textContent) ? e.textContent : ''; 
  GM_setValue(setting.key, value); 
} 
 
function load(form, setting, opt) { 
  var key = setting.key + (opt != undefined ? opt : ''); 
  var field = setting.field + (opt != undefined ? opt : ''); 
  var value = GM_getValue(key); 
  var elem = form.elements.namedItem(field); 
 
//  console.log('load: ' + key + ', ' + field + ', ' + value); 
   
  if (elem) 
    elem.value = value; 
} 
 
function loadRole(form, setting, opt) { 
  if (!loadOption(form, setting, opt)) { 
    var key = setting.key + (opt != undefined ? opt : ''); 
    var field = setting.field + (opt != undefined ? opt : ''); 
    var menu = form.elements.namedItem(field); 
    if (menu) { 
      var value = GM_getValue(key); 
   
      var lastoption = menu.options.length; 
      menu.options[lastoption - 2] = new Option(value, value); 
      menu.options[lastoption - 1] = new Option("--------------", ""); 
      menu.options[lastoption] = new Option("Other...", ""); 
      menu.options.selectedIndex = lastoption - 2;  
    } 
  } 
} 
 
function loadOption(form, setting, opt) { 
  var key = setting.key + (opt != undefined ? opt : ''); 
  var field = setting.field + (opt != undefined ? opt : ''); 
   
  var value = GM_getValue(key); 
 
  var select = form.elements.namedItem(field); 
  if (select == null) 
    return false; 
   
  var option = $x1('option[text() = "' + value + '"]', select); 
 
  if (option) { 
    select.value = option.value; 
    return true; 
  } 
  else 
    return false; 
} 
 
function fixAuthorName(value) { 
  var newvalue = value.replace( 
      /^(.+) ([^ ,]+),? (JR|SR|III|IV|V|VI|VII|VIII|IX)(.?)$/i, '$2, $1, $3$4'); 
  if (newvalue != value) 
    value = newvalue; 
  else 
    value = value.replace(/^(.+) ([^ ]+)$/, '$2, $1'); 
 
  return value; 
} 
 
function addToLibraryClick(e) { 
  addToClick(1); 
} 
 
function addToWishlistClick() { 
  addToClick(4) 
} 
 
function fixLang(value) { 
  if (value == '') 
    value = '(blank)'; 
   
  return value; 
} 
 
function addToClick(c) { 
  GM_setValue(ltcbCollection.key, c); 
   
  save(ltcbTitle); 
  save(ltcbPublication); 
  save(ltcbLanguage, fixLang); 
  save(ltcbLanguage2, fixLang); 
  save(ltcbLanguageO, fixLang); 
 
  save(ltcbDate, 
      function (value) { 
        if (value == '?') 
          value = ''; 
         
        return value; 
      } 
  ); 
 
  save(ltcbISBN, 
      function (value) { 
        if (value == '') { 
          var elem = $x1('/html/head/meta[@property="books:isbn"]/@content'); 
          if (elem != null) { 
            value = elem.textContent; 
          } 
        } 
 
      return (value + ' / ').split(' / ')[0]; 
      } 
  ); 
 
  var authorElem = document.getElementById(ltcbAuthor.id); 
  var authorName = null; 
  var authorRole = ''; 
 
  if (authorElem != null) { 
    authorName = authorElem.firstChild.textContent; 
    var elem = authorElem.lastChild; 
    if (elem.nodeType == 3) {//Node.TEXT_NODE 
        authorRole = elem.textContent; 
    } 
  } 
  // workdetails page with no user book 
  else { 
    authorElem = $x1('//div[@class="headsummary"]/h2'); 
    if (authorElem != null) { 
      authorName = $x1('//div[@class="headsummary"]/h2/a').textContent; 
      var authorRoleElem = $x1('//div[@class="headsummary"]/h2/text()[2]'); 
      if (authorRoleElem != null) { 
        authorRole = authorRoleElem.textContent(); 
      } 
      else { 
      } 
    } 
  } 
 
    console.log("author", "name=", authorName, "role=", authorRole); 
  if (authorName != null) { 
      console.log("setting author name", authorName); 
    authorRole = authorRole.replace(/^ \((.+)\)$/, '$1'); 
 
    GM_setValue(ltcbAuthor.key, fixAuthorName(authorName)); 
    GM_setValue(ltcbAuthorRole.key, authorRole) 
  } 
 
  // fields with possible green text 
  setNonGreen(ltcbLCCN); 
  setNonGreen(ltcbDewey); 
   
   
  // Other Authors 
  var others = $x("//div[@class='bookeditPerson']/span[@class='book_langLabel']"); 
   
  GM_setValue(ltcbOtherAuthorCount.key, others.snapshotLength); 
   
  for (var i = 0; i < others.snapshotLength; i++) { 
    var role = others.snapshotItem(i); 
    var roleText = role.textContent; 
    GM_setValue(ltcbOtherAuthorRole.key + i, roleText.substring(0, roleText.length - 3)); 
     
    var author = role.nextSibling; 
    while (author && author.tagName != 'SPAN') { 
      author = author.nextSibling; 
    } 
    if (author) 
      GM_setValue(ltcbOtherAuthorName.key + i, author.textContent); 
  } 
}     
 
function createAddTo(id, text, bg) { 
  return '<span class="ltbtn ltbtn-inline-block sp16  ltbtn-ff3 " style="margin-left: 0.5em;">'+ 
    '<a id="' + id + '" href="/addnew.php">'+ 
      '<div class="ltbtn-outer-box ltbtn-inline-block">'+ 
        '<div class="ltbtn-inner-box ltbtn-inline-block">'+ 
          '<div class="ltbtn-pos">'+ 
            '<div class="ltbtn-top-shadow"></div>' +  
            '<div class="ltbtn-content">'+ 
              '<div style="margin-right: 2px;" class="ltbtn-body ">'+ 
                '<span style="background-position: ' + bg + ';" class="sp_c  sp16 "></span>'+ 
                'Copy to ' + text +  
              '</div>'+ 
            '</div>'+ 
          '</div>'+ 
        '</div>'+ 
      '</div>'+ 
    '</a>' +  
  '</span>'; 
} 
 
function readData() { 
  if (document.getElementById('ltcbButtons') == null) { 
    // Create Buttons 
    var elem = $x1('//div[@class="book_bitHeadContent"]/table[@class="book_bitTable"]/tbody/tr'); 
    if (elem == null) { 
      elem = $x1('//table[@id="book_bookInformationTable"]/tbody/tr'); 
    } 
 
    if (elem) { 
      var td = document.createElement('td'); 
   
      var div = document.createElement('div'); 
      div.setAttribute('style', 'float: right'); 
      div.setAttribute('id', 'ltcbButtons'); 
       
      td.appendChild(div); 
      elem.appendChild(td); 
      div.innerHTML =  
        '<span style="font-size: 9px; font-weight: normal; white-space: nowrap">' + 
          createAddTo(ltcbAddToLibrary.key, 'your library', '-17px -68px') + 
          createAddTo(ltcbAddToWishlist.key, 'your wishlist', '-34px -68px') + 
        '</span>'; 
   
      document.getElementById(ltcbAddToLibrary.key).addEventListener('click', addToLibraryClick, false);   
      document.getElementById(ltcbAddToWishlist.key).addEventListener('click', addToWishlistClick, false);   
    } 
  } 
} 
 
/* ===== Click on an element (borrowed from Facebook Fixer, @namespace http://userscripts.org/people/14536) ===== */ 
function click(elm) { 
  try { 
    elm.click(); 
  } 
  catch (e) { } 
} 
 
function writeData() { 
  var collection = GM_getValue(ltcbCollection.key); 
  if (collection != undefined) { 
    var f = document.getElementById('book_editForm'); 
 
    click($x1('//div[@class="collectionListFooter"]/span[@id!=""]/button')); 
 
    var collections = $x('//td[@id="bookedit_tags"]//input'); 
    for (var i = 0; i < collections.snapshotLength; i++) { 
      var collectionInput = collections.snapshotItem(i); 
      collectionInput.checked = collection == collectionInput.value; 
    } 
 
    load(f, ltcbTitle); 
    load(f, ltcbAuthor); 
    load(f, ltcbDate); 
    load(f, ltcbPublication); 
    load(f, ltcbISBN); 
    load(f, ltcbLCCN); 
    load(f, ltcbDewey); 
 
    loadRole(f, ltcbAuthorRole); 
 
    var otherAuthorCount = GM_getValue(ltcbOtherAuthorCount.key); 
 
    if (otherAuthorCount) 
      unsafeWindow.pcount = 1; 
     
    for (i = 0; i < otherAuthorCount; i++) { 
      if (i) 
        unsafeWindow.addPerson(); 
       
      load(f, ltcbOtherAuthorName, i); 
      loadRole(f, ltcbOtherAuthorRole, i); 
    } 
     
    writeLangs(); 
  } 
} 
 
var langLoadCalled = false; 
 
function writeLangs() { 
  var f = document.getElementById('book_editForm'); 
  var success = loadOption(f, ltcbLanguage)  
      && loadOption(f, ltcbLanguage2) && loadOption(f, ltcbLanguageO); 
   
  if (success) 
    GM_deleteValue(ltcbCollection.key); 
  else { 
    if (!langLoadCalled) { 
      langLoadCalled = true; 
      unsafeWindow.book_updateLangMenus.call(unsafeWindow, 1); 
    } 
//    console.log('setting timeout'); 
    setTimeout(writeLangs, 100); 
  } 
} 
 
function $x(x, t, r) { 
    if (t && t.nodeType)  
        var h = r, r = t, t = h;     
    var d = r ? r.ownerDocument || r : r = document, p; 
    switch (t) { 
      case XPathResult.NUMBER_TYPE: 
          p = 'numberValue'; 
          break; 
      case XPathResult.STRING_TYPE: 
          p = 'stringValue'; 
          break; 
      case XPathResult.BOOLEAN_TYPE: 
          p = 'booleanValue'; 
          break; 
      case XPathResult.ANY_UNORDERED_NODE_TYPE: 
      case XPathResult.FIRST_ORDERED_NODE_TYPE: 
          p = 'singleNodeValue'; 
          break; 
      default: 
          return d.evaluate(x, r, null,  
              t || XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
    } 
    var result = d.evaluate(x, r, null, t, null); 
    if (result != null) 
      result = result[p]; 
     
    return result; 
} 
 
function $x1(x, r) { 
  return $x(x, XPathResult.ANY_UNORDERED_NODE_TYPE, r) 
}  
 
try { 
  // find the values from the screen 
  if (window.location.pathname.substring(0, '/work/'.length) == '/work/') 
    readData() 
  else if (window.location.pathname == '/addnew.php') 
    writeData() 
} catch (e) { 
  console.log(e); 
}