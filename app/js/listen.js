
var listenObjects = [];

function attachImages() {
	var len = listenObjects.length;
	
	for (var i=0; i < len; i++){
	
		var src;
		var clicksrc = listenObjects[i].name;
		var id = listenObjects[i].id;
		src= '<a href="/#/'+clicksrc+'"><img src="http://api.artsmia.org/images/'+id+'/300/small.jpg"></a>';
		
		$("#lo"+i+" div.tableCell").append(src);
	}
}

$(document).ready(function() {
	
	$.ajax({ 
	    type: 'GET', 
	    url: 'audio/index.json', 
	    data: { get_param: 'value' }, 
	    dataType: 'json',
	    success: function (data) {
	        $.each(data, function(index, element) {
	            
	            var newobj = new Object();
	            newobj.name = index;
	            newobj.id = element.id;
	            newobj.colors = element.colors;
	            newobj.tracks = element.tracks
	            
	            //console.log('node '+index);
	            //console.log('element.id '+element.id);
	            //console.log('element.colors '+element.colors);
				//console.log('element.tracks '+element.tracks);
				
				listenObjects.push(newobj);
	        });
	        /*
	        //get a color
	        	console.log('array: '+listenObjects[0].colors[0]);
	        //get mp3
	        	console.log('array: '+listenObjects[0].tracks[0].file);
	        */
	        attachImages();
	    }
	});
	

	$.fn.fullpage({
		slidesColor: ['#1788a3', '#298658', '#222', '1788a3'],
		anchors: ['Welcome', 'Instructions', 'Chooser', 'Mixer'],
		scrollOverflow: true
	});
});


/*

All the things that can be set with fullPage.js

$(document).ready(function() {
    $.fn.fullpage({
        verticalCentered: true,
        resize : true,
        slidesColor : ['#ccc', '#fff'],
        anchors:['firstSlide', 'secondSlide'],
        scrollingSpeed: 700,
        easing: 'easeInQuart',
        menu: false,
        navigation: false,
        navigationPosition: 'right',
        navigationTooltips: ['firstSlide', 'secondSlide'],
        slidesNavigation: true,
        slidesNavPosition: 'bottom',
        loopBottom: false,
        loopTop: false,
        loopHorizontal: true,
        autoScrolling: true,
        scrollOverflow: false,
        css3: false,
        paddingTop: '3em',
        paddingBottom: '10px',
        fixedElements: '#element1, .element2',
        normalScrollElements: '#element1, .element2',
        keyboardScrolling: true,
        touchSensitivity: 15,
        continuousVertical: false,
        animateAnchor: true,

        //events
        onLeave: function(index, direction){},
        afterLoad: function(anchorLink, index){},
        afterRender: function(){},
        afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex){},
        onSlideLeave: function(anchorLink, index, slideIndex, direction){}
    });
});
*/


