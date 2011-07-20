(function ($) {

AjaxSolr.theme.prototype.result = function (doc, snippet, thetitlelink, thepivot, thedocthis) {
  console.log("DIC: "+doc);
/*for (ele in doc){
	console.log(';;;;'+ele+';;;;'+doc[ele]);
}*/
  var $thisdiv=$('<div></div>');
  var $h2 = $('<h2></h2>').append(doc.title+" ").append(thetitlelink).append(thepivot);
  //var output = '<div><h2>' + thetitle + '['+thepivot+']</h2>';
  //var output='';
  var $linkoutput=$('<p id="links_' + doc.id + '" class="links"></p>');
  //output += '<p>' + snippet[0] + '</p>';
  var $morea=$('<a href="#" class="less" id="am_'+doc.id+'">more</a>').click(thedocthis.moreHandler(doc));
  var $lessa=$('<a href="#" id="al_'+doc.id+'" style="display:none">less</a>').click(thedocthis.lessHandler(doc));
  var $bookmark=$('<a href="#" class="save" id="savepub_'+doc.id+'">save</a>').click(thedocthis.saveHandler(doc));
  var $data=$('<a href="#" class="save" id="data_'+doc.id+'">data</a>').click(thedocthis.dataHandler(doc));
  var $morepara=$('<p id="p_'+doc.id+'" style="display:none"></p>').append(snippet[1]);
  var $lessmore=$('<div class="lessmore"></div>').append($bookmark).append($data).append($morea).append($lessa).append($morepara);
  //return output;
  console.log("hi")
  return $thisdiv.append($h2).append($linkoutput).append(snippet[0]).append($lessmore);
}

AjaxSolr.theme.prototype.title = function (doc) {
    var $output=$('<a class="iframe"/>').text('(Link)')
		.attr('href', "http://labs.adsabs.harvard.edu/ui/abs/"+doc.bibcode)
		.fancybox({autoDimensions: false, width:1024, height:768});
    //var $output=$('<a class="colorbox-iframe"/>').text(doc.title).attr('href', "#p_"+doc.id).fancybox();
    return $output;
}

AjaxSolr.theme.prototype.pivot = function (doc, handler){
    var $pivot = $('<a href="#"/>').text(' [P]').click(handler);
    return $pivot;
}
AjaxSolr.theme.prototype.snippet = function (doc) {
  var output = '';
//  if (doc.text.length > 300) {
//    output += doc.dateline + ' ' + doc.text.substring(0, 300);

//  }
//  else {
    output += "<p><b>Authors</b>: "+doc.author.join(' ; ')+"<br/>";
    output += "<b>Year</b>: "+doc.pubyear_i + ' <b>BibCode</b>:' + doc.bibcode + ' <b>Citations</b>:' + doc.citationcount_i+"</p>";
//  }
 //output += '<div class="lessmore"> <span class="abstract" style="display:none;">' + doc.abstract;
 //output += '</span> <a href="#" class="more">more</a></div>';
 var objectnames=doc.objectnames_s;
 var obsids=doc.obsids_s;
//http://simbad.u-strasbg.fr/simbad/sim-id?Ident=NAME+CASSIOPEIA+A&NbIdent=1&Radius=2&Radius.unit=arcmin&submit=submit+id
//http://cda.harvard.edu/chaser/ocatList.do?obsid=3498,3744,4373,4374,4395
 if (objectnames==undefined){
	objectnames="None";
	var objlinks=[];
 } else {
	var objlinks=objectnames.map(function(ele)
		{
			return $('<a class="iframe" href="http://simbad.u-strasbg.fr/simbad/sim-id?Ident='+encodeURIComponent(ele)+'&NbIdent=1&Radius=2&Radius.unit=arcmin&submit=submit+id">'+ele+'</a>').fancybox({autoDimensions: false, width:1024, height:768});
		}
	);
 }
 if (obsids==undefined){
     obsids="None";
     var obsarray=[];
     // var obslinks=[];
     var $obsarea = $('<span>None</span>');
     // var $obsall = $('<span>None</span>');
     var $obsall = $('');
 } else {

     // we sort so that the same missions get grouped together
     var obsarray = obsids.sort().map(function(ele) {
	 return ele.split("/"); // assume '/' does not occur as part of an obsid; not ideal
     } );
     /*
     var obslinks = obsarray.map(function(ele) {
	 if (ele[0] == "CHANDRA") {
	     return $('<a class="iframe" href="http://cda.harvard.edu/chaser/ocatList.do?obsid='+ele[1]+'">'+ele[1]+'</a>').fancybox({autoDimensions: false, width:1024, height:768});
	 } else {
	     return ele[1];
	 }
     } );
     */

     // the following is not intended to be efficient or idiomatic javascript
     // it's also not creating the HTML I want
     var curmission = "";
     var $obsarea = $('<div>');
     for (var e1 in obsarray) {
	 var mission = obsarray[e1][0];
	 var obsid   = obsarray[e1][1];
	 if (mission !== curmission) {
	     if (curmission !== "") { $obsarea.append("</div>"); }
	     $obsarea.append("<div><i>" + mission + ":</i> "); // could add all link here if rework things
	     curmission = mission;
	 }

	 if (mission == "CHANDRA") {
	     $obsarea.append($('<a class="iframe" href="http://cda.harvard.edu/chaser/ocatList.do?obsid='+obsid+'">'+obsid+'</a> ').fancybox({autoDimensions: false, width:1024, height:768}));
	 } else {
	     $obsarea.append('<span>' + obsid + '</span> ');
	 }
     }
     $obsarea.append("</div></div>")
	     
     // Should think about doing the "all" list within the loop above
     //obsids=obslinks.join(",");
     var $obsall=$('<a class="iframe" href="http://cda.harvard.edu/chaser/ocatList.do?obsid='+obsarray.join(',')+'">All</a>').fancybox({autoDimensions: false, width:1024, height:768});
 }
 //console.log("output="+output);
 //var output2='<p><b>Objects</b>: '+objectnames+'<br/><b>Datasets</b>: '+obsids+" "+obsall+'<br/><b>Abstract</b>: '+doc.abstract+"</p>";
var $jqlist=$('<p><b>Datasets</b>: </p>');
    $jqlist = $jqlist.append($obsarea);
/*
for (var ele in obslinks){
    $jqlist = $jqlist.append(obslinks[ele]);
}
*/
var $jqlist2=$('<p><b>Objects</b>: </p>');
for (var ele in objlinks){
	$jqlist2=$jqlist2.append(objlinks[ele]);
} 
//alert("Abstract:"+doc.abstract);
var $output2=$('<p></p>').append($jqlist2).append($('<br/>')).append($jqlist).append($obsall).append($('<p><br/><b>Abstract</b>: '+doc.abstract+'</p>'));
return [$(output), $output2];
};

AjaxSolr.theme.prototype.tag = function (value, thecount, weight, handler, handler2) {
  
  var $thelink=$('<a href="#"/>').text(value).click(handler);
  var $thetext=$('<span></span>').text('('+thecount+')');
  //var $thepivot=$('<a href="#""/>').text('P').click(handler2);
  var $span=$('<span class="tagcloud_item"></span>').addClass('tagcloud_size_' + weight).append('[').append($thelink).append($thetext).append(']');
  //return [$thelink, $thetext, $thepivot]
  return $span;
};

AjaxSolr.theme.prototype.facet_link = function (value, handler) {
  return $('<a href="#"/>').text(value).click(handler);
};

AjaxSolr.theme.prototype.no_items_found = function () {
  return 'no items found in current selection';
};

AjaxSolr.theme.prototype.list_items = function (list, items, separator) {
  //var $list=$('#'+list);
  //console.log(list);
  //console.log($list);
  var $list=$(list);
  $list.empty();
  for (var i = 0, l = items.length; i < l; i++) {
    var li = jQuery('<li/>');
    //console.log("li"+li);
    if (AjaxSolr.isArray(items[i])) {
      for (var j = 0, m = items[i].length; j < m; j++) {
        if (separator && j > 0) {
          li.append(separator);
        }
        li.append(items[i][j]);
      }
    }
    else {
      //console.log("here");
      if (separator && i > 0) {
        li.append(separator);
      }
      li.append(items[i]);
    }
    $list.append(li);
  }
  //console.log("C"+$list);
};

})(jQuery);
