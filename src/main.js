import './style.css';
import { TYPES, QUESTIONS, resultType } from './data.js';
import { resultText } from './share.js';

const $ = selector => document.querySelector(selector);
let answers = [];
let result = null;

$('#app').innerHTML = `
  <header>
    <div class="brand"><span class="brand-mark">↯</span><div>급구 유령 테스트<small>NEEDER AFTER DARK</small></div></div>
    <nav class="nav" aria-label="주 메뉴"><button class="my" id="my">👻 나의 유령 찾기</button></nav>
  </header>
  <main class="container">
    <div class="topline"><div class="eyebrow">OCTOBER 31 · HALLOWEEN SPECIAL</div><span class="mode">5문항 · 약 1분</span></div>
    <section class="hero" aria-label="우리 회사에 사는 유령 테스트">
      <div class="intro">
        <span class="pill">✦ 오늘만큼은, 우리도 유령</span>
        <h1>퇴근 후 깨어나는<br>또 다른 <span>나.</span></h1>
        <p>회의실 지박령부터 정시 퇴근 늑대인간까지.<br>회사에 숨어 있던 나의 유령을 찾아보세요.<br>Trick or Treat! 오늘의 정체는 뭘까요?</p>
        <button class="primary" id="start">나의 유령 알아보기 <b>↗</b></button>
        <div class="intro-note"><span class="tiny-ghosts">👻🎃👻</span>여섯 가지 유령 중 나는 어떤 모습일까?</div>
      </div>
      <div class="scene-wrap" id="scene"></div>
      <div class="scene-bottom"><span class="help">↔ 드래그해서 회전 · 스크롤로 확대</span><div class="scene-controls"><button id="zoom-in" aria-label="확대">+</button><button id="zoom-out" aria-label="축소">−</button><button id="reset" aria-label="처음 시점으로">↺</button></div></div>
    </section>
    <section class="quiz-guide" aria-label="참여 방법">
      <div><span>01</span><strong>나답게 골라요</strong><p>다섯 가지 질문에 솔직하게 답해요.</p></div>
      <div><span>02</span><strong>내 유령을 만나요</strong><p>나의 특징과 찰떡궁합을 확인해요.</p></div>
      <div><span>03</span><strong>복사하고 나눠요</strong><p>결과 텍스트를 복사해 슬랙에 붙여넣어요.</p></div>
    </section>
    <footer class="footer"><span>NEEDER AFTER DARK © 2026 · 오늘도 급구를 지키는 모든 유령에게.</span><span>재미로 즐기는 테스트예요. 답변은 저장하지 않아요.</span></footer>
  </main>`;

// The house is decorative. Quiz and copying still work if 3D is unavailable.
let house;
import('./scene.js').then(({ createHouse }) => {
  house = createHouse($('#scene'));
}).catch(() => { $('#scene').innerHTML = '<div class="scene-placeholder" aria-hidden="true">👻 🎃 👻</div>'; });

function modal(content, title = 'FIND YOUR INNER GHOST') {
  const el = $('#modal');
  el.innerHTML = `<div class="modal-top"><span>${title}</span><button class="close" aria-label="닫기">×</button></div>${content}`;
  el.querySelector('.close').onclick = () => el.close();
  if (!el.open) el.showModal();
  const heading = el.querySelector('h2');
  if (heading) { heading.tabIndex = -1; heading.focus(); }
}

$('#modal').addEventListener('click', event => {
  if (event.target !== $('#modal')) return;
  const rect = event.target.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
});

function begin() {
  answers = [];
  quiz();
}

function quiz() {
  const index = answers.length;
  const question = QUESTIONS[index];
  modal(`
    <div class="progress" aria-hidden="true"><div style="width:${index / QUESTIONS.length * 100}%"></div></div>
    <span class="result-tag">QUESTION 0${index + 1} / 0${QUESTIONS.length}</span>
    <h2 class="modal-title">${question.q}</h2>
    <div class="answers">${question.a.map(([text, id], i) => `<button class="answer" data-answer="${id}"><span class="answer-number">0${i + 1}</span>${text}</button>`).join('')}</div>
    ${index ? '<button class="quiz-back">← 이전 질문</button>' : ''}`);
  $('.answers').querySelectorAll('button').forEach(button => {
    button.onclick = () => {
      answers.push(button.dataset.answer);
      if (answers.length < QUESTIONS.length) quiz();
      else {
        result = resultType(answers);
        $('#my').textContent = '👻 내 결과 보기';
        showResult();
      }
    };
  });
  $('.quiz-back')?.addEventListener('click', () => { answers.pop(); quiz(); });
}

function showResult() {
  if (!result) return begin();
  const type = result;
  modal(`
    <div class="result">
      <div class="result-visual"><span class="mini-ghost" style="--ghost:${type.color}"></span></div>
      <p class="result-tag">${type.tag}</p>
      <h2>나는 ${type.name}!</h2>
      <p class="modal-copy">${type.desc}</p>
      <p class="quote">${type.habit}</p>
      <dl class="facts"><dt>✦ 유령을 움직이는 한마디</dt><dd>${type.cure}</dd><dt>♡ 찰떡궁합</dt><dd>${type.match}</dd></dl>
      <button class="primary full" id="copy-result">📋 결과 텍스트 복사하기</button>
      <p id="copy-status" class="copy-status" role="status" aria-live="polite"></p>
      <div id="manual-copy" hidden><label class="field-label" for="copy-text">자동 복사가 지원되지 않아요. 아래 텍스트를 직접 복사해 주세요.</label><textarea id="copy-text" readonly rows="9"></textarea></div>
      <button class="text-link retake" id="retake">테스트 다시 하기 ↺</button>
    </div>`, 'YOUR GHOST IDENTITY');
  $('#copy-result').onclick = () => copyResult(type);
  $('#retake').onclick = begin;
}

async function copyResult(type) {
  const text = resultText(type, location.href);
  const button = $('#copy-result');
  const status = $('#copy-status');
  const manual = $('#manual-copy');
  button.disabled = true;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch { /* Fall back without claiming the text was copied. */ }
  if (!copied) {
    const field = $('#copy-text');
    manual.hidden = false;
    field.value = text;
    field.focus();
    field.select();
    try { copied = document.execCommand('copy'); } catch { /* Keep manual text selected. */ }
  }
  if (copied) {
    manual.hidden = true;
    status.textContent = '복사했어요! 슬랙에 붙여넣어 내 유령을 소개해 주세요. 🍬';
    button.textContent = '✓ 복사 완료 · 다시 복사하기';
  } else {
    status.textContent = '선택된 텍스트를 Ctrl+C 또는 ⌘C로 복사해 주세요.';
  }
  button.disabled = false;
  if (copied) button.focus();
}

$('#start').onclick = begin;
$('#my').onclick = () => result ? showResult() : begin();
$('#zoom-in').onclick = () => house?.zoom(1);
$('#zoom-out').onclick = () => house?.zoom(-1);
$('#reset').onclick = () => house?.reset();
window.addEventListener('pagehide', event => { if (!event.persisted) house?.dispose(); });
