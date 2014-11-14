jQuery(document).ready(function($){	
	$('#wait').fadeIn(fadeTimer);
	// Footer timeline contruct
	var days = ["0", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];

	$("#timeline").dateRangeSlider({
		bounds: {min: new Date(2014, 9, 17), max: new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()+1)},
		defaultValues: {min: Date.parse(datetime)-86400000, max: Date.parse(datetime)},
		arrows: false,
		scales: [{
		  first: function(value){ return value; },
		  end: function(value) {return value; },
		  next: function(value){
			var next = new Date(value);
			return new Date(next.setDate(value.getDate() + 1));
		  },
		  label: function(value){
			return days[value.getDate()];
		  },
		  format: function(tickContainer, tickStart, tickEnd){
			tickContainer.addClass("myCustomClass");
		  }
		}]
	});
	// Generate initial volume bars
	volumeBars('*', '', 7200);

	// UI/UX Navigation
	// Click logo to go back to archive list with current timeline selection
	$('#logo').click(function(){
		if($(this).hasClass('disabled')){
			return false;
		}
		currentArchive = '*';
		searchTerm = '';
		currentView = 'archiveCloud';
		$('#viewlabel .currentArchive').text('');
		$('header input.search').val('');
		$('.sort-link').fadeOut(fadeTimer);
		$('.view-controls .view-link').text('Cloud');
		$('main').fadeOut(fadeTimer);
		runSearch('');		
	});
	// Omnibox (search input)
	$('header input.search').on("keydown", function (e) {		
		searchValue = $('header input.search').val();
		if($('#tweetListView').css('display') == 'block') {
			resetArchiveList = true;
		}
	});
	$('header input.search').on("keyup", function (e) {
		newSearchValue = $('header input.search').val();
		var code = e.keyCode || e.which;
		if (code == 32) {
			// pressin the space bar
		} else if ( (newSearchValue != searchValue) || (code == 16) ) {
			// nothing changed in search content
			if (searchTimerId) {
				clearTimeout ( searchTimerId );
			}
			// set a timer and run search if done typing
			searchTimerId = setTimeout ( 'runSearch("'+ newSearchValue +'")', 2000 );
		}
	});
	// Click icon in omnibox to clear and run search
	$('#clearSearch').click(function(){
		$('header input.search').val('');
		runSearch('');
	});	
	// View Controls
	$('.view-controls .view-link').click(function(){		
		var newView;
		$('main').fadeOut(fadeTimer);
		switchView = $(this).text();
		if(switchView == 'Cloud') {
			newView = currentView.slice(0,-5)+'ListView';			
			currentView = newView;
			switchView = 'List';
			$('.sort-link').fadeIn(fadeTimer);
		} else {
			newView = currentView.slice(0,-8)+'Cloud';
			currentView = newView;
			switchView = 'Cloud';
			$('.sort-link').fadeOut(fadeTimer);
		}
		$('#'+newView).fadeIn(fadeTimer);
		$(this).text(switchView);
	});	
	// Sort - Archive List
	$('#resort-archView').click(function(){
		$('main').not('#'+currentView).fadeOut(fadeTimer);
		$('#archiveList').toggleClass('pop-sort');
		$('#wordsList').toggleClass('pop-sort');
		if($('#archiveList').hasClass('pop-sort')){
			$('#archiveList li').sortElements(function(a, b){
				return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
			});
			$(this).text('Popular');
		} else {
			sortUnorderedList("archiveList");
			$(this).text('Alphabetical');
		}
		if($('#wordsList').hasClass('pop-sort')){
			$('#wordsList li').sortElements(function(a, b){
				return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
			});
			$(this).text('Popular');
		} else {
			sortUnorderedList("wordsList");
			$(this).text('Alphabetical');
		}
		$('main #'+currentView).fadeIn(fadeTimer);
	});
	// Sort - Tweet List
	$('#resort').click(function(){
		$('main').fadeOut(fadeTimer);
		$('#tweetListView').fadeIn(fadeTimer);
		$('#tweetList').toggleClass('pop-sort');
		if($('#tweetList').hasClass('pop-sort')){
			$('#tweetList li').sortElements(function(a, b){
				return parseInt($(a).attr('retweets')) < parseInt($(b).attr('retweets')) ? 1 : -1;
			});
			$(this).text('Popular');
		} else {
			$('#tweetList li').sortElements(function(a, b){
				return $(a).attr('tweetDate') < $(b).attr('tweetDate') ? 1 : -1;
			});
			$(this).text('Recent');
		}
	});
	// Button on start page
	$('.getAllArchives').click(function(){
		getAllArchives();
	});	
	// Timeline selected values change
	$("#timeline").bind("valuesChanged", function(e, data){
		resetArchiveList = true;
		currentPage = 0;
		totalPages = 0;
		$('ul#tweetList li').remove();
		if($('#tweetListView').css('display') == 'block') {
			if(!activeWord){
				var searchWord = currentArchive;			
			} else {
				var searchWord = activeWord;			
			}
			wordSearch(currentArchive, searchWord, 40, 0);
			resetArchiveList = true;
		} else {			
			if (currentView.slice(0,5) == 'words') {
				getArchiveWords(searchTerm);
			} else {
				getJobs(searchTerm);
			}
		}
	});
	// Modal controls
	$(document).on("keyup", function (e) {
		var code = e.keyCode || e.which;
		if (code == 27) {
			// esc pressed
			if($('#wait').css('display') == 'block') {
				$('#wait').hide();
			}
			clearModal();
		}
	});
	$('.close-modal').click(function(){
		clearModal();
	});	
}); // End Document.Ready

// Default variables
var datetime = new Date();
var fadeTimer = 100;
var activeJobsCache = [];
var newArchiveVolumeQueryStringCache = [];
var newArchiveVolumeCache = [];
var defaultMaxResults = 160;
var cloudlist = [];
var currentView = 'archiveCloud';
var currentArchive = '*';
var activeWord;
var searchResults = [];
var searchResultsCache = [];
var resetArchiveList = false;
var currentPage = 0;
var totalPages = 0;

function getAllArchives(){
	searchValue = '';
	$('header input.search').val(searchValue);
	var basicSliderBounds = $("#timeline").dateRangeSlider("bounds");
	var startDate = Date.parse(basicSliderBounds.min)/1000;
	var endDate = Date.parse(datetime);
	$("#timeline").dateRangeSlider("values", startDate, endDate);
}

// RUN SEARCH
var searchValue = '';
var newSearchValue = '';
var searchTimerId = 0;
var searchRunning;
var searchTerm;

function runSearch(searchTerm) {
	clearTimeout ( searchTimerId );
	searchRunning = 0;
	if($('#tweetListView').css('display') == 'block') {
		clearModal();
	}	
	if (currentView.slice(0,5) == 'words') {
		activeWord = $('.search').val();
		getArchiveWords(currentArchive,activeWord);
	} else {
		getJobs(searchTerm);
	}
}

// NEW GET ACTIVE JOBS AND VOLUMES
function getJobs(searchTerm) {
	console.log('Searching for '+searchTerm);
	if(resetArchiveList == true){
		resetArchiveList = false;
		newArchiveVolumeCache.length = 0;
		newArchiveVolumeQueryStringCache.length = 0;
	}
	searchResults.length = 0;
	searchResultsCache.length = 0;
	if (!searchTerm) {
		var searchTerm = '';
	}
	$('#wait').fadeIn(fadeTimer);
	$('.search').attr('disabled','disabled');
    $('#intro').remove();
	$('main').fadeOut(fadeTimer);
	if ((currentView == 'archiveListView') || (currentView == 'wordListView') ) {
		$('#'+currentView.slice(0,-8)+'Cloud').children().remove();
		$('#'+currentView+' li').remove();
	} else {
		$('#'+currentView.slice(0,-5)+'ListView li').remove();
		$('#'+currentView).children().remove();
	}
	var dateValues = $("#timeline").dateRangeSlider("values");
	var queryString = '{"StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+'}';
	// Check the cache for recent query
	var cacheCheck = false;
	if(jQuery.inArray(queryString, newArchiveVolumeQueryStringCache) > -1){
		console.log('queryString = '+queryString);
		console.log('newArchiveVolumeQueryStringCache = '+newArchiveVolumeQueryStringCache);
		console.log('newArchiveVolumeCache = '+newArchiveVolumeCache);
		cacheCheck = true;
		newArchiveVolumeCache.forEach(function(a, i){
			if(!searchTerm){
				$("#archiveList").append('<li id="archive-'+a[0].replace(/ /g,"-")+'" volume="'+a[1]+'"><a href="#" onclick="wordSearch(\x27'+a[0]+'\x27, \x27'+a[0]+'\x27, 40, 0)"><span>' + a[0] + '</span> <span class="archive-volume">'+a[1]+'</span></a></li>');
				searchResults.push(a[0]);
			} else {
				var titleSlice = a[0].slice(0,searchTerm.length);
				if(titleSlice.toLowerCase() == searchTerm.toLowerCase()) {
					$("#archiveList").append('<li id="archive-'+a[0].replace(/ /g,"-")+'" volume="'+a[1]+'"><a href="#" onclick="wordSearch(\x27'+a[0]+'\x27, \x27'+a[0]+'\x27, 40, 0)"><span>' + a[0] + '</span> <span class="archive-volume">'+a[1]+'</span></a></li>');
					searchResults.push(a[0]);
				}
			}
		});
	}
	if(cacheCheck == false){		
		console.log('API call: get/activejobs/betweenDates ... '+searchTerm);
		newArchiveVolumeQueryStringCache.length = 0;
		newArchiveVolumeCache.length = 0;
		$.ajax({
			type: "POST",
			data: queryString.toString(),
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/activejobs/betweenDates",
			success: function (e) {
				console.log('getJobs() Ajax: get/activejobs/betweenDates ... '+searchTerm);
				var data = $.parseJSON(e);
				// Cache the query string
				newArchiveVolumeQueryStringCache.push(queryString);
				for (var i = 0; i < data['Jobs'].length; i++) {
					if ( data['Count'][i] != 0 ) {
						if(!searchTerm){
							newArchiveVolumeCache.push([data['Jobs'][i],data['Count'][i]]);
							$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'" volume="'+data['Count'][i]+'"><a href="#" onclick="wordSearch(\x27'+data['Jobs'][i]+'\x27, \x27'+data['Jobs'][i]+'\x27, 40, 0)"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume">'+data['Count'][i]+'</span></a></li>');
						} else {
							var titleSlice = data['Jobs'][i].slice(0,searchTerm.length);
							if(titleSlice.toLowerCase() == searchTerm.toLowerCase()) {
								// Cache the results
								newArchiveVolumeCache.push([data['Jobs'][i],data['Count'][i]]);
								$("#archiveList").append('<li id="archive-'+data['Jobs'][i].replace(/ /g,"-")+'" volume="'+data['Count'][i]+'"><a href="#" onclick="wordSearch(\x27'+data['Jobs'][i]+'\x27, \x27'+data['Jobs'][i]+'\x27, 40, 0)"><span>' + data['Jobs'][i] + '</span> <span class="archive-volume">'+data['Count'][i]+'</span></a></li>');
							}
						}
					}
				}
				buildArchiveList();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest);
				console.log(textStatus);
				console.log(errorThrown);
				librarianErr();
			}
		});
	} else {
		cacheCheck = false;
		console.log('searchResults.length = '+searchResults.length);
		if(searchResults.length > 0){
			if(searchResults.length == $('#archiveList li').length){
				newArchiveVolumeCache.forEach(function(a, i){
					if(jQuery.inArray(a[0], searchResults) > -1){
						searchResultsCache.push(a);
					}
				});
				buildArchiveList();
			}
		} else {
			console.error('Problem in getJobs cacheCheck function');
		}
	}
}

// Build archiveList and cloudlist array and call word cloud function
function buildArchiveList() {	
	$('#archiveList li').each(function(){
		var volumeSpan = $(this).find('span.archive-volume').html();
		if((volumeSpan=='')||(volumeSpan==0)){
			$(this).remove();
		}
	});
	$('#'+currentView).fadeIn(fadeTimer);
	$('#archiveListView').css('height',$('#archiveList').height()+100+'px');
	// Populate cloudlist array with raw data			
	var cloudlistraw = [];
	var cloudlist = [];
	console.error('searchResultsCache = '+searchResultsCache);
	console.error('newArchiveVolumeCache = '+newArchiveVolumeCache);
	if ((searchResultsCache.length==0)&&(newArchiveVolumeCache.length!=0)) {
		$.each(newArchiveVolumeCache,function(i, d){
			cloudlistraw.push([i,d]);
		});				
	} else if (searchResultsCache.length!=0) {
		$.each(searchResultsCache,function(i, d){
			cloudlistraw.push([i,d]);
		});
	} else {
		alert('Under construction');
	}
	cloudlistraw.sort(function(a,b){ return a[1][1]>b[1][1]?1:-1; });
	cloudlistraw.forEach(function(a){
		if(a[1][1]>0){
			cloudlist.push(a[1][0]);
		}
	});
	console.log('cloudlistraw = '+cloudlistraw);
	console.log('cloudlist = '+cloudlist);
	// Sort list according to client session preference
	if($('#resort-archView').text() == 'Popular') {
		$('#archiveList').addClass('pop-sort');
		$('#archiveList li').sortElements(function(a, b){
			return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
		});
	} else {
		sortUnorderedList("archiveList");
	}
	$('.view-link').fadeIn(fadeTimer);

	// Build Word Cloud
	buildWordCloud(cloudlist, defaultMaxResults);
}

// Get top words in archive and construct cloud
function getArchiveWords(arch, filterword) {
	if(!arch){
		if (currentArchive) {
			var arch = currentArchive;
		} else {
			console.log('No archive title!');
			return false;
		}
	}
	// Loading spinner
	$('#wait').fadeIn(fadeTimer);
	// Remove previous results from Words cloud and list
	$('main article ul li').remove();
	$('.wordCloud').children().remove();
	// Adjust interface display for Words cloud display
	$('.sort-link').fadeOut(fadeTimer);
	// Construct query string
	var dateValues = $("#timeline").dateRangeSlider("values");
	var queryStringMod = '';
	if (filterword) { queryStringMod = ',"FilterWord":"'+filterword+'"'; }
	var queryString = '{"Archive": "'+ arch +'","StartDate": '+Date.parse(dateValues.min)/1000+',"EndDate": '+Date.parse(dateValues.max)/1000+',"MaxResults": '+defaultMaxResults+',"FilterStopWords": true'+queryStringMod+'}';
	console.log('API call: get/archive/betweenDates/wordcloud ...');
	$.ajax({
		type: "POST",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/archive/betweenDates/wordcloud",
		data: queryString.toString(),
		success: function (e) {
			console.log('getArchiveWords() Ajax: betweenDates/wordcloud ... '+queryString);
			var data = $.parseJSON(e);
			// Load words
			var cloudlistraw = [],i;
			var cloudlist = [];
			// Add words and volumes to array and hidden list
			$.each(data,function(word, weight){
				cloudlistraw.push([word,weight]);
				$("#wordsList").append('<li class="responseRow" volume="'+weight+'"><a href="#" onclick="wordSearch(&quot;'+searchTerm+'&quot;, &quot;'+word+'&quot;, 40, 0);"><span>' + word + '</span> <span class="archive-volume">'+ weight +'</span></a></li>');
			});
			// Sort the words array and list by volume
			cloudlistraw.sort(function(a,b){ return a[1]>b[1]?1:-1; });
			cloudlistraw.forEach(function(a){
				cloudlist.push(a[0]);
			});
			$('#wordsList li').sortElements(function(a, b){
				return parseInt($(a).attr('volume')) < parseInt($(b).attr('volume')) ? 1 : -1;
			});
			$('#wordsList').addClass('pop-sort');
			// Build the interface
			$('.sort-link').text('Popular');
			$('#wordsListView').css('height',$('#wordsList').height()+100+'px');
			$('main#'+currentView).fadeIn(fadeTimer);
			buildWordCloud(cloudlist, defaultMaxResults);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest);
			console.log(textStatus);
			console.log(errorThrown);
			librarianErr();
		}
	});
}

// Build WORD CLOUD
function buildWordCloud(cloudlist, MaxResults) {
	// Determine word cloud density for word size and fill
	if (!MaxResults) {
		var MaxResults = defaultMaxResults;
	}
	if (cloudlist.length < MaxResults)  {
		totalResults = cloudlist.length;
	} else {
		totalResults = MaxResults;
	}	
	var w = window.innerWidth;				
	var h = window.innerHeight-117;
	var fontSizeMultiplier = ((MaxResults-totalResults)/MaxResults)+(document.emSize()[1]*.1); // Change difference between largest and smallest word based on browser font size AND number of results
	d3.layout.cloud()
	  .timeInterval(10)
	  .size([w, h])
	  .words(cloudlist.map(function(d, i) {
		return {text: d, size: (((i/totalResults)*fontSizeMultiplier)+1)*document.emSize()[1], fill: i/totalResults }; // base size on ratio of number of actual results
	  }))
	  .padding(5*fontSizeMultiplier)
	  .rotate(0)
	  .font("Avenir-Book")
	  .fontSize(function(d) { return d.size; })
	  .on("end", draw)
	  .start();

	function draw(words) {
		var thisCloudView = currentView;
		if ((currentView == 'archiveListView') || (currentView == 'wordsListView') ) {
			thisCloudView = currentView.slice(0,-8)+'Cloud';
		}
		
		var currentArchiveLowercase = currentArchive.toLowerCase();
	d3.select("#"+thisCloudView).append("svg")
		.attr("width", w)
		.attr("height", h)
	  .append("g")
		.attr("transform", "translate(" + [w >> 1, h >> 1] + ")")
	  .selectAll("text")
		.data(words)
	  .enter().append("text")
		.style("font-size", function(d) { return parseInt(d.size)/document.emSize()[1] + "em"; }) // set font size in ems
		.style("font-family", "Avenir-Book")
		.style("fill", function (d) { // base fill on ratio of number of actual results
			if ( (d.text == currentArchiveLowercase) && ( currentArchiveLowercase != '*' ) ) {
				return '#9DA2CF';
			} else if (d.fill < .075) { return '#eeeeee' }
			else if (d.fill < .15) { return '#dddddd' }
			else if (d.fill < .225) { return '#cccccc' }
			else if (d.fill < .3) { return '#bbbbbb' }
			else if (d.fill < .375) { return '#aaaaaa' }
			else if (d.fill < .45) { return '#999999' }
			else if (d.fill < .525) { return '#888888' }
			else if (d.fill < .6) { return '#777777' }
			else if (d.fill < .675) { return '#666666' }
			else if (d.fill < .75) { return '#555555' }
			else if (d.fill < .825) { return '#444444' }
			else if (d.fill < .9) { return '#333333' }
			else { return '#222222' };
		})
		.attr("text-anchor", "middle")
		.attr("transform", function(d) {
		  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		})
		.on("click", function(d) {
			$('#wait').fadeIn(fadeTimer);
			var item = d.text;
			if(currentView == 'wordsCloud' ){
				activeWord = item;
				wordSearch(currentArchive, item, 40, 0);
			} else {
				$('main').fadeOut(fadeTimer);
				currentArchive = item;
				$('#viewlabel .currentArchive').text(currentArchive);
				searchTerm = item;
				currentView = 'wordsCloud';
				getArchiveWords(item);
			}
		})
		.text(function(d) { return d.text; });
	}
	// VOLUME BARS AFTER WORD CLOUD
	volumeBars(currentArchive,'',7200);
}

// Build TWEET LIST
function wordSearch(arch, word, rpp, currentPage) {
	$('#wait').fadeIn(fadeTimer);
	resetArchiveList = false;
	var pageFix = currentPage+1;
	if(!arch){
		arch = currentArchive;
	}
	if((!arch)||(!word)||(!rpp)||(!pageFix)){
		console.log(arch + ', ' + word + ', ' + rpp + ', ' + pageFix);
		if(!arch){console.log('arch!')}else if(!word){console.log('word!')}else if(!rpp){console.log('rpp = '+rpp)}else if(!pageFix){console.log('pageFix = '+pageFix)}else{console.log('something else!')}
		alert('error in wordSearch');		
		return false;
	} else {
		if($('#tweetListView').css('display') != 'block') {
			$('.view-controls').fadeOut(fadeTimer);
			searchValue = $('header input.search').val();
			$('.overlay').fadeIn(fadeTimer);
		}
		var dateValues = $("#timeline").dateRangeSlider("values");
		if ( totalPages == 0 ) {
			// GET TOTAL PAGES
			totalPagesAPI(arch, word, Date.parse(dateValues.min)/1000, Date.parse(dateValues.max)/1000, rpp);
		}
		// Get a page of tweets between two dates
		tweetListPageAPI(arch, word, Date.parse(dateValues.min)/1000, Date.parse(dateValues.max)/1000, rpp);
	}
}

function totalPagesAPI(arch, word, StartDate, EndDate, rpp){
	if(arch == '*'){
		alert('FAIL: arch = *, currentArchive = '+currentArchive+', word = '+word);
		return false;
	}
	if(currentArchive == '*'){
		currentArchive = arch;
		seachTerm = arch;
	}
	if((word == '*')||(!word)){
		var word = arch;
	}
	if(!rpp){
		var rpp = 40;
	}
	if((!arch)||(!word)||(!StartDate)||(!EndDate)||(!rpp)){
		console.log(arch + ', ' + word + ', ' + StartDate + EndDate + ', ' + rpp);
		alert('error in totalPagesAPI');		
		return false;
	} else {
		// GET TOTAL PAGES
		var queryString = '{"Archive":"'+arch+'","Word":"'+word+'","StartDate":'+StartDate+',"EndDate":'+EndDate+',"ResultsPerPage": '+rpp+'}';
		console.log('API call: betweenDates/wordsearch/pagecount');
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch/pagecount",
			data: queryString.toString(),
			success: function (e) {
				console.log('wordSearch() Ajax: betweenDates/wordsearch/pagecount ... '+queryString);
				totalPages = $.parseJSON(e);
				// VOLUME BARS FOR TWEET LIST
				volumeBars(arch, word, 7200);
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert("some error");
					console.log(XMLHttpRequest);
					console.log(textStatus);
					console.log(errorThrown);
					librarianErr();
			   }
		});
	}
}

function tweetListPageAPI(arch, word, StartDate, EndDate, rpp) {
	if(arch == '*'){
		alert('FAIL: arch = *, currentArchive = '+currentArchive+', word = '+word);
		return false;
	}
	if(currentArchive == '*'){
		currentArchive = arch;
		seachTerm = arch;
	}
	if((word == '*')||(!word)){
		var word = arch;
	}
	if(!rpp){
		var rpp = 40;
	}
	if((!arch)||(!word)||(!StartDate)||(!EndDate)||(!rpp)){
		console.log(arch + ', ' + word + ', ' + StartDate + EndDate + ', ' + rpp);
		alert('error in tweetListPageAPI');		
		return false;
	} else {
		// Get a page of tweets between two dates
		var queryString = '{"Archive": "'+arch+'","Word": "'+word+'","StartDate": '+StartDate+',"EndDate": '+EndDate+',"ResultsPerPage": '+rpp+',"Page": '+ currentPage +'}';
		console.log('API call: get/tweets/betweenDates/wordsearch ...');
		$.ajax({
			type: "POST",
			url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/tweets/betweenDates/wordsearch",
			data: queryString.toString(),
			success: function (e) {
				console.log('wordSearch() Ajax: betweenDates/wordsearch ... '+queryString);
				var data = $.parseJSON(e);
				// Load a page of tweets
				for (var i = 0; i < data.length; i++) {
					var tweetDate = Date.parse(data[i].p.twitter.data[4]);
					var niceTweetDate = data[i].p.twitter.data[4].split(' ');
					$("#tweetList").append('<li class="responseRow" tweetdate="'+tweetDate+'" retweets="'+data[i].p.twitter.data[7]+'"><div><strong><a href="https://twitter.com/'+data[i].p.twitter.data[9]+'" target="_blank" class="twitter-username">@' + data[i].p.twitter.data[9] + '</a></strong> <span class="tweet-date">' + niceTweetDate[0] + ' ' + niceTweetDate[1] + ' ' + niceTweetDate[2] + ' ' + niceTweetDate[5] + ' ' + niceTweetDate[3] + '</span></div><div class="tweetBody">' + data[i].p.twitter.data[10] + '</div><div style="clear:both"></div><div class="left"><span class="rts">Retweets: '+data[i].p.twitter.data[7]+'</span> <span class="favs">Favorites: '+data[i].p.twitter.data[6]+'</span></div><a href="https://twitter.com/'+data[i].p.twitter.data[9]+'/status/'+data[i].p.twitter.data[3]+'" class="twitterbird" target="_blank"></a></li>');
				}
				$("#tweetList li.more-link").remove();
				currentPage++;
				if(currentPage < totalPages) {
					$("#tweetList").append('<li class="more-link"><a href="javascript:wordSearch(\x27'+arch+'\x27,\x27'+word+'\x27,\x27'+rpp+'\x27,\x27'+ currentPage +'\x27);">Load More (Page '+ currentPage +'/'+totalPages+')</a></li>');
				}
				$('.tweetBody').linkify();			
				$('#wait').fadeOut(fadeTimer);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest);
				console.log(textStatus);
				console.log(errorThrown);
				librarianErr();
			}
		});
	}
}

/* KEEP CLEANING THIS CODE FROM THIS POINT DOWN = BOOKMARK */

// CLEAR MODAL
function clearModal() {
	if (currentView.slice(0,7) == 'archive') {
		currentArchive = '*';
	}
	currentPage = 0;
	totalPages = 0
	$("#tweetList li").remove();
	$('.overlay').fadeOut(fadeTimer);
	$('main').not('#'+currentView).fadeOut(fadeTimer);
	$('.view-controls').fadeIn(fadeTimer);
	if (resetArchiveList == true) {
		if (currentView.slice(0,5) == 'words') {
			getArchiveWords(searchTerm);
		} else {
			getJobs(searchTerm);
		}
	}
}

// VOLUME BARS
function volumeBars(arch, word, interval){
	$('footer svg').remove();
	if (!arch) {
		arch = '*';
	}
	if (!word) {
		word = '';
	}
	if(!interval){
		var inverval = 7200;
	}
	//Width and height
	var w = window.innerWidth-1;
	var h = 60;
	var barPadding = 1;
	var dataset = [];
	
	var basicSliderBounds = $("#timeline").dateRangeSlider("bounds");
	var queryString = '{"Archive":"'+arch+'","Word":"'+word+'","StartDate":'+Date.parse(basicSliderBounds.min)/1000+',"EndDate":'+Date.parse(basicSliderBounds.max)/1000+',"Interval": '+interval+'}';
	console.log('API call: get/interval/count ...');
	$.ajax({
		type: "POST",
		url: "http://blue.a.blocktech.com:3000/alexandria/v1/twitter/get/interval/count",
		data: queryString.toString(),
		success: function (e) {
			console.log('volumeBars() Ajax: get/interval/count ... '+queryString);
			var data = $.parseJSON(e);
			$.each(data,function(t, v){
				dataset.push(v);
			});
			var largest = Math.max.apply(Math, dataset);
			var mostRecent = Math.max.apply(Math, Object.keys(data));
			// Difference between most recent and current time
			console.log('Diff = '+((Date.parse(datetime)/1000)-mostRecent));
			console.log('interval = '+interval);
			if ( ( ( ( Date.parse(datetime)/1000 ) - mostRecent ) > interval*1.15 ) && (arch == '*') ) {
				alert('Librarian stopped archiving!');
			} else {
				console.log('Librarian appears to be archiving');
			}
			var firstTimestamp = Math.min.apply(Math, Object.keys(data));
			var missingIntervals = ((Date.parse(basicSliderBounds.max)/1000)-mostRecent)/interval;
			// Fill in missing volume bars at end of timeline
			while (missingIntervals > 0) {
				data[Math.max.apply(Math, Object.keys(data))+interval] = 0;
				missingIntervals--;
			}
			// Draw bars
			if(missingIntervals == 0){
				var drawdata = [];
				$.each(data,function(t, v){
					drawdata.push(v);
				});
				//Create SVG element
				var svg = d3.select("#footer")
							.append("svg")
							.attr("width", "100%")
							.attr("id","volume")
							.attr("height", h);
			
				svg.selectAll("rect")
				   .data(drawdata)
				   .enter()
				   .append("rect")
				   .attr("x", function(d, i) {
						return ((i * (w / drawdata.length))/w)*100+'%';
				   })
				   .attr("y", function(d) {
						return h - (h*(d/largest));
				   })
				   .attr("width", ((w / drawdata.length - barPadding)/w)*100+'%')
				   .attr("height", function(d) {
						return h*(d/largest);
				   })
				   .attr("fill", function(d) {
						return "rgb(0, 0, " + (d * 10) + ")";
				   });
			}
			// Reset Interface
			searchResults.length=0;
			searchResultsCache.length = 0;
			$('#wait').fadeOut(fadeTimer);
			$('.search').attr('disabled',false);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log(XMLHttpRequest);
			console.log(textStatus);
			console.log(errorThrown);
			librarianErr();
		}
	});
}

// ERROR CONNECTING TO LIBRARIAN
function librarianErr(){
	$('#logo').addClass('disabled');
    $('#intro').remove();
	$("#archiveList li").remove();
	$('header input.search').attr('disabled','disabled').css({background:'none #efefef',padding:'3px 15px',width:'14em'}).val('Cannot connect to Librarian').next().hide();			
	$('#wait').fadeOut(fadeTimer);
	$('#volume').fadeOut(fadeTimer);
	$('#timeline').fadeOut(fadeTimer);
	$('#app-shading').css('bottom',0);
	alert('Cannot connect to Librarian');
}

// Interger sort order function
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

// Alphabetical sort
function sortUnorderedList(ul, sortDescending) {
	var mylist = $('#'+ul);
	var listitems = mylist.children('li').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { mylist.append(itm); });
}

// Spinner configuration
var largeSpinConfig = {
	lines: 17, // The number of lines to draw
	length: 40, // The length of each line
	width: 4, // The line thickness
	radius: 60, // The radius of the inner circle
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

// Default browser font size for word cloud
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
