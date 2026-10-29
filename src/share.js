export function resultText(type, pageUrl) {
  const url = new URL(pageUrl);
  // Copy only the entry page, never query parameters or fragments.
  const link = `${url.origin}${url.pathname}`;
  return [
    '🎃 급구 유령 테스트 · Trick or Treat!',
    `👻 나는 ‘${type.name}’!`,
    type.tag,
    '',
    type.desc,
    `💬 ${type.habit}`,
    `✦ 유령을 움직이는 한마디: ${type.cure}`,
    `🤝 찰떡궁합: ${type.match}`,
    '',
    '너는 어떤 유령이야? 👇',
    link,
  ].join('\n');
}
