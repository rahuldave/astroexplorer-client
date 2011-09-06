/*
 * Common code for AstroExplorer
 */

var SITEPREFIX = '/semantic2/alpha';
var SOLRURL = SITEPREFIX + '/solr/';

(function() {
    function nop() {}
    if (! ("console" in window) || !("firebug" in console)) {
	var names = ["log", "debug", "info", "warn", "error", "assert", "dir",
		     "dirxml", "group", "groupEnd", "time", "timeEnd", "count",
		     "trace", "profile", "profileEnd"];
	window.console = {};
	for (var i = 0; i < names.length; ++i) {
	    window.console[names[i]] = nop;
	}
    }
})();

(function ($) {
    $(function () {

	function setLoggedIn(email) {
	    $('a#logouthref').text("logout " + email).show();
	    $('a#loginhref').hide();
	}

	function setLoggedOut() {
	    $('a#logouthref').hide();
	    $('a#loginhref').show();
	}
	
	function myjsonp(data){
            return data; //so that we dont handle url on server
	};

	$('#gosearch').click(function(){
            alert("not yet implemented");
	});

	$('a#loginhref').click(function () {
            var loc = encodeURIComponent(window.location);
            $.ajax({
		url: "http://labs.adsabs.harvard.edu" + SITEPREFIX + "/adsjsonp?callback=?",
		dataType: 'jsonp',
		jsonpcallback: myjsonp,
		success: function (data) {

		    if (data.email === undefined || data.email == '') {
			$('a#loginhref').click(function () {
                            var thispage = window.location;
                            var prefix = thispage.protocol + '//' + location.host;
                            var loc = encodeURIComponent(prefix + SITEPREFIX + "/login?redirect=" + window.location);
                            window.location.href = "http://adsabs.harvard.edu/cgi-bin/nph-manage_account?man_cmd=login&man_url=" + loc;
			});
			$('a#loginhref').trigger('click');

		    } else {
			// setLoggedin(data.email);
			$.post(SITEPREFIX + '/addtoredis', JSON.stringify(data), function() {
                            window.location.reload();
			});
                    }
		}
            });
	});

	$('a#logouthref').click(function () {
            var loc = encodeURIComponent(window.location);
            window.location.href = SITEPREFIX + "/logout?redirect=" + loc;
	});
	
        $.getJSON(SITEPREFIX + '/getuser', function(data) {
	    if (data.email === undefined || data.email == 'undefined') {
		// user is not logged in according to ADS, so check
		// our database.
		//
                if (data.startup !== undefined && data.startup != 'undefined') {
                    $.ajax({
			url: "http://labs.adsabs.harvard.edu" + SITEPREFIX + "/adsjsonp?callback=?",
			dataType: 'jsonp',
			jsonpcallback: myjsonp,
			success: function (adata) {
                            if (adata.email !== undefined && adata.email != '') {
				setLoggedIn(adata.email);
				$.post(SITEPREFIX + '/addtoredis', JSON.stringify(adata));
                            } else {
				setLoggedOut();
			    }
			}
                    });
                } else {
		    setLoggedOut();
		}

	    } else {
		setLoggedIn(data.email);
            }
        });

    });
})(jQuery);
