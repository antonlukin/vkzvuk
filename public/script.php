<?php
/*
Script name: vkZvuk functionality handler
Description: Return user sound filename
Version: 1.0
Developer: Anton Lukin <anton@lukin.me>
License: Active link to http://vkzvuk.ru required 
 */ 

define('VKZ_CALLBACK', 'vkz_sound');
define('VKZ_TTL', 1000); 
define('APP_ID', '3402716');  
define('APP_SHARED_SECRET', 'G58hiQ5fP1XKcQ7T4gKG');
define('ABSPATH', __DIR__ . '/..');

$sounds = array('xfer', 'metall', 'ding', 'icq', 'worms', 'visi', 'im', 'burp', 'glass', 'cat', 'sleeve', 'trell');


function parse_cookie($user_id){
	$session = array();
	$member = FALSE;
	$valid_keys = array('expire', 'mid', 'secret', 'sid', 'sig');
	$app_cookie = $_COOKIE['vk_app_'.APP_ID];
	if (!$app_cookie)
		return FALSE;  

	$session_data = explode ('&', $app_cookie, 10);
	foreach ($session_data as $pair) {
		list($key, $value) = explode('=', $pair, 2);
		if (empty($key) || empty($value) || !in_array($key, $valid_keys))
			continue;
		$session[$key] = $value;
	}
	foreach ($valid_keys as $key)
	  if (!isset($session[$key])) 
		return $member;
	ksort($session);

	$sign = '';
	foreach ($session as $key => $value)
	  if ($key != 'sig')
		$sign .= ($key.'='.$value);

	$sign .= APP_SHARED_SECRET;
	$sign = md5($sign);
	if ($session['sig'] == $sign && $session['expire'] > time()) 
		if($user_id == intval($session['mid']))
			return TRUE;

	return FALSE;
}

function get_sound($user_id){
	if(!is_numeric($user_id))
		return array(FALSE, 'wrong user id');

	if(apc_exists($user_id) && $sound = apc_fetch($user_id))
		return array(TRUE, $sound);

	if(!$sound = trim(@file_get_contents(ABSPATH . "/users/{$user_id}")))
		return array(FALSE, 'unregistered user');
	
	apc_store($user_id, $sound, VKZ_TTL);

	return array(TRUE, $sound);
} 

function change_sound($user_id, $sound){
	if(!file_put_contents(ABSPATH . "/users/{$user_id}", $sound))
		return FALSE;
	apc_delete($user_id);
	return TRUE;
}

function query_api(){
	header('Content-type: application/json'); 

	$q = $_GET;
	
	if(!isset($q['callback']) || $q['callback'] !== VKZ_CALLBACK)
		die_api('wrong callback', FALSE);

	list($status, $message) = get_sound($q['id']);
	die_api($message, $status);

}

function query_get(){
 	header('Content-type: application/json');  
	
	$q = $_POST;

	if(!parse_cookie($q['id']))
		die_query('authentication required', FALSE);

	list($status, $message) = get_sound($q['id']); 

	die_query($message, $status); 
}   

function query_change(){
	global $sounds; 

	header('Content-type: application/json');

	$q = $_POST;

 	if(!parse_cookie($q['id']))
		die_query('authentication required', FALSE);   

	if(!in_array($q['sound'], $sounds))
		die_query('undefined sound', FALSE);

	if(!change_sound($q['id'], $q['sound']))
		die_query('change error', FALSE);

	die_query('changed', TRUE);
}

function query_users(){
	header('Content-type: application/json');  

	die_query(count(scandir(ABSPATH . "/users/")), TRUE);
}

function is_ajax(){
	return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
}

function die_query($message, $success = FALSE){
	$result = ($success === TRUE) ? json_encode(array("success" => $message)) : json_encode(array("error" => $message));
	exit($result);
}

function die_api($message, $success = FALSE){
	$result = ($success === TRUE) ? VKZ_CALLBACK . "('{$message}')" : "vkz_error('$message')";
	exit($result);
}


function request_uri($url){
	$locations = array("api" => "query_api", "get" => "query_get", "change" => "query_change", "users" => "query_users");

	preg_match("~^[a-z0-9]+~", $url, $uri);
	$uri = array_shift($uri);                                    

	if(!array_key_exists($uri, $locations) || !function_exists($execution = $locations[$uri]))
		if(is_ajax())
			die_query("unsigned request");
		else
			header("Location: /");

	$execution();
} 

{
	request_uri(strtolower(trim($_SERVER['REQUEST_URI'], "/"))); 
}

?>
