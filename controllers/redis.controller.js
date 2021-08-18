const redis = require("redis");
const redisConfig = require("../config/redis.config.js");

// Create a connection to the database
const client =redis.createClient({host:'localhost', port: redisConfig.PORT});

client.on("error", (err) => {console.log(err);});

const redi = function(){
};

redi.deleteKey = async(key)=>{
	return new Promise(resolve => {
		client.del(key,  function (err,reply) {
		if (err) {
			console.log("error: ",err);
			resolve(err);
		}
		resolve(reply);
		});
	});
}

redi.getHashKeys=()=>{
	return new Promise(resolve => {
		client.keys('*-*', function (err,reply) {
		if (err) {
			console.log("error: ",err);
			resolve(err);
		}
		resolve(reply);
		});
	});
}

redi.getOne = (typename, id) =>{
	return new Promise(resolve => {
		client.zrangebyscore(typename,id,id, function (err,reply) {
		if (err) {
			console.log("error: ",err);
			resolve(err);
		}
		resolve(reply);
		});
	});
}
redi.getSinter = (str) =>{
	return new Promise(resolve => {
		client.sinter(str, function (err,reply) {
		if (err) {
			console.log("error: ",err);
			resolve(err);
		}
		resolve(reply);
		});
	});
}

redi.getSet = (typename) =>{
	return new Promise(resolve => {
		client.smembers(typename, function(e,r)  {
			if (e){
				resolve(e);
				console.log(e);
			}
			resolve(r);
		});
	});
}

redi.getAll = (typename) =>{
	return new Promise(resolve => {
		client.zrange(typename, 0 ,-1, function(e,r)  {
			if (e){
				resolve(e);
				console.log(e);
			}
			resolve(r);
		});
	});
}

redi.addToSet = (typename, value) => {
	return new Promise(resolve => {
		client.sadd(typename, value, function(e,r) {
			if (e){
				resolve(e);
				console.log(e)
				}
			else
				resolve(r);
		});
	});
}
redi.set = (typename,value) => {
	return new Promise(resolve => {
		client.set(typename,value, function(e,r) {
			if (e){
				resolve(e);
				console.log(e)
				}
			else
				resolve(r);
		});
	});
}
redi.getNewId = (typename) => {
	return new Promise(resolve => {
		client.zrangeforscore(typename, '(1','+inf','LIMIT 0 1', function(e,r) {
			if (e){
				resolve(e);
				console.log(e)
				}
			else
				resolve(r._id+1);
		});
	});
}

redi.addToHash = (typename, id, value) => {
	return new Promise(resolve => {
		client.zadd(typename, id ,value, function(e,r) {
			if (e){
				resolve(e);
				console.log(e)
				}
			else
				resolve(r);
		});
	});
}

redi.exists = (setName) => {
	return new Promise(resolve => {
		client.exists(setName, function(e,r) {
			if (e){
				resolve(e);
				console.log(e)
				}
			else
				resolve(r);
		});
	});
}

redi.removeFromSet = (typename, id) =>{
	return new Promise(resolve => {
		client.srem(typename, id, function(e,r) {
			if (e){
				resolve(e);
				console.log(e)
				}
			else
				resolve(r);
		});
	});
}

redi.removeFromHash = (typename, id) => {
		return new Promise(resolve => {
		client.zrembyscore(typename, id, id, function(e,r) {
			if (e){
				resolve(e);
				console.log(e)
				}
			else
				resolve(r);
		});
	});
}


module.exports = redi;