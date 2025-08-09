// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const PASSWORD = "shinwjdgusrla!";
const MIN_INIT_YEAR = 2025;
const MIN_INIT_MONTH = 8; // 2025-08이 최상단 기준
const SPECIAL_MIN_DATE = new Date("2025-08-09T00:00:00"); // 8/9 이전 비활성
const MAX_FUTURE_LIMIT = new Date("2224-12-31T23:59:59");

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function firstOfMonth(y, mIndex) { return new Date(y, mIndex, 1); }
function addMonths(date, n) { return new Date(date.getFullYear(), date.getMonth() + n, 1); }
function sameYM(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
function monthLabel(date) { return `${date.getFullYear()}년 ${date.getMonth() + 1}월`; }
function getMonthDaysGrid(base) {
  const year = base.getFullYear(), month = base.getMonth();
  const first = new Date(year, month, 1), last = new Date(year, month + 1, 0);
  const start = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function isSameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

const LS_POSTS = "memory_site_posts_v1";
const LS_LIKES = "memory_site_likes_v1";

export default function App() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(()=>setNow(new Date()), 60000); return ()=>clearInterval(t); }, []);

  const initialTop = useMemo(() => {
    const today = new Date(), sep2025 = new Date(2025, 8, 1);
    return today >= sep2025 ? firstOfMonth(2025, 8) : firstOfMonth(2025, 7);
  }, []);
  const [topMonth, setTopMonth] = useState(initialTop);
  const months = [0,1,2].map(i => addMonths(topMonth, i));
  const isAtInitialTop = sameYM(topMonth, firstOfMonth(MIN_INIT_YEAR, MIN_INIT_MONTH - 1));
  const canGoUp = !isAtInitialTop;
  const canGoDown = useMemo(() => addMonths(topMonth, 3) <= firstOfMonth(MAX_FUTURE_LIMIT.getFullYear(), MAX_FUTURE_LIMIT.getMonth()), [topMonth]);

  const [selectedDate, setSelectedDate] = useState(() => new Date(Math.max(SPECIAL_MIN_DATE.getTime(), new Date().setHours(0,0,0,0))));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const canWrite = isSameDay(selectedDate, today); // ★ 오늘만 작성 가능

  const [mode, setMode] = useState("landing"); // landing | normal | admin
  const [pw, setPw] = useState("");
  const isAdmin = mode === "admin";

  const [postsByDate, setPostsByDate] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_POSTS) || "{}"); } catch { return {}; }
  });
  useEffect(()=>localStorage.setItem(LS_POSTS, JSON.stringify(postsByDate)),[postsByDate]);

  const [likes, setLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_LIKES) || "{}"); } catch { return {}; }
  });
  useEffect(()=>localStorage.setItem(LS_LIKES, JSON.stringify(likes)),[likes]);

  const [composeOpen, setComposeOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [phName, setPhName] = useState("사용자 이름");
  const [phTitle, setPhTitle] = useState("제목");
  const [phBody, setPhBody] = useState("환상적인 글을 적어보세요!");

  const [invalidName, setInvalidName] = useState(false);
  const [invalidTitle, setInvalidTitle] = useState(false);
  const [invalidBody, setInvalidBody] = useState(false);

  const [viewPost, setViewPost] = useState(null);

  function isDateClickable(d) {
    if (!d) return false;
    const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (d > today0) return false;
    if (d.getFullYear() === 2025 && d.getMonth() === 7 && d < SPECIAL_MIN_DATE) return false;
    return true;
  }
  function handleArrowUp(){ if (canGoUp) setTopMonth(addMonths(topMonth,-3)); }
  function handleArrowDown(){ if (canGoDown) setTopMonth(addMonths(topMonth,3)); }

  function openCompose(){
    if (!canWrite){ alert("글 쓰기는 '오늘 날짜'에만 가능합니다. 달력에서 오늘을 선택해 주세요."); return; }
    setComposeOpen(true);
  }
  function resetCompose(){
    setComposeOpen(false); setNameInput(""); setTitleInput(""); setBodyInput("");
    setAttachments([]); setPhName("사용자 이름"); setPhTitle("제목"); setPhBody("환상적인 글을 적어보세요!");
    setInvalidName(false); setInvalidTitle(false); setInvalidBody(false);
  }
  function validateCompose(){
    let ok=true;
    if(!nameInput.trim()){ ok=false; setInvalidName(true); setTimeout(()=>setInvalidName(false),1300); }
    if(!titleInput.trim()){ ok=false; setInvalidTitle(true); setTimeout(()=>setInvalidTitle(false),1300); }
    if(!bodyInput.trim() && attachments.length===0){ ok=false; setInvalidBody(true); setTimeout(()=>setInvalidBody(false),1300); }
    return ok;
  }
  function submitCompose(){
    if (!canWrite){ alert("오늘 날짜에만 글을 등록할 수 있습니다."); return; }
    if (!validateCompose()) return;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const dateKey = ymd(selectedDate);
    const newPost = { id, date: dateKey, name: nameInput.trim(), title: titleInput.trim(), body: bodyInput, images: attachments.slice(), likes: 0, createdAt: Date.now() };
    setPostsByDate(prev => {
      const arr = prev[dateKey] ? [...prev[dateKey]] : [];
      arr.push(newPost);
      return { ...prev, [dateKey]: arr };
    });
    resetCompose();
  }
  function toggleLike(post){
    const liked = !!likes[post.id];
    setLikes(prev=>({ ...prev, [post.id]: !liked }));
    setPostsByDate(prev=>{
      const arr = (prev[post.date]||[]).map(p => p.id!==post.id ? p : { ...p, likes: Math.max(0,(p.likes||0)+(liked?-1:1)) });
      return { ...prev, [post.date]: arr };
    });
  }
  function deletePost(post){
    if(!isAdmin) return;
    setPostsByDate(prev=>({ ...prev, [post.date]: (prev[post.date]||[]).filter(p=>p.id!==post.id) }));
  }

  const fileInputRef = useRef(null);
  function handleAttachClick(){ fileInputRef.current?.click(); }
  function handleFiles(e){
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    files.forEach(f=>{
      const reader=new FileReader();
      reader.onload=()=>{ setAttachments(prev=>[...prev, reader.result]); setBodyInput(prev=>(prev?prev+"\n":"")+"[이미지 첨부]"); };
      reader.readAsDataURL(f);
    });
    e.target.value="";
  }

  const dateKey = ymd(selectedDate);
  const posts = (postsByDate[dateKey]||[]).slice().sort((a,b)=>a.createdAt-b.createdAt);

  const leftWidth="39.855%"; const rightWidth="60.145%";

  return (
    <div className="w-full h-screen bg-black text-white">
      {mode==="landing" ? (
        <Landing onEnterNormal={()=>setMode("normal")} onEnterAdmin={()=>setMode("admin")} pw={pw} setPw={setPw} setMode={setMode} />
      ) : (
        <div className="flex h-full">
          {/* 왼쪽 달력 */}
          <div className="relative h-full" style={{ width:leftWidth, minWidth:leftWidth }}>
            <div className="absolute inset-0 overflow-y-auto p-4 bg-black">
              <div className="flex justify-center mb-2">
                {!((topMonth.getFullYear()===2025)&&(topMonth.getMonth()===7)) ? (
                  <button onClick={handleArrowUp} className="text-blue-400 hover:text-blue-300 select-none">▲</button>
                ) : <div className="text-transparent select-none">▲</div>}
              </div>
              <div className="flex flex-col gap-6">
                {months.map((m,idx)=>(
                  <MonthView key={idx} base={m} selectedDate={selectedDate} onSelect={setSelectedDate} isDateClickable={isDateClickable}/>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                {canGoDown ? (
                  <button onClick={handleArrowDown} className="text-blue-400 hover:text-blue-300 select-none">▼</button>
                ) : <div className="text-transparent select-none">▼</div>}
              </div>
            </div>
          </div>

          {/* 세로 구분선 */}
          <div className="h-full" style={{ width:"1px", backgroundColor:"#2f2f2f" }} />

          {/* 오른쪽 글 영역 */}
          <div className="relative h-full overflow-hidden" style={{ width:rightWidth, minWidth:rightWidth, backgroundColor:"#000" }}>
            <div className="absolute inset-0 overflow-y-auto p-6">
              <div className="mb-4 text-sm text-gray-300">{dateKey}</div>
              <div className="flex flex-col gap-4">
                {posts.length===0 ? (
                  <div className="text-gray-400">이 날짜에는 아직 추억이 없어요.</div>
                ) : posts.map(p=>(
                  <article key={p.id} className="bg-white text-black rounded-2xl p-4 shadow">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold">{p.name}</div>
                      {isAdmin && <button onClick={()=>deletePost(p)} className="text-white text-xs bg-red-600 px-2 py-1 rounded">삭제</button>}
                    </div>
                    <div className="text-lg mt-1 font-bold cursor-pointer" onClick={()=>setViewPost(p)}>{p.title}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button aria-label="like" onClick={()=>toggleLike(p)} className="text-red-500">
                        {likes[p.id] ? <span>❤</span> : <span className="text-gray-500">♡</span>}
                      </button>
                      <span className="text-sm text-gray-600">{p.likes||0}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* 고정 + 버튼 — 오늘만 활성화(아니면 흐리게) */}
            <button
              onClick={openCompose}
              className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black border border-white flex items-center justify-center ${!canWrite ? 'opacity-40 cursor-not-allowed' : ''}`}
              title="추억 남기기"
              aria-disabled={!canWrite}
            >
              <span className="text-white text-3xl leading-none">+</span>
            </button>
          </div>
        </div>
      )}

      {/* 글쓰기 모달 — 오버레이 스크롤 */}
      {composeOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black w-full max-w-2xl rounded-2xl shadow-xl p-6 relative my-8">
            <button className="absolute top-3 right-3 text-gray-500" onClick={resetCompose}>✕</button>
            <h2 className="text-xl font-bold mb-4">추억 쓰기 — {ymd(selectedDate)}</h2>

            <div className="flex flex-col gap-3">
              <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onFocus={()=>setPhName("")} onBlur={()=>!nameInput&&setPhName("사용자 이름")} placeholder={phName} className={`w-full border rounded-xl px-4 py-3 ${invalidName?"border-red-500":"border-gray-300"}`}/>
              <input value={titleInput} onChange={e=>setTitleInput(e.target.value)} onFocus={()=>setPhTitle("")} onBlur={()=>!titleInput&&setPhTitle("제목")} placeholder={phTitle} className={`w-full border rounded-xl px-4 py-3 ${invalidTitle?"border-red-500":"border-gray-300"}`}/>
              <textarea value={bodyInput} onChange={e=>setBodyInput(e.target.value)} onFocus={()=>setPhBody("")} onBlur={()=>!bodyInput&&setPhBody("환상적인 글을 적어보세요!")} placeholder={phBody} rows={8} className={`w-full border rounded-xl px-4 py-3 resize-y ${invalidBody?"border-red-500":"border-gray-300"}`}/>
              {attachments.length>0 && (
                <div className="grid grid-cols-3 gap-2">
                  {attachments.map((src,i)=>(<img key={i} src={src} alt={`attachment-${i}`} className="w-full h-24 object-cover rounded-lg border" />))}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" multiple onChange={handleFiles}/>
                  <button onClick={handleAttachClick} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">사진 첨부</button>
                </div>
                <button onClick={submitCompose} className="px-5 py-2 rounded-lg font-bold" style={{ backgroundColor:"#9be15d" }}>완료</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전체 글 보기 모달 — 오버레이 스크롤 */}
      {viewPost && (
        <div className="fixed inset-0 z-[70] bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black w-full max-w-3xl rounded-2xl shadow-xl p-6 relative my-8">
            <button className="absolute top-3 right-3 text-gray-500" onClick={()=>setViewPost(null)}>✕</button>
            <div className="text-sm text-gray-500">{viewPost.date}</div>
            <h3 className="text-2xl font-bold mt-1">{viewPost.title}</h3>
            <div className="mt-1 font-semibold">{viewPost.name}</div>

            <div className="mt-4 whitespace-pre-wrap">{viewPost.body}</div>
            {viewPost.images?.length>0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {viewPost.images.map((src,i)=>(<img key={i} src={src} alt={`img-${i}`} className="w-full rounded-xl border" />))}
              </div>
            )}

            <div className="mt-5 flex items-center gap-2">
              <button aria-label="like" onClick={()=>toggleLike(viewPost)} className="text-red-500 text-xl">
                {likes[viewPost.id] ? <span>❤</span> : <span className="text-gray-500">♡</span>}
              </button>
              <span className="text-gray-600">{viewPost.likes||0}</span>
              {isAdmin && <button onClick={()=>{ deletePost(viewPost); setViewPost(null); }} className="ml-auto text-white text-sm bg-red-600 px-3 py-1 rounded">삭제</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthView({ base, selectedDate, onSelect, isDateClickable }) {
  const grid = getMonthDaysGrid(base);
  return (
    <div className="bg-black">
      <div className="text-white text-lg font-bold mb-2">{monthLabel(base)}</div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, idx) => {
          if (!d) return <div key={idx} className="h-8" />;
          const day = d.getDate();
          const clickable = isDateClickable(d);
          const isSelected = ymd(d) === ymd(selectedDate);
          const textColor = !clickable ? "text-gray-500" : "text-white";
          const bg = isSelected ? "bg-white/10" : "bg-black";
          return (
            <button
              key={idx}
              disabled={!clickable}
              onClick={() => onSelect(d)}
              className={`h-8 rounded ${bg} ${textColor} flex items-center justify-center border border-transparent disabled:cursor-not-allowed`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Landing({ onEnterNormal, onEnterAdmin, pw, setPw, setMode }) {
  const [showPw, setShowPw] = useState(false);
  function tryAdmin(){ if (pw===PASSWORD) setMode("admin"); else alert("비밀번호가 올바르지 않습니다."); }
  return (
    <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center relative">
      <div className="absolute top-1/4 -translate-y-1/2 text-2xl font-bold">08 대화방</div>
      <div className="mt-10 flex items-center gap-6">
        <button onClick={onEnterNormal} className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90">일반인으로 입장하기</button>
        {!showPw ? (
          <button onClick={()=>setShowPw(true)} className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90">클릭하지 마시오</button>
        ) : (
          <div className="flex items-center gap-2">
            <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="비밀번호" className="px-3 py-2 rounded-lg text-black" type="password"/>
            <button onClick={tryAdmin} className="px-4 py-2 rounded-lg bg-white text-black font-semibold">확인</button>
          </div>
        )}
      </div>
      <div className="absolute right-3 bottom-3 text-xs text-gray-500">제작: 신바위</div>
    </div>
  );
}
