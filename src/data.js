export const TYPES = [
 {id:'meeting',name:'회의실 지박령',icon:'👻',color:'#c4b5fd',room:'meeting',tag:'회의가 끝나도, 나는 여기',desc:'모두의 이야기를 듣고 연결하는 당신. 빈 회의실에서도 다음 아이디어를 생각하고 있군요.',habit:'“이 건으로 15분만 이야기할까요?”',cure:'이건 슬랙으로 공유드릴게요.',match:'정시 퇴근 늑대인간'},
 {id:'vampire',name:'심야 사무실 흡혈귀',icon:'🧛',color:'#f5a1b5',room:'office',tag:'달이 뜨면 집중력도 뜬다',desc:'조용해진 사무실에서 진가를 발휘하는 몰입의 달인. 아무도 보지 못한 디테일까지 챙겨요.',habit:'“이것만 마무리하고 갈게요.”',cure:'완료 버튼과 따뜻한 이불.',match:'탕비실 호박 요정'},
 {id:'wolf',name:'정시 퇴근 늑대인간',icon:'🐺',color:'#91cdbd',room:'lobby',tag:'해가 지면 본캐로 변신',desc:'일할 때는 확실하게, 쉴 때는 누구보다 즐겁게. 나만의 리듬으로 팀에 활력을 불어넣어요.',habit:'“내일의 제가 해낼 겁니다.”',cure:'퇴근 1분 전 도착한 긴급 회의.',match:'회의실 지박령'},
 {id:'pumpkin',name:'탕비실 호박 요정',icon:'🎃',color:'#ffc176',room:'pantry',tag:'당 충전은 곧 팀워크',desc:'작은 간식과 다정한 한마디로 팀의 온도를 올리는 사람. 당신이 있는 곳에 웃음이 모여요.',habit:'“이거 하나 먹고 하세요!”',cure:'과자가 모두 사라진 탕비실.',match:'심야 사무실 흡혈귀'},
 {id:'wizard',name:'아이디어 마법사',icon:'🧙',color:'#a5b7ff',room:'meeting',tag:'잠깐, 이런 방법은 어때요?',desc:'익숙한 문제에서도 새로운 길을 발견해요. 당신의 엉뚱한 한마디가 멋진 시작이 되곤 하죠.',habit:'“갑자기 생각난 건데요…”',cure:'아이디어를 마음껏 적을 빈 노트.',match:'슬랙 떠돌이 유령'},
 {id:'slack',name:'슬랙 떠돌이 유령',icon:'💬',color:'#e2c28f',room:'office',tag:'어디에나 있지만, 조용히',desc:'놓치는 소식 없이 필요한 곳에 등장하는 당신. 작은 신호를 알아채고 동료의 막힌 곳을 풀어줘요.',habit:'“관련 스레드 링크 공유드려요.”',cure:'알림 끄기와 방해 금지 모드.',match:'아이디어 마법사'}
];
export const QUESTIONS = [
 {q:'아무도 없는 사무실. 딱 하나 불이 켜져 있다면?',a:[['회의실. 이야기는 아직 끝나지 않았어.','meeting'],['내 자리. 지금 딱 집중이 잘되는데?','vampire'],['탕비실. 마지막 과자는 내가 지킨다.','pumpkin'],['현관. 집에 가는 길이 제일 밝지.','wolf']]},
 {q:'갑자기 새로운 일이 떨어졌다. 나의 첫 반응은?',a:[['관련된 사람들을 모아서 이야기한다.','meeting'],['재밌는 방법부터 떠올려 본다.','wizard'],['예전 논의와 자료부터 찾아본다.','slack'],['오늘 할 수 있는 범위부터 정한다.','wolf']]},
 {q:'동료의 기운이 없어 보일 때, 나는?',a:[['간식 하나를 슬쩍 건넨다.','pumpkin'],['조용히 옆에서 일을 나눠 맡는다.','vampire'],['“잠깐 이야기할까요?” 먼저 묻는다.','meeting'],['필요할 것 같은 정보를 찾아 보내준다.','slack']]},
 {q:'할로윈 파티에서 내 역할은?',a:[['기상천외한 게임을 만들어 온다.','wizard'],['먹거리와 선물을 야무지게 챙긴다.','pumpkin'],['마지막까지 남아 분위기를 즐긴다.','vampire'],['즐길 만큼 즐기고 귀가 시간은 지킨다.','wolf']]},
 {q:'딱 하나의 초능력을 얻을 수 있다면?',a:[['흩어진 대화에서 답을 찾아내는 능력.','slack'],['생각만 하면 아이디어가 현실이 되는 능력.','wizard'],['누구와도 마음이 통하는 능력.','meeting'],['한 시간 만에 하루 일을 끝내는 능력.','wolf']]}
];
export function resultType(answers){const scores=Object.fromEntries(TYPES.map(t=>[t.id,0]));for(const a of answers)if(a in scores)scores[a]++;return TYPES.reduce((best,t)=>scores[t.id]>scores[best.id]?t:best,TYPES[0]);}
export const typeOf=id=>TYPES.find(t=>t.id===id)||TYPES[0];


export const GHOST_LORE = {
  meeting: {
    intro: '회의가 끝나도 다음 이야기를 찾아 떠도는 유령.',
    personality: '사람들의 의견을 연결하는 다정한 조율자. 다만 “마지막으로 하나만”을 세 번쯤 말해요.',
    habitat: '예약 시간이 끝난 회의실',
    exorcism: '“이건 슬랙으로 공유드릴게요.” 하고 회의실 불을 끈다.',
  },
  vampire: {
    intro: '사무실 불이 꺼질수록 눈빛이 반짝이는 몰입형 흡혈귀.',
    personality: '조용하고 꼼꼼해요. 남들이 놓친 디테일을 발견하면 시간 가는 줄 몰라요.',
    habitat: '모니터 하나만 켜진 심야 사무실',
    exorcism: '“오늘 할 일은 끝났어요.”와 따뜻한 이불을 준비한다.',
  },
  wolf: {
    intro: '퇴근 시간이 되면 누구보다 빠르게 본래 모습으로 돌아오는 유령.',
    personality: '일도 휴식도 확실하게 챙기는 현실주의자. 집중해서 끝내고 내일의 기운을 아껴 둬요.',
    habitat: '퇴근 1분 전, 사무실 출입문 앞',
    exorcism: '“오늘은 여기까지!” 한마디면 집으로 사라진다.',
  },
  pumpkin: {
    intro: '바스락 소리와 함께 나타나 사탕을 나누는 작은 호박 요정.',
    personality: '동료의 기분을 먼저 살피는 다정한 분위기 메이커. 간식을 나눌 때 가장 행복해요.',
    habitat: '새 간식이 도착한 탕비실',
    exorcism: '마지막 과자까지 나눠 먹고 “덕분에 힘났어요!”라고 말한다.',
  },
  wizard: {
    intro: '아무도 생각하지 못한 방법을 모자 속에서 꺼내는 마법사.',
    personality: '호기심이 많고 상상력이 풍부해요. “그런데 이렇게 해보면?”으로 새로운 길을 열어요.',
    habitat: '낙서와 아이디어로 가득한 화이트보드 앞',
    exorcism: '새 노트를 건네면 아이디어를 적으러 조용히 사라진다.',
  },
  slack: {
    intro: '누군가 정보를 찾으면 관련 링크를 들고 나타나는 유령.',
    personality: '말없이 흐름을 읽는 관찰자. 흩어진 이야기를 기억하고 필요한 순간에 꺼내 줘요.',
    habitat: '읽지 않은 메시지가 쌓인 슬랙 스레드',
    exorcism: '“찾았어요, 고마워요!”라고 답하고 알림을 잠시 끈다.',
  },
};
