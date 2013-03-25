VK.init({apiId: 3402716}); 
VK.Auth.getLoginStatus(vk_login);  

var vkId, currentSound;

function detect_browser(){ 
	var ua = navigator.userAgent.toLowerCase();
	
	if(/(mobile|android|iphone|tablet|ipad|iron)/.exec(ua))
		return false;
	
	var browser = jQuery.browser;

	if(browser.chrome)
		return {browser:'chrome', extension:'crx'};

	if(browser.mozilla)
		return {browser:'firefox', extension:'xpi'}; 
 
	if(browser.opera)
		return {browser:'opera', extension:'oex'};         

	return false;
}

function show_sounds(fast){
	if(typeof fast === 'undefined' || !fast)
		return $(".about").fadeOut(function(){
			$("#list").fadeIn(); 
		}); 
	
	$(".about").hide();
	$("#list").show();
	return;
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
			$("#alert").html("<p>" + errors.server + "</p>").fadeIn('fast');
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
			$("#alert").html("<p>" + errors.server + "</p>").fadeIn('fast');
		},
		success: function(data){
			if(!data.success)
				$("#alert").html("<p>" + errors.change + "</p>").fadeIn('fast');     
		
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
	else
		get_sound(vkId);

	var code = 'return {me: API.getProfiles({uids: "' + vkId + '", fields: "first_name, last_name, photo_rec, nickname"})[0]};';
	VK.Api.call('execute', {'code': code}, function(cu){
		document.getElementById('login').innerHTML = cu.response.me.first_name + " " + cu.response.me.last_name;
	});
} 

function bad_browser(){
	return $(".browser-lock").addClass('not-ie').fadeIn();
}

$(document).ready(function(){
	$(".browser-lock.not-ie").live('click touchstart', function(){
		$(this).fadeOut();
	})

	$("button.play").on('click touchstart', function(){
		var filename = "//assets.vkzvuk.ru/" + $(this).closest(".sounds-wrapper").find("input").val();
		$("#pleer").html('<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3" /></audio>');
	});

	$("button#change").on('click touchstart', function(){
 	   	if(check_extension()) 
			return change_sound(vkId);
	
		$("#alert").html("<p>" + errors.addon + "</p>").fadeIn('fast'); 
		return false;
	});

	$("button#download").on('click touchstart', function(){
		if(!(detect = detect_browser()))
			return bad_browser();

		if(detect.browser == 'chrome')
			return chrome.webstore.install("https://chrome.google.com/webstore/detail/mgdniegdoedpnhojjocdlhmkamngdhgj", 
				   function(a){location.reload();}); 

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

	$(":radio").iButton(); 
	
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
}); 
