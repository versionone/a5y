const regularType = require("../models/regularType.model.js");
const cache = require("./cache.controller.js");

exports.findAll = (req,  res) => {
	if (Object.keys(req.query).length !== 0){
		cache.findIntersection(req, (err,data) => {
			if (err)
				res.status(500).send({
				message:err});
			else	res.send( data ) ;
		})		
	}
	else {
		regularType.getAll(req.params.typename, (err,data) =>{
			if (err)
				res.status(500).send({
				message:err.message || 'foo' });
			else	res.send( data ) ;
		});
	}
};

exports.loadFromMongo = (req,  res) => {
	regularType.loadFromMongo(req.app.locals.db,req.params.typename, (err,data) =>{
		if (err)
			res.status(500).send({
			message:err.message || 'foo' });
		else	res.send( data ) ;
	});
};


exports.findOne = (req, res) => {
	regularType.getById(req.params.typename, req.params.id, (err,data) =>{
	    if (err)
			res.status(500).send({
			message:err.message });
		else	res.send( data ) ;
	});
};	

exports.deleteOne = (req, res) => {
	regularType.delete(req.app.locals.db,req.params.typename, req.params.id, (err,data) =>{
	    if (err)
			res.status(500).send({
			message:err.message  });
		else	res.send( data ) ;
	});
};	


exports.update = (req, res) => {
	if (req.body._id){
		regularType.update(req.app.locals.db,req.params.typename, req.body, (err,data) =>{
			if (err)
				res.status(500).send({
				message:err.message});
			else	res.send( data ) ;
		});
	}
	else{
		regularType.create(req.app.locals.db,req.params.typename, req.body, (err,data) =>{
			if (err)
				res.status(500).send({
				message:err.message});
			else	res.send( data ) ;
		});
	};
};	
//create and update will have to come from typed classes