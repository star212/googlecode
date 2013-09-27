<?php
	header('Content-type: application/json; charset=utf-8');
	$res1['option'] = "客户经理";//月总支出 yzc=sh+jt+gw+dk+tzz+qtz
	$res1['value']= 2;//投资支出
	$res2['option'] = "客户资料";//月总支出 yzc=sh+jt+gw+dk+tzz+qtz
	$res2['value']= 3;//投资支出
	$array = array(0 => $res1, 1 => $res2);
	echo json_encode($array);
//	$res['yzs']= 20000;//月总收入
//	$res['dk']= 0;//贷款支出
//	$res['srjk']= 0;//私人借款
//	$res['nsr']= 100000;//年收入   nsr=yzs*12+3gz
//	$res['jzc']= 300000;//净资产 总资产-总负债=zzc-zfz 总资产=zzc=ldzc+dqck+bxnj+swzc+tzzzc 总负债=zfz=fd+cd+xfdk+srjk+xyktz+qtdk
//	$res['tzzzc']= 100000;//投资总资产
//	$res['zzc']= 300000;//总资产
//	$res['zfz']=0;
//	$res['nl']= 4;//年龄
//	$res['yxj']= 15000;//月现金
//	$res['fa']= 1;//是否已婚
//	//收入支出部分
//	$res['zsr']= 200000;//总收入
//	$res['zsr_comment']= "zsr_comment";//收入评价
//	$res['zzc_comment']= "zzc_comment";//支出评价
//	//资产负债部分
//	$res['ldzc']=300000;//现金及活期存款
//	$res['dqck']=50000;//定期存款
//	$res['bxnj']=100000;//保险年金
//	$res['swzc']=500000;//实物资产
//	
//	$res['fd']=0;   //房贷
//	$res['cd']=0; //车贷
//	$res['xfdk']=0; //消费贷款
//	$res['srjk']=0; //私人借款
//	$res['xyktz']=0;//信用卡透支  
//	$res['qtdk']=0; //其他贷款
//	
//	$res['zc_comment']="zc_comment"; //资产评价
//	$res['fz_comment']="fz_comment"; //负债评价
//
//	$res['fxph']=4; //风险偏好
//	$res['fxph_comment']="fxph_comment";
//	$res['comment']="最后的总评";
//	echo json_encode($res);
?>