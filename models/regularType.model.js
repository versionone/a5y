const red = require("../controllers/redis.controller.js");
const alltype = require("../types/typemap.js");

const regType = function(){
};


regType.getAll = async (typename, result) =>{

		const redget = await red.getAll(typename);
		var ret=[];
		for(const id in redget){
			var r = redget[id];
			const f =await getSubs(typename,r);
			try{
			ret.push(f);
			}
			catch(e){
				console.log(e);
			}
		}	
		result(null,ret);
}



regType.getById =  async (typename, id, result) =>{
	var r = await red.getOne(typename, id);
	const f =await getSubs(typename,r);
	result(null,f);
};

regType.loadFromMongo =(db,typename, result) => {
	console.log(typename);
	var coll = db.collection(typename);

	coll.find().toArray((err, results) => {
        if (err) 
			return console.log(err);
		red.deleteKey(typename);
		console.log('loading '+typename+' to redis');			
		for(var s in results){
			var r=results[s];
			console.log(r);
			red.addToHash(typename,r._id, JSON.stringify(r));
		}
		result(null,results);
 });
};

regType.create = async (db,typename, typ, result) => {
	typ = stripObj(typ);
	var n = await red.getNewId(typename)
	typ= {'_id': n, ...typ};
	await	red.addToHash(typename,typ._id,JSON.stringify(typ));
	var coll = db.collection(typename);
	   coll.insertOne(typ, function(err, reply){
		   if (err) throw err;
	   });
	   result(null,typ);
	};


regType.update =async (db,typename, typ, result) => {
	typ = stripObj(typ);
	await red.addToHash(typename,typ._id,JSON.stringify(typ));
	var coll = db.collection(typename);
	coll.replaceOne({"_id": typ._id}, typ, { upsert: false }, function(err, reply){
		if (err) throw err;		
	    result(null,typ);
	});
};

function stripObj(obj){
	//only allow first generation object updates
	var arr=Object.entries(obj);
	for (const [key, value] of arr) {
		var strip=typeof(value)=='object' || Array.isArray(value);
		if (strip){
			console.log('removing prop:'+key);
			delete obj[key];
		}
	}
	return obj;		
}

regType.delete = (db, typename, id, result) => {
	red.removeFromHash(typename, id);
		var coll = db.collection(typename);

		coll.deleteOne({ '_id' : parseInt(id)}, function( e, reply){
			if (e) {
				console.log(e);
			throw e;}
			result(null,reply);
		});			
};


const getSubs = async(typename, obj) => {
	const f=await getChildren(typename,obj);
	return f;
}

async function getChildren(typename, obj){
	console.log(obj);
	if (obj===[])
		return;
	var cop = Object.assign({},JSON.parse(obj));
	var v=alltype[typename];	

	if (v){
	
		cop['self'] = 'https://yourdomain.example.com/api/'+typename+'/'+cop._id;
		//if (v.hasOwnProperty('isLarge') && v['isLarge']) //for pagination
			//console.log('is large');
		
				
			
		if (v.hasOwnProperty('coload')){
			var carr=Object.entries(v.coload);
			for (const [key, value] of carr) {				
					var uid = cop[key+'Id'];
					var f = await red.getOne(value, uid);
					var g = await getSubs(value, f);
					cop[key] =g;
				}
		}
		if (v.hasOwnProperty('children')){
			var parentId = v.name+'Id';		
			for(var i=0;i<v.children.length;i++){	
				var subName= v.children[i];					
				var subrep = await red.getAll(subName);

				var newArr=[];
				for(const id in subrep){			
					var r = JSON.parse(subrep[id]);				
					if (r[parentId]==cop._id){						
						var s = await getSubs(subName,subrep[id]);						
						newArr.push(s);				
					}
				};
				var subtype=alltype[subName];
				var collCase = subtype.name.endsWith('s')? subtype.name+'es' : subtype.name.endsWith('y') ? (subtype.name.substring(0,subtype.name.length-1))+'ies': subtype.name+'s';	
				cop[collCase] = newArr;		
			};
		}
		if (v.hasOwnProperty('recursive')){
			var subO=[];
			var propN=v['recursive'];
			var orgs = await red.getAll(typename);
			for(const org in orgs){
				var ss = JSON.parse(orgs[org]);
				if(ss[propN] && ss[propN]==cop._id){
					var sss = await getSubs(typename,orgs[org]);
					subO.push(sss);
				}
				var cased=v.name.endsWith('s')? v.name+'es' : v.name.endsWith('y')? (v.name.substring(0,v.name.length-1))+'ies': v.name+'s';
				var subCase = 'sub'+cased.substring(0,1).toUpperCase()+cased.substring(1);
				//console.log(subCase);
				cop[subCase]=subO;	
			}
		}
	}
	return cop;
}

module.exports = regType;