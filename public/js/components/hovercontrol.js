import web from "../functions/webfunctions.js";
var hovercontrol={
    data: function() {
        return {	
            hover:false	,
            control:false,
            fibList:[1,2,3,5,10,20,30],
            selectList:{}	
     }}
,
computed:{	
    isText: function(){
        return (this.controltype && this.controltype.toLowerCase()=='text');
    },
    isSelect:  function(){
        if (this.controltype && this.controltype.toLowerCase()=='select'){
            this.getList();
            return true;
        }
        return false;
    },
    isFibonnaci: function(){
        return this.controltype && this.controltype.toLowerCase()=='fibonacci';
    }
},
props: {
   prop : {},
   controltype: {},
   selecttype:{}
},
methods:{	
    getList: async function(){
        this.selectList = await web.get(this.selecttype);
    }
},
mounted: function(){
   
},
 template: `
<div v-if="isText">
    <input type="text" class="form-control" style="border:0" @input="$emit('update:prop', $event.target.value)"  @mouseover="hover = true" @mouseleave="hover = false" @focus="control = true" @blur="control = false" :class="{ 'highlight': hover}" v-model="prop">
</div>
<div v-if="isSelect">
    <select class="form-control" style="border:0" @input="$emit('update:prop', $event.target.value)"  @mouseover="hover = true" @mouseleave="hover = false" @focus="control = true" @blur="control = false" :class="{ 'highlight': hover}" v-model="prop">
        <option v-for="option in selectList" :value="option" >{{option.name}}</option>
    </select>
</div>
<div v-if="isFibonnaci">
    <select class="form-control" style="border:0" @input="$emit('update:prop', $event.target.value)"  @mouseover="hover = true" @mouseleave="hover = false" @focus="control = true" @blur="control = false" :class="{ 'highlight': hover}" v-model="prop">
        <option v-for="option in fibList" :value="option" >{{option}}</option>
    </select>
</div>
 `
};

export default hovercontrol;