<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL|E_STRICT);
	$res = "-7";
	$fName = $_POST['filepath'];
	try {
		$res=simplexml_load_file($fName);
		echo json_encode($res); 
	} catch (Exception $e) {
		echo 'error';
	}
?> 
