(function() {
  var $, changeAllButtons;

  $ = jQuery;

  AjaxSolr.theme.prototype.section_title = function(text) {
    return $('<h4/>').text(text);
  };

  changeAllButtons = function(newstate) {
    return function() {
      var item, _i, _len, _ref;
      _ref = $(this.form).find('input[type=checkbox]');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item.checked = newstate;
      }
      return true;
    };
  };

  AjaxSolr.theme.prototype.saved_formactions = function(throwhandler, bibtexHandler, myADSHandler) {
    var $thediv;
    if (throwhandler == null) throwhandler = null;
    if (bibtexHandler == null) bibtexHandler = null;
    if (myADSHandler == null) myADSHandler = null;
    if (!(bibtexHandler === null && myADSHandler === null)) {
      return $('<div class="formactions"/>').append($('<input class="btn small" type="button" value="Mark all"/>').click(changeAllButtons(true))).append($('<input class="btn small" type="button" value="Clear all"/>').click(changeAllButtons(false))).append($('<span>&nbsp;<span class="label"/>&nbsp;</span>')).append($('<input class="btn btn-danger small" type="submit" value="Remove" name="action"/>')).append($('<span>&nbsp;<span class="label"/>&nbsp;</span>')).append($('<input class="btn btn-info small" type="button" value="View"/>').click(throwhandler)).append($('<span>&nbsp;<span class="label"/>&nbsp;</span>')).append($('<input class="btn btn-info small" type="button" value="Get as BibTex"/>').click(bibtexHandler)).append($('<button type="button" name="myads" value="Send to myADS"/>').click(myADSHandler).append($('<img alt="[myADS logo]"/>').attr('src', "" + SITEPREFIX + "/static/images/ADSlabs-button.png")));
    }
    $thediv = $('<div class="formactions"/>').append($('<input class="btn small" type="button" value="Mark all"/>').click(changeAllButtons(true))).append($('<input class="btn small" type="button" value="Clear all"/>').click(changeAllButtons(false))).append($('<span>&nbsp;<span class="label"/>&nbsp;</span>')).append($('<input class="btn btn-danger small" type="submit" value="Remove" name="action"/>'));
    if (throwhandler !== null) {
      $thediv.append($('<span>&nbsp;<span class="label"/>&nbsp;</span>'));
      $thediv.append($('<input class="btn btn-info small" type="button" value="View"/>').click(throwhandler));
    }
    return $thediv;
  };

  AjaxSolr.theme.prototype.saved_tablehead = function(cols) {
    var $tr, name, _i, _len;
    $tr = $('<tr/>').append('<th/>');
    for (_i = 0, _len = cols.length; _i < _len; _i++) {
      name = cols[_i];
      $tr.append($('<th/>').text(name));
    }
    return $('<thead/>').append($tr);
  };

  AjaxSolr.theme.prototype.saved_tablerow = function(row) {
    var $out, value, _i, _len;
    $out = $('<tr class="saveditem"/>');
    for (_i = 0, _len = row.length; _i < _len; _i++) {
      value = row[_i];
      $out.append($('<td/>').append($(value)));
    }
    return $out;
  };

  AjaxSolr.theme.prototype.saved_items = function(idfrag, cols, rows, throwhandler, bibtexHandler, myADSHandler) {
    var $actions, $out, $table, $tbody, value, _i, _len;
    $out = $('<form action="#"/>').attr('id', "saved-" + idfrag + "-form");
    $actions = AjaxSolr.theme('saved_formactions', throwhandler, bibtexHandler, myADSHandler);
    $table = $('<table class="table table-striped table-bordered table-condensed"/>').attr('id', "saved-" + idfrag + "-table").append(AjaxSolr.theme('saved_tablehead', cols));
    $tbody = $('<tbody/>');
    for (_i = 0, _len = rows.length; _i < _len; _i++) {
      value = rows[_i];
      $tbody.append(AjaxSolr.theme('saved_tablerow', value));
    }
    $table.append($tbody);
    $out.append($actions).append($table);
    return $out;
  };

}).call(this);
