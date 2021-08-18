var workitem={
    data: function() {
        return {		
            activeItem: 'comments'		
     }
    }
,
computed:{
    loaded: function(){
        return this.item!==undefined;
    },
    currentStep: function(){
        var self=this;
        if (!this.workflow)
            return null;

        var s = _.find(this.workflow.steps, function(t){
            return t._id==self.item.currentStepId;
        })
        return s;
    }	,
    status: function(){
        if (this.currentStep)
                return this.currentStep.status;
        return null;
    },
    assignedToUser: function(){
        if (this.item)
            return this.item.assignedToUser;
        return null;
    },
    createdByUser: function(){
        if (this.item)
            return this.item.createdByUser;
        return null;
    }
},
props: {
   item : {},
   workflow:{}
},
methods:{	
    formatDate: function(dt){
        return moment(dt).format('MMM DD, YYYY h:mm A');
    },
    isActive(tab){
        return this.activeItem===tab;
    },
    setActive(tab){
        this.activeItem=tab;
    }
},

mounted: function(){
   
},
 template: `
<div>
    
   

    <div class="card" v-if="item">
       <div class="card-header">
       <h5>{{item.itemKey}}</h5>
            <h4>{{item.summary}}</h4>         
       </div>
        <div class="card-body">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-sm">Status:</div>
                <div class="col-sm" v-if="status"><hovercontrol v-model:prop="status.name" controltype="text" /></div>
                <div class="col-sm"><label>Assigned to:</label></div>
                <div class="col-sm" v-if="assignedToUser"><hovercontrol v-model:prop="assignedToUser" controltype="select" selecttype="user" /></div>
                <div class="col-sm"><label>Estimate:</label></div>
                <div class="col-sm"><hovercontrol v-model:prop="item.estimate" controltype="fibonacci" /></div>
            </div>  
        </div> 
            <hr/>     
                <h6> Description</h6>
              <p>  {{item.description}}    </p>                          

            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item" r>
                    <button class="nav-link active" role="tab"  data-bs-toggle="tab" @click="setActive('comments')">Comments</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" role="tab"   data-bs-toggle="tab" @click="setActive('attachments')">Attachments</button>
                </li>
                       <li class="nav-item">
                    <button class="nav-link" role="tab"  data-bs-toggle="tab" @click="setActive('related')">Links</button>
                </li>           
            </ul>
            <div class="tab content py-3">
                <div class="tab-pane fade" :class="{'active show' : isActive('comments')}" v-show="isActive('comments')">
                    <div v-for="cm in item.workItemComments" :key="cm._id">
                        {{cm.comment}}
                        <div style="font-size:small">{{formatDate(cm.date)}}</div>
                    </div>
                </div>
                <div class="tab-pane fade" :class="{'active show' : isActive('attachments')}"  v-show="isActive('attachments')">             
                    <div v-for="att in item.workItemAttachments" :key="att._id">
                        {{att.name}} <a :href="att.location"> <i class="bi bi-download" :href="att.location"></i></a>
                    </div>
                </div>
                <div class="tab-pane fade" :class="{'active show':isActive('related')}" v-show="isActive('related')">
                    <div v-for="sw in item.subWorkItems" :key="sw._id">
                        {{sw}}
                    </div>
                    <div v-for="li in item.workItemLinks" :key="li._id">
                        {{li.workItemLinkType.name}}-{{li.linkedWorkItemId}}
                    </div>
                </div>               
            </div>
        </div>
        <div class="card-footer text-muted" style="font-size:small" v-if="createdByUser">
            Created {{formatDate(item.createdDate)}} by {{createdByUser.name}}, updated {{formatDate(item.updatedDate)}} by {{item.lastUpdatedUser.name}}
        </div>
    </div>
   


</div>
 `
};

export default workitem;