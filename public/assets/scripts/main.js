if(typeof VK === 'undefined')
	throw show_error(errors.novk);

VK.init({apiId: 3402716}); 
VK.Auth.getLoginStatus(vk_login);  

var vkId, currentSound;

function detect_browser(){ 
	var ua = navigator.userAgent.toLowerCase();
	
	if(/(mobile|android|iphone|tablet|ipad|iron|trident)/.exec(ua))
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

function format_filesize(bytes) {
	if (typeof bytes !== 'number')
		return '';

	if (bytes >= 1000000000)
		return (bytes / 1000000000).toFixed(2) + ' GB';

	if (bytes >= 1000000)
		return (bytes / 1000000).toFixed(2) + ' MB';

	return (bytes / 1000).toFixed(2) + ' KB';
}                    

function show_error(message, hide){
 	if(typeof hide !== 'undefined' && hide) 
		$(".main").css('visibility', 'hidden');

	if(typeof message === 'undefined' || message == '')
		return $("#alert").fadeOut();

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

			var placeholder = $("#sounds .sounds-placeholder").html();
			$("#sounds .sounds-placeholder").remove();
			$.each(data, function(i, item){
				pleer = $(placeholder).prependTo("#sounds");
                $(pleer).find(".pleer-title").text(item.title);
 				$(pleer).find("input").val(item.slug);  
			});

			$("#sounds").mCustomScrollbar({advanced:{updateOnContentResize: true}});
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
			$(".board").fadeIn(); 
		}); 
	
	$(".about").hide();
	$(".board").show();
}

function check_extension(ext){
	ext = typeof ext !== 'undefined' ? ext : 'extension';
	if(!$(document.body).hasClass(ext))
		return false;

	return true;
}

function update_container() {
    var width = $(window).width();
	var height = $(window).height(); 

	if(!$(".main").data("image"))
	    $(".main").data("image", $(".main").css('background-image'));

	if(width <= 1150)
		$(".board").css('right', 1170 - width + "px");
 
	if(width > 1150)
		$(".board").css('right', '20px');

	if(width <= 1100){
		$(".logo").css('display', 'none');
		$(".main").css('background-image', 'none');
		$(".about-wrapper").css('margin-left', '100px');
	}

	if(width > 1100){
		$(".logo").css('display', 'block');
		$(".main").css('background-image', $(".main").data("image"));
 		$(".about-wrapper").css('margin-left', '270px'); 
	}

    if(width <= 1060)
    	$(".about").css('margin-right', 1160 - width + "px");
 
	if(width > 1060)
  		$(".about").css('margin-right', '100px');

}

function change_radio(sound){
	$("#sounds [value='" + sound + "']").trigger('click').attr('checked', 'checked');
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
 	var sound = $("#sounds input:checked").val();
	if(sound == currentSound || sound === undefined)
		return false;

	if(id === undefined)
		return VK.Auth.login(function(response){
			vk_login(response, true)
		});

 	vk_refresh(); 

	$.ajax({
		type: 'POST', url: '/change', data: "id=" + id + "&sound=" + sound, 
		error: function(){
			return show_error(errors.server); 
		},
		success: function(data){
			if(!data.success)
				return show_error(errors.change);  
		
			return currentSound = sound;
		}
	});  
	return false;
}

function vk_refresh(){
	var link = document.createElement('a');
	link.href = 'https://vk.com/settings?vkz-clear';
	link.setAttribute('target', '_blank');
	document.body.appendChild(link);
	link.click();    
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

	$(document).on('click', 'a#add', function(e){
		e.preventDefault(); 

		$(".board-list").fadeOut(function(){
			$(".board-add").fadeIn();
		});
	});

 	$(document).on('click', 'a#list', function(e){
		e.preventDefault(); 

		$(".board-add").fadeOut(function(){
			$(".board-list").fadeIn();
		});
	}); 

	$("#login a").on('click touchstart', function(){ 
		VK.Auth.login(vk_login);

		return false;
	}); 

	$(document).on('click', '#drop button.browse', function(e){
 		e.preventDefault(); 
 
		if(vkId === undefined)
			return VK.Auth.login(function(response){
				vk_login(response, true)
			});    

		$(this).parent().find('input').click();
	}); 
 
	$(document).on('drop dragover', function (e) {
		e.preventDefault();
	}); 

	$('#upload').fileupload({

		dropZone: $('#drop'),

		formData: {id : vkId},
		
		add: function (e, data) {
			show_error('');
		
			if(vkId === undefined)
				return show_error(errors.vkauth);

			$("#uploaded").slideUp(300);   
		
			if(data.files[0].size > 512000)
				return show_error(errors.filesize);

			var tpl = $('<div class="working"><input type="text" value="0" data-width="80" data-height="80"' +
			' data-fgColor="#169bd3" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></div>');

			tpl.find('p').text(data.files[0].name).append('<i>' + format_filesize(data.files[0].size) + '</i>');

			data.context = tpl;
		
			$("#uploaded").slideDown(function(){
				$(this).html(tpl);
			});

			tpl.find('input').knob();
			tpl.find('span').click(function(){
				if(tpl.hasClass('working'))
					jqXHR.abort();
			});

			var jqXHR = data.submit();
		},

		progress: function(e, data){
			var progress = parseInt(data.loaded / data.total * 100, 10);

			data.context.find('input').val(progress).change();

			if(progress == 100)
				data.context.removeClass('working');
		},

		fail: function(e, data){
			data.context.addClass('error');
		},

		done: function(e, data){
			if(data.result.success){
 				$(".upload-desc").fadeOut(function(){
					$(".upload-box").hide();
					$(".upload-result").fadeIn();
				}); 
				
				return false;
			}
			
			$("#uploaded").slideUp();
			return show_error(errors.upload);
		}

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
