<?php
header('content-type:text/plain;charset=utf-8');
//定义站点根目录
define('ROOT_PATH', str_replace("\\", '/', dirname(dirname(__FILE__))));
//定义附件上传路径
define('ATTACHMENTS_PATH', ROOT_PATH . "/attachments/");
//判断附件文件夹是否存在，不存在则创建
if (!is_dir(ATTACHMENTS_PATH)) {
    mkdir(ATTACHMENTS_PATH);
}

if ($_FILES['imgFile']['error'] > 0) {
    $return = array();
    $return['error'] = 1;
    $return['message'] = '上传失败';
    exit(json_encode($return));
}

//判断被上传的图片大小是否合法
/**
 * getimagesize()根据图片的绝对路径（必须是绝对路径），获取这个图片的信息。返回的是一个数组：
 * 0=>图片的宽
 * 1=>图片的高
 * 2=>返回的是数字，其中1 = GIF，2 = JPG，3 = PNG，4 = SWF，5 = PSD，6 = BMP，7 = TIFF(intel byte order)，8 = TIFF(motorola byte order)，9 = JPC，10 = JP2，11 = JPX，12 = JB2，13 = SWC，14 = IFF，15 = WBMP，16 = XBM
 * 3=>height="yyy" width="xxx"
 * 'bits'=>给出的是图像的每种颜色的位数，二进制格式
 * 'channels'=>给出的是图像的通道值，RGB 图像默认是 3
 * 'mime'=>类似于'image/jpeg'的MIME信息
 */
$source_info = getimagesize($_FILES['imgFile']['tmp_name']);
if (isset($_REQUEST['minWidth'])) {
    if ($source_info[0] < $_REQUEST['minWidth']) {
        $return = array();
        $return['error'] = 1;
        $return['message'] = '图片尺寸太小';
        exit(json_encode($return));
    }
}
if (isset($_REQUEST['minHeight'])) {
    if ($source_info[1] < $_REQUEST['minHeight']) {
        $return = array();
        $return['error'] = 1;
        $return['message'] = '图片尺寸太小';
        exit(json_encode($return));
    }
}

//获取后缀名(这里不用$_FILES["imgFile"]["type"]去获取文件的MIME类型来判断文件格式，因为flash上传文件的MIME类型统一都是"application/octet-stream")
//$suffix = '.' . pathinfo($_FILES['imgFile']['name'])['extension']; //$_FILES['imgFile']['name']是上传文件的原始文件名称
$pathinfo = pathinfo($_FILES['imgFile']['name']);
$suffix = '.' . $pathinfo['extension']; //$_FILES['imgFile']['name']是上传文件的原始文件名称

if (is_uploaded_file($_FILES['imgFile']['tmp_name'])) {
    $src = uniqid() . $suffix;
    if (!move_uploaded_file($_FILES['imgFile']['tmp_name'], ATTACHMENTS_PATH . $src)) {
        $return = array();
        $return['error'] = 1;
        $return['message'] = '上传失败';
        exit(json_encode($return));
    } else {
        $return = array();
        $return['error'] = 0;
        $return['message'] = '上传成功';
        $return['url'] = "/attachments/" . $src;
        $return['source_path'] = ATTACHMENTS_PATH . $src;
        if (isset($_REQUEST['uid'])) {
            $return['uid'] = $_REQUEST['uid'];
        }
        exit(json_encode($return));
    }
}


