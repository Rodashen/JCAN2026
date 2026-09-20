export const MODES = ['full', 'reading', 'listening'];
// Keep source question types, choices and recordings together. Number clips and
// instruction examples stay in their original slots.
export function assembleExam(template, pool, selection) {
  if (!Array.isArray(selection) || selection.length !== 40 || new Set(selection).size !== 40) throw Error('Invalid exam selection.');
  const byId = new Map(pool.questions.map(q => [q.id,q]));
  const questions = template.questions.map((slot,i) => {
    const q = byId.get(selection[i]);
    if (!q || q.group !== slot.group || q.section !== slot.section) throw Error('Question type mismatch.');
    return {...q,number:slot.number,instruction:slot.instruction};
  });
  let number = 0;
  const sequence = template.sequence.map(step => {
    if (step.question) number = step.question;
    if (number && step.src === template.questions[number-1].audio) return {...step,src:questions[number-1].audio};
    return {...step};
  });
  return validateBank({...template,id:template.id+':'+selection.join(','),title:'EPS-TOPIK Random Practice',questions,sequence});
}
export function selectExam(template, pool, history = {}, random = Math.random) {
  const previous = new Set(Array.isArray(history.previous) ? history.previous : []);
  const counts = history.counts || {};
  for(let attempt=0;attempt<200;attempt++) {
    const used = new Set();
    const selection = template.questions.map(slot => {
      const candidates = pool.questions.filter(q => q.group === slot.group && q.section === slot.section && !used.has(q.id));
      // Prefer questions absent from the last test, then the least-used ones.
      const ranked = candidates.map(q=>({q,repeat:previous.has(q.id)?1:0,count:Number(counts[q.id])||0,tie:random()}))
        .sort((a,b)=>a.repeat-b.repeat || (attempt===199 ? (a.q.audioSeconds||0)-(b.q.audioSeconds||0) : attempt<20 ? a.count-b.count : 0) || a.tie-b.tie);
      if(!ranked.length) throw Error('Not enough questions for this question type.');
      used.add(ranked[0].q.id);return ranked[0].q.id;
    });
    const exam = assembleExam(template,pool,selection);
    const duration = (pool.listeningOverheadSeconds || 0) + 2*exam.questions.slice(20).reduce((n,q)=>n+(q.audioSeconds||0),0);
    if(duration > template.sectionSeconds-10) continue;
    if(selection.every(id=>previous.has(id))) continue;
    return exam;
  }
  throw Error('Could not prepare a fresh exam within the listening time limit. Please try again.');
}
export function leaveQuestion(state, bank) {
  const q = bank.questions[state.current-1];
  if(q && state.visited?.[q.id] && state.answers[q.id] === undefined) (state.skipped ||= {})[q.id] = true;
}
export function questionStatus(state,q) {
  return {answered:state.answers[q.id]!==undefined,skipped:state.answers[q.id]===undefined&&Boolean(state.skipped?.[q.id]),flagged:Boolean(state.flags[q.id])};
}
export function mediaPath(value) {
  return typeof value === 'string' && /^media\/eps-topik\/[a-zA-Z0-9_.-]+$/.test(value);
}
export function validateBank(bank) {
  if (!bank || bank.version !== 1 || typeof bank.id !== 'string' || bank.sectionSeconds !== 1500 || !Array.isArray(bank.questions)) throw Error('Unsupported exam data.');
  const ids = new Set();
  if (bank.questions.length !== 40) throw Error('A full exam needs 40 questions.');
  bank.questions.forEach((q, i) => {
    if (!q.id || ids.has(q.id) || q.number !== i + 1 || q.section !== (i < 20 ? 'reading' : 'listening')) throw Error('Invalid question order.');
    ids.add(q.id);
    if (typeof q.prompt !== 'string' || typeof q.instruction !== 'string' || !Array.isArray(q.images) || !Array.isArray(q.choices) || q.choices.length !== 4 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) throw Error('Invalid question ' + q.number);
    for (const c of q.choices) if (typeof c.text !== 'string' || !Array.isArray(c.images)) throw Error('Invalid answer choice.');
    const paths = [...q.images, ...q.choices.flatMap(c => c.images)];
    if (q.section === 'listening') paths.push(q.audio);
    if (!paths.every(mediaPath)) throw Error('Invalid media path.');
  });
  if (!Array.isArray(bank.sequence) || !bank.sequence.length) throw Error('Missing listening sequence.');
  const markers = bank.sequence.filter(s => s.question).map(s => s.question);
  if (markers.join(',') !== Array.from({length:20}, (_, i) => i + 21).join(',')) throw Error('Invalid listening sequence.');
  if (!bank.sequence.every(s => s.question || mediaPath(s.src))) throw Error('Invalid recording.');
  return bank;
}
export function questionsFor(bank, mode) {
  return bank.questions.filter(q => mode === 'full' || q.section === mode);
}
export function createAttempt(bank, mode, candidate = {}, now = Date.now()) {
  if (!MODES.includes(mode)) throw Error('Invalid mode');
  return {version:1, bankId:bank.id, selection:bank.questions.map(q=>q.id), mode, candidate:{name:String(candidate.name || '').slice(0,80),seat:String(candidate.seat || '').slice(0,20)}, stage:mode === 'listening' ? 'listening' : 'reading', current:mode === 'listening' ? 21 : 1, answers:{}, flags:{}, visited:{}, skipped:{}, startedAt:now, deadline:now + bank.sectionSeconds * 1000, completedAt:null, sequenceIndex:0, audioOffset:0};
}
export function advanceTime(state, bank, now = Date.now()) {
  if (state.stage === 'complete' || now < state.deadline) return false;
  leaveQuestion(state,bank);
  if (state.stage === 'reading' && state.mode === 'full') {
    state.stage = 'listening'; state.current = 21;
    state.deadline += bank.sectionSeconds * 1000;
    state.sequenceIndex = 0; state.audioOffset = 0;
    if (now >= state.deadline) { state.stage = 'complete'; state.completedAt = state.deadline; }
  } else { state.stage = 'complete'; state.completedAt = state.deadline; }
  return true;
}
export function finishSection(state, bank, now = Date.now()) {
  if (state.stage === 'complete') return;
  state.deadline = now;
  advanceTime(state, bank, now);
}
export function answerQuestion(state, bank, number, answer) {
  const q = bank.questions.find(q => q.number === number);
  if (!q || state.stage === 'complete' || q.section !== state.stage || !Number.isInteger(answer) || answer < 0 || answer > 3) return false;
  state.answers[q.id] = answer;
  return true;
}
export function scoreAttempt(state, bank) {
  const items = questionsFor(bank, state.mode).map(q => ({question:q, answer:state.answers[q.id], correct:state.answers[q.id] === q.answer}));
  const correct = items.filter(x => x.correct).length;
  const unanswered = items.filter(x => x.answer === undefined).length;
  return {items,total:items.length,correct,unanswered,incorrect:items.length - correct - unanswered,percent:Number((correct / items.length * 100).toFixed(1)),points:correct * 2.5,maxPoints:items.length * 2.5};
}
export function restoreAttempt(raw, bank) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || s.bankId !== bank.id || !MODES.includes(s.mode) || !['reading','listening','complete'].includes(s.stage) || !Number.isFinite(s.deadline) || !Number.isFinite(s.startedAt) || s.deadline < s.startedAt || s.deadline > s.startedAt + 3000000 || !s.answers || typeof s.answers !== 'object' || !s.flags || typeof s.flags !== 'object' || !s.candidate || typeof s.candidate.name !== 'string' || typeof s.candidate.seat !== 'string') return null;
    if ((s.mode === 'reading' && s.stage === 'listening') || (s.mode === 'listening' && s.stage === 'reading')) return null;
    const valid = questionsFor(bank,s.mode);
    if (!valid.some(q => q.number === s.current) || (s.stage !== 'complete' && bank.questions[s.current-1].section !== s.stage)) return null;
    if (!Number.isInteger(s.sequenceIndex) || s.sequenceIndex < 0 || s.sequenceIndex > bank.sequence.length || !Number.isFinite(s.audioOffset) || s.audioOffset < 0 || s.audioOffset > 3600) return null;
    for (const [id,a] of Object.entries(s.answers)) if (!valid.some(q => q.id === id) || !Number.isInteger(a) || a < 0 || a > 3) return null;
    s.candidate.name = s.candidate.name.slice(0,80); s.candidate.seat = s.candidate.seat.slice(0,20);
    return s;
  } catch { return null; }
}
export function formatTime(milliseconds) {
  const seconds = Math.max(0,Math.ceil(milliseconds / 1000));
  return String(Math.floor(seconds / 60)).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0');
}
