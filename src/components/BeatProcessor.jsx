
import React from "react";
import { useState,useRef } from "react";

const BeatProcessor=()=>
{
  const audioRef=useRef(null);

  //UI(just for testing)
  const [beats,setBeats]=useState([]);
  const beatsRef=useRef([]);

 const audioContextRef=useRef(null);
 const analyserRef=useRef(null);
 const rafRef=useRef(null);

 const prevMagsRef=useRef(null);
 const rmsHistoryRef=useRef([]);

 const lastBeatTimeRef=useRef(0);

 const params={
  fftSize:2048,
  rmsHistoryLength:43,
  rmsThreshold:1.5,
  fluxThreshold:0.02,
  strongFluxThreshold:0.04,
  minBeatGap:0.25,
  sampleRate:44100,//to be Updated
 }

 function computeRms(timeData)
 {
  let sum=0;
  for(let i=0;i<timeData.length;i++)
  {
    const data_i=timeData[i];
    sum+=data_i*data_i;
  }
  return Math.sqrt(sum/timeData.length);
 }

 function dbToMagnitude(dbs)
 {
   if(!isFinite(dbs)) return 0;
   return Math.pow(10,dbs/20);
 }

 function spectralCentroid(mags,fftSize,sampleRate)
 {
  let totalNum=0;
  let dens=0;
  const binFreqFac =sampleRate/fftSize;
  for(let i=0;i<mags.length;i++)
  {
    const magnitude=mags[i];
    const freq=i*binFreqFac;
    totalNum+=freq*magnitude;
    dens+=magnitude;
  }
  if(dens<=0) return 0;
  return totalNum/dens;
 }

 function spectralFlux(mags,prevMags)
 {
     if(!prevMags) return 0;
     let totalFlux=0;
     for(let i=0;i<mags.length;i++)
     {
      const diff=mags[i]-(prevMags[i]||0);
      if(diff>0) totalFlux+=diff;
     }

     return totalFlux/mags.length;
 }

 function centroidToBand(centroid)
 {
   if(centroid<250)
   {
     return "low";
   }
   if(centroid>2000)
   {
    return "high";
   }

   return "mid";
 }

 function processFrame()
 {
  const analyser =analyserRef.current;
  const audio=audioRef.current;

  if(!analyser|| !audio) return;

  const fftSize=analyser.fftSize;
  const timeData =new Float32Array(fftSize);
  analyser.getFloatTimeDomainData(timeData);

  const rmsVal = computeRms(timeData);
  const hist=rmsHistoryRef.current;
  hist.push(rmsVal);
  if(hist.length>params.rmsHistoryLength) hist.shift();

  const avgRms=hist.reduce((a,b)=>a+b,0)/Math.max(1,hist.length);

  const freqDataDb = new Float32Array(analyser.frequencyBinCount);
  analyser.getFloatFrequencyData(freqDataDb);

  const mags=new Float32Array(freqDataDb.length);
  
  for(let i=0;i<freqDataDb.length;i++)
  {
    mags[i]=dbToMagnitude(freqDataDb[i]);
  }

  const centroid = spectralCentroid(mags,fftSize,params.sampleRate);
  const flux= spectralFlux(mags,prevMagsRef.current);
  prevMagsRef.current=mags;

  const lastRms = hist.length>1 ? hist[hist.length-2]:0;
  const energyDelta = rmsVal-lastRms;

  const now = audio.currentTime || 0;
  const timeSinceLastBeat = now-lastBeatTimeRef.current;

  const isRmsBeat = rmsVal> avgRms*params.rmsThreshold;
  const isFluxBeat= flux>params.fluxThreshold;

  if((isRmsBeat||isFluxBeat)&&timeSinceLastBeat>params.minBeatGap)
  {
      console.log("Beat detected!", { now, rmsVal, avgRms, flux });
    const isStrong = flux>params.strongFluxThreshold || rmsVal>avgRms*(params.rmsThreshold+0.3);
    const type=isStrong?"strong":"weak";

    let intensity=0;
    if(avgRms>0) intensity=Math.min(1,(rmsVal-avgRms*1.0)/(avgRms*2)+0.5);
    intensity=Math.max(0,Math.min(1,intensity));

    const freqBand = centroidToBand(centroid);

    const beat=
    {
      time:Number(now.toFixed(3)),
      type,
      intensity: Number(intensity.toFixed(3)),
      frequencyBand:freqBand,
      energyDelta:Number(energyDelta.toFixed(4)),
      spectralFlux:Number(flux.toFixed(6)),
      spectralCentroid:Number(centroid.toFixed(1)),
    };

  beatsRef.current.push(beat);
  setBeats([...beatsRef.current]);

  lastBeatTimeRef.current=now;
  }

  rafRef.current=requestAnimationFrame(processFrame);

 }

 const startAnalysis=async()=>
 {
    const audio=audioRef.current;
    if(!audio)
    {
      alert("No audio element found");
      return;
    }

    if(!audioContextRef.current)
    {
      const acont=new(window.AudioContext||window.webkitAudioContext)();
      audioContextRef.current=acont;
      params.sampleRate=acont.sampleRate;
    }

    const audioContext = audioContextRef.current;

    const analyser=audioContext.createAnalyser();
    analyser.fftSize=params.fftSize;
    analyser.smoothingTimeConstant=0.8;
    analyserRef.current=analyser;

    const sourceNode=audioContext.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    prevMagsRef.current=null;
    rmsHistoryRef.current=[];
    beatsRef.current=[];
    setBeats([]);

    try
    {
      await audio.play();
    }catch(e)
    {
      await audioContext.resume();
      await audio.play().catch(()=>{});
    }

    rafRef.current=requestAnimationFrame(processFrame);
   
    audio.onended=()=>
    {
      cancelAnimationFrame(rafRef.current);
      exportBeatsJson();
    }


 };





function exportBeatsJson(filename="beats3.json")
{
  const jsonData=JSON.stringify(beatsRef.current,null,2);
  const blob=new Blob([jsonData],{type:"application/json"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=filename;
  link.click();
}

const stopAnalysis=()=>
{
  if(rafRef.current) cancelAnimationFrame(rafRef.current);
  if(analyserRef.current) analyserRef.current.disconnect();
  if(audioContextRef.current)
  {
    audioContextRef.current.close();
  }
  
};

return( <div style={{padding:12}}>
  <h3>
    Beat Processor
  </h3>

  <audio ref={audioRef} controls src="/src/assets/audio/song3.mp3" style={{width:"100%"}}/>

  <div style={{margin:8}}>
    <button onClick={startAnalysis}>Analyse</button>
    <button onClick={()=>exportBeatsJson()} style={{marginLeft:8}}>Export JSON</button>
    <button onClick={stopAnalysis} style={{marginLeft:8}}>Stop</button>
  </div>

   <div style={{marginTop:12}}>
    <h4>Detected Beats({beats.length})</h4>
    <pre style={{maxHeight:240,overflow:"auto",background:"#111",color:"#0f0",padding:12}}>
      {JSON.stringify(beats,null,2)}
    </pre>
   </div>
  </div>);
};
export default BeatProcessor;