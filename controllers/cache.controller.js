const red = require("./redis.controller.js");

const cache = function(){
};

var lookups = {
	"assignedto":"user",
	"createdby": "user",
	"status":"status", 
	"period": "period", 
	"step": "step",
	"workflow": "workflow", 
	"increment": "increment", 
	"workitemtype":"workitemtype", 
	"organization":"organization", 
	"workinggroup":"workinggroup",
	"component": "component" ,
	"componentendpoint": "componentendpoint",
	"componentendpointtype": "componentendpointtype", 
	"componentenvironment": "environment",
	"platformtype": "platformtype",
	"association": "association", 
	"rollup": "rollup"
}
cache.cacheInitial = async() =>{
	//more efficient, preloads all orgs and workflowstep
	console.log('starting icache');
	var keys = await red.getHashKeys();
	//console.log(keys);
	for(key in keys){
		await red.deleteKey(keys[key]);
	}
	var wis = await red.getAll('workitem');

	for(wi in wis){
		work = wis[wi];
		await cacheWorkitem(work);
	}	
}


async function  cacheWorkitem (workitem) {
	pwi = JSON.parse(workitem);
	if (pwi.workItemTypeId) //then it's not a work item
		red.addToSet('workitemtype-'+pwi.workItemTypeId, pwi._id);	
	if (pwi.periodId)
		red.addToSet('period-'+pwi.periodId,pwi._id);
	if (pwi.assignedToUserId)
		red.addToSet('assignedto-'+pwi.assignedToUserId,pwi._id);
	if (pwi.createdByUserId)
		red.addToSet('createdby-'+pwi.createdByUserId,pwi._id);
	red.addToSet('organization-'+pwi.organizationId,pwi._id);
	if (pwi.workingGroupId)
		red.addToSet('workinggroup-'+pwi.workingGroupId,pwi._id);
	if (pwi.workflowId)
		red.addToSet('workflow-'+pwi.workflowId, pwi._id);
	
	var s = await red.getOne('step', pwi.currentStepId);
	var stt=JSON.parse(s);
	red.addToSet('step-'+stt._id,pwi._id);
	red.addToSet('status-'+stt.statusId,pwi._id);	
	
	var per = await red.getOne('period',pwi.periodId);
	var pt = JSON.parse(per);
	red.addToSet('increment-'+pt.incrementId, pwi._id);
	
	var comps = await red.getAll('workitemcomponent');
	var compend = await red.getAll('componentendpoint');
	var compenv = await red.getAll('componentenvironment');

	var assoc = await red.getAll('association');
	var assorg = await red.getAll('associationorganization');
	var roll = await red.getAll('rollup');
	
	for (r in roll){
		var jr = JSON.parse(roll[r]);
		if (jr.organizationId===pwi.organizationId)
		{
			var d1 = new Date(jr.start);
			var d2 = new Date(jr.end);
			var wid = new Date(pwi.lastUpdated);
			if (d1 <=wid && wid <=d2)
				red.addToSet('rollup-'+jr._id, pwi._id);
		}
	}

	for( ao in assorg){
		var jao = JSON.parse(assorg[ao]);
		if (jao.organizationId===pwi.organizationId){
			for (ass in assoc){
				var ja = JSON.parse(assoc[ass]);
				if (jao._id===jao.associationId)
					red.addToSet('association-'+ja._id, pwi._id);
			}
		}
	}
	
	for(wc in comps){
		var wic = JSON.parse(comps[wc]);
		var comp = await red.getOne('component', wic.componentId);
		var jc = JSON.parse(comp);
		red.addToSet('platformtype-'+jc.platformTypeId, pwi._id);
		if (wic.workItemId=== pwi._id){
			red.addToSet('component-'+wic._id, pwi._id);
			for(ce in compend){
				var jce = JSON.parse(compend[ce])
				if (jce.componentId==wic.componentId){
					 red.addToSet('componentendpoint-'+jce._id, pwi._id);
					 red.addToSet('componentendpointtype-'+jce.componentEndpointTypeId, pwi._id);					 
				}				
			}
			for(cenv in compenv){
				var jcev = JSON.parse(compenv[cenv]);
				if (jcev.componentId==wic._id)
					red.addToSet('componentenvironment-'+jcev._id, pwi._id);
			}
		}
	}

	
				
}

cache.cacheWorkItemUpdate = async (before, after, del ) => {
	if (del){
		red.removeFromSet('workitemtype-'+before.workItemTypeId,before._id);
		red.removeFromSet('workitemtype-'+before.workItemTypeId,before._id);
		if (before.actualPeriodId)
		red.removeFromSet('actualperiodid-'+before.actualPeriodId,before._id);
	if (before.assignedToUserId)
		red.removeFromSet('assignedto-'+before.assignedToUserId,before._id);
	if (before.createdByUserId)
		red.removeFromSet,('createdby-',+before.createdByUserId,before._id);
	red.removeFromSet('organization-'+before.organizationId,before._id);
	red.removeFromSet('workinggroup-'+before.workingGroupId,before._id);
	var wf = await red.getOne('workflow', before.workflowId);
	wf = JSON.parse(wf);
	var st = wf.steps.filter(t=>t._id==before.currentStepId);
	red.removeFromSet('status-'+st.statusId,before._id);					
	}	
	cacheWorkitem(after,null,null,null);
}



cache.findIntersection = async (req,res) => {
	var retval=[];
	//passed in a set of parameters of objectType:name pairs

	var setnames=[];
	
	for(var propName in req.query){
		//for each type, lowercase it, 
		if (req.query.hasOwnProperty(propName)){ //not from prototype chain			
			//then get the id that corresponds to that name from redis
			var found=false;
			if (propName.endsWith('Id')){
				var noid=propName.substring(0,propName.length-2)

				setnames.push(noid+'-'+req.query[propName]);
				found=true;
			}
			else {
				var p = lookups[propName.toLowerCase()];
				if (!p){
					res('no property ' + propName,[]);
					return;
				}
				var hashfull = await red.getAll(p);
			
				for(var ins in hashfull){
					if (Object.hasOwnProperty.call(hashfull, ins)){
						var obj = JSON.parse(hashfull[ins]);
						if (obj.name==req.query[propName]){
							setnames.push(propName + '-'+obj._id);	
							found=true;
							break;
						}					
					}				
				}	
			}	
			if (!found) //that prop value isn't hashed
			{ 
				res('invalid value for '+propName,[])
				return;
			}
		}		
	}
	
	//now with a set of type and id, you have a set to locate (type-id)
	var rset;
	if (setnames.length==1){
		var s= await  red.getSet(setnames[0])
		rset=s;
	}
	else{
		rset = await red.getSinter(setnames);
	}
	
	//now simply return each of those to the array
	for(var i=0; i< rset.length; i++){
		var work = await red.getOne('workitem', rset[i]);
		retval.push(JSON.parse(work));
	}
	res(null,retval);
}



module.exports =cache;