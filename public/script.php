<?php
/*
Script name: vkZvuk functionality handler
Description: Retrieve and update user's sound
Version: 1.3
Developer: Anton Lukin <anton@lukin.me>
License: Active link to http://vkzvuk.ru required 
 */ 


function init_settings(){
	require_once('../config/settings.php');
}

function parse_cookie($user_id){
	$session = array();
	$member = FALSE;
	$valid_keys = array('expire', 'mid', 'secret', 'sid', 'sig');
	$app_cookie = @$_COOKIE['vk_app_'.APP_ID];
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

function db_connect(){
	try{
		$link = new PDO(DB_TYPE.":host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PWD, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8")); 
		$link->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
		return $link;
	}
	catch(PDOException $e) {
		return false;
	}
}

function db_select($link, $query, $data = false, $result = array()){
	try{    
		if(!$data)
			$query = $link->query($query);
		
		else {
			$query = $link->prepare($query);
			$query->execute($data);
		}

		$query->setFetchMode(PDO::FETCH_ASSOC);  

		while($row = $query->fetch()) 
			$result[] = $row;
	}
	catch(PDOException $e) {
		return false;
	} 
	return $result;
}

function db_row($link, $query, $data = false){
	$result = db_select($link, $query, $data);
	if(isset($result[0]))
		return $result[0];
	return false;
}

function db_num_rows($link, $query, $data = array()){
	$result = $link->prepare($query);  
	$result->execute($data);      

	return $result->fetchColumn();
}

function db_query($link, $query, $data = array()){
	try{ 
		$link->beginTransaction();

		$prepare = $link->prepare($query);  
		$prepare->execute($data); 

		$link->commit();
	}
	catch(PDOException $e) {
		$link->rollBack();
		
		return false;
	}    

	return true;
}

function db_close($link) {
	$link = null;
}  

function get_sound($user_id){
	if(!is_numeric($user_id))
		return array(FALSE, 'wrong user id');

	if(apc_exists($user_id) && $sound = apc_fetch($user_id))
		return array(TRUE, $sound);

	$db = db_connect();
	if(!$db)
		return array(FALSE, 'cannot connect to database');

	$select = db_row($db, "SELECT slug FROM users JOIN sounds WHERE users.sound = sounds.id AND vkid = ?", array($user_id));

	db_close($db);

	if(!$sound = $select['slug'])
		return array(FALSE, 'unregistered user');
	
	apc_store($user_id, $sound, VKZ_TTL);

	return array(TRUE, $sound);
} 


function change_sound($user_id, $sound){
	$db = db_connect();
	if(!$db)
		return FALSE;

	$select = db_num_rows($db, "SELECT COUNT(vkid) FROM users WHERE vkid = ?", array($user_id));

	if((int)$select == 0)
		$query = "INSERT INTO users (vkid, sound, created) SELECT :user_id, id, NOW() FROM sounds WHERE sounds.slug = :sound";
	else
		$query = "UPDATE users AS u,(SELECT id FROM sounds WHERE slug = :sound) AS s SET u.sound = s.id WHERE u.vkid = :user_id";

    $result = db_query($db, $query, array(':sound' => $sound, ':user_id' => $user_id));
	
	db_close($db);

	if(!$result)
		return FALSE;

	apc_delete($user_id);
	return TRUE;
}

function query_api(){
	header('Content-type: application/javascript'); 

	$q = $_GET;
	
	if(!isset($q['callback']) || $q['callback'] !== VKZ_CALLBACK)
		die_api('wrong callback', FALSE);

	list($status, $message) = get_sound($q['id']);
	die_api($message, $status);

}

function query_get(){
 	header('Content-type: application/json');  

	$q = $_POST;

	if(!isset($q['id']) || !parse_cookie($q['id']))
		die_query('authentication required', FALSE);

	list($status, $message) = get_sound($q['id']); 

	die_query($message, $status); 
}   

function query_change(){
	header('Content-type: application/json');

	$q = $_POST;

 	if(!isset($q['id']) || !parse_cookie($q['id']))
		die_query('authentication required', FALSE);   

	if(!change_sound($q['id'], $q['sound']))
		die_query('change error', FALSE);

	die_query('changed', TRUE);
}

function query_users(){
	if(!is_ajax())
		die_redirect("/");

	header('Content-type: application/json');  

	$db = db_connect() or 
		die_query('cannot connect to database', FALSE);

	$select = db_row($db, "SELECT COUNT(vkid) as count FROM users");

	db_close($db);
	die_query($select['count'], TRUE);
}

function query_sounds(){
	if(!is_ajax())
		die_redirect("/"); 

	header('Content-type: application/json');  

	$db = db_connect() or 
		die_query('cannot connect to db', FALSE);

	$sounds = db_select($db, "SELECT slug, title FROM sounds WHERE hidden <> 1 ORDER BY id DESC");

	if(!$sounds)
		die_query('cannot select data from db', FALSE);

	db_close($db);

	$result = json_encode($sounds);
	exit($result);
}

function query_upload(){
	header('Content-type: application/json');
	
  	$q = $_POST;
	$allowed = array('mp3', 'ogg');

	if(!isset($q['id']) || !parse_cookie($q['id']))
		die_query('authentication required', FALSE);

	if(!isset($_FILES['upl']) || $_FILES['upl']['error'] != 0)
		die_query("can't upload file", FALSE);

	$extension = pathinfo($_FILES['upl']['name'], PATHINFO_EXTENSION);

	if(!in_array(strtolower($extension), $allowed))
		die_query("wrong file extension", FALSE);

	$user = $q['id'];
	$path = ABSPATH . '/write/' . $user;
	$file = md5($_FILES['upl']['name'] . time()) . ".{$extension}";

	if(!is_dir($path))
		@mkdir($path);

	if(!move_uploaded_file($_FILES['upl']['tmp_name'], "{$path}/{$file}"))
		die_query("can't move uploaded file", FALSE); 

	$db = db_connect();
	if(!$db)
		die_query("can't connect to database", FALSE);

	$query = "INSERT INTO uploads (vkid, filename, path, created) VALUES (:user, :filename, :path, NOW())";

    $result = db_query($db, $query, array(':user' => $user, ':filename' => $_FILES['upl']['name'], ':path' => $file));
	
	db_close($db);

	if(!$result)
		die_query("can't insert sound to database", FALSE); 
	
	die_query("successfully uploaded", TRUE);
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

function die_redirect($location){
	header("Location: " . $location);
	exit();
}

function request_uri($url){
	$locations = array("api" => "query_api", "get" => "query_get", "change" => "query_change", "users" => "query_users", "sounds" => "query_sounds");

	preg_match("~^[a-z0-9]+~", $url, $uri);
	$uri = array_shift($uri);                                    

	if(!array_key_exists($uri, $locations) || !function_exists($execution = $locations[$uri])){
		if(is_ajax())
			die_query("unsigned request");
		else
			die_redirect("/");  
	}

	$execution();
} 

{
	init_settings();
	request_uri(strtolower(trim($_SERVER['REQUEST_URI'], "/"))); 
}
