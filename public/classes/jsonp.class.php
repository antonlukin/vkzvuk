<?php

define('VKZ_CALLBACK', 'vkz_sound');
define('VKZ_TTL', 1000);


function get_sound($q){
	if(!isset($q['callback']) || $q['callback'] !== VKZ_CALLBACK)
		return array(FALSE, 'wrong user callback');

	if(!isset($q['id']) || !is_numeric($id = $q['id']))
		return array(FALSE, 'wrong user id');

	if(apc_exists($id) && $sound = apc_fetch($id))
		return array(TRUE, $q['callback'] . '("'.$sound . '")');       

	if(!$sound = @file_get_contents(__DIR__ . "/users/{$id}"))
		return array(FALSE, 'unregistered user');

	apc_store($id, $sound, VKZ_TTL);

	return array(TRUE, $q['callback'] . "('{$sound}')");

}
{
	

	exit($value); // debug now
}
?>
