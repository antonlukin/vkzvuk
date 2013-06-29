<?php

{
	define('VKZ_CALLBACK', 'vkz_sound');			// js callback function
	define('VKZ_TTL', 1000);					    // cache expiration time in sec
	define('APP_ID', 'vk_app_id');		        	// vk.com app id
	define('APP_SHARED_SECRET', 'vk_shared_key');	// vk.com app key
	define('ABSPATH', __DIR__ . '/..'); 

	define('DB_HOST', 'localhost');					// 99% chance you won't need to change this
	define('DB_USER', 'database_user');
	define('DB_PWD', 'database_password');
	define('DB_NAME', 'database_name');
	define('DB_TYPE', 'mysql');						// php-pdo db driver
}
