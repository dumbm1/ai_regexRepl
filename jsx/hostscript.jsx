/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/

function evalStr (str) {
  var res = '';

  try {
    res = eval (/*JSON.parse*/ (str));
  } catch (e) {
    res = e.message;
  }
  return res;
}

/**
 * Recursive bypassing the collection of elements
 *
 * @param {Function} repl - the applied function
 * @param {Object} collection - some Illustrator DOM collection of elements (selection, PageItems, ets.)
 * */
function replInCollect (regStr, replacer) {
  recurs (selection);

  function recurs (collection) {
    if (!collection.length) throw new Error ('Bad collection');
    for (var i = 0; i < collection.length; i++) {
      var elem = collection[i];
      switch (elem.typename) {
        case 'GroupItem':
          recurs (elem.pageItems);
          break;
        case 'TextFrame':
          repl (elem);
          break;
        default:
          break;
      }
    }
  }

  /**
   * change Contents Of Word Or String Remain Formatting
   * autor (c)pixxxel schubser
   *
   * function needs one text frame selected by Selection Tool,
   * Direct Selection Tool or Group Selection Tool
   *
   * @param {Object} txtFrame - TextFrameItem class object
   * @param {String} regStr - regular expression string
   * @param {String} replacer - replacer string
   * */
  function repl (txtFrame) {
    if (!regStr.length) {
      throw new Error ('No regexp input value');
    }
    replacer = replacer || '';

    var replaceCount = 0;

    var resIndex = 0,
        result,
        reg;

    try {
      reg = new RegExp (regStr, 'gmi')
    } catch (e) {
      return e.message + ', line: ' + e.line;
    }
    var protectDebugCount = 1;
    while (result = reg.exec (txtFrame.contents)) {
      // force abort script if loop becomes infinite
      if (protectDebugCount % 1001 == 0) {
        confirm ('Do you want to abort the script?');
      }

      try {
        var currMatchPiece      = txtFrame.characters[result.index];
        currMatchPiece.length   = result[0].length;
        currMatchPiece.contents = currMatchPiece.contents.replace (reg, replacer);
        // !!! when the match.length is different with the replacer.length the loop becomes infinite
        reg.lastIndex += replacer.length - result[0].length;
        replaceCount++;
      } catch (e) {
      }
      protectDebugCount++;
    }
    return replaceCount;
  }
}

function killCEP () {
  /**
   * make bat-file that kill all system processes CEPHTMLEngine.exe
   */
  _execFile (
    Folder.temp.absoluteURI + '/' + 'taskkil.bat',
    'taskkill /IM CEPHTMLEngine.exe /f'
  );
  /**
   * make new file by full path, write to disk with some file contenr, execute file
   *
   * @param {String} filePath - FULL path (include file-extension)
   * @param {String} fileContent - content to new file
   */
  function _execFile (filePath, fileContent) {
    var f = new File (filePath);
    f.open ('e');
    f.write (fileContent);
    f.close ();
    f.execute ();
  }
}
