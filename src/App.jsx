/**
 * MediElvesDashboard.jsx — REDESIGNED (Light Theme, Original Loader Preserved)
 * Extraordinary premium light-mode dashboard with elevated typography,
 * refined cards, rich micro-interactions, and sophisticated data presentation.
 */

import { useState, useEffect, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip as RT, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useZohoData, fmtAUD, fmtCount, currentFYMonthIndex, getFYLabel } from "./zohoapi";

/* ── FONT ── */
if (!document.getElementById("me-fonts")) {
  const l = document.createElement("link");
  l.id = "me-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
  document.head.appendChild(l);
}

/* ── GLOBAL CSS ── */
const G = `
:root{
  --bg:#F4F6FB;
  --surface:#FFFFFF;
  --border:#E6E9F4;
  --border-soft:#EFF2FA;
  --text:#101426;
  --text-soft:#8A93A6;
  --accent:#5B5BF5;
  --accent-2:#22C7B5;
  --accent-3:#FF8966;
  --accent-soft:#EEF0FF;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
body{
  font-family:'Poppins',sans-serif;
  background: linear-gradient(150deg, #ECFDF5 0%, #D9F7EC 25%, #E3F2FD 65%, #E8F0FE 100%) !important;
  background-attachment:fixed;
  color:var(--text);font-size:13px;-webkit-font-smoothing:antialiased
}
#root{background:transparent !important}
.layout{background:transparent}
.main-scroll{background:linear-gradient(260deg, #a7ffd5 0%, #9be8cc 25%, #308cd0 65%, #E8F0FE 100%)}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:#94A3B8}

@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;max-height:0}to{opacity:1;max-height:4000px}}
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes ripple{0%{transform:scale(0);opacity:.6}100%{transform:scale(4);opacity:0}}
@keyframes ecgLine{0%{stroke-dashoffset:600}100%{stroke-dashoffset:0}}
@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.18)}28%{transform:scale(1)}42%{transform:scale(1.08)}70%{transform:scale(1)}}
@keyframes glow{0%,100%{box-shadow:0 0 24px rgba(52,211,153,.5)}50%{box-shadow:0 0 48px rgba(52,211,153,.9)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes borderShimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

.ld-step-text{animation:slideUp .3s ease both}
.heartbeat-icon{animation:heartbeat 1.4s ease-in-out infinite}
.ld-ecg{stroke-dasharray:600;stroke-dashoffset:600;animation:ecgLine 2.2s ease-out infinite}
.fu{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
.fu1{animation:fadeUp .5s .06s cubic-bezier(.22,1,.36,1) both}
.fu2{animation:fadeUp .5s .12s cubic-bezier(.22,1,.36,1) both}
.fu3{animation:fadeUp .5s .18s cubic-bezier(.22,1,.36,1) both}
.fu4{animation:fadeUp .5s .24s cubic-bezier(.22,1,.36,1) both}
.fu5{animation:fadeUp .5s .30s cubic-bezier(.22,1,.36,1) both}
.fu6{animation:fadeUp .5s .36s cubic-bezier(.22,1,.36,1) both}
.sd{animation:slideDown .32s ease both;overflow:hidden}

.skeleton{display:block;background:#E8EDF5 !important;background-image:none !important;border-radius:6px;animation:skPulse 1.4s ease-in-out infinite}

/* ── LAYOUT ── */
.topbar{
  background:rgba(255,255,255,.82) !important;
  backdrop-filter:blur(14px) saturate(160%);
  height:64px;display:flex;align-items:center;justify-content:space-between;
  padding:0 28px;border-bottom:1px solid #E8EDF5;
  position:sticky;top:0;z-index:200;gap:8px;
  box-shadow:0 1px 0 rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.03)
}
.layout{display:flex;background:transparent}
.main-scroll{flex:1;overflow-y:auto;height:calc(100vh - 64px);padding:24px 24px 60px;min-width:0;}
.sidebar{width:268px;flex-shrink:0;background:rgba(255,255,255,.7) !important;backdrop-filter:blur(14px) saturate(160%);border-left:1px solid var(--border);overflow-y:auto;height:calc(100vh - 64px);position:sticky;top:64px}
.chart-2col{display:grid;grid-template-columns:1fr 1fr}
.sidebar-toggle{display:none;width:42px;height:36px;border-radius:10px;border:1px solid #E8EDF5;background:#fff;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}

@media(max-width:1100px){.sidebar{display:none}.main-scroll{height:auto;min-height:calc(100vh - 64px)}.sidebar-toggle{display:flex!important}}
@media(max-width:900px){.chart-2col{grid-template-columns:1fr!important}.chart-2col > div:first-child{border-right:none!important;border-bottom:1px solid #F0F4FA}}
@media(max-width:768px){.topbar{height:auto;padding:10px 16px;flex-wrap:wrap}.main-scroll{padding:14px 12px 40px}.pgrid{grid-template-columns:1fr 1fr!important}.hero-pills{grid-template-columns:repeat(3,1fr)!important}.followup-grid{grid-template-columns:repeat(3,1fr)!important}.doc-pay-grid{grid-template-columns:repeat(2,1fr)!important}}
@media(max-width:480px){.pgrid{grid-template-columns:1fr!important}.hero-pills{grid-template-columns:repeat(2,1fr)!important}.followup-grid{grid-template-columns:repeat(2,1fr)!important}.doc-pay-grid{grid-template-columns:1fr!important}}

/* ── CARDS ── */
.sec-card{
  background:rgba(255,255,255,.92) !important;
  border-radius:22px;
  border:1px solid var(--border);
  overflow:hidden;
  margin-bottom:18px;
  box-shadow:0 1px 2px rgba(16,20,38,.03), 0 8px 24px rgba(91,91,245,.05);
  transition:box-shadow .25s ease, transform .25s ease;
}
.sec-card:hover{
  box-shadow:0 2px 4px rgba(16,20,38,.04), 0 12px 32px rgba(91,91,245,.09);
  transform:translateY(-1px);
}
.sec-hd{
  padding:18px 22px;
  display:flex;justify-content:space-between;align-items:center;
  cursor:default;background:#ffffff
}
.sec-body{border-top:1px solid #F0F4FA;background:#ffffff}

/* ── METRIC CELLS ── */
.metric-cell{background:#ffffff !important;padding:18px 20px;transition:background .2s,transform .2s;cursor:default;position:relative;overflow:hidden}
.metric-cell::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent-2));opacity:0;transition:opacity .25s}
.metric-cell::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:var(--border-soft)}
.metric-cell:hover{background:#F9FAFF !important;transform:translateY(-1px)}
.metric-cell:hover::before{opacity:1}
.pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border-soft)}

/* ── STATUS ROWS ── */
.status-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;transition:all .2s cubic-bezier(.22,1,.36,1);cursor:default;border:1px solid transparent}
.status-row:hover{transform:translateX(4px);box-shadow:0 4px 16px rgba(0,0,0,.06)}

/* ── QUICK ACTIONS ── */
.qa-btn{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border-radius:12px;border:1px solid var(--border-soft);background:#FAFBFF;cursor:pointer;font-family:'Poppins',sans-serif;transition:all .2s cubic-bezier(.22,1,.36,1);margin-bottom:6px;text-align:left;text-decoration:none}
.qa-btn:hover{background:var(--accent-soft) !important;border-color:#C7D2FE !important;transform:translateX(4px);box-shadow:0 6px 16px rgba(91,91,245,.12)}
.qa-lbl{font-size:12px;font-weight:600;color:#1E293B;flex:1}
.qa-btn:hover .qa-lbl{color:#4338CA}

/* ── ALERTS ── */
.alert-row{border-radius:10px;padding:9px 12px;display:flex;gap:9px;margin-bottom:7px;transition:all .18s;border:1px solid transparent}
.alert-row:hover{transform:translateX(3px)}

/* ── MISC ── */
.prog-t{height:4px;background:#F1F5F9;border-radius:99px;overflow:hidden;flex:1}
.prog-f{height:100%;border-radius:99px;transition:width .9s cubic-bezier(.22,1,.36,1)}
.bdg{font-size:9px;font-weight:700;padding:2px 8px;border-radius:5px;letter-spacing:.3px;white-space:nowrap}
.invoice-row{padding:11px 14px;border-radius:12px;background:#F8FAFF;border:1px solid #EEF2FF;transition:all .18s;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;gap:12px}
.invoice-row:hover{background:#EEF2FF !important;border-color:#C7D2FE !important;transform:translateX(3px);box-shadow:0 4px 12px rgba(79,70,229,.07)}
.number-display{font-family:'Poppins',monospace;letter-spacing:-.3px}
.divider{height:1px;background:linear-gradient(90deg,transparent,#E8EDF5,transparent);margin:0 22px}
.pill-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:9.5px;font-weight:700;letter-spacing:.4px}
`;

/* ── STATIC ── */
const LOGO_URL = "https://creatorapp.zohopublic.com.au/file//medielves/claims-management//All_Images/31559000000068316/Logo/image-download/PFxHZm68ZwuMKfkZz7yNOH7BZEes8UQN5ETOHD0bVY8Njqf0b9Zw5ZTe2XUK0CONRVfdmbQ9wteQdDnbWNCN4kVaeRZQhFrE6Tp5?filepath=/1776069422134774_logo__1_.png";

const qaIcons={
  claim:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  doctor:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  hospital:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/></svg>,
  invoice:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  lodge:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
};

const quickActions=[
  {label:"Claims",     icon:"claim",    color:"#4F46E5",bg:"#EEF2FF",url:"https://creatorapp.zoho.com.au/medielves/claims-management/#Report:Add_Claim_Report"},
  {label:"Add Doctor", icon:"doctor",   color:"#0284C7",bg:"#E0F2FE",url:"https://creatorapp.zoho.com.au/medielves/claims-management/#Report:All_Doctors"},
  {label:"Add Hospital",icon:"hospital",color:"#10B981",bg:"#D1FAE5",url:"https://creatorapp.zoho.com.au/medielves/claims-management/#Report:All_Hospitals"},
  {label:"New Invoice",icon:"invoice",  color:"#D97706",bg:"#FEF3C7",url:"https://creatorapp.zoho.com.au/medielves/claims-management/#Report:All_Invoices"},
  {label:"Today Claims",icon:"lodge",   color:"#7C3AED",bg:"#F5F3FF",url:"https://creatorapp.zoho.com.au/medielves/claims-management/#Report:Daily_Claim_Report"},
];

const loaderSteps=["Connecting to Medi Elves…","Loading claims data…","Fetching payment records…","Syncing hospital data…","Preparing your dashboard…","Almost ready…"];

const INV_STATUS={
  "Paid":{color:"#10B981",bg:"#ECFDF5",border:"#A7F3D0"},
  "Pending":{color:"#F59E0B",bg:"#FFFBEB",border:"#FDE68A"},
  "Partially Paid":{color:"#0EA5E9",bg:"#F0F9FF",border:"#BAE6FD"},
  "Overdue":{color:"#EF4444",bg:"#FEF2F2",border:"#FECDD3"},
};

/* ── HELPERS ── */
function Bdg({label,bg,color,border}){
  return <span className="bdg" style={{background:bg,color,border:`1px solid ${border||bg}`}}>{label}</span>;
}
function Sk({w="100%",h=14,style={}}){
  return <div style={{display:"block",width:w,height:h,backgroundColor:"#E8EDF5",backgroundImage:"none",borderRadius:6,animation:"skPulse 1.4s ease-in-out infinite",flexShrink:0,...style}}/>;
}
function useCounter(target,active){
  const [v,setV]=useState(0);
  useEffect(()=>{
    if(!active)return;
    const end=parseInt(String(target).replace(/\D/g,""));
    if(!end)return;
    let c=0;const s=Math.max(1,Math.floor(end/55));
    const t=setInterval(()=>{c+=s;if(c>=end){setV(end);clearInterval(t);}else setV(c);},18);
    return()=>clearInterval(t);
  },[target,active]);
  return v;
}
function Counter({to,active=true}){const v=useCounter(to,active);return <>{v.toLocaleString()}</>;}

/* Auto-shrinks font size for long dollar amounts so they never get clipped/hidden in fixed-width cells */
function AmtText({children,size=16,color,style={}}){
  const digits=String(children).replace(/[^0-9]/g,"").length;
  const fs = digits>=9?size-6 : digits>=7?size-4 : digits>=6?size-2 : size;
  return(
    <div style={{fontSize:fs,fontWeight:800,color,letterSpacing:-.3,fontFamily:"'Poppins',monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.15,...style}}>
      {children}
    </div>
  );
}

const ChartTip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:"#fff",border:"1px solid #E8EDF5",borderRadius:12,padding:"10px 14px",fontSize:11,fontFamily:"Plus Jakarta Sans,sans-serif",boxShadow:"0 8px 24px rgba(0,0,0,.10)"}}>
    <div style={{fontWeight:700,color:"#0F172A",marginBottom:5}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color||p.fill,fontWeight:600,fontSize:11}}>{p.name}: ${((p.value??0)*1000).toLocaleString()}</div>)}
  </div>);
};
const PieTip=({active,payload})=>{
  if(!active||!payload?.length)return null;
  const d=payload[0];
  return(<div style={{background:"#fff",border:"1px solid #E8EDF5",borderRadius:12,padding:"10px 14px",fontSize:11,fontFamily:"Plus Jakarta Sans,sans-serif",boxShadow:"0 8px 24px rgba(0,0,0,.10)"}}>
    <div style={{fontWeight:700,color:d.payload.color}}>{d.name}</div>
    <div style={{fontWeight:800,color:"#0F172A",fontSize:18,fontFamily:"'Poppins',monospace"}}>{d.value}</div>
  </div>);
};
const PieLabel=({cx,cy,midAngle,innerRadius,outerRadius,percent})=>{
  if(percent<0.06)return null;
  const R=Math.PI/180,r=innerRadius+(outerRadius-innerRadius)*.55;
  return(<text x={cx+r*Math.cos(-midAngle*R)} y={cy+r*Math.sin(-midAngle*R)} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{fontSize:10,fontWeight:800,fontFamily:"Plus Jakarta Sans,sans-serif"}}>{`${(percent*100).toFixed(0)}%`}</text>);
};

/* ── ORIGINAL LOADER (preserved exactly) ── */
function Loader(){
  const [pct,setPct]=useState(0);const [step,setStep]=useState(0);const [ai,setAi]=useState(0);
  useEffect(()=>{
    let p=0;
    const iv=setInterval(()=>{p+=Math.random()*9+3;if(p>=100){p=100;clearInterval(iv);}
      setPct(Math.min(Math.floor(p),100));setStep(Math.min(Math.floor((p/100)*loaderSteps.length),loaderSteps.length-1));setAi(Math.floor((p/100)*5));
    },140);return()=>clearInterval(iv);
  },[]);
  const icons=[
    <svg key="s" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
    <svg key="h" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
    <svg key="sy" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>,
    <svg key="b" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A7F3D0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/></svg>,
    <svg key="p" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1FAE5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
  ];
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,fontFamily:"'Poppins',sans-serif",overflow:"hidden",
      background:"linear-gradient(135deg,#022C22 0%,#064E3B 50%,#065F46 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:0,opacity:.05,backgroundImage:"linear-gradient(rgba(167,243,208,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(167,243,208,.6) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
      <div style={{position:"relative",marginBottom:20}}>
        <div style={{width:100,height:100,borderRadius:22,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 48px rgba(52,211,153,.6)",animation:"glow 2s ease-in-out infinite",overflow:"hidden",padding:6}}>
          <img src={LOGO_URL} alt="Medi Elves Logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
        </div>
        {[1,2,3].map(n=><div key={n} style={{position:"absolute",inset:-(n*14),borderRadius:22+(n*6),border:"1.5px solid rgba(52,211,153,.25)",animation:`ripple ${1+n*.4}s ease-out ${n*.2}s infinite`}}/>)}
      </div>
      <div style={{fontSize:22,fontWeight:900,color:"#ECFDF5",letterSpacing:.5,marginBottom:2}}>Medi Elves</div>
      <div style={{fontSize:11,color:"rgba(167,243,208,.65)",fontWeight:400,marginBottom:28,letterSpacing:.5}}>Australia's Leading Medical Billing Service</div>
      <div style={{display:"flex",gap:12,marginBottom:28}}>
        {icons.map((ic,i)=>(
          <div key={i} style={{width:48,height:48,borderRadius:12,background:ai>=i?"rgba(167,243,208,.15)":"rgba(255,255,255,.04)",border:`1.5px solid ${ai>=i?"rgba(52,211,153,.5)":"rgba(255,255,255,.08)"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .4s cubic-bezier(.34,1.56,.64,1)",transform:ai===i?"scale(1.18)":"scale(1)",opacity:ai>=i?1:0.3}}>
            {ai===i?<div className="heartbeat-icon">{ic}</div>:ic}
          </div>
        ))}
      </div>
      <div style={{width:300,marginBottom:18,position:"relative",height:44}}>
        <svg width="300" height="44" viewBox="0 0 300 44">
          <path className="ld-ecg" d="M0,22 L28,22 L36,22 L40,4 L46,42 L52,8 L56,22 L78,22 L86,22 L90,4 L96,42 L102,8 L106,22 L128,22 L136,22 L140,4 L146,42 L152,8 L156,22 L178,22 L186,22 L190,4 L196,42 L202,8 L206,22 L260,22 L300,22" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{position:"absolute",top:18,width:8,height:8,borderRadius:"50%",background:"#34D399",boxShadow:"0 0 10px #34D399",animation:"blink 1s ease-in-out infinite",left:`${pct*2.9}px`,transition:"left .14s linear"}}/>
      </div>
      <div style={{width:260,height:4,background:"rgba(255,255,255,.1)",borderRadius:99,overflow:"hidden",marginBottom:8}}>
        <div style={{height:"100%",borderRadius:99,background:"linear-gradient(90deg,#34D399,#6EE7B7,#34D399)",backgroundSize:"200% 100%",animation:"shimmer 1.5s linear infinite",width:pct+"%",transition:"width .14s linear"}}/>
      </div>
      <div style={{fontSize:26,fontWeight:900,color:"#ECFDF5",letterSpacing:-1,marginBottom:4}}>
        {pct}<span style={{fontSize:14,fontWeight:600,color:"rgba(167,243,208,.55)"}}>%</span>
      </div>
      <div key={step} className="ld-step-text" style={{fontSize:11,color:"rgba(167,243,208,.55)",fontWeight:500,letterSpacing:.3}}>{loaderSteps[step]}</div>
    </div>
  );
}

/* ── SECTION WRAPPER ── */
function Sec({title,icon,sub,badge,children,accent="#4F46E5"}){
  return(
    <div className="sec-card">
      <div className="sec-hd">
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:38,height:38,borderRadius:11,background:accent+"15",border:`1px solid ${accent}25`,display:"flex",alignItems:"center",justifyContent:"center",color:accent,fontSize:18}}>
            {icon}
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#0F172A",display:"flex",alignItems:"center",gap:8}}>
              {title}
              {badge&&<span style={{fontSize:9,fontWeight:700,padding:"2px 9px",borderRadius:99,background:accent+"15",color:accent,letterSpacing:.5,textTransform:"uppercase"}}>{badge}</span>}
            </div>
            {sub&&<div style={{fontSize:10,color:"#94A3B8",marginTop:2,fontWeight:400}}>{sub}</div>}
          </div>
        </div>
      </div>
      <div className="sec-body">{children}</div>
    </div>
  );
}

/* ── SIDEBAR ── */
function SidebarContent({data}){
  const cs=data?.claimStatus;
  const fu=data?.followUp;
  const inv=data?.invoices;
  const todayFU=fu?.today??0;
  const pendingInv=inv?.statusBreakdown?.["Pending"]??0;
  const partialInv=inv?.statusBreakdown?.["Partially Paid"]??0;
  const rejectedCls=cs?.Rejected??0;

  const liveAlerts=[
    {msg:todayFU>0?`${todayFU} follow-up${todayFU>1?"s":""} due today`:"No follow-ups due today",bg:todayFU>0?"#FEF2F2":"#ECFDF5",border:todayFU>0?"#FECDD3":"#A7F3D0",dot:todayFU>0?"#EF4444":"#10B981",color:todayFU>0?"#991B1B":"#065F46"},
    {msg:pendingInv>0?`${pendingInv} invoice${pendingInv>1?"s":""} pending payment`:"No pending invoices",bg:pendingInv>0?"#FFFBEB":"#ECFDF5",border:pendingInv>0?"#FDE68A":"#A7F3D0",dot:pendingInv>0?"#F59E0B":"#10B981",color:pendingInv>0?"#92400E":"#065F46"},
    {msg:partialInv>0?`${partialInv} invoice${partialInv>1?"s":""} partially paid`:"No partially paid invoices",bg:partialInv>0?"#EEF2FF":"#ECFDF5",border:partialInv>0?"#C7D2FE":"#A7F3D0",dot:partialInv>0?"#4F46E5":"#10B981",color:partialInv>0?"#3730A3":"#065F46"},
    {msg:rejectedCls>0?`${rejectedCls} claim${rejectedCls>1?"s":""} rejected — review needed`:"No rejected claims",bg:rejectedCls>0?"#FEF2F2":"#ECFDF5",border:rejectedCls>0?"#FECDD3":"#A7F3D0",dot:rejectedCls>0?"#EF4444":"#10B981",color:rejectedCls>0?"#991B1B":"#065F46"},
  ];

const statusConfig={"Draft":{c:"#94A3B8"},"Lodged":{c:"#4F46E5"},"Partially Paid":{c:"#F59E0B"},"Fully Paid":{c:"#10B981"},"Rejected":{c:"#EF4444"},"Resubmitted":{c:"#0EA5E9"}};
  return(
    <>
      <div style={{padding:"20px 16px 14px"}}>
        <div style={{fontSize:9,fontWeight:800,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:12}}>Quick Actions</div>
        {quickActions.map((q,i)=>(
          <a key={i} href={q.url} target="_blank" rel="noopener noreferrer" className="qa-btn">
            <div style={{width:30,height:30,borderRadius:9,background:q.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:q.color}}>{qaIcons[q.icon]}</div>
            <span className="qa-lbl">{q.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        ))}
      </div>

      <div className="divider"/>

      {cs&&(
        <div style={{padding:"16px"}}>
          <div style={{fontSize:9,fontWeight:800,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:14}}>Claim Status</div>
          {Object.entries(statusConfig).map(([name,{c}])=>{
            const val=cs[name]??0;
            const pct=Math.round((val/(cs.total||1))*100);
            return(
              <div key={name} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11,fontWeight:500,color:"#374151"}}>{name}</span>
                  <span style={{fontSize:11,fontWeight:800,color:c,fontFamily:"'Poppins',monospace"}}>{val}</span>
                </div>
                <div className="prog-t"><div className="prog-f" style={{width:`${pct}%`,background:c}}/></div>
              </div>
            );
          })}
        </div>
      )}

      <div className="divider"/>

      <div style={{padding:"16px 16px 24px"}}>
        <div style={{fontSize:9,fontWeight:800,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:12}}>Live Alerts</div>
        {!fu&&!inv&&!cs?(
          [1,2,3,4].map(i=><div key={i} style={{marginBottom:7}}><Sk w="100%" h={38} style={{borderRadius:10}}/></div>)
        ):(
          liveAlerts.map((a,i)=>(
            <div key={i} className="alert-row" style={{background:a.bg,borderColor:a.border}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:a.dot,flexShrink:0,marginTop:4,display:"inline-block"}}/>
              <span style={{fontSize:11,fontWeight:500,lineHeight:1.5,color:a.color,flex:1}}>{a.msg}</span>
              {a.msg.match(/^\d+/)&&(
                <span style={{marginLeft:"auto",flexShrink:0,fontSize:10,fontWeight:800,background:a.dot,color:"#fff",borderRadius:99,padding:"1px 7px",minWidth:20,textAlign:"center",fontFamily:"'Poppins',monospace"}}>
                  {a.msg.match(/^(\d+)/)?.[1]}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ── HERO ── */
function HeroSection({data}){
  const hc=data?.heroCounts;
  const pills=[
    {v:hc?.claims,   l:"Total Claims",  accent:"#4F46E5", bg:"#EEF2FF", icon:"📋"},
    {v:hc?.doctors,  l:"Doctors",       accent:"#0284C7", bg:"#E0F2FE", icon:"👨‍⚕️"},
    {v:hc?.hospitals,l:"Hospitals",     accent:"#10B981", bg:"#ECFDF5", icon:"🏥"},
    {v:hc?.patients, l:"Patients",      accent:"#7C3AED", bg:"#F5F3FF", icon:"🫀"},
    {v:hc?.staffs,   l:"Employees",     accent:"#D97706", bg:"#FEF3C7", icon:"👥"},
  ];
  return(
    <div className="fu1" style={{
      background:"linear-gradient(118deg,#1A1640 0%,#4338CA 28%,#5B5BF5 55%,#22C7B5 100%)",
      borderRadius:22,padding:"30px 32px",marginBottom:18,position:"relative",overflow:"hidden",
      boxShadow:"0 8px 32px rgba(79,70,229,.22), 0 2px 8px rgba(0,0,0,.08)"
    }}>
      {/* Layered decoration */}
      {[[300,300,-110,-80],[160,160,10,170],[100,100,-24,undefined,220]].map(([w,h,top,right,left],i)=>(
        <div key={i} style={{position:"absolute",borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.08)",width:w,height:h,top,right,left}}/>
      ))}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.07) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",background:"linear-gradient(to top,rgba(0,0,0,.08),transparent)"}}/>

      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#4ADE80",display:"inline-block",boxShadow:"0 0 7px #4ADE80"}}/>
          <span style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:500,letterSpacing:.7,textTransform:"uppercase"}}>
            Live · {new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </span>
        </div>
        <div style={{fontSize:26,fontWeight:800,color:"#fff",letterSpacing:-.8,marginBottom:4,lineHeight:1.15}}>
          Claims Management
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.45)",fontWeight:400,marginBottom:26}}>Real-time financial &amp; operational overview</div>

        <div className="hero-pills" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {pills.map((k,i)=>(
            <div key={i} style={{
             background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.18)",
borderRadius:16,padding:"14px 16px",backdropFilter:"blur(8px)",
boxShadow:"0 4px 16px rgba(0,0,0,.06)",
              transition:"all .2s cubic-bezier(.22,1,.36,1)",cursor:"default"
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.16)";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.1)";e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{marginBottom:8}}>
                {k.v!=null
                  ?<div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:-.8,lineHeight:1,fontFamily:"'Poppins',monospace"}}><Counter to={k.v}/></div>
                  :<Sk w="65%" h={22} style={{marginBottom:4}}/>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,.6)"}}/>
                <span style={{fontSize:9.5,color:"rgba(255,255,255,.5)",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{k.l}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CLAIM STATUS ── */
function ClaimStatusSection({data}){
  const cs=data?.claimStatus;
  const statusList=[
    {label:"Claims Entered", key:"total",         delta:"All time",       color:"#4F46E5",bg:"#EEF2FF",border:"#C7D2FE"},
    {label:"Draft",          key:"Draft",          delta:"Not yet lodged", color:"#94A3B8",bg:"#F1F5F9",border:"#E2E8F0"},
    {label:"Lodged",         key:"Lodged",         delta:"+21 this month", color:"#0284C7",bg:"#E0F2FE",border:"#BAE6FD"},
    {label:"Partially Paid", key:"Partially Paid", delta:"+12 this month", color:"#F59E0B",bg:"#FFFBEB",border:"#FDE68A"},
    {label:"Fully Paid",     key:"Fully Paid",     delta:"+35 this month", color:"#10B981",bg:"#ECFDF5",border:"#A7F3D0"},
    {label:"Rejected",       key:"Rejected",       delta:"Review needed",  color:"#EF4444",bg:"#FEF2F2",border:"#FECDD3"},
    {label:"Resubmitted",    key:"Resubmitted",    delta:"In progress",    color:"#0EA5E9",bg:"#F0F9FF",border:"#BAE6FD"},
];
  const pieData=cs?statusList.slice(1).map(s=>({name:s.label,value:cs[s.key]??0,color:s.color})):[];

  return(
    <Sec title="Claim Status" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
      badge={cs?`${fmtCount(cs.total)} total`:"loading…"} accent="#6366F1">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.1fr"}} className="chart-2col">
        {/* Left: status list */}
        <div style={{padding:"16px 18px",borderRight:"1px solid #F0F4FA",display:"flex",flexDirection:"column",gap:8}}>
          {statusList.map((s,i)=>(
            <div key={i} className="status-row" style={{background:s.bg,border:`1px solid ${s.border}`}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${s.color}20`}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:s.color,boxShadow:`0 0 6px ${s.color}60`}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:"#1E293B"}}>{s.label}</div>
                <div style={{fontSize:10,color:"#94A3B8",marginTop:1,fontWeight:400}}>{s.delta}</div>
              </div>
              {cs
                ?<div style={{fontSize:22,fontWeight:800,color:s.color,letterSpacing:-.8,fontFamily:"'Poppins',monospace"}}><Counter to={cs[s.key]??0}/></div>
                :<Sk w={46} h={24}/>}
            </div>
          ))}
        </div>
        {/* Right: pie chart */}
        <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10,alignSelf:"flex-start"}}>Status Breakdown</div>
          {cs&&pieData.length>0?(
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={98} paddingAngle={3} dataKey="value" animationBegin={100} animationDuration={900} labelLine={false} label={PieLabel}>
                    {pieData.map((d,i)=><Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2}/>)}
                  </Pie>
                  <RT content={<PieTip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px",width:"100%",marginTop:4}}>
                {pieData.map(d=>(
                  <div key={d.name} style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{width:9,height:9,borderRadius:3,background:d.color,flexShrink:0}}/>
                    <span style={{fontSize:11,color:"#374151",fontWeight:600}}>{d.name}</span>
                    <span style={{fontSize:11,fontWeight:800,color:d.color,marginLeft:"auto",fontFamily:"'Poppins',monospace"}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ):<div style={{width:"100%",height:220,display:"flex",flexDirection:"column",gap:10,padding:10}}>{[1,2,3,4,5].map(i=><Sk key={i} w="100%" h={30}/>)}</div>}
        </div>
      </div>
    </Sec>
  );
}

/* ── FOLLOW UP ── */
function FollowUpSection({data}){
  const fu=data?.followUp;
  const periods=[
    {label:"Today",       key:"today",      color:"#EF4444",bg:"#FEF2F2",border:"#FECDD3",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
    {label:"This Week",   key:"thisWeek",   color:"#F59E0B",bg:"#FFFBEB",border:"#FDE68A",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
    {label:"Next Week",   key:"nextWeek",   color:"#0284C7",bg:"#E0F2FE",border:"#BAE6FD",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>},
    {label:"This Month",  key:"thisMonth",  color:"#4F46E5",bg:"#EEF2FF",border:"#C7D2FE",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
    {label:"Next Month",  key:"nextMonth",  color:"#059669",bg:"#ECFDF5",border:"#A7F3D0",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>},
    {label:"Next 30 Days",key:"next30Days", color:"#7C3AED",bg:"#F5F3FF",border:"#DDD6FE",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>},
  ];
  return(
    <Sec title="Follow Up" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.57 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 5.55 5.55l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.5z"/></svg>}
      badge="6 periods" accent="#7C3AED">
      <div className="followup-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:1,background:"#EEF1F8"}}>
        {periods.map((f,i)=>(
          <div key={i} style={{background:"#fff",padding:"20px 16px",cursor:"default",transition:"all .2s cubic-bezier(.22,1,.36,1)"}}
            onMouseEnter={e=>{e.currentTarget.style.background=f.bg;e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{width:38,height:38,borderRadius:11,background:f.bg,border:`1px solid ${f.border}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:`0 2px 8px ${f.color}15`}}>
              {f.icon}
            </div>
            <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".7px",marginBottom:5}}>{f.label}</div>
            {fu
              ?<div style={{fontSize:28,fontWeight:800,color:f.color,letterSpacing:-1.2,lineHeight:1,fontFamily:"'Poppins',monospace"}}><Counter to={fu[f.key]??0}/></div>
              :<Sk w={46} h={28} style={{marginBottom:4}}/>}
            <div style={{fontSize:9.5,color:"#94A3B8",marginTop:4,fontWeight:400}}>follow-ups</div>
          </div>
        ))}
      </div>
    </Sec>
  );
}

/* ── PAYMENTS RECEIVED ── */
function PaymentsSection({data}){
  const pm=data?.payments;const fc=data?.feeCalc;
  const periods=[
    {p:"Today",     key:"today",     color:"#4F46E5"},
    {p:"This Week", key:"thisWeek",  color:"#0284C7"},
    {p:"This Month",key:"thisMonth", color:"#D97706"},
    {p:"This Year", key:"thisYear",  color:"#059669"},
  ];
  return(
    <Sec title="Payments Received" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} accent="#10B981">
      <div style={{display:"grid",gridTemplateColumns:"1.55fr 1fr"}} className="chart-2col">
        <div style={{borderRight:"1px solid #F0F4FA"}}>
          <div className="pgrid">
            {periods.map((item,i)=>(
              <div key={i} className="metric-cell">
                <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5}}>{item.p}</div>
                {pm?(
                  <>
                    <AmtText color={item.color}>{fmtAUD(pm[item.key]?.amount??0)}</AmtText>
                    <div style={{fontSize:10,color:"#94A3B8",marginTop:2,fontWeight:400}}>{pm[item.key]?.count??0} claims</div>
                  </>
                ):<><Sk w="80%" h={18} style={{marginBottom:4}}/><Sk w="50%" h={11}/></>}
              </div>
            ))}
          </div>
          <div style={{padding:"14px 18px 12px"}}>
            <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",marginBottom:8}}>Monthly payment trend</div>
            {pm?.monthly?(
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={pm.monthly} margin={{top:0,right:0,left:4,bottom:0}}>
                  <XAxis dataKey="m" tick={{fontSize:9,fill:"#94A3B8",fontFamily:"Plus Jakarta Sans"}} axisLine={false} tickLine={false}/>
                  <YAxis width={54} tick={{fontSize:9,fill:"#94A3B8"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v*1000).toLocaleString()}`}/>
                  <RT content={({active,payload,label})=>{
                    if(!active||!payload?.length)return null;
                    return(<div style={{background:"#fff",border:"1px solid #E8EDF5",borderRadius:10,padding:"8px 12px",fontSize:11,fontFamily:"Plus Jakarta Sans,sans-serif",boxShadow:"0 8px 24px rgba(0,0,0,.10)"}}>
                      <div style={{fontWeight:700,color:"#0F172A",marginBottom:4}}>{label}</div>
                      <div style={{color:"#4F46E5",fontWeight:700}}>Payments: ${((payload[0]?.value??0)*1000).toLocaleString()}</div>
                    </div>);
                  }}/>
                  <Bar dataKey="amt" radius={[5,5,0,0]} name="Payments">
                    {pm.monthly.map((_,i)=>(
                      <Cell key={i} fill={i===currentFYMonthIndex()?"#4F46E5":"#C7D2FE"}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ):<Sk w="100%" h={110}/>}
          </div>
        </div>
        {/* Fee calculation panel */}
        <div style={{padding:20,background:"linear-gradient(160deg,#F0FDF4,#ECFDF5)",display:"flex",flexDirection:"column"}}>
          <div style={{fontSize:9,fontWeight:800,color:"#059669",textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>MediElves Fee Calculation</div>
          <div style={{fontSize:9,color:"#94A3B8",marginBottom:12,fontWeight:400}}>Service_Fee + Payment_Amount</div>
          {fc?(
            <>
              <AmtText size={28} color="#047857" style={{letterSpacing:-1.4,lineHeight:1}}>{fmtAUD(fc.totalServiceFee)}</AmtText>
              <div style={{fontSize:11,color:"#10B981",fontWeight:600,marginBottom:16,marginTop:4}}>Total service fees earned</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
                {[{v:fmtAUD(fc.today?.fee??0),l:"Today"},{v:fmtAUD(fc.thisMonth?.fee??0),l:"Month"},{v:fmtAUD(fc.thisYear?.fee??0),l:"Year"}].map((f,i)=>(
                  <div key={i} style={{background:"#fff",border:"1px solid #A7F3D0",borderRadius:10,padding:"10px 8px",textAlign:"center",boxShadow:"0 2px 6px rgba(16,185,129,.08)"}}>
                    <AmtText size={12} color="#047857" style={{whiteSpace:"nowrap"}}>{f.v}</AmtText>
                    <div style={{fontSize:9,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",marginTop:2,letterSpacing:.5}}>{f.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{l:"Pending",v:fmtAUD(fc.pendingAmount??0),c:"#D97706",bg:"#FFFBEB",border:"#FDE68A"},{l:"Invoiced",v:fmtAUD(fc.invoicedAmount??0),c:"#059669",bg:"#ECFDF5",border:"#A7F3D0"}].map((x,i)=>(
                  <div key={i} style={{background:x.bg,border:`1px solid ${x.border}`,borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{x.l}</div>
                    <AmtText color={x.c}>{x.v}</AmtText>
                  </div>
                ))}
              </div>
            </>
          ):<div style={{display:"flex",flexDirection:"column",gap:10}}><Sk w="70%" h={32}/><Sk w="90%" h={14}/><Sk w="100%" h={60}/><Sk w="100%" h={60}/></div>}
        </div>
      </div>
    </Sec>
  );
}

/* ── DOCTOR PAYMENTS ── */
function DoctorPaymentsSection({data}){
  const dp=data?.doctorPayments;
  const periods=[
    {p:"Today",     key:"today",     color:"#4F46E5"},
    {p:"This Week", key:"thisWeek",  color:"#0284C7"},
    {p:"This Month",key:"thisMonth", color:"#D97706"},
    {p:"This Year", key:"thisYear",  color:"#059669"},
  ];
  return(
    <Sec title="Doctor Payments" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>} accent="#0284C7">
      <div className="doc-pay-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"#EEF1F8"}}>
        {periods.map((item,i)=>(
          <div key={i} className="metric-cell">
            <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5}}>{item.p}</div>
            {dp?(
              <>
                <AmtText color={item.color}>{fmtAUD(dp[item.key]?.amount??0)}</AmtText>
                <div style={{fontSize:10,color:"#94A3B8",marginTop:2,fontWeight:400}}>{dp[item.key]?.count??0} doctors</div>
              </>
            ):<><Sk w="80%" h={18} style={{marginBottom:4}}/><Sk w="50%" h={11}/></>}
          </div>
        ))}
      </div>
      <div style={{padding:"14px 18px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8"}}>Monthly Payout Trend — {getFYLabel()}</div>
          <div style={{display:"flex",gap:12,fontSize:9.5}}>
            {[["#0284C7","This Month"],["#BAE6FD","Past Months"]].map(([c,l])=>(
              <span key={l} style={{display:"flex",alignItems:"center",gap:5,color:"#94A3B8"}}>
                <span style={{width:8,height:8,borderRadius:2,background:c,display:"inline-block"}}/>{l}
              </span>
            ))}
          </div>
        </div>
        {dp?.monthly?(
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={dp.monthly} margin={{top:4,right:4,left:4,bottom:0}} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F4FB" vertical={false}/>
              <XAxis dataKey="m" tick={{fontSize:9.5,fill:"#94A3B8",fontFamily:"Plus Jakarta Sans"}} axisLine={false} tickLine={false}/>
              <YAxis width={58} tick={{fontSize:9.5,fill:"#94A3B8",fontFamily:"Plus Jakarta Sans"}} axisLine={false} tickLine={false} tickFormatter={v=>v===0?"$0":`$${(v*1000).toLocaleString()}`} allowDecimals={false}/>
              <RT content={({active,payload,label})=>{
                if(!active||!payload?.length)return null;
                const raw=payload[0]?.payload?.raw??0;const amt=payload[0]?.value??0;
                return(<div style={{background:"#fff",border:"1px solid #E8EDF5",borderRadius:10,padding:"8px 12px",fontSize:11,fontFamily:"Plus Jakarta Sans,sans-serif",boxShadow:"0 8px 24px rgba(0,0,0,.10)"}}>
                  <div style={{fontWeight:700,color:"#0F172A",marginBottom:4}}>{label}</div>
                  <div style={{color:"#0284C7",fontWeight:700}}>{raw>0?`$${raw.toLocaleString()}`:`$${(amt*1000).toLocaleString()}`}</div>
                  <div style={{fontSize:9.5,color:"#94A3B8",marginTop:2}}>{payload[0]?.payload?.count??""}{payload[0]?.payload?.count?" payments":"No data"}</div>
                </div>);
              }}/>
              <Bar dataKey="amt" radius={[5,5,0,0]} name="Doctor Payments" minPointSize={2}>
                {dp.monthly.map((entry,i)=>(
                  <Cell key={i} fill={i===currentFYMonthIndex()?"#0284C7":(entry.raw??entry.amt)>0?"#BAE6FD":"#EFF8FF"}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ):<Sk w="100%" h={150}/>}
      </div>
    </Sec>
  );
}

/* ── CASHFLOW ── */
/* ── CASHFLOW ── */
function CashflowSection({data}){
  const cf=data?.cashflow;
  return(
    <Sec title="Cashflow Trend" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>} sub="Collections vs received" accent="#0EA5E9">
      <div style={{padding:"16px 20px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:11,fontWeight:700,color:"#374151"}}>Cashflow — {getFYLabel()}</div>
          <div style={{display:"flex",gap:14,fontSize:10,color:"#94A3B8"}}>
            {[["#4F46E5","Collections"],["#10B981","Received"]].map(([c,l])=>(
              <span key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:8,height:8,borderRadius:2,background:c,display:"inline-block"}}/>{l}
              </span>
            ))}
          </div>
        </div>
        {cf?.monthly?(
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cf.monthly} margin={{top:5,right:8,left:4,bottom:0}}>
              <defs>
                <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={.12}/><stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/></linearGradient>
                <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={.1}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F4FB" vertical={false}/>
              <XAxis dataKey="m" tick={{fontSize:9.5,fill:"#94A3B8",fontFamily:"Plus Jakarta Sans"}} axisLine={false} tickLine={false}/>
              <YAxis width={58} tick={{fontSize:9.5,fill:"#94A3B8",fontFamily:"Plus Jakarta Sans"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v*1000).toLocaleString()}`}/>
              <RT content={<ChartTip/>}/>
              <Area type="monotone" dataKey="col" stroke="#4F46E5" strokeWidth={2.5} fill="url(#gC2)" name="Collections" dot={false} activeDot={{r:5,fill:"#4F46E5",stroke:"#fff",strokeWidth:2}}/>
              <Area type="monotone" dataKey="rec" stroke="#10B981" strokeWidth={2.5} fill="url(#gR2)" name="Received" dot={false} activeDot={{r:5,fill:"#10B981",stroke:"#fff",strokeWidth:2}} strokeDasharray="5 3"/>
            </AreaChart>
          </ResponsiveContainer>
        ):<Sk w="100%" h={200}/>}
      </div>
    </Sec>
  );
}

/* ── INVOICE SECTION ── */
function InvoiceSection({data}){
  const inv=data?.invoices;
  const periods=[
    {p:"Today",     key:"today",     color:"#4F46E5"},
    {p:"This Week", key:"thisWeek",  color:"#0284C7"},
    {p:"This Month",key:"thisMonth", color:"#D97706"},
    {p:"This Year", key:"thisYear",  color:"#059669"},
  ];
  const invPieData=inv?[
    {name:"Paid",          value:inv.statusBreakdown?.["Paid"]??0,          color:"#10B981"},
    {name:"Pending",       value:inv.statusBreakdown?.["Pending"]??0,       color:"#F59E0B"},
    {name:"Partially Paid",value:inv.statusBreakdown?.["Partially Paid"]??0,color:"#0EA5E9"},
  ]:[];
  return(
    <Sec title="Medi Elves Service Fee Invoices" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} accent="#D97706">
      <div className="pgrid">
        {periods.map((item,i)=>(
          <div key={i} className="metric-cell">
            <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".6px",marginBottom:5}}>{item.p}</div>
            {inv?(
              <>
                <AmtText color={item.color}>{fmtAUD(inv[item.key]?.amount??0)}</AmtText>
                <div style={{fontSize:10,color:"#94A3B8",marginTop:2,fontWeight:400}}>{inv[item.key]?.count??0} invoices</div>
              </>
            ):<><Sk w="80%" h={18} style={{marginBottom:4}}/><Sk w="50%" h={11}/></>}
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}} className="chart-2col">
        <div style={{padding:"18px 20px",borderRight:"1px solid #F0F4FA",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10,alignSelf:"flex-start"}}>Invoice Status</div>
          {inv&&invPieData.length>0?(
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={invPieData} cx="50%" cy="50%" innerRadius={56} outerRadius={90} paddingAngle={3} dataKey="value" animationBegin={100} animationDuration={900} labelLine={false} label={PieLabel}>
                    {invPieData.map((d,i)=><Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2}/>)}
                  </Pie>
                  <RT content={<PieTip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px 10px",width:"100%",marginTop:4}}>
                {invPieData.map(d=>(
                  <div key={d.name} style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:8,height:8,borderRadius:3,background:d.color,flexShrink:0}}/>
                    <span style={{fontSize:10,color:"#374151",fontWeight:600}}>{d.name}</span>
                    <span style={{fontSize:10,fontWeight:800,color:d.color,marginLeft:"auto",fontFamily:"'Poppins',monospace"}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ):<Sk w="100%" h={200}/>}
        </div>
        <div style={{padding:"18px 20px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#64748B",marginBottom:14,textTransform:"uppercase",letterSpacing:"1px"}}>Recent Invoices</div>
          {inv?(
            <div>
              {(inv.recent??[]).slice(0,5).map((r,i)=>{
                const sc=INV_STATUS[r.status]??{color:"#94A3B8",bg:"#F1F5F9",border:"#E2E8F0"};
                return(
                  <div key={i} className="invoice-row">
                    <div style={{width:8,height:8,borderRadius:"50%",background:sc.color,flexShrink:0,boxShadow:`0 0 6px ${sc.color}50`}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:10.5,fontWeight:700,color:sc.color,fontFamily:"'Poppins',monospace"}}>{r.invoiceNo}</span>
                        <Bdg label={r.status} bg={sc.bg} color={sc.color} border={sc.border}/>
                      </div>
                      <div style={{fontSize:11,fontWeight:600,color:"#1E293B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.doctor}</div>
                      <div style={{fontSize:9.5,color:"#94A3B8",marginTop:1,fontWeight:400}}>Due: {r.dueDate}</div>
                    </div>
                    <div style={{flexShrink:0}}><AmtText size={14} color={sc.color}>{fmtAUD(parseFloat(String(r.totalAUD).replace(/[^0-9.]/g,""))||0)}</AmtText></div>
                  </div>
                );
              })}
            </div>
          ):<div style={{display:"flex",flexDirection:"column",gap:8}}>{[1,2,3,4].map(i=><Sk key={i} w="100%" h={62}/>)}</div>}
        </div>
      </div>
    </Sec>
  );
}

/* ── MAIN DASHBOARD ── */
export default function Dashboard(){
  const [loaderDone,setLoaderDone]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const {data,user,loading,error}=useZohoData();

  useEffect(()=>{const t=setTimeout(()=>setLoaderDone(true),2800);return()=>clearTimeout(t);},[]);
  if(!loaderDone)return <><style>{G}</style><Loader/></>;

  return(
    <>
      <style>{G}</style>
     <div style={{minHeight:"100vh",background:"transparent",color:"#0F172A"}}>
        {sidebarOpen&&<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.35)",zIndex:299,backdropFilter:"blur(3px)"}} onClick={()=>setSidebarOpen(false)}/>}
        <div style={{position:"fixed",right:0,top:0,bottom:0,width:280,background:"#fff",zIndex:300,overflowY:"auto",transform:sidebarOpen?"translateX(0)":"translateX(100%)",transition:"transform .3s cubic-bezier(.22,1,.36,1)",boxShadow:"-6px 0 32px rgba(0,0,0,.12)",borderLeft:"1px solid #E8EDF5"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",borderBottom:"1px solid #F1F5F9"}}>
            <span style={{fontSize:13,fontWeight:700,color:"#0F172A"}}>Quick Panel</span>
            <button onClick={()=>setSidebarOpen(false)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <SidebarContent data={data}/>
        </div>

        {/* TOPBAR */}
        <header className="topbar fu">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:11,overflow:"hidden",background:"#F8FAFF",border:"1.5px solid #E8EDF5",display:"flex",alignItems:"center",justifyContent:"center",padding:4}}>
              <img src={LOGO_URL} alt="Medi Elves Logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"#0F172A",letterSpacing:-.4,lineHeight:1.2}}>Medi Elves</div>
              <div style={{fontSize:9.5,color:"#94A3B8",fontWeight:500,marginTop:2,letterSpacing:.5,textTransform:"uppercase"}}>Claims Management</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {error&&<div style={{fontSize:10.5,fontWeight:600,color:"#DC2626",background:"#FEF2F2",padding:"4px 10px",borderRadius:6,border:"1px solid #FECDD3"}}>⚠ {error}</div>}
            {loading&&<div style={{display:"flex",alignItems:"center",gap:6,fontSize:10.5,fontWeight:600,color:"#D97706",background:"#FEF3C7",padding:"4px 12px",borderRadius:6,border:"1px solid #FDE68A"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#D97706",animation:"blink 1s ease-in-out infinite"}}/>
              Syncing…
            </div>}
            <button className="sidebar-toggle" onClick={()=>setSidebarOpen(o=>!o)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,background:"linear-gradient(135deg,#4F46E5,#7C3AED)",borderRadius:10,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,boxShadow:"0 4px 12px rgba(79,70,229,.25)"}}>
                {user?.name?user.name.charAt(0).toUpperCase():"A"}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#0F172A"}}>{user?.name||"Admin"}</div>
                <div style={{fontSize:10,color:"#94A3B8",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:400}}>{user?.email||"Super Admin"}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="layout">
          <main className="main-scroll">
            <HeroSection data={data}/>
            <div className="fu2"><ClaimStatusSection data={data}/></div>
            <div className="fu3"><FollowUpSection data={data}/></div>
            <div className="fu3"><PaymentsSection data={data}/></div>
            <div className="fu4"><DoctorPaymentsSection data={data}/></div>
            <div className="fu5"><CashflowSection data={data}/></div>
            <div className="fu6"><InvoiceSection data={data}/></div>
            <div style={{textAlign:"center",padding:"20px 0 6px",color:"#CBD5E1",fontSize:10.5,letterSpacing:.3}}>© 2026 Medi Elves Claims Management System</div>
          </main>
          <aside className="sidebar"><SidebarContent data={data}/></aside>
        </div>
      </div>
    </>
  );
}