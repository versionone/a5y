const webf = function(){
};
webf.get = async (api, parameters) => {       
	var par= (parameters!=null && typeof(parameters)==='object')? '?':'';         	
	_.each(parameters, function (value,key) {
		par+=(par=='?')?key.toString() +'='+ value.toString():'&' + key.toString()  +'='+ value.toString();
	});
	if (parameters!=null &&  typeof(parameters)!=='object')
		par='/'+ parameters;
	var fullapi=api+ par;
	var ret= await go("GET",fullapi,null);
	return ret;
};

webf.post = async (api, request) => {
    var ret= await go('POST',api,request);
	return ret;
};
webf.put = async  (api, request) => {
	var ret= await go('PUT',api,request);
	return ret;
},
webf.delete = async (api, id) => {
	await go('DELETE',api+'/'+id,null);
}

var go = async (meth,api,payload) => {
	return new Promise(resolve => {
		var self=this;
		var coreapi= 'http://localhost:3000/api/';
		var call=  {
				url: coreapi + api  ,
				type: meth,
				crossDomain:true,
				beforeSend: function(request) {
					//request.setRequestHeader('jkey', self.tk);
				},
				contentType: "application/json",
				success:function(data) {
					resolve(data); 
				}
			};
			if (payload){
				call['data'] = JSON.stringify(payload);
			}	

		$.ajax(call);
	});
}

export default webf;