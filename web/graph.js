/* Pure graph compiler: retains the supplied workflow's node IDs and connections. */
(function(root){
'use strict';
const BASE={
 Drama3Loader:{model_name:'drama3_w4a8experts_bf16.safetensors',experts:'in RAM',expert_cache_gb:0,second_gpu:'none',split_layer:0},
 Drama3CodecLoader:{codec_name:'drama3_codec.safetensors'},
 Qwen3ASRLoader:{repo_id:'Qwen/Qwen3-ASR-0.6B',source:'HuggingFace',precision:'bf16',attention:'auto',forced_aligner:'None',local_model_path:''},
 Qwen3ASRTranscribe:{language:'auto',context:'',max_new_tokens:4096,return_timestamps:false},
 Drama3Generate:{temperature:1,top_p:0.9,top_k:0,max_frames:600,split_long_text:true,speakers:'one take per line'},
 Drama3Decode:{shorten_long_pauses:true},SaveAudio:{filename_prefix:'drama3/dialogue'}
};
function definitions(info,type){return {...info[type]?.input?.required,...info[type]?.input?.optional};}
function defaultValue(spec){
 if(!Array.isArray(spec))return undefined;
 if(Object.hasOwn(spec[1]||{},'default'))return spec[1].default;
 if(Array.isArray(spec[0]))return spec[0][0];
 if(spec[1]?.options)return spec[1].options[0];
 if(spec[0]==='BOOLEAN')return false;
 return undefined;
}
function nodeInputs(info,type,overrides){
 if(!info[type])throw Error('Missing node: '+type+'. Install/enable the matching ComfyUI-Drama3 nodes and restart ComfyUI.');
 const defs=definitions(info,type),result={};
 for(const [key,spec]of Object.entries(defs)){
  if(key==='voices'&&Object.keys(overrides).some(k=>k.startsWith('voices.voice')))continue;
  if(['PROMPT','EXTRA_PNGINFO','UNIQUE_ID'].includes(spec[0]))continue;
  let value=Object.hasOwn(overrides,key)?overrides[key]:BASE[type]?.[key];
  if(value===undefined)value=defaultValue(spec);
  if(value!==undefined){
   const kind=spec[0],opts=spec[1]||{};
   if(!Array.isArray(value)){
    if(!(type==='LoadAudio'&&key==='audio')&&(Array.isArray(kind)||opts.options)&&!(Array.isArray(kind)?kind:opts.options).includes(value))throw Error(type+' → '+key+': select an available option.');
    if(kind==='BOOLEAN'&&typeof value!=='boolean')throw Error(key+' must be on or off.');
    if(kind==='INT'||kind==='FLOAT'){
     if(typeof value!=='number'||!Number.isFinite(value)||(kind==='INT'&&!Number.isSafeInteger(value)))throw Error(key+' must be a valid '+kind.toLowerCase()+'.');
     if((opts.min!==undefined&&value<opts.min)||(opts.max!==undefined&&value>opts.max))throw Error(key+' is outside the installed node’s allowed range.');
    }
   }
   result[key]=value;
  }
 }
 // Autogrow sockets use dotted API input names in the supplied ComfyUI graph.
 for(const [key,value]of Object.entries(overrides))if(key.startsWith('voices.voice'))result[key]=value;
 for(const key of Object.keys(info[type].input?.required||{})){
  if(key==='voices'&&Object.keys(result).some(k=>k.startsWith('voices.voice')))continue;
  if(!(key in result))throw Error(type+' needs an unsupported required input: '+key+'. This node version may be incompatible.');
 }
 return result;
}
function compile(state,info){
 if(!state.text?.trim())throw Error('Write a script first.');
 if(![1,2].includes(state.count))throw Error('Choose one or two voices.');
 const tags=[...state.text.matchAll(/<\|speaker:(\d+)\|>/g)].map(m=>Number(m[1]));
 if(tags.some(n=>n>=state.count))throw Error('The script uses a speaker that is not enabled.');
 if(state.count===2&&state.text.split('\n').filter(s=>s.trim()).some(s=>!/^<\|speaker:[01]\|>\s*\S/.test(s.trim())))throw Error('Start each nonempty dialogue line with speaker 0 or speaker 1. Use the speaker buttons.');
 const graph={};
 const add=(id,type,data)=>{graph[id]={class_type:type,inputs:nodeInputs(info,type,data)};};
 add('2','Drama3Loader',state.model||{});add('3','Drama3CodecLoader',state.codec||{});
 const generate={...state.generation,text:state.text,seed:state.seed,model:['2',0]};
 let needsASR=false;
 for(let i=0;i<state.count;i++){
  const voice=state.voices[i],load=String(10+i*10),trans=String(11+i*10),encode=String(12+i*10),save=String(13+i*10);
  if(voice.source==='saved'){
   if(!voice.saved)throw Error('Choose a saved voice for Voice '+(i?'B':'A')+'.');
   add(encode,'Drama3LoadVoice',{voice:voice.saved});
  }else{
   if(!voice.file)throw Error('Upload a reference clip for Voice '+(i?'B':'A')+'.');
   add(load,'LoadAudio',{audio:voice.file});
   let transcript=voice.transcript?.trim();
   if(voice.transcriptMode==='manual'){
    if(!transcript)throw Error('Type the exact reference transcript for Voice '+(i?'B':'A')+'.');
    const prefix=transcript.match(/^<\|speaker:(\d+)\|>/);
    if(prefix&&Number(prefix[1])!==i)throw Error('Reference transcript speaker tag does not match Voice '+(i?'B':'A')+'.');
   }else{
    needsASR=true;add(trans,'Qwen3ASRTranscribe',{model:['4',0],audio:[load,0],language:voice.language||'auto'});transcript=[trans,0];
   }
   add(encode,'Drama3EncodeVoice',{codec:['3',0],audio:[load,0],transcript});
   if(voice.save)add(save,'Drama3SaveVoice',{voice:[encode,0],name:'drama3/'+(i?'voice_b':'voice_a')});
  }
  generate['voices.voice'+i]=[encode,0];
 }
 if(needsASR)add('4','Qwen3ASRLoader',state.asr||{});
 add('30','Drama3Generate',generate);
 add('31','Drama3Decode',{codec:['3',0],codes:['30',0],shorten_long_pauses:state.shorten});
 add('33','SaveAudio',{audio:['31',0],filename_prefix:state.prefix||'drama3/dialogue'});
 return graph;
}
root.DramaGraph={compile,definitions,defaultValue,BASE};
if(typeof module!=='undefined')module.exports=root.DramaGraph;
})(globalThis);
