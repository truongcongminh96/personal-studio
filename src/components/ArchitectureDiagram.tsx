import React from 'react';

interface ArchitectureDiagramProps {
  index: number;
}

const diagrams = [
  <svg key={0} viewBox="0 0 320 120" width="100%" height="100%">
    <rect x={10} y={35} width={70} height={40} rx={3} fill="none" stroke="#74b9aa" strokeWidth={1} strokeDasharray="2"/>
    <text x={45} y={60} fill="#74b9aa" fontSize={8} fontFamily="Nunito" textAnchor="middle">USER IN</text>
    <path d="M 80 55 L 110 55" fill="none" stroke="#e98d9c" strokeWidth={1.5}/>
    <polygon points="110,55 104,51 104,59" fill="#e98d9c"/>
    <rect x={110} y={20} width={100} height={70} rx={4} fill="rgba(216, 240, 221, 0.42)" stroke="#74b9aa" strokeWidth={1.5}/>
    <text x={160} y={45} fill="#5a5064" fontSize={9} fontFamily="Nunito" fontWeight="bold" textAnchor="middle">AGENT CORE</text>
    <text x={160} y={62} fill="#74b9aa" fontSize={7} fontFamily="Nunito" textAnchor="middle">PLANNING &amp; MEM</text>
    <text x={160} y={75} fill="#e98d9c" fontSize={7} fontFamily="Nunito" textAnchor="middle">TOOL EXECUTOR</text>
    <path d="M 210 40 L 240 40" fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <polygon points="240,40 234,37 234,43" fill="#74b9aa"/>
    <path d="M 210 70 L 240 70" fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <polygon points="240,70 234,67 234,73" fill="#74b9aa"/>
    <rect x={240} y={25} width={70} height={30} rx={3} fill="none" stroke="#e98d9c" strokeWidth={1}/>
    <text x={275} y={44} fill="#e98d9c" fontSize={7} fontFamily="Nunito" textAnchor="middle">TOOLS API</text>
    <rect x={240} y={65} width={70} height={30} rx={3} fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <text x={275} y={84} fill="#74b9aa" fontSize={7} fontFamily="Nunito" textAnchor="middle">VECTOR DB</text>
  </svg>,
  <svg key={1} viewBox="0 0 320 120" width="100%" height="100%">
    <rect x={10} y={20} width={80} height={30} rx={3} fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <text x={50} y={38} fill="#74b9aa" fontSize={7} fontFamily="Nunito" textAnchor="middle">DOC INGEST</text>
    <path d="M 90 35 L 120 35" fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <polygon points="120,35 114,32 114,38" fill="#74b9aa"/>
    <rect x={120} y={20} width={80} height={35} rx={3} fill="rgba(255, 220, 227, 0.42)" stroke="#e98d9c" strokeWidth={1.5}/>
    <text x={160} y={38} fill="#e98d9c" fontSize={8} fontFamily="Nunito" fontWeight="bold" textAnchor="middle">HYBRID SEARCH</text>
    <text x={160} y={48} fill="#5a5064" fontSize={6} fontFamily="Nunito" textAnchor="middle">VECTOR + KEYWORD</text>
    <path d="M 160 55 L 160 75" fill="none" stroke="#e98d9c" strokeWidth={1}/>
    <polygon points="160,75 157,69 163,69" fill="#e98d9c"/>
    <rect x={120} y={75} width={80} height={30} rx={3} fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <text x={160} y={93} fill="#74b9aa" fontSize={7} fontFamily="Nunito" textAnchor="middle">SEMANTIC RERANK</text>
    <path d="M 200 90 L 230 90" fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <polygon points="230,90 224,87 224,93" fill="#74b9aa"/>
    <rect x={230} y={70} width={80} height={38} rx={3} fill="none" stroke="#e98d9c" strokeWidth={1} strokeDasharray="2"/>
    <text x={270} y={88} fill="#e98d9c" fontSize={8} fontFamily="Nunito" textAnchor="middle">LLM CONTEXT</text>
    <text x={270} y={98} fill="#5a5064" fontSize={6} fontFamily="Nunito" textAnchor="middle">GROUNDED ANSWER</text>
  </svg>,
  <svg key={2} viewBox="0 0 320 120" width="100%" height="100%">
    <rect x={15} y={30} width={70} height={50} rx={4} fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <text x={50} y={50} fill="#5a5064" fontSize={8} fontFamily="Nunito" fontWeight="bold" textAnchor="middle">BASE MODEL</text>
    <text x={50} y={65} fill="#74b9aa" fontSize={7} fontFamily="Nunito" textAnchor="middle">Llama-3 / Mistral</text>
    <path d="M 85 55 L 115 55" fill="none" stroke="#74b9aa" strokeWidth={1.5}/>
    <polygon points="115,55 109,51 109,59" fill="#74b9aa"/>
    <rect x={115} y={20} width={90} height={70} rx={4} fill="rgba(255, 220, 227, 0.42)" stroke="#e98d9c" strokeWidth={1.5}/>
    <text x={160} y={45} fill="#e98d9c" fontSize={9} fontFamily="Nunito" fontWeight="bold" textAnchor="middle">QLoRA / PEFT</text>
    <text x={160} y={60} fill="#5a5064" fontSize={7} fontFamily="Nunito" textAnchor="middle">ADAPTER WEIGHTS</text>
    <text x={160} y={75} fill="#74b9aa" fontSize={7} fontFamily="Nunito" textAnchor="middle">16-bit Quantize</text>
    <path d="M 205 55 L 235 55" fill="none" stroke="#e98d9c" strokeWidth={1.5}/>
    <polygon points="235,55 229,51 229,59" fill="#e98d9c"/>
    <rect x={235} y={30} width={70} height={50} rx={4} fill="none" stroke="#74b9aa" strokeWidth={1} strokeDasharray="2"/>
    <text x={270} y={55} fill="#74b9aa" fontSize={8} fontFamily="Nunito" textAnchor="middle">DEPLOYED</text>
    <text x={270} y={68} fill="#5a5064" fontSize={7} fontFamily="Nunito" textAnchor="middle">TensorRT Engine</text>
  </svg>,
  <svg key={3} viewBox="0 0 320 120" width="100%" height="100%">
    <circle cx={50} cy={60} r={25} fill="none" stroke="#74b9aa" strokeWidth={1.5}/>
    <text x={50} y={63} fill="#74b9aa" fontSize={8} fontFamily="Nunito" textAnchor="middle">3D SCENE</text>
    <path d="M 75 60 L 105 60" fill="none" stroke="#74b9aa" strokeWidth={1}/>
    <polygon points="105,60 99,57 99,63" fill="#74b9aa"/>
    <rect x={105} y={25} width={110} height={70} rx={4} fill="rgba(255, 220, 227, 0.42)" stroke="#e98d9c" strokeWidth={1.5}/>
    <text x={160} y={45} fill="#e98d9c" fontSize={9} fontFamily="Nunito" fontWeight="bold" textAnchor="middle">GPU SHADERS</text>
    <text x={160} y={60} fill="#5a5064" fontSize={7} fontFamily="Nunito" textAnchor="middle">Vertex / Frag GLSL</text>
    <text x={160} y={75} fill="#74b9aa" fontSize={7} fontFamily="Nunito" textAnchor="middle">Reflection Maps</text>
    <path d="M 215 60 L 245 60" fill="none" stroke="#e98d9c" strokeWidth={1}/>
    <polygon points="245,60 239,57 239,63" fill="#e98d9c"/>
    <rect x={245} y={35} width={60} height={50} rx={3} fill="none" stroke="#74b9aa" strokeWidth={1} strokeDasharray="2"/>
    <text x={275} y={58} fill="#74b9aa" fontSize={8} fontFamily="Nunito" textAnchor="middle">RENDER</text>
    <text x={275} y={70} fill="#5a5064" fontSize={7} fontFamily="Nunito" textAnchor="middle">WebGL Canvas</text>
  </svg>,
];

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ index }) => (
  <div className="architecture-box">{diagrams[index]}</div>
);

export default ArchitectureDiagram;
