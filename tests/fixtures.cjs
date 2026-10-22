const spec=(type,defaultValue,extra={})=>[type,defaultValue===undefined?extra:{default:defaultValue,...extra}];
const node=required=>({input:{required}});
const schema={
Drama3Loader:node({model_name:spec(['drama3_w4a8experts_bf16.safetensors']),experts:spec(['in RAM','in VRAM'],'in RAM'),expert_cache_gb:spec('FLOAT',0,{min:0,max:256}),second_gpu:spec(['none','cuda:1'],'none'),split_layer:spec('INT',0,{min:0,max:39})}),
Drama3CodecLoader:node({codec_name:spec(['drama3_codec.safetensors'])}),
Qwen3ASRLoader:node({model_name:spec(['qwen3_asr_0.6b_bf16.safetensors'])}),
Qwen3ASRTranscribe:node({model:spec('QWEN3_ASR_MODEL'),audio:spec('AUDIO'),language:spec(['auto','English'],'auto'),context:spec('STRING',''),max_new_tokens:spec('INT',4096,{min:1,max:32768})}),
LoadAudio:node({audio:spec(['placeholder.wav'])}),
Drama3EncodeVoice:node({codec:spec('DRAMA3_CODEC'),audio:spec('AUDIO'),transcript:spec('STRING','')}),
Drama3SaveVoice:node({voice:spec('DRAMA3_VOICE'),name:spec('STRING','voice')}),
Drama3LoadVoice:node({voice:spec(['voice_a_00001.safetensors','voice_b_00001.safetensors'])}),
Drama3Generate:node({model:spec('DRAMA3_MODEL'),text:spec('STRING',''),voices:spec('AUTOGROW'),seed:spec('INT',0,{min:0}),temperature:spec('FLOAT',1,{min:0,max:2}),top_p:spec('FLOAT',.9,{min:.05,max:1}),top_k:spec('INT',0,{min:0,max:4096}),max_frames:spec('INT',600,{min:1,max:8192}),split_long_text:spec('BOOLEAN',true),speakers:spec(['one take per line','one take per speaker','together'],'one take per line')}),
Drama3Decode:node({codec:spec('DRAMA3_CODEC'),codes:spec('DRAMA3_CODES'),shorten_long_pauses:spec('BOOLEAN',true)}),
SaveAudio:node({audio:spec('AUDIO'),filename_prefix:spec('STRING','audio/ComfyUI')})
};
// LoadAudio filenames are runtime values: ComfyUI accepts uploaded inputs through its audio validation.
function current(){const s=structuredClone(schema);return s;}
function settings(){return {count:2,text:'<|speaker:0|> Hello.\n<|speaker:1|> Hi!',seed:12,shorten:true,voices:[{source:'clip',file:'studio/a.wav',transcriptMode:'auto',language:'auto'},{source:'clip',file:'studio/b.wav',transcriptMode:'auto',language:'auto'}],asr:{model_name:'qwen3_asr_0.6b_bf16.safetensors'},generation:{}};}
module.exports={current,settings,node,spec};
