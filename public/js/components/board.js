import web from "../functions/webfunctions.js";

var board={
    data: function() {
        return {
            workitems:{},
            workflow:{}	,
            selectedWork:{}	
     }}
,
computed:{	
   sortedWork :function(){
      var ret=[];
      if (!this.workflow || !this.workitems)
         return ret;
         var self=this;
      var s= _.each(this.workflow.steps,function(s){
         var f = _.filter(self.workitems,function(t){
            return t.currentStepId==s._id;
         });
         ret.push({step:s, items: f});
      });
   return ret;
   }
},
props: {
   workflowId : Number,
   organizationId: Number
},
methods:{	
   load:async function(){        
      this.workflow = await web.get('workflow',this.workflowId)
       this.workitems = await web.get('workitem',{organizationId:this.organizationId});	
       },
   stepname: function(step){
      return 'step'+step._id;
   },
   setItem: function(work){
      this.selectedWork = work;
      $('#workItemModal').modal('toggle');
   },
   closeModal: function(){
      $('#workItemModal').modal('toggle');
   }
},
mounted: async function(){
   await this.load()
   var dr=[]
   _.each(this.workflow.steps,function(s){
      dr.push(document.querySelector('#step'+s._id))
   });
   dragula(
     dr
   ).on('drop', function(el,target){
      console.log(target.id +':'+el.id); //to-do - change the currentstep
   })
},
 template: `
 <h4>Kanban</h4>
<div class="row">
   <div class="col-lg-4"  v-for="col in sortedWork" >
      <div class="card mb-3">
         <div class="card-header bg-light">
            <h3 class="card-title h5 mb-1">
               {{col.step.name}}
            </h3>
         </div>
         <div class="card-body">
            <div class="cards" :id="stepname(col.step)">
                     <card  v-for="work in col.items"  :workItem="work" @click="setItem(work)"  :key="work._id" :id="work._id"/>
            </div>
         </div>
      </div>
   </div>
</div>
<teleport to="body">		          
			<div id="workItemModal" class="modal fade" role="dialog" aria-hidden="true">
				<div class="modal-dialog modal-xl">
					<div class="modal-content">
						<div class="modal-header">
							<div class="modal-body" >
                        <workitem :item="selectedWork" :workflow="workflow"/>                        
                         <button class="btn btn-primary" @click="closeModal">Close</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			</teleport>
 `
};

export default board;