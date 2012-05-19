<?php

	if(!isset($_FILES['file']))
	{
		$response = 'No File Error';
		return;
	}
	
	$file = $_FILES['file'];
	$chars = str_split("abcdefghijklmnopkrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
	$filename = '';
	for($i = 0; $i < 10; $i++)
		$filename .= $chars[rand(0, count($chars) - 1)];
	$pathinfo = pathinfo($file['name']);
	$filename .= '.' . $pathinfo['extension'];
	
	$pathinfo = pathinfo($_FILES['file']['tmp_name']);
	$filepath = $pathinfo['dirname'] . '/' . $filename;
	
	if(!move_uploaded_file($_FILES['file']['tmp_name'], $filepath)) 
		print('Move Uploaded File Error');
	
	$postdata = array();
	$postdata ['file'] = "@".$filepath.";type=".$_FILES['file']['type'];
	 
	$post_url = 'http://ms.dring93.org/upload';
	 
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_VERBOSE, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, $post_url);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
	$response = curl_exec($ch);
	curl_close ($ch);
	
	unlink($filepath);

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">

<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>upload</title>
	<meta name="generator" content="TextMate http://macromates.com/">
	<meta name="author" content="Mathieu Desvé">
	<!-- Date: 2012-05-18 -->
</head>
<body>
	<?php echo $response; ?>
</body>
</html>
