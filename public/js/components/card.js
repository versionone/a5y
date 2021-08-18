
var card={
	 data: function() {
		 return {				
	  }}
,
computed:{	

},
props: {
	workItem : {}
},
methods:{	
	truncate:function(text){
		if (text.length>50)
				return text.substring(0,50)+'...'
		else return text;
	}
},
mounted: function(){
	
},
  template: `
<div>
	<div class="card" style="height:10rem">
	<div class="position-relative">
		<div style="position:absolute; right:1rem">{{workItem.itemKey}}</div>
	</div>
	<div class="card-body">
		<h5 class="card-title">{{workItem.summary}}</h5>
		<p class="card-text">{{truncate(workItem.description)}}.</p>
		<a style="position:absolute; bottom:1rem" href="#" class="btn btn-primary">View</a>
	</div>
	</div>
</div>
  `
};

export default card;