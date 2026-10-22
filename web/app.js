'use strict';
const $=id=>document.getElementById(id),KEY='drama3-studio-v1',PENDING=KEY+'-pending',TAKES=KEY+'-takes';
const example='<|speaker:0|>[sighs] I told you this would happen. We should have left an hour ago.\n<|speaker:1|>Oh, come on. [laughs] You say that every single time.\n<|speaker:0|>And every single time I’m right.\n<|speaker:1|>[whispers] Fine. But if we find the treasure, I’m keeping half.';
let info={},ready=false,busy=false,uploading=0,count=2,lastDetails=null,pending=null,pollToken=0;
const voices=[0,1].map(()=>({source:'clip',file:'',transcriptMode:'auto',transcript:'',language:'auto',saved:'',save:false}));
const urls=[null,null],fields={model:[],codec:[],asr:[],generation:[]};
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function putStore(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Download project remains available if storage is blocked. */}}
function setStatus(message,kind=''){ $('status').textContent=message;$('jobDot').className='dot '+kind;}
function fail(error){setStatus(error.message||String(error),'bad');$('errorDetails').hidden=false;$('errorText').textContent=error.stack||String(error);}
async function api(path,options={}){
 const response=await fetch(path,{...options,signal:options.signal||AbortSignal.timeout(30000)});
 let data;try{data=await response.json();}catch{throw Error('ComfyUI returned an unreadable response ('+response.status+').');}
 if(!response.ok){const e=Error(data.error?.message||data.error||'ComfyUI request failed ('+response.status+').');e.stack=JSON.stringify(data,null,2);throw e;}return data;
}
function choices(spec){return Array.isArray(spec?.[0])?spec[0]:(spec?.[1]?.options||null);}
function optionSelect(options,value){const el=document.createElement('select');for(const item of options){const op=document.createElement('option');op.value=String(item);op.textContent=String(item);el.append(op);}if(options.includes(value))el.value=value;return el;}
function labelFor(text,input){const label=document.createElement('label');label.append(document.createTextNode(text),input);return label;}
function voiceUI(i){
 const v=voices[i],card=document.createElement('div');card.className='voice-card';card.id='voice'+i;
 card.innerHTML='<div class="voice-heading"><div class="avatar">'+(i?'B':'A')+'</div><div><strong>Voice '+(i?'B':'A')+'</strong><small>Speaker '+i+'</small></div></div>';
 const source=optionSelect(['clip','saved'],v.source);source.options[0].textContent='Reference audio clip';source.options[1].textContent='Previously saved voice';
 source.onchange=()=>{v.source=source.value;renderVoices();saveLocal();};card.append(labelFor('Voice source',source));
 if(v.source==='saved'){
  const opts=choices(DramaGraph.definitions(info,'Drama3LoadVoice').voice)||[];
  if(!opts.length){const p=document.createElement('p');p.className='small muted';p.textContent='No saved voices found. Save a voice from a clip first, then click Recheck.';card.append(p);v.saved='';}
  else{if(!opts.includes(v.saved))v.saved=opts[0];const saved=optionSelect(opts,v.saved);saved.onchange=()=>{v.saved=saved.value;saveLocal();};card.append(labelFor('Saved voice',saved));}
 }else{
  const upload=document.createElement('input');upload.type='file';upload.accept='audio/*,.wav,.mp3,.flac,.ogg,.m4a';upload.setAttribute('aria-label','Upload Voice '+(i?'B':'A')+' sample');
  upload.onchange=()=>uploadVoice(i,upload,card);card.append(labelFor('Reference recording',upload));
  const filename=document.createElement('div');filename.className='filename';filename.textContent=v.file?'Ready: '+v.file:'No clip uploaded';card.append(filename);
  const player=document.createElement('audio');player.controls=true;player.preload='none';player.hidden=!v.file;player.src=v.file?viewURL({filename:v.file.split('/').pop(),subfolder:v.file.split('/').slice(0,-1).join('/'),type:'input'}):'';card.append(player);
  const mode=optionSelect(['auto','manual'],v.transcriptMode);mode.options[0].textContent='Transcribe automatically';mode.options[1].textContent='Type the transcript myself';mode.onchange=()=>{v.transcriptMode=mode.value;renderVoices();saveLocal();};card.append(labelFor('Reference transcript',mode));
  if(v.transcriptMode==='manual'){const transcript=document.createElement('textarea');transcript.placeholder='Exactly what is said in your reference clip…';transcript.value=v.transcript;transcript.oninput=()=>{v.transcript=transcript.value;saveLocal();};card.append(labelFor('Words spoken in the clip',transcript));}
  else{const opts=choices(DramaGraph.definitions(info,'Qwen3ASRTranscribe').language)||['auto'];if(!opts.includes(v.language))v.language=opts[0];const language=optionSelect(opts,v.language);language.onchange=()=>{v.language=language.value;saveLocal();};card.append(labelFor('Reference language',language));}
  const save=document.createElement('input');save.type='checkbox';save.checked=v.save;save.onchange=()=>{v.save=save.checked;saveLocal();};const saveLabel=labelFor(' Save encoded voice for later',save);saveLabel.className='checklabel';card.append(saveLabel);
 }
 return card;
}
function renderVoices(){ $('voices').replaceChildren(...Array.from({length:count},(_,i)=>voiceUI(i)));$('voices').style.gridTemplateColumns=count===1?'1fr':'';$('one').classList.toggle('selected',count===1);$('two').classList.toggle('selected',count===2);$('one').setAttribute('aria-pressed',count===1);$('two').setAttribute('aria-pressed',count===2);$('insertB').hidden=count===1;}
async function uploadVoice(i,input,card){
 const file=input.files[0];if(!file)return;
 const name=card.querySelector('.filename'),player=card.querySelector('audio');input.disabled=true;uploading++;updateGenerate();name.textContent='Uploading…';
 try{
  const form=new FormData();form.append('image',file,file.name);form.append('type','input');form.append('subfolder','drama3_studio/'+crypto.randomUUID());form.append('overwrite','false');
  const result=await api('/upload/image',{method:'POST',body:form});if(!result.name)throw Error('ComfyUI did not return an uploaded filename.');
  voices[i].file=[result.subfolder,result.name].filter(Boolean).join('/');name.textContent='Ready: '+result.name;
  if(urls[i])URL.revokeObjectURL(urls[i]);urls[i]=URL.createObjectURL(file);player.src=urls[i];player.hidden=false;saveLocal();setStatus('Reference uploaded. Write your scene when ready.','good');
 }catch(e){fail(e);name.textContent=voices[i].file?'Previous clip retained: '+voices[i].file:'Upload failed. Try again.';}
 finally{input.disabled=false;uploading--;renderVoices();updateGenerate();}
}
const nice={model_name:'Drama 3 model',codec_name:'Audio codec',experts:'Expert placement',expert_cache_gb:'Expert cache (GB; 0 = automatic)',second_gpu:'Second GPU',split_layer:'GPU split layer',repo_id:'Transcription model',source:'ASR source',precision:'ASR precision',attention:'ASR attention',forced_aligner:'Forced aligner',local_model_path:'Local ASR path',temperature:'Temperature',top_p:'Top P',top_k:'Top K',max_frames:'Maximum frames per chunk',split_long_text:'Split long text',speakers:'Dialogue generation mode'};
function buildFields(type,group,target,keys,stored){
 fields[group]=[];const defs=DramaGraph.definitions(info,type);
 for(const key of keys){const spec=defs[key];if(!spec)continue;const opts=choices(spec);let value=stored?.[key]??DramaGraph.BASE[type]?.[key]??DramaGraph.defaultValue(spec),el;
  if(opts){const preferred=opts.find(v=>type==='Qwen3ASRLoader'?/qwen.*asr/i.test(v):['Drama3Loader','Drama3CodecLoader'].includes(type)&&key.endsWith('_name')?/drama3/i.test(v):false);value=opts.includes(value)?value:(preferred??opts[0]);el=optionSelect(opts,value);}
  else{el=document.createElement('input');if(spec[0]==='BOOLEAN'){el.type='checkbox';el.checked=!!value;}else if(['INT','FLOAT'].includes(spec[0])){el.type='number';el.step=spec[0]==='INT'?'1':String(spec[1]?.step||.05);if(spec[1]?.min!==undefined)el.min=spec[1].min;if(spec[1]?.max!==undefined)el.max=spec[1].max;el.value=value??0;}else{el.type='text';el.value=value??'';}}
  el.dataset.key=key;el.addEventListener('input',saveLocal);const label=labelFor(type==='Qwen3ASRLoader'&&key==='model_name'?'Transcription model':nice[key]||key,el);if(el.type==='checkbox')label.className='checklabel';$(target).append(label);fields[group].push(el);
 }
}
function collect(group){return Object.fromEntries(fields[group].map(el=>[el.dataset.key,el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value]));}
function state(){return {format:'drama3-audio-studio',version:1,count,text:$('script').value,voices:structuredClone(voices),model:collect('model'),codec:collect('codec'),asr:collect('asr'),generation:collect('generation'),seed:Number($('seed').value),randomSeed:$('randomSeed').checked,shorten:$('shorten').checked,prefix:$('prefix').value};}
function saveLocal(){if(!ready)return;putStore(KEY,state());$('chars').textContent=$('script').value.length.toLocaleString()+' characters';}
function apply(s){
 if(!s||s.format!=='drama3-audio-studio'||s.version!==1)throw Error('This is not an Audio Studio project file. Open a project saved by this page.');
 count=s.count===1?1:2;$('script').value=typeof s.text==='string'?s.text:'';
 for(let i=0;i<2;i++)if(s.voices?.[i]){const v=s.voices[i];for(const k of ['file','saved','transcript','language'])voices[i][k]=typeof v[k]==='string'?v[k]:'';voices[i].source=v.source==='saved'?'saved':'clip';voices[i].transcriptMode=v.transcriptMode==='manual'?'manual':'auto';voices[i].save=!!v.save;}
 for(const group of Object.keys(fields))for(const el of fields[group])if(s[group]?.[el.dataset.key]!==undefined){const value=s[group][el.dataset.key];if(el.type==='checkbox')el.checked=!!value;else if(el.tagName!=='SELECT'||[...el.options].some(o=>o.value===String(value)))el.value=value;}
 $('seed').value=Number.isSafeInteger(s.seed)&&s.seed>=0?s.seed:0;$('randomSeed').checked=s.randomSeed!==false;$('shorten').checked=s.shorten!==false;$('prefix').value=typeof s.prefix==='string'?s.prefix:'drama3/dialogue';renderVoices();saveLocal();
}
function updateGenerate(){ $('generate').disabled=!ready||busy||!!pending||uploading>0;for(const id of ['one','two','check','openProject'])$(id).disabled=uploading>0;}
async function check(){
 $('check').disabled=true;const retained=ready?state():readStore(KEY,null);
 try{info=await api('/object_info');const core=['Drama3Loader','Drama3CodecLoader','Drama3Generate','Drama3EncodeVoice','Drama3Decode','LoadAudio','SaveAudio'],missing=core.filter(t=>!info[t]);
  $('modelFields').replaceChildren();$('generationFields').replaceChildren();
  buildFields('Drama3Loader','model','modelFields',['model_name','experts','expert_cache_gb','second_gpu','split_layer'],retained?.model);
  buildFields('Drama3CodecLoader','codec','modelFields',['codec_name'],retained?.codec);
  buildFields('Qwen3ASRLoader','asr','modelFields',['model_name','repo_id','source','precision','attention','forced_aligner','local_model_path'],retained?.asr);
  buildFields('Drama3Generate','generation','generationFields',['temperature','top_p','top_k','max_frames','split_long_text','speakers'],retained?.generation);
  ready=missing.length===0;
  $('connection').textContent='ComfyUI connected';$('dot').className='dot good';
  const modelOpts=choices(DramaGraph.definitions(info,'Drama3Loader').model_name)||[],codecOpts=choices(DramaGraph.definitions(info,'Drama3CodecLoader').codec_name)||[];
  const notices=[];if(missing.length)notices.push('Missing nodes: '+missing.join(', ')+'. Install or enable ComfyUI-Drama3, then restart ComfyUI.');
  if(!modelOpts.some(x=>/drama/i.test(x)))notices.push('No Drama 3 model detected. Check your model files in ComfyUI/models/diffusion_models.');
  if(!codecOpts.some(x=>/drama/i.test(x)))notices.push('No Drama 3 codec detected. Check ComfyUI/models/vae.');
  if(!info.Qwen3ASRLoader||!info.Qwen3ASRTranscribe)notices.push('Automatic transcription is unavailable. Type each reference transcript yourself, or install the Qwen3-ASR nodes.');
  $('notice').className='notice'+(notices.length?'':' good');$('notice').textContent=notices.join('\n')||'Connected to your ComfyUI. Check the model selections below, then add your voice samples.';
  if(retained)apply(retained);else{renderVoices();saveLocal();}updateGenerate();
 }catch(e){ready=false;$('connection').textContent='ComfyUI unavailable';$('dot').className='dot bad';$('notice').textContent='Cannot reach ComfyUI. Keep it running and open this page at its address followed by /drama3-audio-studio. '+e.message;updateGenerate();}
 finally{$('check').disabled=false;}
}
function viewURL(file){return '/view?'+new URLSearchParams({filename:file.filename,subfolder:file.subfolder||'',type:file.type||'output'});}
function filesFrom(history){const result=[];for(const output of Object.values(history.outputs||{}))for(const key of ['audio','audios'])for(const f of output[key]||[])if(f.filename&&!result.some(x=>x.filename===f.filename&&x.subfolder===f.subfolder))result.push(f);return result;}
function showFiles(files){
 const children=[];for(const file of files){const player=document.createElement('audio');player.controls=true;player.preload='metadata';player.src=viewURL(file);const a=document.createElement('a');a.href=viewURL(file);a.download=file.filename;a.textContent='↓ Download '+file.filename;children.push(player,a);}
 $('players').replaceChildren(...children);$('outputTitle').textContent='Your take is ready';$('outputHelp').textContent='Listen, download, or create another performance.';$('takeStatus').textContent='TAKE READY';
}
function renderTakes(){const takes=readStore(TAKES,[]);if(!takes.length)return;const children=takes.map(t=>{const div=document.createElement('div');div.className='take';const text=document.createElement('span');text.textContent=new Date(t.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' · '+(t.count===1?'Solo':'Dialogue')+' · '+t.files[0].filename;const button=document.createElement('button');button.textContent='Listen';button.onclick=()=>{showFiles(t.files);lastDetails=t;$('downloadDetails').hidden=false;};div.append(text,button);return div;});$('takes').replaceChildren(...children);}
function finish(){busy=false;pending=null;pollToken++;try{localStorage.removeItem(PENDING);}catch{}$('resume').hidden=true;$('generate').innerHTML='<span>▶</span> Generate audio';updateGenerate();}
async function monitor(job){
 if(busy)return;busy=true;pending=job;updateGenerate();$('resume').hidden=true;const token=++pollToken;let absent=0;
 const tick=async()=>{
  if(token!==pollToken)return;
  try{
   const all=await api('/history/'+encodeURIComponent(job.id)),h=all[job.id];
   if(h){
    const errors=(h.status?.messages||[]).filter(m=>['execution_error','execution_interrupted'].includes(m[0]));
    if(h.status?.status_str==='error'||errors.length){const error=Error(errors[0]?.[1]?.exception_message||'ComfyUI stopped this take. Check its console for details.');error.stack=JSON.stringify(h.status,null,2);finish();fail(error);$('takeStatus').textContent='FAILED';return;}
    if(h.status?.completed||h.status?.status_str==='success'){
     const files=filesFrom(h);finish();if(!files.length){setStatus('Job finished, but no downloadable audio was returned. Check ComfyUI’s output folder.','bad');return;}
     showFiles(files);setStatus('Recording complete. Audio saved in ComfyUI/output.','good');lastDetails={...job,files,completed:new Date().toISOString(),history:h};$('downloadDetails').hidden=false;
     const takes=readStore(TAKES,[]);takes.unshift({time:new Date().toISOString(),count:job.settings?.count||2,files,seed:job.settings?.seed,id:job.id});putStore(TAKES,takes.slice(0,12));renderTakes();return;
    }
   }
   const queue=await api('/queue');const running=(queue.queue_running||[]).some(x=>x[1]===job.id),queued=(queue.queue_pending||[]).some(x=>x[1]===job.id);
   if(running){setStatus('Generating audio… Loading models can take a while.','working');$('takeStatus').textContent='GENERATING';absent=0;}
   else if(queued){setStatus('Queued in ComfyUI. Waiting for earlier jobs.','working');$('takeStatus').textContent='QUEUED';absent=0;}
   else if(++absent>=4){finish();setStatus('This job is no longer in ComfyUI’s queue or history. It may have been removed, or ComfyUI restarted.','bad');$('takeStatus').textContent='UNAVAILABLE';return;}
   if(token===pollToken)setTimeout(tick,2000);
  }catch(e){busy=false;$('resume').hidden=false;updateGenerate();setStatus('Connection lost. Keep ComfyUI running, then resume checking this take.','bad');}
 };tick();
}
async function generate(){
 if(busy||pending||uploading)return;
 try{
  const settings=state();if(settings.randomSeed){const a=new Uint32Array(2);crypto.getRandomValues(a);settings.seed=a[0]*1048576+(a[1]&1048575);$('seed').value=settings.seed;}
  if(!/^[\w\-/ ]{1,160}$/.test(settings.prefix)||settings.prefix.split('/').includes('..')||settings.prefix.startsWith('/'))throw Error('Use a relative output prefix with letters, numbers, spaces, dashes, or underscores.');
  const graph=DramaGraph.compile(settings,info);busy=true;updateGenerate();$('errorDetails').hidden=true;$('generate').textContent='Submitting…';setStatus('Sending your take to ComfyUI…','working');saveLocal();
  // Store a submission marker before POST: a lost response must not silently duplicate a job.
  pending={submitting:true,settings,time:new Date().toISOString()};putStore(PENDING,pending);
  const result=await api('/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:graph,client_id:crypto.randomUUID()})});
  if(!result.prompt_id){finish();throw Error('ComfyUI did not accept the job: '+JSON.stringify(result));}
  pending={id:result.prompt_id,settings,time:new Date().toISOString()};putStore(PENDING,pending);busy=false;$('generate').textContent='Take in progress…';monitor(pending);
 }catch(e){
  // A structured HTTP validation error means ComfyUI rejected the submission.
  if(pending?.submitting&&e.stack?.startsWith('{'))finish();
  if(pending?.submitting){busy=false;$('resume').hidden=false;$('resume').textContent='Check ComfyUI before another submission';fail(Error('The submission response was lost. The take may still be running. Check the ComfyUI queue before submitting again.'));updateGenerate();}
  else{busy=false;updateGenerate();fail(e);}
 }
}
function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('generate').onclick=generate;$('check').onclick=check;
$('one').onclick=()=>{count=1;renderVoices();saveLocal();};$('two').onclick=()=>{count=2;renderVoices();saveLocal();};
$('script').oninput=saveLocal;for(const id of ['seed','randomSeed','shorten','prefix'])$(id).oninput=saveLocal;
$('example').onclick=()=>{count=2;$('script').value=example;renderVoices();saveLocal();};
for(const b of document.querySelectorAll('[data-insert]'))b.onclick=()=>{const t=$('script');t.setRangeText(b.dataset.insert,t.selectionStart,t.selectionEnd,'end');t.focus();saveLocal();};
$('saveProject').onclick=()=>download('Drama3-Audio-Project.json',state());
$('openProject').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{apply(JSON.parse(await file.text()));setStatus('Project opened. Referenced clips must still exist in this ComfyUI input folder.','good');}catch(error){fail(error);}e.target.value='';};
$('downloadDetails').onclick=()=>download('Drama3-Take-Details.json',lastDetails);
$('resume').onclick=async()=>{if(pending?.id){monitor(pending);return;}try{const q=await api('/queue');const total=(q.queue_running||[]).length+(q.queue_pending||[]).length;if(total){setStatus('ComfyUI still has '+total+' active or queued job(s). Check them in ComfyUI before retrying.','bad');return;}finish();setStatus('ComfyUI’s queue is empty. Check output/drama3 for a completed take before retrying.');}catch(e){fail(e);}};
$('script').value=example;renderVoices();renderTakes();
check().then(()=>{pending=readStore(PENDING,null);if(pending?.id)monitor(pending);else if(pending){$('resume').hidden=false;$('resume').textContent='Check ComfyUI before another submission';setStatus('A previous submission needs checking before another take.','bad');updateGenerate();}});
