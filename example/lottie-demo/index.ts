import * as Lottie from 'lottie-web';

const el = document.createElement('div');
document.body.appendChild(el);
el.style.backgroundColor = 'red';

Lottie.default.loadAnimation({
  container: el,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: './data.json',
});
