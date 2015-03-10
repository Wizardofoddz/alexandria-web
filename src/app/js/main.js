/* some global variables to make mistakes only once */
var serverAddress = '54.172.28.195'; // Dev
// var serverAddress = 'blue.a.blocktech.com'; // Demo
var apiURL = "http://"+ serverAddress +":3000/alexandria/v1";

var currentView = 'front';
var subView = '';
var prevTipAmount = '';
var fadeTimer = 200;

var routes = {};  
var filterTypes = [];

var FLOCost;
var FLOLTC;
var LTCUSD;
var FLOUSD;
var BTCUSD;
var cryptoTimerId = 0;


jQuery(document).ready(function($){

	loadAlexandria();
	
	// RUN SEARCH
	$('#search-main').on("keyup", function(e) {
		var code = e.keyCode || e.which;
		if (code == 13) {
			fullSearch(document.getElementById('search-main').value);
		}
	});

	// CLEAR SEARCH
	$('.clearSearch').click(function(){
		$(this).siblings('input[type="text"]').val('');
	});

	// Advanced Search toggle
	$('#adv-search-toggle').click(function(){
		$('#adv-search .module-links a').removeClass('active');
		$('#adv-search').fadeToggle(fadeTimer);
	});

	// Toggle modal on off-modal click
	$('body').on('click', function(e){		
		if ( ($(e.target).attr('id') != 'adv-search') && (!$(e.target).parents('#adv-search')[0]) && ($(e.target).attr('id') != 'adv-search-toggle') ) {			
			if($('#adv-search').css('display') == 'block') {
				$('#adv-search').fadeToggle(fadeTimer);
			}
		}
		if ( ( ($('#info-modal-media').css('display') == 'block') && ($('#info-modal-media').css('opacity') == 1) ) && ( (!$(e.target).parents('#info-modal-media')[0]) && ( (!$(e.target).parents('.info-icon')[0]) ) ) ) {
			$('#info-modal-media').fadeOut(fadeTimer);
		}
		if ( ( ($('#info-modal-small').css('display') == 'block') && ($('#info-modal-small').css('opacity') == 1) ) && ( (!$(e.target).parents('#info-modal-small')[0]) && ( (!$(e.target).parents('.info-icon')[0]) ) ) ) {
			$('#info-modal-small').fadeOut(fadeTimer);
		}
		if ( ( ($('#tip-modal').css('display') == 'block') && ($('#tip-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#tip-modal')[0]) && ( (!$(e.target).parents('.tip-icon')[0]) ) ) ) {
			$('#tip-modal').fadeOut(fadeTimer);
		}
		if ( (document.getElementById('bitmsg-modal').style.display == 'block') && ( (!$(e.target).parents('#bitmsg-modal')[0]) && (!$(e.target).parents('.bitmsg-icon')[0]) ) ) {
			document.getElementById('bitmsg-modal').style.display = 'none';
		}
		if ( ( ($('#share-modal').css('display') == 'block') && ($('#share-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#share-modal')[0]) && ( (!$(e.target).parents('.share-icon')[0]) ) ) ) {
			$('#share-modal').fadeOut(fadeTimer);
		}
		if ( ( ($('#user-modal').css('display') == 'block') && ($('#user-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#user-modal')[0]) && ( (!$(e.target).parents('#app-user-icon')[0]) ) ) ) {
			$('#user-modal').fadeOut(fadeTimer);
		}
		if ( ( ($('#add-menu-modal').css('display') == 'block') && ($('#add-menu-modal').css('opacity') == 1) ) && ( (!$(e.target).parents('#add-menu-modal')[0]) && ( (!$(e.target).parents('#addNewContent-icon')[0]) ) ) ) {
			$('#add-menu-modal').fadeOut(fadeTimer);
		}
	});
	
	// Modal controls
	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which;
		if (code == 27) {
			// esc pressed
			if ($('#lightbox').css('display') == 'block') {
				$('#lightbox').fadeOut(fadeTimer);
			}
			if($('#wait').css('display') == 'block') {
				document.getElementById('wait').style.display = 'none';
				document.getElementById('disabler').style.display = 'none';
			}
			if($('#user-modal.abs').css('display')=='block'){
				$('#user-modal.abs').fadeOut(fadeTimer);
			}
			if($('#add-menu-modal.abs').css('display')=='block'){
				$('#add-menu-modal.abs').fadeOut(fadeTimer);
			}
			$('.overlay-modal').each(function(){
				if ($(this).css('display')=='block'){
					hideOverlay();
				}
			});
			$('.bubble-modal').each(function(){
				if ($(this).css('display')=='block'){
					$(this).hide();
				}
			});
			$('.info-modal').each(function(){
				if ($(this).css('display')=='block'){
					$(this).hide();
				}
			});
		}
	});

	$('input[name="dNetwork"]').click(function(){
		if ($(this)[0]['checked']) {
			$(this).siblings('.input-container').slideDown(fadeTimer);
			resizeTabs(fadeTimer);
		} else {
			$(this).siblings('.input-container').slideUp(fadeTimer);
			resizeTabs(fadeTimer);
		}
	});

	// Alexandria Theme UI interactions
	$('.alex-switch').click(function(){
		$(this).toggleClass('switched-on');
	});
	
	// Tip Modal Tabs
	$('.modal-tabs li').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		$('#tip-modal').find('.modal-tab#'+$(this).attr("name")).show().siblings('.modal-tab').hide();
	});

	// API Server ID and Control
	if(serverAddress == '54.172.28.195'){
		$('#serverID').text('Dev');
	} else {
		$('#serverID').text('Localhost');
	}
	$('#serverID').click(function(){
		if(serverAddress == '54.172.28.195'){
			serverAddress = 'localhost'
			$('#serverID').text('Localhost');
		} else {
			serverAddress = '54.172.28.195'
			$('#serverID').text('Dev');
		}		
	});
	
	// SET LOADED VALUE
	var loadedTimer = setTimeout(function(){
		document.getElementById('loaded').innerHTML = '1';
	}, 3000);

	// Get exchange rates
	getCryptos();
	
}); // End Document.Ready

// The route registering function:
function route (path, templateId, controller) {  
  routes[path] = {templateId: templateId, controller: controller};
  console.info(routes);
}
route('/', 'front', function () {  });  
route('/media', 'media', function () {  });
route('/publishers', 'publishers', function () {  });
route('/add-media', 'add-media', function () {  });
route('/add-publisher', 'add-publisher', function () {  });
route('/search', 'search', function () {  });
route('/about', 'about', function () {  });

var el = null;  
function router () {  
    // Current route url (getting rid of '#' in hash as well):
    var url = location.hash.slice(1) || '/';
	var paths = url.split('/');
	if (paths[1]) {
		var module = '/'+paths[1];
	} else {
		var module = url;
	}
    // Get route by url:
    var route = routes[module];
    // Route the URL
    if ( (route) && (route.controller) ) {
    	currentView = route.templateId;
    	if (currentView == 'front') {
    		resetAlexandria();
    		return false;
    	}
		resetInterface();
    	if (currentView == 'media') {
			if (!paths[2]) {
				filterMediaByType();
			} else {
				if (paths[2] == 'search') {
					var searchTerm = paths[3].toString().replace("-"," ").split('?')[0];
					var searchResults = searchAPI(currentView, '*', searchTerm);
					if (location.hash.indexOf('types') != -1) {
						var parseTypes = location.hash.split('types=')[1].split('-');
						for (var i = 0; i < parseTypes.length; i++) {
							filterTypes.push(parseTypes[i]);
						}
					}
					populateSearchResults(searchResults, currentView);
					buildHistory();
				} else {
					var searchOn = paths[2].replace("-","_");
					if (searchOn.length == 64) {
						loadArtifactView();
					} else {
						console.info(paths);
						if ( (paths[2] == 'type') && (paths[3]) ) {
							var parseTypes = location.hash.split('type/')[1];
							var parseTypeLen = parseTypes.split('-');						
							if (parseTypeLen.length > 1) {
								var searchForStr = '';
								for (var i = 0; i < parseTypeLen.length; i++) {
									if (searchForStr == '') {
										searchForStr = '"'+ parseTypeLen[i]+'"';
									} else {
										searchForStr = searchForStr +',"'+ parseTypeLen[i]+'"';
									}
								}
								var searchFor = searchForStr;
							} else {
								var searchFor = [paths[3]];
							}
						} else if ((paths[2] != 'type') && (paths[3])) {
							var searchFor = paths[3].replace("-"," ");
						} else {
							var searchFor = '';
						}
						var searchResults = searchAPI(currentView, searchOn, searchFor);
						populateSearchResults(searchResults, currentView);
						buildHistory();
					}
				}
			}
    	} else if (currentView == 'publishers') {
			if (!paths[2]) {
				getAllPublishers();
			} else {
				var searchResults;
				if (paths[2].length == 34)  {
					searchResults = searchAPI('publisher', 'address', paths[2]);
					loadPublisherView();
				} else if (paths[2].length == 64)  {
					searchResults = searchAPI('publisher', 'txid', paths[2]);
					loadPublisherView();
				} else {
					var publisherName = paths[2].replace("-"," ");
					searchResults = searchAPI('publisher', 'name', publisherName);
					populateSearchResults(searchResults, currentView);
					buildHistory();
				}
			}
    	} else if (currentView == 'add-media') {
			loadShareMod();
    	} else if (currentView == 'add-publisher') {
			loadCreatePublisherMod();
    	} else if (currentView == 'search') {
    		fullSearch(paths[2].toString().replace("-"," ").split('?')[0]);
    	} else if (currentView == 'about') {
    		loadAboutView();
    	}
    } else {
    	// ROUTE DOESN'T EXIST - IF ADDRESS LOAD PUBLISHER
    	if (paths[1].length == 34) {
			var searchResults = searchAPI('publisher', 'address', paths[1]);
			loadPublisherView();
    	} else if (paths[1].length == 64) {
			var searchResults = searchAPI('publisher', 'txid', paths[1]);
			if (!searchResults) {
				loadArtifactView();
			} else {
				loadPublisherView();
			}
    	}
    }

}

// Listen on hash change:
window.addEventListener('hashchange', router);  

// Listen on page load:
window.addEventListener('load', router);

// TIMER FOR CHANGING EXCHANGE RATES
function changeCryptoRates() {
	if (cryptoTimerRunning == 1) {
		return false;
	} else {
		// set a timer and run search if done typing
		cryptoTimerRunning = 1;
		cryptoTimerId = setTimeout ( 'getCryptos()', 1000 );
	}
}

// MAKE HISTORY
function buildHistory() {
	console.log('History popped!');
	var newURL = document.location.origin + document.location.pathname;
	console.log(document.title);
	if ( (currentView != 'front') && (subView == '') ) {
		document.title = 'ΛLΞXΛNDRIΛ > '+ currentView.charAt(0).toUpperCase() + currentView.slice(1);
		newURL = newURL+'#/'+currentView;
		if ( ($('#browse-media .module-links a.active').length == 0) && (location.hash.slice(1).split('/')[2] != 'type') && (location.hash.slice(1).split('/')[2] != 'search') && (location.hash.slice(1).split('/')[1] != 'search') ) {
			var locationInfo = location.hash.slice(1).split('/');
			var urlHash = location.hash.slice(1).split('/');
			if (location.hash.slice(1).split('/').length > 2) {
				var urlHash = location.hash.slice(1).split('/');
				for (var i = 2; i < urlHash.length; i++) {
					newURL = newURL+'/'+ urlHash[i];
				}
			}
			if ( (currentView == 'publishers') && (document.getElementById('loaded').innerHTML != '1') ) {
				for (var i = 2; i < urlHash.length; i++) {
					newURL = newURL+'/'+ searchUrl[i];
				}
			}
		}
		if (filterTypes.length > 0) {
			var searchUrl = location.hash.slice(1).split('/');
			var searchQuery = '';
			console.info(newURL);
			for (var i = 0; i < filterTypes.length; i++) {
				searchQuery = (searchQuery == '' ) ? (filterTypes[i]) : (searchQuery +'-'+filterTypes[i]);
				$('#browse-media .module-links a[value="'+filterTypes[i]+'"]').addClass('active');
			}
			for (var i = 2; i < searchUrl.length; i++) {
				newURL = newURL+'/'+ searchUrl[i];
			}
			if ( (filterTypes != '') && (filterTypes.length > 0) && (location.hash.indexOf('search') > -1) && (document.getElementById('loaded').innerHTML == '1') ) {
				newURL = (newURL.split('?')[0]) ? (newURL.split('?')[0] + '?types=' + searchQuery) : (newURL + '?types=' + searchQuery) ;
			}
		}
	} else if ( subView != '' ) {
		newURL = newURL+'#/'+subView;
		document.title = (currentView == 'artifact') ? ('ΛLΞXΛNDRIΛ > Media > '+ subView) : (document.title = 'ΛLΞXΛNDRIΛ > Publishers > '+ subView);
	} else if (history.state) {
		if ( (history.state.searchResults == true) && (history.state.currentView == 'publishers') ) {
			document.title = 'ΛLΞXΛNDRIΛ > Publishers > '+ history.state.searchTerm;
			var newTitle = 'ΛLΞXΛNDRIΛ > Publishers > '+ history.state.searchTerm;
		} else if ( (history.state.searchResults == true) && (history.state.currentView == 'media') ) {
			document.title = 'ΛLΞXΛNDRIΛ > Media > '+ history.state.searchTerm;
			var newTitle = 'ΛLΞXΛNDRIΛ > Media > '+ history.state.searchTerm;
		} else if ( (history.state.searchResults == true) && (history.state.currentView == 'search') ) {
			document.title = 'ΛLΞXΛNDRIΛ > Search > '+ history.state.searchTerm;
			var newTitle = 'ΛLΞXΛNDRIΛ > Search > '+ history.state.searchTerm;
		}
	} else {
		document.title = 'ΛLΞXΛNDRIΛ';
		var newTitle = 'ΛLΞXΛNDRIΛ';
	}
	if ( (location.hash.slice(1).split('/')[2] == 'type') && (document.getElementById('loaded').innerHTML != '1') ) {
		var parseTypes = location.hash.split('type/')[1];
		var parseTypeLen = parseTypes.split('-');
		if (parseTypeLen.length > 1) {
			for (var i = 0; i < parseTypeLen.length; i++) {
				filterTypes.push(parseTypeLen[i]);
				$('#browse-media .module-links a[value="'+ parseTypeLen[i] +'"').addClass('active');
			}
		} else {
			$('#browse-media .module-links a[value="'+ parseTypes +'"').addClass('active');
			filterTypes = [parseTypes];
		}
	}
	if ( (location.hash.slice(1).split('/').length > 3) && (location.hash.slice(1).split('/')[2] != 'type') && (location.hash.slice(1).split('/')[2] != 'search') ) {
		for (var i = 2; i < location.hash.slice(1).split('/').length; i++) {
			newURL = newURL+'/'+location.hash.slice(1).split('/')[i];
		}
	}
	if ( (filterTypes != '') && (filterTypes.length > 0) && (location.hash.slice(1).split('/')[2] != 'search') ) {
		newURL = document.location.origin + document.location.pathname;
		$('#browse-media .module-links a').removeClass('active');
		var urlTypes = '';
		for (var i = 0; i < filterTypes.length; i++) {
			$('#browse-media .module-links a[value="'+filterTypes[i]+'"]').addClass('active');
			if (urlTypes == '') {
				urlTypes = newURL+'#/media/type/' + filterTypes[i];
			} else {
				urlTypes = urlTypes + '-' + filterTypes[i];
			}
			newURL = urlTypes;
		}
	} else if ( (currentView == 'media') && (location.hash.slice(1).split('/')[2] == 'search') && (filterTypes.length == 0) && (resetSearch == 0) ) {
		newURL = document.location.origin + document.location.pathname + '#/'+currentView;
		var searchUrl = location.hash.slice(1).split('/');
		var searchQuery = '';
		for (var i = 2; i < searchUrl.length; i++) {
			newURL = newURL+'/'+ searchUrl[i];
		}
		if ( (location.hash.indexOf('search') > -1) && (document.getElementById('loaded').innerHTML == '1') && (searchQuery != '') ) {
			newURL = (newURL.split('?')[0]) ? (newURL.split('?')[0] + '?types=' + searchQuery) : (newURL + '?types=' + searchQuery) ;
		} else if ( (location.hash.indexOf('search') > -1) && (document.getElementById('loaded').innerHTML == '1') && (searchQuery == '') ) {
			newURL = newURL.split('?')[0];
		}
	}
	if (subView == '') {
		var stateObj = {
			currentView: currentView
		};
	} else {
		var stateObj = {
			currentView: currentView,
			subView: subView
		};
	}
	history.pushState(stateObj, newTitle, newURL);
	resetSearch = 0;
}

// GET CRYPTO EXCHANGE RATES
function getCryptos() {
	clearTimeout ( cryptoTimerId );
	cryptoTimerRunning = 0;
// Bitcoin
	$.ajax({
	    url: 'http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=2',
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			BTCUSD = parseFloat(data.return.markets.BTC.lasttradeprice);
			$('.btc-usd .btc-usd-output').text(Math.round((1/BTCUSD)*100000000)/100000000);
			var qrcode = new QRCode("qrcode", {
				text: "bitcoin:3CHHe6DwYFmx5c8LLm1RQBcGiexCJJrMqT?label=hoodiethehomeless",
				width: 64,
				height: 64,
				colorDark : "#000000",
				colorLight : "#d8d8d8",
				correctLevel : QRCode.CorrectLevel.H
			});

		}
	});
	$.ajax({
	    url: 'http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=61',
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			$('#flo-ltc label').text(data.return.markets.FLO.label).next('span').text(data.return.markets.FLO.lasttradeprice);
			FLOLTC = parseFloat($('#flo-ltc span').text());
			$.ajax({
				url: 'http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=1',
				type: 'GET',
				success: function(e) {
					var el = $( '#sketchpad' );
					el.html(e.responseText);
					var data = $.parseJSON($('p', el).html());
					$('#ltc-usd label').text(data.return.markets.LTC.label).next('span').text(data.return.markets.LTC.lasttradeprice);
					LTCUSD = parseFloat($('#ltc-usd span').text());
					FLOUSD = FLOLTC*LTCUSD;
					$('#flo-usd label').text('FLO/USD').next('span').text(FLOUSD);
					FLOCost = parseFloat($('#flo-cost').text());
					$('#tip-modal .flo-usd-output').text(Math.round((1/FLOUSD)*100)/100);
					$('#newMedia-notary .flo-usd-output').text(Math.round((FLOUSD*FLOCost)*100000)/100000);
					$('#tip-alexandria-modal .flo-usd-output').text(Math.round((document.getElementById('alexandria-tip-amount').value*FLOUSD)*100000)/100000);
				}
			});
		}
	});
}

// GET ALL PUBLISHERS
function getAllPublishers() {
	$('video').trigger('pause');
	currentView = 'publishers';
	subView = '';
	filterTypes = [];
	document.getElementById('intro').style.display = 'none';
	$('main').hide();
	$('#browse-media .module-links a.active').removeClass('active');
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('.sharing-ui').hide();
	$('.publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	$('#user-modal').fadeOut(fadeTimer);
	$('.view-media-ui').hide();
	$('.view-publisher-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	console.log('loadRecentMedia() publisher/get/all ...');
	$.ajax({
		url: 'http://'+serverAddress+':41289/alexandria/v1/publisher/get/all',
		success: function (e) {
			var data = $.parseJSON(e);
			console.info(data);
			populateSearchResults(data, 'publisher');
			buildHistory();
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
	});
}

// PUBLISHER SINGLE ENTITY VIEW
function loadPublisherEntity(obj) {
	$('video').trigger('pause');
	document.getElementById('media-breadcrumbs-type').innerHTML = '';
	document.getElementById('media-breadcrumbs-publisher').innerHTML = '';
	document.getElementById('media-breadcrumbs').innerHTML = '';
	var publisherNav = $(obj).parents('.publisher-entity').hasClass('publisher-entity');
	if (publisherNav == true) {
		var parentObj = $(obj).parents('.publisher-entity');
	} else {
		var parentObj = obj;
	}
	document.getElementById('publisher-avatar').src = '';
	loadPublisherView(parentObj);
}

// LOAD PUBLISHER ENTITY VIEW
function loadPublisherView(objMeta) {
	currentView = 'publisher';
	filterTypes = [];
	document.getElementById('intro').style.display = 'none';
	$('main').hide();
	$('.view-media-ui').hide();
	$('#share-modal').css({
			left:'initial',
			right:'initial'
		}).hide();
	$('#tip-modal').css({
			'left':'initial',
			'right':'initial'
		}).hide();
	$('#publisher-media-list li').remove();
	$('#view-publisher .entity-view').show();
	$('#viewlabel').show();
	$('.view-publisher-ui').show();
	$('#view-publisher').fadeIn(fadeTimer);	
	if (location.hash.slice(1).split('/')[2]) {
		var publisherID = (objMeta) ? ($(objMeta).attr('id').split('-')[1]) : (location.hash.slice(1).split('/')[2]) ;
	} else if (location.hash.slice(1).split('/')[1]) {
		var publisherID = (objMeta) ? ($(objMeta).attr('id').split('-')[1]) : (location.hash.slice(1).split('/')[1]) ;
	} else {
		var publisherID = $(objMeta).attr('id').split('-')[1];
	}
	var thisPublisher = (publisherID.length == 34) ? (searchAPI('publisher', 'address', publisherID)) : searchAPI('publisher', 'txid', publisherID);
	console.info(thisPublisher);
	publisherID = thisPublisher[0]['txid'];
	thisPublisher = thisPublisher[0]['publisher-data']['alexandria-publisher'];
	var publisherAddress = thisPublisher['address'];
	subView = publisherAddress;
	var thisPublisherMedia = searchAPI('media', 'publisher', publisherAddress);
	console.info(thisPublisherMedia);
	var publisherName = thisPublisher['name'];
	document.getElementById('publisher-breadcrumbs').innerHTML = publisherName;
	var publisherTime = thisPublisher['timestamp'];
	var publisherMD5;
	if ( (thisPublisher['emailmd5'] != '') && (thisPublisher['emailmd5'] != 'd41d8cd98f00b204e9800998ecf8427e') ) {
		publisherMD5 = thisPublisher['emailmd5'];
		document.getElementById('publisher-avatar').src = 'http://www.gravatar.com/avatar/'+publisherMD5;
	} else {
		document.getElementById('publisher-avatar').style.display = 'none';
	}
	if (thisPublisher['bitmessage'] != '') {
		var publisherBitmsg = thisPublisher['bitmessage'];
		document.getElementById('bitmsg-address').innerHTML = publisherBitmsg;
	} else {
		document.getElementById('publisher-bitmsg').style.display = 'none';
	}
	publisherTime = new Date(parseInt(publisherTime));
	document.getElementById('view-publisher-name').innerHTML = publisherName;
	document.getElementById('publisher-FLO-address').innerHTML = publisherAddress;
	if (thisPublisherMedia) {
		for (var i = 0; i < thisPublisherMedia.length; i++) {
			var mediaID = thisPublisherMedia[i]['txid'];
			var mediaType = thisPublisherMedia[i]['media-data']['alexandria-media']['type'];
			var mediaInfo = thisPublisherMedia[i]['media-data']['alexandria-media']['info'];
			var mediaPubTime = thisPublisherMedia[i]['media-data']['alexandria-media']['timestamp'];
			var mediaPubTimeLen = thisPublisherMedia[i]['media-data']['alexandria-media']['timestamp'].toString().length;
			if (mediaPubTimeLen == 10) {
				mediaPubTime = parseInt(mediaPubTime)*1000;
			}					
			var mediaTitle = mediaInfo['title'];
			var mediaDesc = mediaInfo['description'];
			var mediaRuntime = 0;
			var mediaArtist = '';
			var mediaFilename = '';
			var mediaTid = thisPublisherMedia[i]['media-data']['alexandria-media']['torrent'];
			var mediaFLO = thisPublisherMedia[i]['media-data']['alexandria-media']['publisher'];
			if(thisPublisherMedia[i]['media-data']['alexandria-media']['payment']){
				var mediaPymnt = thisPublisherMedia[i]['media-data']['alexandria-media']['payment']['type'];
			}
			if (mediaInfo['extra-info']) {
				if(mediaInfo['extra-info']['runtime']){
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['runtime']);
				}
				if(mediaInfo['extra-info']['artist']){
					mediaArtist = mediaInfo['extra-info']['artist'];
				}						
				if(mediaInfo['extra-info']['filename']){
					mediaFilename = mediaInfo['extra-info']['filename'];
				}						
			}
			if (mediaRuntime != 0) {
				mediaRuntime = '<div class="media-runtime">Runtime: <span>' + mediaRuntime + '</span></div>';
			} else {
				mediaRuntime = '';
			}
			var mediaEntity = '<li id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '" media-filename="'+mediaFilename+'"><div class="browse-icon" onclick="loadMediaEntity(this);"><img src="img/' + mediaType + '-icon.svg" class="makesvg entity-image" onclick="loadMediaEntity(this);" style="display: inline;"></div><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle + '</h3> '+ mediaRuntime +' <a class="info-icon" onclick="loadInfoModal(this)"><img src="img/info-icon.svg" class="makesvg" style="display: inline;">info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);"><img src="img/play-icon-small.svg" class="makesvg" style="display: inline;">play</a><div class="media-pub-time hidden">' + new Date(parseInt(mediaPubTime)) + '</div><div class="media-desc hidden">' + mediaDesc + '</div><div class="media-Tid hidden">' + mediaTid + '</div><div class="FLO-address hidden">' + mediaFLO + '</div><div class="media-pymnt hidden">'+mediaPymnt+'</li>';
			$('#publisher-media-list').prepend(mediaEntity);
		}
	}
	buildHistory();
	replaceSVG();	
	$('#view-publisher .entity-pub-time span').html(publisherTime);
}

// LOAD MEDIA ARTIFACT VIEW
function loadMediaEntity(obj) {
	var parentObj = $(obj).parents('.media-entity');
	var mediaType = $(parentObj).attr('media-type');
	// Check Movie for IMDB Verification
	if (mediaType == 'movie') {
		var mediaTxnID = $(parentObj).attr('id').split('-')[1];
		var IMDBid = $(parentObj).find('.media-www-id').text();
		var IMDBapi = 'http://www.myapifilms.com/imdb?idIMDB='+ IMDBid;
		$.ajax({
		    url: IMDBapi,
		    type: 'GET',
		    success: function(e) {
				var el = $( '#sketchpad' );
				el.html(e.responseText);
				var data = $.parseJSON($('p', el).html());
				if(data['simplePlot'].indexOf('Alexandria:') > -1) {
					var verifyTxn = data['simplePlot'].split('Alexandria:')[1];
					if (trim11(verifyTxn)== mediaTxnID) {
						loadArtifactView(parentObj);
					} else {
						alert('Incorrect TxnID');
						return false;
					}
				} else {
					alert('Not yet verified!');
					return false;
				}
		    },
			error: function (xhr, ajaxOptions, thrownError) {
				console.error(xhr.status);
				console.error(thrownError);
			}
	    });
	} else {
		// Load Media Entity View
		loadArtifactView(parentObj);
	}
}

function loadArtifactView(objMeta) {
	currentView = 'artifact';
	filterTypes = [];
	document.getElementById('intro').style.display = 'none';
	$('main').hide();
	$('#share-modal').css({
			left:'initial',
			right:'initial'
		}).hide();
	$('#tip-modal').css({
			'left':'initial',
			'right':'initial'
		}).hide();
	$('.view-publisher-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	$('#view-media .entity-view').hide();
	$('#view-media').show();	
	var mediaID = '';
	if (objMeta) {
		mediaID = $(objMeta).attr('id').split('-')[1];
	} else {
		if (location.hash.slice(1).split('/')[2]) {
			mediaID = location.hash.slice(1).split('/')[2];
		} else {
			mediaID = location.hash.slice(1).split('/')[1];
		}
	}
	subView = mediaID;
	var thisMediaData = searchAPI('media', 'txid', mediaID);
	console.info(thisMediaData);
	mediaID = thisMediaData[0]['txid'];
	var mediaPublisher = thisMediaData[0]['publisher-name'];
	var publisherID = thisMediaData[0]['media-data']['alexandria-media']['publisher'];
	var mediaType = thisMediaData[0]['media-data']['alexandria-media']['type'];
	var mediaInfo = thisMediaData[0]['media-data']['alexandria-media']['info'];
	var mediaPubTime = thisMediaData[0]['media-data']['alexandria-media']['timestamp'];
	var mediaPubTimeLen = thisMediaData[0]['media-data']['alexandria-media']['timestamp'].toString().length;
	if (mediaPubTimeLen == 10) {
		mediaPubTime = parseInt(mediaPubTime)*1000;
	}
	mediaPubTime  = new Date(parseInt(mediaPubTime));
	var mediaTitle = mediaInfo['title'];
	var mediaDesc = mediaInfo['description'];
	var mediaRuntime = 0;
	var mediaArtist = '';
	var mediaFilename = '';
	var wwwId = '';
	var mediaTid = thisMediaData[0]['media-data']['alexandria-media']['torrent'];
	var mediaFLO = thisMediaData[0]['media-data']['alexandria-media']['publisher'];
	if(thisMediaData[0]['media-data']['alexandria-media']['payment']) {
		var mediaPymnt = thisMediaData[0]['media-data']['alexandria-media']['payment']['type'];
	}
	if ((mediaPymnt) && (mediaPymnt == 'tip')) {
		$('.tip-amounts li').remove();
		var tipAmounts = thisMediaData[0]['media-data']['alexandria-media']['payment']['amount'].split(',');
		for (var i = 0; i < tipAmounts.length; i++) {
			var thisTipAmount = tipAmounts[i]/100;
			var tipOption = '<li><input type="radio" name="tip-amount" id="tip-option-'+i+'" value="'+ thisTipAmount +'" onclick="changeTipAmount(this);"><label for="tip-option-'+i+'">$'+ thisTipAmount +'</label></li>';
			$('.tip-amounts').append(tipOption);
		}
		$('.tip-amounts').append('<li><input type="radio" name="tip-amount" id="tip-option-custom" value="5" onclick="changeTipAmount(this);" /><label for="tip-option-custom">$</label><input type="text" value="5.00" class="tip-input" name="CustomTipAmount"  id="CustomTipAmount" onfocus="changeCustomTipAmount();" onKeyDown="prevTipAmountSet();" onKeyUp="customTipAmountInput(event);" /></li>');
	}
	if(mediaInfo['extra-info']){
		if(mediaInfo['extra-info']['runtime']){
			mediaRuntime = calcRuntime(mediaInfo['extra-info']['runtime']);
		}
		if(mediaInfo['extra-info']['artist']){
			mediaArtist = mediaInfo['extra-info']['artist'];
		}						
		if(mediaInfo['extra-info']['filename']){
			mediaFilename = mediaInfo['extra-info']['filename'];
		}
		if(mediaInfo['extra-info']['wwwId']) {
			wwwId = mediaInfo['extra-info']['wwwId'];
		}
	}
	if ( (mediaType == 'video') && (wwwId != '') ) {
		var youtubePoster = getYouTubePic(wwwId);
		console.log(youtubePoster);
	}
	document.getElementById('media-breadcrumbs-publisher').innerHTML = '<a onclick="loadPublisherEntity(this)" id="publisher-' + publisherID + '">'+mediaPublisher+'</a>';
	document.getElementById('media-breadcrumbs-type').innerHTML = '<a onclick="filterMediaByType(&apos;'+mediaType+'&apos;)">'+mediaType+'</a>';
	document.getElementById('media-breadcrumbs').innerHTML = mediaTitle;
	if (mediaType == 'movie') {
		getRotten();
	}
	$('.view-media-ui').show();
	$('#viewlabel').show();
	$('#media-view-entity .media-Tid a').attr('href','magnet:?xt=urn:'+mediaTid+'&dn='+escape(mediaTitle));
	if ( (mediaType == 'video') || (mediaType == 'movie') ) {
		var videoHash = mediaTid.split('btih:')[1];
		var videoEmbed = '<video controls id="streamingVideo"> <source src="http://localhost:3000/stream/'+ videoHash +'/'+ mediaFilename +'" type="video/mp4" /> </video>';
		$('.row.entity-footer.media-video').html(videoEmbed);
	} else if ( (mediaType == 'music') || (mediaType == 'podcast') ) {
		var audioHash = mediaTid.split('btih:')[1];
		var audioEmbed = '<audio controls> <source src="http://localhost:3000/stream/'+ videoHash +'/'+ mediaFilename +'" type="audio/mpeg" /> </audio>';
		$('.row.entity-footer.media-video').html(videoEmbed);
	}
	$('#media-txnID').html(mediaID);	
	$('main:visible .FLO-address').html(mediaFLO);
	$('#media-view-entity .entity-meta-header h2').html(mediaTitle);
	if (mediaArtist) {
		document.getElementById('media-artist-name').outerHTML = '<h3 id="media-artist-name" onclick="searchByField(&apos;media&apos;, &apos;info_extra&apos;, &apos;'+ mediaArtist +'&apos;)">'+ mediaArtist +'</h3>';
	}
	$('#media-view-entity .entity-meta-header .entity-runtime').css('display',$(objMeta).find('.media-runtime').css('display'));
	$('#media-view-entity .entity-meta-header .entity-runtime').html(mediaRuntime);
	$('#media-view-entity .entity-meta-header .media-header').hide();
	$('#media-view-entity .entity-meta-header .media-header.media-'+mediaType).show();
	// $('#media-view-entity .media-image').html(mediaIcon);
	$('#media-view-entity .entity-pub-time span').html(mediaPubTime);
	if (mediaInfo['extra-info']) {
		if (mediaInfo['extra-info']['poster']) {
			mediaDesc = '<img src="http://localhost:3000/stream/'+ videoHash +'/'+ mediaInfo['extra-info']['poster'] +'" class="media-poster" />'+ mediaDesc;
		}
	}
	$('#media-view-entity .media-desc').html('<p>'+ mediaDesc +'</p>');
	if (mediaPymnt == 'none') {
		$('#media-view-entity .tip-icon').hide();
	} else {
		$('#media-view-entity .tip-icon').show();
	}
	$('#media-view-entity .entity-footer').hide();
	$('#media-view-entity .entity-footer.media-'+mediaType).show();
	$('#media-view-entity').show();
	// URL and Browser Nav for Media Entity View
	buildHistory();
/*
	var stateObj = {
		currentView: currentView,
		mediaType: mediaType,
		mediaTitle: mediaTitle,
		mediaMeta: mediaMeta
	};
	var titleLower = mediaTitle.replace(/\s/g , "-").toLowerCase();
	var mediaMetaLower = mediaMeta.replace(/\s/g , "-").toLowerCase();
	var newURL = document.location.origin + document.location.pathname +'?view='+currentView+'&title='+encodeURIComponent(titleLower)+'&entity='+encodeURIComponent(mediaMetaLower);
	var newTitle = 'Alexandria > '+mediaTitle+' '+mediaMeta;
	history.pushState(stateObj, newTitle, newURL);
	document.title = newTitle;
	*/
}

// CHANGE CUSTOM TIP AMOUNT
function changeCustomTipAmount() {
	$('#tip-option-custom').click();
}

// CHANGE FLO TIP AMOUNT
function changeTipAmount(opt) {
	var tipAmount = ($(opt).attr('id')=='tip-option-custom') ? (parseFloat($(opt).siblings('.tip-input').val())) : parseFloat($(opt).val()) ;
	$('.tip-value').text(tipAmount);
	$('#tip-modal .flo-usd-output').text(Math.round((tipAmount/FLOUSD)*100)/100);
	$('.btc-usd .btc-usd-output').text(Math.round((tipAmount/BTCUSD)*100000000)/100000000);
}

// SET CUSTOM TIP AMOUNT BY INPUT
function prevTipAmountSet() {
	prevTipAmount = document.getElementById('CustomTipAmount').value;
}

function customTipAmountInput(event) {
	var charCode = event.charCode;
	var tipAmount = parseFloat(document.getElementById('CustomTipAmount').value);
	if ( ( (charCode > 64) && (charCode < 91) ) || ( (charCode > 105) && (charCode < 144) ) || (charCode > 186) || (isNaN(tipAmount) == true) ) {
		document.getElementById('CustomTipAmount').value = prevTipAmount;
		$('.tip-value').text(prevTipAmount);
		$('#tip-modal .flo-usd-output').text(Math.round((prevTipAmount/FLOUSD)*100000000)/100000000);
		return false;
	}
	if (tipAmount != prevTipAmount) {
		var decValue = document.getElementById('CustomTipAmount').value.split('.')[1];
		if(decValue) {
			if (decValue.length > 2){
				document.getElementById('CustomTipAmount').value = tipAmount.toFixed(2);
			}
		}
		tipAmount = document.getElementById('CustomTipAmount').value;
		document.getElementById('tip-option-custom').value = tipAmount;
		$('.tip-value').text(tipAmount);
		$('.flo-usd-output').text(Math.round((tipAmount/FLOUSD)*100000000)/100000000);
	}
}

// GENERAL SEARCH
function fullSearch(searchFor) {
	$('video').trigger('pause');
	document.getElementById('intro').style.display = 'none';
	$('main').not('#browse-media').hide();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('.sharing-ui').hide();
	$('.publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	$('#user-modal').fadeOut(fadeTimer);
	$('.view-media-ui').hide();
	$('.view-publisher-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	var publisherResults = searchAPI('publisher', 'name', searchFor);
	console.info(publisherResults);
	var mediaResults = searchAPI('media', '*', searchFor);
	console.info(mediaResults);
	$('#adv-search').fadeOut(fadeTimer);
	var stateObj = {
		currentView: 'search',
		searchResults: true,
		searchTerm: document.getElementById('searchTermInput').value
	}
	var newTitle = 'ΛLΞXΛNDRIΛ > Search';
	var newUrl = document.location.origin + document.location.pathname +'#/search/'+ searchFor.replace(/\s/g , "-").toLowerCase();
	window.history.replaceState(stateObj, newTitle, newUrl);	$('#browse-media .module-links a').removeClass('active');
	populateSearchResults(publisherResults, 'publisher');
	populateSearchResults(mediaResults, 'media');
	currentView = 'search';
	subView = '';
	buildHistory();
}

// ADVANCED SEARCH
function selectSearchMediaType(obj){
	filterTypes = [];
	$(obj).toggleClass('active');
	$('#adv-search .module-links a.active').each(function(){
		filterTypes.push($(this).attr('value'));
	});
}

// EXECUTE ADVANCED SEARCH
function buildSearch() {
	$('video').trigger('pause');
	document.getElementById('intro').style.display = 'none';
	$('main').not('#browse-media').hide();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('.sharing-ui').hide();
	$('.publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	$('#user-modal').fadeOut(fadeTimer);
	$('.view-media-ui').hide();
	$('.view-publisher-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	var searchProtocol = document.getElementById('searchModule').value;
	var searchOn = (searchProtocol == 'media') ? (searchOn = '*') : (searchOn = 'name') ;
	var AdvSearchResults = searchAPI(searchProtocol, searchOn, document.getElementById('searchTermInput').value);
	console.info(AdvSearchResults);
	if (searchProtocol == 'publisher') {
		var stateObj = {
			currentView: 'publishers',
			searchResults: true,
			searchTerm: document.getElementById('searchTermInput').value
		}
		var newTitle = 'ΛLΞXΛNDRIΛ > Publisher Search';
		var newUrl = document.location.origin + document.location.pathname +'#/publishers/'+document.getElementById('searchTermInput').value.replace(/\s/g , "-").toLowerCase();
		window.history.replaceState(stateObj, newTitle, newUrl);
	} else if (searchProtocol == 'media') {
		var stateObj = {
			currentView: 'media',
			searchResults: true,
			searchTerm: document.getElementById('searchTermInput').value
		}
		var newTitle = 'ΛLΞXΛNDRIΛ > Media Search';
		var newUrl = document.location.origin + document.location.pathname +'#/media/search/'+document.getElementById('searchTermInput').value.replace(/\s/g , "-").toLowerCase();
		window.history.replaceState(stateObj, newTitle, newUrl);
	}
	if ($('#adv-search .module-links a.active').length == 0) {
		filterTypes = [];
	}
	$('#adv-search').fadeOut(fadeTimer);
	subView = '';
	$('#browse-media .module-links a').removeClass('active');
	populateSearchResults(AdvSearchResults, searchProtocol);
	buildHistory();
}

// CLEAR ADVANCED SEARCH
function cancelSearch() {
	$('#adv-search').fadeToggle(fadeTimer).find('input[type="text"]').val('');
}

// SEARCH BY FIELD
function searchByField(module, searchOn, searchFor) {
	$('video').trigger('pause');
	var AdvSearchResults = searchAPI(module, searchOn, searchFor);
	subView = '';
	$('main').not('#browse-media').hide();
	$('#browse-media .module-links a').removeClass('active');
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	$('#user-modal').fadeOut(fadeTimer);
	$('.view-media-ui').hide();
	$('.view-publisher-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	var stateObj = {
		currentView: 'media',
		searchResults: true,
		searchTerm: document.getElementById('searchTermInput').value
	}
	var newTitle = 'ΛLΞXΛNDRIΛ > Media Search';
	var newUrl = document.location.origin + document.location.pathname + '#/media/search/' + searchFor.replace(/\s/g , "-").toLowerCase();
	window.history.replaceState(stateObj, newTitle, newUrl);
	populateSearchResults(AdvSearchResults, module);
	buildHistory();
}

// MEDIA + PUBLISHER SEARCH API
function searchAPI(module, searchOn, searchFor) {
	if ( (searchOn == 'type') && (searchFor.length > 1) ) {
		searchFor = '['+searchFor+']';
	} else {
		searchFor = '"'+searchFor+'"';
	}
	queryString = '{"protocol":"'+ module +'","search-on":"'+ searchOn +'","search-for":'+searchFor+',"search-like": true}';
	console.log(queryString);
	var mediaData;
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$.ajax({
		type: "POST",
		url: 'http://'+ serverAddress +':41289/alexandria/v1/search',
		data: queryString.toString(),
		success: function (e) {
			mediaData = $.parseJSON(e).response;
		},
		async:   false
	});
	return mediaData;
}

// MEDIA TYPE FILTER
var resetSearch = 0;
function setMediaTypeFilter(obj) {
	if(!obj) {
		$('#browse-media .module-links a.active').removeClass('active');
		filterTypes = [];
		resetSearch = 1;
	} else {
		$(obj).toggleClass('active');
	}
	if (!$('#browse-media .module-links a.active')) {
		filterTypes = [];
	}
	filterMediaByType();
}

function filterMediaByType(obj) {
	$('video').trigger('pause');
	subView = '';
	document.getElementById('intro').style.display = 'none';
	$('main').not('#browse-media').hide();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('.sharing-ui').hide();
	$('.publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('share-modal').style.display = 'none';
	document.getElementById('tip-modal').style.display = 'none';
	$('#user-modal').fadeOut(fadeTimer);
	$('.view-media-ui').hide();
	$('.view-publisher-ui').hide();
	document.getElementById('publisher-avatar').src = '';
	var filteredMedia = [];
	if (currentView != 'media') {
		filteredMedia = [obj];
		$('#browse-media .module-links a.active').removeClass('active');
		$('#browse-media .module-links a[value="'+ obj +'"').addClass('active');
	} else {
		if ($('#browse-media .module-links a.active')) {
			$('#browse-media .module-links a.active').each(function(i){
				filteredMedia[i] = $(this).attr('value');
			});
		}
	}
	filterTypes = filteredMedia;
	if (filteredMedia.length > 1) {
		var filteredMediaStr = '';
		for (var i = 0; i < filteredMedia.length; i++) {
			if (filteredMediaStr == '') {
				filteredMediaStr = '"'+filteredMedia[i]+'"';
			} else {
				filteredMediaStr = filteredMediaStr+',"'+filteredMedia[i]+'"';
			}
		}
		filteredMedia = filteredMediaStr;
	}
	var filteredMedia = searchAPI('media', 'type', filteredMedia);
	populateSearchResults(filteredMedia, 'media');
	buildHistory();
}

// POPULATE SEARCH RESULTS
function populateSearchResults(results, module) {
	artifact = '';
	document.getElementById('media-breadcrumbs-type').innerHTML = '';
	document.getElementById('media-breadcrumbs-publisher').innerHTML = '';
	document.getElementById('media-breadcrumbs').innerHTML = '';
	if (!results) {
		if (module =='media') {
			currentView = module;
		} else {
			currentView = 'publishers';
			filterTypes = [];
		}
		buildHistory();
		var mediaEntity = '<div class="row media-entity"><div class="browse-icon"><img src="img/media-icon.svg" class="makesvg entity-image" style="display: inline;"></div><h3 class="media-title">No Results Found</h3></div>';
		$('#browse-media-wrap').append(mediaEntity);
		var currentViewUpper = currentView.charAt(0).toUpperCase() + currentView.slice(1);;
		$('#browse-media-wrap h2').text('Browse '+ currentViewUpper);
		$('#browse-media-wrap .row:first-of-type').addClass('first');
		$('#browse-media').show();
		replaceSVG();
		return false;
	}
	if ( (filterTypes.length > 0) && (filterTypes.length == 0) ) {
		for (var i = 0; i < results.length; i++) {
			$('#browse-media .module-links a[value="'+ filterTypes[i] +'"').addClass('active');
		}
	} else {
		$('#browse-media .module-links a').removeClass('active');
	}

	if (module =='media') {		
		for (var i = 0; i < results.length; i++) {
			var mediaType = results[i]['media-data']['alexandria-media']['type'];
			if (filterTypes[0]) {
				console.info(results[i]);
				if ( (filterTypes.length > 0) && (filterTypes.indexOf(mediaType) == -1) ) {
					continue;
				}
			}
			var mediaID = results[i]['txid'];
			var mediaPublisher = results[i]['publisher-name'];
			var mediaInfo = results[i]['media-data']['alexandria-media']['info'];
			var mediaPubTime = results[i]['media-data']['alexandria-media']['timestamp'];
			var mediaPubTimeLen = results[i]['media-data']['alexandria-media']['timestamp'].toString().length;
			if (mediaPubTimeLen == 10) {
				mediaPubTime = parseInt(mediaPubTime)*1000;
			}					
			var mediaTitle = mediaInfo['title'];
			var mediaDesc = mediaInfo['description'];
			var mediaRuntime = 0;
			var mediaArtist = '';
			var mediaFilename = '';
			var mediaTid = results[i]['media-data']['alexandria-media']['torrent'];
			var mediaFLO = results[i]['media-data']['alexandria-media']['publisher'];
			if(results[i]['media-data']['alexandria-media']['payment']){
				var mediaPymnt = results[i]['media-data']['alexandria-media']['payment']['type'];
			}
			if(mediaInfo['extra-info']){
				if(mediaInfo['extra-info']['runtime']){
					mediaRuntime = calcRuntime(mediaInfo['extra-info']['runtime']);
				}
				if(mediaInfo['extra-info']['artist']){
					mediaArtist = mediaInfo['extra-info']['artist'];
				}						
				if(mediaInfo['extra-info']['filename']){
					mediaFilename = mediaInfo['extra-info']['filename'];
				}						
			}
			if (mediaRuntime != 0) {
				mediaRuntime = '<div class="media-runtime">Runtime: <span>' + mediaRuntime + '</span></div>';
			} else {
				mediaRuntime = '';
			}
			var mediaEntity = '<div id="media-' + mediaID + '" class="row media-entity" media-type="' + mediaType + '" media-filename="'+mediaFilename+'"><div class="browse-icon" onclick="loadMediaEntity(this);"><img src="img/' + mediaType + '-icon.svg" class="makesvg entity-image" onclick="loadMediaEntity(this);" style="display: inline;"></div><h3 class="media-title" onclick="loadMediaEntity(this);">' + mediaTitle + '</h3> <div class="media-meta" onclick="loadMediaEntity(this);">' + mediaPublisher + '</div> '+ mediaRuntime +' <a class="info-icon" onclick="loadInfoModal(this)"><img src="img/info-icon.svg" class="makesvg" style="display: inline;">info</a><a class="playbtn-icon" onclick="loadMediaEntity(this);"><img src="img/play-icon-small.svg" class="makesvg" style="display: inline;">play</a><div class="media-pub-time hidden">' + new Date(parseInt(mediaPubTime)) + '</div><div class="media-desc hidden">' + mediaDesc + '</div><div class="media-Tid hidden">' + mediaTid + '</div><div class="FLO-address hidden">' + mediaFLO + '</div><div class="media-pymnt hidden">'+mediaPymnt+'</div>';
			if ($('#browse-media-wrap .row').length < 1){
				$('#browse-media-wrap').append(mediaEntity);
			} else {
				$('#browse-media-wrap .row:first-of-type').before(mediaEntity);
			}
		}
		$('#browse-media-wrap h2').text('Browse Media');
		if (history.state.searchResults != true) {
			currentView = 'media';
		}
	} else {
		for (var i = 0; i < results.length; i++) {
			var publisherID = results[i]['txid'];
			var publisherName = results[i]['publisher-data']['alexandria-publisher']['name'];
			var publisherDate = results[i]['publisher-data']['alexandria-publisher']['timestamp'];
			var publisherDateLen = results[i]['publisher-data']['alexandria-publisher']['timestamp'].toString().length;
			if (publisherDateLen == 10) {
				publisherDate = parseInt(publisherDate)*1000;
			}
			var publisherEntity = '<div id="publisher-' + publisherID + '" class="row publisher-entity"><div class="browse-icon publisher-icon" onclick="loadPublisherEntity(this);"><img src="img/publisher-icon.svg" class="makesvg publisher-image" onclick="loadPublisherEntity(this);" style="display: inline;"></div><h3 class="publisher-title" onclick="loadPublisherEntity(this);">' + publisherName + '</h3> <div class="publisher-date">' + new Date(parseInt(publisherDate)) + '</div><div class="FLO-address hidden">' + publisherID + '</div>';
			if ($('#browse-media-wrap .row').length < 1){
				$('#browse-media-wrap').append(publisherEntity);
			} else {
				$('#browse-media-wrap .row:first-of-type').before(publisherEntity);
			}
		}
		$('#browse-media-wrap h2').text('Browse Publishers');
		if (history.state.searchResults != true) {
			currentView = 'publishers';
		}
	}
	$('#browse-media-wrap .row:first-of-type').addClass('first');
	$('#browse-media').show();	
	replaceSVG();
}

// DISPLAY MEDIA INFO MODAL
function loadInfoModal(childObj) {
    var parentObj = childObj.parentNode;
    if ( $(parentObj).hasClass('media-entity') ) {
	    // LOAD MEDIA ENTITY INFO MODAL
		if ( ($('#info-modal-media').css('display') == 'block') && ($('#info-modal-media').css('opacity')==1) ) {
			$('#info-modal-media').fadeOut(fadeTimer);
			return false;
		}
		if ($(parentObj).find('#info-modal-media').length == 0) {
			$(parentObj).append($('#info-modal-media'));
		}
		var mediaRuntime = $(parentObj).find('.media-runtime').html();
		var mediaPubTime = $(parentObj).find('.media-pub-time').html();
		var mediaTitle = $(parentObj).find('.media-title').html();
		var mediaMeta = $(parentObj).find('.media-meta').html();
		var mediaDesc = $(parentObj).find('.media-desc').html();
		var mediaIcon = $(parentObj).find('.browse-icon').html();
		$('#info-modal-media .entity-meta-header h2').html(mediaTitle);
		$('#info-modal-media .entity-meta-header h3').html(mediaMeta);
		$('#info-modal-media .entity-meta-header .entity-runtime').html(mediaRuntime);
		$('#info-modal-media .media-image').html(mediaIcon);
		$('#info-modal-media .entity-pub-time span').html(mediaPubTime);	
		$('#info-modal-media .media-desc').html('<p>'+ mediaDesc +'</p>');
		$(childObj).siblings('#info-modal-media').fadeIn(fadeTimer);
    } else {
        if ($(parentObj.parentNode).hasClass('col')) {    	
			if ( ($('#info-modal-small').css('display') == 'block') && ($('#info-modal-small').css('opacity')==1) ) {
				$('#info-modal-small').fadeOut(fadeTimer);
				return false;
			}
        }
		// INFO MODAL for LI
		$('#info-modal-small').html('');
		var localFile = $(childObj).siblings('label').text().replace(/\s/g , "-").toLowerCase();
		getInfoFile(localFile);
		if ($(childObj).find('#info-modal-small').length == 0) {
			$(childObj).append($('#info-modal-small'));
		}
		var infoInterval = setInterval(function() {
		    if ($(childObj).find('#info-modal-small').html()!='') {
		        clearInterval(infoInterval);
				$(childObj).find('#info-modal-small').fadeIn(fadeTimer);
		    }
		}, 100);
    }
}

// LOAD LOCAL HTML FILES FOR INFO MODAL
function getInfoFile(localFile) {
	var localURL = 'modals/info-'+ localFile +'.html';
	$.ajax({
	    url: localURL,
	    type: 'GET',
	    success: function(res) {
			$('#info-modal-small').html(res);
	    }
	});
}

// LOAD ADD CONTENT MODAL
function loadAddContentModal() {
	$('#add-menu-modal.abs').fadeToggle(fadeTimer);
}
// LOAD USER MODAL
function loadUserModal() {
	$('#user-modal.abs').fadeToggle(fadeTimer);
}

// CALCULATE RUNTIME FROM SECONDS
function calcRuntime(seconds) {
	var runSecs = seconds;
	var runMins = 0;
	var runHours = 0;
	if (runSecs > 59) {
		runMins = Math.floor(parseInt(seconds)/60);
		runSecs = runSecs-(runMins*60);
	}
	if (runSecs < 10) {
		runSecs = '0' + runSecs;
	}
	if (runMins > 59) {
		runHours = Math.floor(parseInt(runMins)/60);
		runMins = runMins-(runHours*60);
	}
	if (runMins < 10) {
		runMins = '0' + runMins;
	}
	if (runHours < 10) {
		runHours = '0' + runHours;
	}
	var runtime = runHours + ':' + runMins + ':' + runSecs;
	return runtime;
}

// CHECK RUNTIME VALIDITY
function isRuntime(runtime) {
	var runtimeError = 0;
	var runtimeArray = runtime.value.split(':');
	console.log(runtimeArray.length);
	console.info(runtimeArray);
	if (runtimeArray.length < 3) {
		runtimeError = 1;
	}
	for (var i = 0; i < runtimeArray.length; i++) {
		for (var i2 = 0; i2 < runtimeArray[i].length; i2++) {
			console.log(isNaN(parseInt(runtimeArray[i][i2])));
			if (isNaN(parseInt(runtimeArray[i][i2]))) {
				runtimeError = 1;
			}
		}
		if ( (runtimeArray[i].length > 2) || ( (i > 0) && (runtimeArray[i] > 59) ) || (isNaN(parseInt(runtimeArray[i]))) ) {
			runtimeError = 1;
		}
	}
	if (runtimeError != 0) {
		alert('Please input a valid runtime');	
	}
}

// CALCULATE SECONDS FROM RUNTIME
function calcSeconds(runtime) {
	if (!runtime) {
		return false;
	}
	var runtimeArray = runtime.split(':');
	if (runtimeArray.length < 3) {
		alert('Please input a valid runtime');
	}
	var runtimeHours = parseInt(runtimeArray[0]);
	var runtimeMins = parseInt(runtimeArray[1]);
	var runtimeSeconds = parseInt(runtimeArray[2]);
	runtimeSeconds = ((runtimeHours*60)*60)+(runtimeMins*60)+runtimeSeconds;
	return runtimeSeconds;
}

// DISPLAY SHARE MODAL
function loadShareModal(obj) {
	if ($(obj).parents('.entity-market #share-modal').length == 0) {
		$(obj).parents('.entity-market').append($('#share-modal'));
	}
	var modalPos = (currentView=='artifact') ? ('left') : ('right');
	var shareModalPos = $(obj).parent().width() - $(obj).position().left - 84;
	document.getElementById('share-url').innerHTML = location.href;
	document.getElementById('share-title').innerHTML = $('.entity-meta-header h2:visible').text();
	$(obj).parents('.entity-market').find('#share-modal').css(modalPos, shareModalPos +'px').fadeToggle(fadeTimer);
}

// DISPLAY TIP MODAL
function loadTipModal(obj) {
	if ($(obj).parents('.entity-market #tip-modal').length == 0) {
		$(obj).parents('.entity-market').append($('#tip-modal'));
	}
	$('#tip-modal .modal-tabs li:first-child').click();
	$('input[name="tip-amount"]:eq(2)').click();
	var mediaFLO = $('main:visible .FLO-address').html();
	if (mediaFLO != '') {
		$('#tipAdd-FLO').html(mediaFLO);
	} else {
		$('#tipAdd-FLO').text('No Address Available');
	}
	var modalPos = (currentView=='artifact') ? ('left') : ('right');
	var tipModalPos = (currentView=='artifact') ? ($(obj).parent().width() - $(obj).position().left) : ($(obj).parent().width() - $(obj).position().left - 80);
	$(obj).parents('.entity-market').find('#tip-modal').css(modalPos,tipModalPos+'px').fadeToggle(fadeTimer);
}

// DISPLAY QR CODE FOR BTC
function loadQR() {
	$('#lightbox').html('<div id="qrcode-lightbox"></div>');
	var qrcode = new QRCode("qrcode-lightbox", {
		text: "bitcoin:3CHHe6DwYFmx5c8LLm1RQBcGiexCJJrMqT?label=hoodiethehomeless",
		width: 400,
		height: 400,
		colorDark : "#000000",
		colorLight : "#FFFFFF",
		correctLevel : QRCode.CorrectLevel.H
	});
	$('#lightbox').fadeIn(fadeTimer);
}

// DISPLAY BITMSG MODAL
function bitMsgModal() {
	if ( (document.getElementById('bitmsg-modal').style.display == 'none') || (document.getElementById('bitmsg-modal').style.display == '') ) {
		document.getElementById('bitmsg-modal').style.display = 'block';
	} else {
		document.getElementById('bitmsg-modal').style.display = 'none';
	}
}

// NEW MEDIA MODULE
function loadShareMod() {
	currentView = 'add-media';
	filterTypes = [];
	buildHistory();
/*
	var stateObj = {
		currentView: currentView
	};
	var newURL = document.location.origin + document.location.pathname +'?view=addcontent';
	history.pushState(stateObj, 'ΛLΞXΛNDRIΛ > Add Content', newURL);
	document.title = 'ΛLΞXΛNDRIΛ > Add Content';
*/
	document.getElementById('search').style.display = 'none';
	$('.header-modal').hide();
	$('.view-media-ui').hide();
	document.getElementById('intro').style.display = 'none';
	document.getElementById('viewlabel').style.display = 'none';
	$('main').not('.sharing-ui').hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').show();
	resizeTabs();
}

// ADD MEDIA TAB PAGINATION
function paginateMediaTabs(obj) {
	var activeTab = $('#add-media-menu li.active');
	if ($(obj).hasClass('next')) {
		$(activeTab).next('#add-media-menu li').click();
	} else if ($(obj).hasClass('prev')) {
		$(activeTab).prev('#add-media-menu li').click();
	} else if ($(obj).hasClass('submit')) {
		if($('#mediaType').val() == ''){
			$('#add-media nav ul li:first-child').click();
			alert('Please select a media type');
			return false;
		}
		var reqCheck = mediaReqCheck();
		console.log(reqCheck);
		if (reqCheck == true) {
			showTipAlexandriaModal();
		}
	}
}

// NEW PUBLISHER MODULE
function loadCreatePublisherMod() {
	$('.header-modal').hide();
	currentView = 'add-publisher';
	filterTypes = [];
	buildHistory();
/*
	var stateObj = {
		currentView: currentView
	};
	var newURL = document.location.origin + document.location.pathname +'?view=addpublisher';
	history.pushState(stateObj, 'ΛLΞXΛNDRIΛ > Add Publisher', newURL);
	document.title = 'ΛLΞXΛNDRIΛ > Add Publisher';
*/
	document.getElementById('search').style.display = 'none';
	document.getElementById('intro').style.display = 'none';
	$('main').not('.publisher-ui').hide();
	document.getElementById('viewlabel').style.display = 'none';
	$('.sharing-ui').hide();
	$('.publisher-ui').show();
	resizeTabs();
}

// PARSE MAGNET URI
function parseMagnetURI() {
	var errorCheck = 0;
	if (document.getElementById('dht-hash').value == '') {
		return false;
	}
	var magnetURI = document.getElementById('dht-hash').value;
	var isMagnet = magnetURI.indexOf('magnet:?xt=urn:');
	var hasWS = magnetURI.indexOf('&ws');
	if (isMagnet == -1) {
		errorCheck = 1;
	} else {
		var mediaBTIH = magnetURI.split('urn:')[1].split('&')[0];
		document.getElementById('btih-hash').value = mediaBTIH;
		if (hasWS > 0) {
			var mediaWS = magnetURI.split('&ws=')[1].split('&')[0];
			if (mediaWS) {
				console.log(mediaWS);
			}
		}
	}
	if (errorCheck = 1) {
		console.error('Input a valid magnet link');
	}
}

// CHECK TIP AMOUNTS ARE USD VALUES
function checkTipAmounts() {
	var tipError = 0;
	var TipInputs = document.getElementsByClassName(' set-tip-amount');
	for (i = 0; i < TipInputs.length; i++) {
		var tipValue = $(TipInputs[i]).val();
		if (tipValue != '') {
			for (i2 = 0; i2 < tipValue.length; i2++) {
				if ( (!tipValue[i2] == '.') && (isNaN(parseInt(tipValue[i2]))) ) {
					tipError = 1;
				}
			}
		}
		if (tipValue.split('.')) {
			var deci = tipValue.split('.')[1];
			if ( ( (deci) && (deci.length > 2) ) || (tipValue.split('.').length > 2) ) {
				tipError = 1;
			}
		}
	}
	if (tipError == 1) {
		alert('Input a valid tip amount');
		return false;
	}
}

// SUBMIT PUBLISHER TO BLOCKCHAIN
function postPublisher() {
	var pubName = document.getElementById('newPublisher-name').value;
	var pubAdd = document.getElementById('newPublisher-floAdd').value;
	var pubEmailMD5 = '';
	if (document.getElementById('newPublisher-emailmd5').value != '') {
		pubEmailMD5 = MD5(trim11(document.getElementById('newPublisher-emailmd5').value).toLowerCase());
	}
	var pubBitMsg = document.getElementById('newPublisher-bitmsg').value;
	var pubTime = Date.parse(new Date()).toString();
	var pubSig = generateSignature(pubName, pubAdd, pubTime);
	if (pubSig == false) {
		return false;
	}
	var queryString = '{ "alexandria-publisher": { "name": "'+ pubName +'", "address": "'+ pubAdd +'", "timestamp":'+ pubTime +', "bitmessage": "'+ pubBitMsg +'", "emailmd5":"'+ pubEmailMD5 +'"}, "signature":"'+ pubSig +'"}';
	console.log(queryString);
	$.ajax({
	    url: 'http://'+ serverAddress +':41289/alexandria/v1/send/',
	    type: 'POST',
		data: queryString.toString(),
	    success: function(e) {
	    	$('.publisher-ui').hide();
	    	resetAlexandria();
	    	$('#publisher-process input[type="text"]').val('');
	    	alert('Publisher Announced!');
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
	});
}

// GENERATE SIGNATURE FOR PUBLISHING
function generateSignature(pubName, pubAdd, pubTime) {
	if ( (!pubName) || (!pubAdd) || (!pubTime) ) {
		alert('Incomplete input');
		return false;
	}
	var queryString = '{ "address":"'+ pubAdd +'", "text":"'+ pubName + '-' + pubAdd + '-' + pubTime +'" }';
	console.log(queryString);
	var signature;
	var stopError;
	$.ajax({
	    url: 'http://'+ serverAddress +':41289/alexandria/v1/sign/',
	    type: 'POST',
		data: queryString.toString(),
	    success: function(e) {
			var res = $.parseJSON(e);
			if (res['status'] == 'failure') {
				alert(res['response'][0]);
				stopError = 1;
			} else {
				signature = res['response'][0];
			}
	    }, 
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		},
		async:   false
	});
	if (stopError == 1) {
		return false;
	} else {
		return signature;
	}
}

// ADD MEDIA TABS
function changeAddMediaTab(obj) {
	$(obj).addClass('active').siblings().removeClass('active');
	$('#newMedia-tabs').find('.modal-tab#'+$(obj).attr("name")).show().siblings().hide();
	var activeTabName = $('#add-media-menu li.active').attr('name');
	$('#add-media .pagination ul li').show();
	resizeTabs();
	var firstTab = $('#add-media-menu li:first-child').attr('name');
	var lastTab = $('#add-media-menu li:last-child').attr('name');
	if (activeTabName == lastTab) {
		$('#add-media .pagination ul li:last-child').removeClass('next').addClass('submit').text('Submit');
	} else {
		$('#add-media .pagination ul li:last-child').removeClass('submit').addClass('next').text('Next');
	}
	if (activeTabName == firstTab) {
		$('#add-media .pagination ul li.prev').hide();
	}
}

// SHOW AUTOFILL ON ADD MEDIA
var mediaWwwID = '';
function showAutoFill(obj){
	if ( (obj.value != '') && (obj.value != mediaWwwID) ) {
		$('fieldset:visible input').attr('disabled','disabled');
		$('fieldset:visible textarea').attr('disabled','disabled');
		$(obj).parents('fieldset').find('.autofill-button').slideDown(fadeTimer);
		mediaWwwID = obj.value;
		if ($(obj).siblings('label').text().split(' ')[0] == 'IMDB') {
			getIMDBinfo();
		} else if ($(obj).siblings('label').text().split(' ')[0] == 'YouTube') {
			getYouTubeinfo();
		} else if ($(obj).siblings('label').text().split(' ')[0] == 'Soundcloud') {
			getSoundcloudInfo();
		}
	} else {
		$(obj).parents('fieldset').find('.autofill-button').slideUp(fadeTimer);
	}
}

// GET IMDB INFO FOR AUTOFILL
function getIMDBinfo() {
	var IMDBid = document.getElementById('www-id').value;
	var IMDBapi = 'http://www.myapifilms.com/imdb?idIMDB='+ mediaWwwID +'&actors=S&uniqueName=1';
	$.ajax({
	    url: IMDBapi,
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			console.info(data);
			var errorCode = data['code'];
			if (errorCode) {
				alert(data['message']);
				$('fieldset:visible input').val('');
				$('fieldset:visible textarea').val('');
			} else {
				for (var key in data) {
					var obj = data[key];
					var inputObj = document.getElementById('addMovie-'+key);
					if (key == 'urlPoster') {
						$('.thumbnail-wrapper:visible').html('<p><a href="'+ obj +'" target="_blank" class="btnLightGray">Download from IMDB</a></p>');
					} else if (inputObj) {
						var length = 0;
						var newObj = [];
						if(typeof obj == 'object'){
							if (typeof obj[0] == 'object') {
								for (var objIndex in obj) {
									var subObj = obj[objIndex];
									if (key == 'actors') {
										newObj.push(subObj['actorName']);
									} else {
							            ++length;
										for (var subkey in subObj) {
											if(subObj[subkey].substring(0,2) != 'nm'){
												newObj.push(subObj[subkey]);
											}
										}
									}
								}
							} else {
								obj.forEach(function(a,i){
						            ++length;
									newObj.push(obj[i]);
								});
							}
							obj = newObj;
						}
						var IMDBResult = '';
						if (typeof obj == 'object') {
							obj.forEach(function(a){
								if (IMDBResult == '') {
									IMDBResult = a;
								} else {
									IMDBResult = IMDBResult + ', ' + a;
								}
							});
						} else {
							IMDBResult = obj;
						}		
						inputObj.value = IMDBResult;
					}
				}
			}
			$('.modal-tab:visible .autofill-button').slideUp(fadeTimer);
			$('fieldset:visible input').removeAttr('disabled');
			$('fieldset:visible textarea').removeAttr('disabled');
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
	});
}
// GET YOUTUBE INFO FOR AUTOFILL
function getYouTubeinfo() {
	var YouTubeId = document.getElementById('www-id').value;
	var url = 'https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBH_FceJKLSmo0hk9y2zBdZ8ZTmUiNJr8o&part=snippet&id='+ YouTubeId;
	$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			var mediaData = data['items'][0]['snippet'];
			document.getElementById('addMedia-title').value = mediaData['title'];
			document.getElementById('addMedia-creators1').value = mediaData['channelTitle'];
			document.getElementById('addMedia-desc').innerHTML = mediaData['description'];
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
	    }
    });
	$('.modal-tab:visible .autofill-button').slideUp(fadeTimer);
	$('fieldset:visible input').removeAttr('disabled');
	$('fieldset:visible textarea').removeAttr('disabled');	
}
// GET SOUNDCLOUD INFO FOR AUTOFILL
function getSoundcloudInfo() {
	var SoundcloudId = document.getElementById('www-id').value;
	var url = 'https://api.soundcloud.com/tracks/'+ SoundcloudId + '.json?client_id=0e74cd0666418c8b8a26f967b1e3a7bb';
	$.ajax({
	    url: url,
	    success: function(e) {
	    	console.info(e);
			document.getElementById('addMedia-title').value = e['title'];
			document.getElementById('addMedia-creators1').value = e['user']['username'];
			document.getElementById('addMedia-runtime').value = e['duration'];
			document.getElementById('addMedia-year').value = e['release_year'];
			document.getElementById('addMedia-genres').value = e['genre'];
			document.getElementById('addMedia-desc').innerHTML = e['description'];
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			if (xhr.status == 404) {
				alert('Soundcloud ID not found');
				$('fieldset:visible input').val('');
				$('fieldset:visible textarea').val('');
			}
			console.error(xhr.status);
			console.error(thrownError);
	    }
    });
	$('.modal-tab:visible .autofill-button').slideUp(fadeTimer);
	$('fieldset:visible input').removeAttr('disabled');
	$('fieldset:visible textarea').removeAttr('disabled');	
}

// GET YOUTUBE SCREENGRAB FOR VIDEO VIEW
function getYouTubePic(YouTubeId) {
	var url = 'https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBH_FceJKLSmo0hk9y2zBdZ8ZTmUiNJr8o&part=snippet&id='+ YouTubeId;
	$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			var mediaData = data['items'][0]['snippet']['thumbnails']['medium']['url'];
			$('#media-view-entity .row.media-desc').prepend('<img src="'+mediaData+'" class="poster-frame" />');
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
	    }
    });
}

// GET ROTTEN TOMATOES RATING
function getRotten() {
	var RottenID = parseInt(document.getElementById('movie-rotten').innerHTML);
	var RottenAPI = 'http://api.rottentomatoes.com/api/public/v1.0/movies/'+ RottenID +'.json?apikey=uatf974sbyb7reyrstwnpmzu';
	$.ajax({
	    url: RottenAPI,
	    type: 'GET',
	    success: function(e) {
			var el = $( '#sketchpad' );
			el.html(e.responseText);
			var data = $.parseJSON($('p', el).html());
			console.info(data);
			var rating = data['ratings']['audience_score'];
	    	document.getElementById('movie-rotten').innerHTML = rating;
	    	if ( rating < 50 ) {
	    		document.getElementById('rotten-img').src = 'img/rotten-tomatos-rotten.svg';
	    	} else {
	    		document.getElementById('rotten-img').src = 'img/rotten-tomatos-fresh.svg';
	    	}
	    	replaceSVG();
	    	document.getElementById('rotten-wrap').style.display = 'inline-block';
	    },
		error: function (xhr, ajaxOptions, thrownError) {
			console.error(xhr.status);
			console.error(thrownError);
		}
    });
}

// CHECK REQUIRED FIELDS FOR MEDIA SUBMISSION
function mediaReqCheck() {
		var reqCheck = 0;
		$('#add-media .required').each(function(){
			var inputValue = $(this).find('input');
			if ( !inputValue[0] ) {
				var inputValue = $(this).find('textarea');
			}
			if ( (!$(inputValue).val()) || ($(inputValue).val() == '') ) {
				var inputName = $(inputValue).siblings('label').text();
				$('#add-media nav ul li:first-child').click();
				alert('Please input a '+ inputName);
				reqCheck = 1;
			}
		});
		if (document.getElementById('payment-tips').checked) {
			checkTipAmounts();
		}
		if ( (document.getElementById('newMediaPublisherFLO').value.length != 34) && (document.getElementById('newMediaPublisherFLO').value != '') ) {
			alert('Please input a valid Florincoin Address');
		}
		if (reqCheck == 1) {
			reqCheck = 0;
			hideOverlay();
			return false;
		} else {
			if ( $('input[type="checkbox"][name="dNetwork"]:checked').length < 1 ) {
				$('#newMedia-net').click();
				alert('Please select a Distribution Network');
				return false;
			}
			return true;
		}
}

// LOAD TIP-TO-ALEXANDRIA MODAL
function showTipAlexandriaModal() {
	getCryptos();
	$('#tip-alexandria-modal').fadeIn(fadeTimer);
	$('#app-overlay').fadeIn(fadeTimer);
	document.getElementById('app-overlay').style.display = 'block';
}

// HIDE OVERLAY AND MODAL
function hideOverlay() {
	$('.overlay-modal').fadeOut(fadeTimer);
	document.getElementById('disabler').style.display = 'none';	
	document.getElementById('app-overlay').style.display = 'none';
}

// SELECT MEDIA TYPE ON ADD MEDIA
function selectMediaType(obj, mediaType) {
	$('#media-type-select-list a').removeClass('active');
	obj.className = 'active';
	$('#newMedia-info fieldset').hide();
	if (mediaType != '' ) {
		$('fieldset .media-specific').hide();
		$('#newMedia-info .left').fadeIn(fadeTimer);
		$('#newMedia-info .pull-right').fadeIn(fadeTimer);
		if (mediaType == 'movie') {
			$('#media-meta-www').text('IMDB');
			$('#media-meta-runtime').text('Runtime');
			$('#media-meta-creators1').text('Director');
			$('#media-meta-creators2').text('Screenwriter(s)');
			$('#media-meta-creators3').text('Cast');
			$('#media-meta-taxonomy').text('Genre');
			$('#media-meta-collection').text('Series Title');
		} else if (mediaType == 'music') {
			$('#media-meta-runtime').text('Runtime');
			$('#media-meta-creators1').text('Artist');
			$('#media-meta-taxonomy').text('Genre');
			$('#media-meta-collection').text('Album Title');
		} else if (mediaType == 'podcast') {
			$('#media-meta-www').text('Soundcloud');
			$('#media-meta-runtime').text('Runtime');
			$('#media-meta-creators1').text('Host(s)');
			$('#media-meta-creators2').text('Co-Host(s)');
			$('#media-meta-creators3').text('Guest(s)');
			$('#media-meta-taxonomy').text('Genre');
			$('#media-meta-collection').text('Series Title');
		} else if (mediaType == 'video') {
			$('#media-meta-www').text('YouTube');
			$('#media-meta-runtime').text('Runtime');
			$('#media-meta-creators1').text('Creator');
			$('#media-meta-taxonomy').text('Genre');
			$('#media-meta-collection').text('Series Title');
		} else if (mediaType == 'book') {
			$('#media-meta-creators1').text('Author');
			$('#media-meta-creators2').text('Editor(s)');
			$('#media-meta-taxonomy').text('Genre');
			$('#media-meta-collection').text('Series Title');
		} else if (mediaType == 'thing') {
			$('#media-meta-creators1').text('Creator');
			$('#media-meta-creators2').text('Contributors');
			$('#media-meta-collection').text('Collection');
		} else if (mediaType == 'recipe') {
			$('#media-meta-creators1').text('Chef');
			$('#media-meta-runtime').text('Number of Servings');
			$('#media-meta-taxonomy').text('Cuisine');
			$('#media-meta-collection').text('Collection');
		}
		$('fieldset .media-specific.'+mediaType+'-meta').show();
		$('fieldset#new-media-meta').show();
		
	} else {
		$('#newMedia-info .left').fadeOut(fadeTimer);
		$('#newMedia-info .pull-right').fadeOut(fadeTimer);
	}
	resizeTabs();
}
// SUBMIT MEDIA TO BLOCKCHAIN
function postMedia(tipAlexandria) {
	var reqCheck = mediaReqCheck();
	if (reqCheck == true) {
		var tipToAlexandria = 0;
		if (tipAlexandria == 1) {
			tipToAlexandria = document.getElementById('alexandria-tip-amount').value;;
		}
		var Tid = document.getElementById('btih-hash').value;
		var FLOadd = document.getElementById('newMediaPublisherFLO').value;
		var pubTime = Date.parse(new Date()).toString();
		var mediaSig = generateSignature(Tid, FLOadd, pubTime);
		if (mediaSig == false) {
			return false;
		}
		var mediaType = $('#media-type-select-list a.active').attr('value');
		var mediaDesc = replace(replace(document.getElementById('addMedia-desc').value,'\r',' '),'\n',' ');
		var mediaInfo = '';
		$('#new-media-meta input[type="text"].info-field').each(function(){
			if ( $(this).val() != '' ) {
				var infoKeyName = $(this).attr('name');
				var infoKeyValue = $(this).val();
				if ((infoKeyValue) && (isNaN(infoKeyValue))){
					infoKeyValue = '"'+ infoKeyValue+'"';
				}
				if (mediaInfo == '') {
					mediaInfo = '"' + infoKeyName + '":'+ infoKeyValue +'';
				} else {
					mediaInfo = mediaInfo + ',' + '"' + infoKeyName + '":'+ infoKeyValue +'';
				}
			}
		});
		mediaInfo = mediaInfo + ',' + '"description":"'+ mediaDesc +'"';
	
		var mediaExtraInfo = '';
		$('#newMedia-info input[type="text"]').not('.info-field').each(function(){
			if ( $(this).val() != '' ) {
				var infoKeyName = $(this).attr('name');
				var infoKeyValue = $(this).val();
				if (infoKeyName == 'runtime'){
					if ((infoKeyValue) && (infoKeyValue.split(':'))){
						if (infoKeyValue.split(':').length != 0){
							infoKeyValue = calcSeconds(infoKeyValue);
						} else {
							alert('Please enter a valid runtime');
							return false;
						}
					}
					} else if ((infoKeyValue) && (isNaN(infoKeyValue))){
					infoKeyValue = '"'+ infoKeyValue+'"';
				}
				if (mediaExtraInfo == '') {
					mediaExtraInfo = '"' + infoKeyName + '":'+ infoKeyValue +'';
				} else {
					mediaExtraInfo = mediaExtraInfo + ',' + '"' + infoKeyName + '":'+ infoKeyValue +'';
				}
			}
		});
		if (mediaExtraInfo != '') {
			mediaInfo = mediaInfo+', "extra-info": {'+mediaExtraInfo+'}';
		}
		
		if ($('#newMedia-pay input[type="checkbox"]:checked').length != 0) {
			var payCurrency = 'USD';
			var payType = 'tip';
			var payAmount = [];
			$('.tip-amount-value').each(function(){
				var tipAmount = $(this).val()*100;
				payAmount.push(tipAmount);
			});
			var queryString = '{ "alexandria-media": { "torrent": "'+ Tid +'", "publisher": "'+ FLOadd +'", "timestamp":'+ pubTime +', "type": "'+ mediaType +'", "payment": { "currency":"'+ payCurrency +'", "type": "'+ payType +'", "amount": "'+ payAmount +'"}, "info": {'+mediaInfo+'} }, "signature":"'+ mediaSig +'" }';
		} else {
			var queryString = '{ "alexandria-media": { "torrent": "'+ Tid +'", "publisher": "'+ FLOadd +'", "timestamp":'+ pubTime +', "type": "'+ mediaType +'", "info": {'+mediaInfo+'} }, "signature":"'+ mediaSig +'" }';
		}
		console.log(queryString);
		$.ajax({
		    url: 'http://'+ serverAddress +':41289/alexandria/v1/send/',
		    type: 'POST',
			data: queryString.toString(),
		    success: function(e) {
		    	$('.sharing-ui').hide();
		    	resetAlexandria();
		    	$('#add-media input[type="text"]').val('');
		    	$('#add-media textarea').val('');
		    	alert('Media Published!');
		    },
			error: function (xhr, ajaxOptions, thrownError) {
				console.error(xhr.status);
				console.error(thrownError);
			}
		});
	}
}

/* ADD NEW CONTENT INTERFACE */
function resizeTabs(t) {
	if (t) {		
		var tabsTimeout = setTimeout(function() {
			resizeTabs();
		}, t);
		return false;
	}
	$('.media-info-container').css('overflow','hidden');
	var tabHeight = $('.modal-tab:visible').children().first().height();
	$('.modal-tab:visible').children().each(function(){
		var thisTabHeight = $(this).height();
		if (thisTabHeight > tabHeight) {
			tabHeight = thisTabHeight;
		}
	});
	$('.media-info-container').css('overflow','initial');
	$('#newMedia-tabs').css('height',tabHeight+'px');
}

// GO MODAL
function showGoModal() {
	document.getElementById('user-modal').style.display = 'none';
	if ( (document.getElementById('go-modal').style.display == 'none') || (document.getElementById('go-modal').style.display == '') ) {
		document.getElementById('go-modal').style.display = 'block';
		document.getElementById('app-overlay').style.display = 'block';
	} else {
		hideOverlay();
	}
}

function goToLocation() {
	$('video').trigger('pause');
	hideOverlay();
	var stateObj = {}
	var newTitle = '';
	var newUrl = document.getElementById('go-to-input').value;
	window.history.replaceState(stateObj, newTitle, newUrl);
	router();	
}

// LOAD ABOUT VIEW
function loadAboutView() {
	resetInterface();
	currentView = 'about';
	$('#intro').fadeOut(fadeTimer);
	$('#user-modal').fadeOut(fadeTimer);
	$('#wait').fadeOut(fadeTimer);
	document.getElementById('disabler').style.display = 'none'
	$('.search').attr('disabled',false);
	$('video').trigger('pause');
	document.title = 'ΛLΞXΛNDRIΛ';
	subView = '';
	filterTypes = [];
	$('main').not('#about').hide();
	hideOverlay();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('#search').show();
	$('#share-modal').css({
			left:'initial',
			right:'initial'
		}).hide();
	$('#tip-modal').css({
			'left':'initial',
			'right':'initial'
		}).hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	document.getElementById('about').style.display = 'block';
	buildHistory();
}

// LOAD ALEXANDRIA
function loadAlexandria() {
	if(window.location.protocol != 'file:') {
		replaceSVG();
	} else {
		$('img.makesvg:hidden').show();
	}
	if (window.location.search.indexOf("view") == -1) {
		$('#search').show();
	}
	$('#adv-search').addClass('abs');
	$('.header-modal').addClass('abs');
	$('.info-modal').addClass('abs');
	$('#tip-modal').addClass('abs');
	$('#share-modal').addClass('abs');
	$('#bitmsg-modal').addClass('abs');
	$('.alex-ui-slider').slider();
	$('.alex-ui-datepicker').datepicker();
}

// RESET INTERFACE
function resetInterface() {
	// Reset Interface
	document.getElementById('viewlabel').style.display = 'none';
	$('#wait').fadeOut(fadeTimer);
	document.getElementById('disabler').style.display = 'none';
	$('.search').attr('disabled',false);
}

// RESET ALEXANDRIA
function resetAlexandria() {
	$('video').trigger('pause');
	currentView = 'front';
	document.title = 'ΛLΞXΛNDRIΛ';
	subView = '';
	filterTypes = [];
	$('main').hide();
	hideOverlay();
	$('body').append($('#info-modal-media'));
	$('#browse-media-wrap .row').remove();
	$('#search').show();
	$('#share-modal').css({
			left:'initial',
			right:'initial'
		}).hide();
	$('#tip-modal').css({
			'left':'initial',
			'right':'initial'
		}).hide();
	$('.publisher-ui').hide();
	$('.sharing-ui').hide();
	$('.view-media-ui').hide();
	$('.view-publisher-ui').hide();
	document.getElementById('search').style.display = 'block';
	$('#app-shading').css('bottom','0');
	$('#intro').fadeIn(fadeTimer);
	buildHistory();
}

// CLEAR MODAL
function clearModal() {
	$('.overlay').fadeOut(fadeTimer);
	return false;
}

// LIGHTBOX FUNCTION
function lightbox(obj){
	var imgContent = $(obj).find('img').clone();
	$('#lightbox').children().remove();
	$('#lightbox').append(imgContent);
	$('#lightbox').show();
	var imgContentWidth = $(imgContent).width();
	var maxWH = .95; // Max width and height for lightboxed image
	if (imgContentWidth > window.innerWidth*maxWH) {
		$('#lightbox img').css('width',window.innerWidth*maxWH+'px');
		imgContentWidth = $('#lightbox img').width();
	}
	var imgContentHeight = $('#lightbox img').height();
	if (imgContentHeight > window.innerHeight*maxWH) {
		$('#lightbox img').css('width','auto');
		$('#lightbox img').css('height',window.innerHeight*maxWH+'px');
		imgContentHeight = $('#lightbox img').height();
		imgContentWidth = $('#lightbox img').width();
	}
	$('#lightbox img').css({
		'top': (window.innerHeight-imgContentHeight)/2+'px',
		'left': (window.innerWidth-imgContentWidth)/2+'px'
	});
}

// INT SORT
jQuery.fn.sortElements = (function(){
    var sort = [].sort;
    return function(comparator, getSortable) {
        getSortable = getSortable || function(){return this;};
        var placements = this.map(function(){
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
                // Since the element itself will change position, we have
                // to have some way of storing its original position in
                // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                ); 
            return function() {
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
            };
        });
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
    };
})();

// ALPHA SORT
function sortUnorderedList(ul, sortDescending) {
	var mylist = $('#'+ul);
	var listitems = mylist.children('li').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { mylist.append(itm); });
}

// REPLACE .SVG WITH WEB SVG
function replaceSVG() {
	jQuery('.makeChildrenSVG').each(function(){
		jQuery(this).children('img').each(function(){
			jQuery(this).addClass('makesvg');
		});
	});
	jQuery('img.makesvg').each(function(){
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');
		jQuery.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = jQuery(data).find('svg');
	
			// Add replaced image's ID to the new SVG
			if(typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if(typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass+' replaced-svg');
			}
	
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');
			
			// Replace image with new SVG
			$img.replaceWith($svg);

		}, 'xml');
	});
}

// SPINNER
var largeSpinConfig = {
	lines: 17, // The number of lines to draw
	length: 7, // The length of each line
	width: 1, // The line thickness
	radius: 10, // The radius of the inner circle
	corners: 1, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	direction: 1, // 1: clockwise, -1: counterclockwise
	color: '#000', // #rgb or #rrggbb or array of colors
	speed: .5, // Rounds per second
	trail: 34, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false, // Whether to use hardware acceleration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: '50%', // Top position relative to parent
	left: '50%' // Left position relative to parent
};
var target = document.getElementById('wait');
var spinner = new Spinner(largeSpinConfig).spin(target);

// DEFAULT BROWSER FONT SIZE
document.emSize=function(pa){
	pa= pa || document.body;
	var who= document.createElement('div');
	var atts= {fontSize:'1em',padding:'0',position:'absolute',lineHeight:'1',visibility:'hidden'};
	for(var p in atts){
		who.style[p]= atts[p];
	}
	who.appendChild(document.createTextNode('M'));
	pa.appendChild(who);
	var fs= [who.offsetWidth,who.offsetHeight];
	pa.removeChild(who);
	return fs;
}

// TRIM SPACES FROM STR
function trim11(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

// REPLACE CARRIAGE RETURNS IN STR
function replace(string,text,by) {
    var strLength = string.length, txtLength = text.length;
    if ((strLength == 0) || (txtLength == 0)) return string;
    var i = string.indexOf(text);
    if ((!i) && (text != string.substring(0,txtLength))) return string;
    if (i == -1) return string;
    var newstr = string.substring(0,i) + by;
    if (i+txtLength < strLength)
        newstr += replace(string.substring(i+txtLength,strLength),text,by);
    return newstr;
}

// SELECT TEXT ON SINGLE CLICK
function selectText(containerid) {
	if (document.selection) {
	    var range = document.body.createTextRange();
	    range.moveToElementText(document.getElementById(containerid));
	    range.select();
	} else if (window.getSelection) {
	    var range = document.createRange();
	    range.selectNode(document.getElementById(containerid));
	    window.getSelection().addRange(range);
	}
}