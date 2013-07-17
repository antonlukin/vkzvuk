if(typeof VK === 'undefined')
	throw show_error(errors.novk);

VK.init({apiId: 3402716}); 
VK.Auth.getLoginStatus(vk_login);  

var vkId, currentSound;

function detect_browser(){ 
	var ua = navigator.userAgent.toLowerCase();
	
	if(/(mobile|android|iphone|tablet|ipad|iron)/.exec(ua))
		return false;

	if(/opr\/\d/.exec(ua))
		return {browser:'chrome', extension:'crx', internal:true}; 

	var browser = jQuery.browser;

	if(browser.chrome)
		return {browser:'chrome', extension:'crx'};

	if(browser.mozilla)
		return {browser:'firefox', extension:'xpi'}; 
 
	if(browser.opera)
		return {browser:'opera', extension:'oex'};         

	return false;
}

function show_error(message, hide){
 	if(typeof hide !== 'undefined' && hide) 
		$(".main").css('visibility', 'hidden');

	$("#alert").html("<p>" + message + "</p>").fadeIn('fast'); 

	return false;
}

function generate_list(){
	$.ajax({
		type: 'POST', url: '/sounds', data: "",
		error: function(){
			return show_error(errors.server, true);
		},
		async: false,
		success: function(data){
 			if(data.error)
				return show_error(errors.database, true); 

			var placeholder = $("#list .sounds-placeholder").html();
			$("#list .sounds-placeholder").remove();

			$.each(data, function(i, item){
				if(i % 6 == 0){
					playlist = document.createElement('div');
					$(playlist).addClass('sounds-playlist');
					$("#list .sounds-title").after(playlist);
				}
				pleer = $(placeholder).appendTo(playlist);
                $(pleer).find(".pleer-title").text(item.title);
 				$(pleer).find("input").val(item.slug);  
			});

			$(":radio").iButton(); 
		}
	});        
}

function show_sounds(fast){
	generate_list();

	if(vkId)
		get_sound(vkId); 

	if(typeof fast === 'undefined' || !fast)
		return $(".about").fadeOut(function(){
			$("#list").fadeIn(); 
		}); 
	
	$(".about").hide();
	$("#list").show();
}

function check_extension(ext){
	ext = typeof ext !== 'undefined' ? ext : 'extension';
	if(!$(document.body).hasClass(ext))
		return false;

	return true;
}

function update_container() {
    var width = $(window).width();
    if (width <= 1050)
	 	$(".about").css('position', 'fixed').css('margin-right', '0');   

    if (width > 1050)
	  	$(".about").css('position', 'absolute').css('margin-right', '100px');

    if (width <= 1150)
	 	$(".sounds").css('position', 'fixed');

    if (width > 1150)
	  	$(".sounds").css('position', 'absolute');
}

function change_radio(sound){
	$("#list [value='" + sound + "']").trigger('click').attr('checked', 'checked');
	currentSound = sound;

	return;
}

function get_sound(id){
	$.ajax({
		type: 'POST', url: '/get', data: "id=" + id, 
		error: function(data){
			return show_error(errors.server);
		},
		success: function(data){
			if(data.success)
				return change_radio(data.success);
		}
	});          
}

function change_sound(id){
 	var sound = $("#list input:checked").val();
	if(sound == currentSound || sound === undefined)
		return false;

	if(id === undefined)
		return VK.Auth.login(function(response){
			vk_login(response, true)
		});

	$.ajax({
		type: 'POST', url: '/change', data: "id=" + id + "&sound=" + sound, 
		error: function(){
			return show_error(errors.server); 
		},
		success: function(data){
			if(!data.success)
				return show_error(errors.change);  
		
			vk_refresh();
			return currentSound = sound;
		}
	});  
	return false;
}

function vk_refresh(){
	var vk = $('<iframe />').css('position', 'absolute').css('left', '-9999px');
	vk.attr('src','//vk.com/settings?vkz-clear');
	$('body').prepend(vk);
}

function vk_login(response, change){
	if(!response.session) 
		return false;
	vkId = response.session.mid;
	
	if(change === true)
 		change_sound(vkId);

	var code = 'return {me: API.getProfiles({uids: "' + vkId + '", fields: "first_name, last_name, photo_rec, nickname"})[0]};';
	VK.Api.call('execute', {'code': code}, function(cu){
		document.getElementById('login').innerHTML = cu.response.me.first_name + " " + cu.response.me.last_name;
	});
} 

function show_users(){
 	$.ajax({
		type: 'POST', url: '/users',
		error: function(data){
			return show_error(errors.server);           
		},
		success: function(data){
			if(data.success)
				$("#users-number").prepend(data.success).fadeIn();
		}
	});           
}

function bad_browser(){
	return $(".browser-lock").addClass('not-ie').fadeIn();
}

$(document).ready(function(){
	$(".browser-lock.not-ie").on('click touchstart', 'div', function(){
		$(this).fadeOut();
	})

	$("button.play").live('click touchstart', function(){
		var filename = "//assets.vkzvuk.ru/" + $(this).closest(".sounds-wrapper").find("input").val();
		$("#pleer").html('<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3" /></audio>');
	});

	$("button#change").on('click touchstart', function(){
 	   	if(check_extension()) 
			return change_sound(vkId);
	
		return show_error(errors.addon);   
	});

	$("button#download").on('click touchstart', function(){
		var chromeUrl = "https://chrome.google.com/webstore/detail/mgdniegdoedpnhojjocdlhmkamngdhgj";
		if(!(detect = detect_browser()))
			return bad_browser();

		if(detect.browser == 'chrome' && !detect.internal)
			return chrome.webstore.install(chromeUrl, 
				   function(a){location.reload();}, function(a){location.href = chromeUrl}); 

		url = "/download/" + detect.browser + "/vkzvuk." + detect.extension;
		document.location.href = url;
		return show_sounds();
	});


	$("#login a").on('click touchstart', function(){ 
		VK.Auth.login(vk_login);

		return false;
	}); 
  	
	update_container();
    $(window).resize(function() {
        update_container();
    });

	
});


$(window).load(function(){
 
 	if(typeof(ie) !== 'undefined' && ie)
		return; 

	$("#vk-like").html(VK.Share.button({url: "https://vkzvuk.ru"},{type: "custom", text: '<div title="Рассказать друзьям ВКонтакте"></div>'}));

	$("#alert").html('').hide();
	$("#preloader").fadeOut('fast', function(){
 	   	if(check_extension())
			show_sounds(true);

	    $("#login").show();
		$(".main").fadeIn('fast');

	});

	show_users();
}); 
