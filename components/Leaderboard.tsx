"use client";
export type Player={id:string,name:string,total_score:number;participant_id?:string|null};
export default function Leaderboard({players,me}:{players:Player[];me?:string}){
 const sorted=[...players].sort((a,b)=>b.total_score-a.total_score);
 return <div><h3>Live leaderboard</h3><div className="leaderboard-scroll"><table className="tb-table"><thead><tr><th>#</th><th>Player</th><th>Points</th></tr></thead><tbody>{sorted.map((p,i)=><tr key={p.id} className={p.id===me?"tb-me":""}><td>{i+1}</td><td>{p.name}{p.id===me?" •":""}</td><td>{p.total_score}</td></tr>)}</tbody></table></div></div>
}
