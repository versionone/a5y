const red = require("../controllers/redis.controller.js");
const alltype = require("../types/typemap.js");
const cache = require("../controllers/cache.controller.js");
const init = function(){
};


init.uninit = () =>{
	console.log('uninit');
	return new Promise(resolve => {
		red.deleteKey('init');
	});
	
}
function dropMongoColl(db, collName){
	return new Promise(resolve => {
		db.collection(collName).drop(function(e,r) {
			if (e)
				console.log('error:'+e);
			resolve();
		})
	});
};
async function dropRedisColl(collName){
	console.log('dropping redis coll '+collName);
	const r = red.deleteKey(collName);
};

function buildSets(){
	cache.cacheWorkitemInitial();
}

async function createMongo(db, collName, v){
	return new Promise(resolve => {
		 db.collection(collName).insertOne(v, function(err, reply){
				if (err) {
					console.log('error on: '+collName+':'+err);
					throw err;}
				resolve();
		});
	});
}

async function createRedis(collName, v){
	//console.log('loading redis for '+collName+ '; id:'+ v._id);
	const r= red.addToHash(collName,v._id, JSON.stringify(v));
}

async function isInit(){
	var r= await red.exists('init');
	if (r==0)
		return false;
	return true;
}

async function loadAll(db) { 
	const isin = await isInit();
	if (!isin){
		for (const [key, value] of Object.entries(alltype)) {
			console.log('initializing '+key);
			await dropRedisColl(key);
			await dropMongoColl(db,key); 
			
			//add values
			for(var i=0;i<value.init.length;i++){	
				var v=value.init[i];			
				const res= await createMongo(db, key, v);
				const f= await createRedis(key, v);
			}			
		};
		await cache.cacheInitial();
		await red.set('init',true);
		console.log('completed initializing');
	}	
};


init.prime = (db) =>{	
	loadAll(db);

}



module.exports = init;