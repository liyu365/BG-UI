<?php
header('content-type:text/plain;charset=utf-8');

$return = array();
$return['referer'] = '';
$return['refresh'] = true;
$return['state'] = 'success';
$return['message'] = '提交成功';

echo json_encode($return);