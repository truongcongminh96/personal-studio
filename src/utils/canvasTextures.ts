import * as THREE from 'three';
import type { Project } from '../data/projects';

export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

export const createDoodleTexture = (
  kind: 'star' | 'heart' | 'cloud',
  color: string,
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(128, 93, 100, 0.45)';
  ctx.fillStyle = color;

  if (kind === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? 54 : 24;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = 80 + Math.cos(angle) * radius;
      const y = 80 + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'heart') {
    ctx.beginPath();
    ctx.moveTo(80, 124);
    ctx.bezierCurveTo(20, 78, 30, 30, 70, 44);
    ctx.bezierCurveTo(80, 18, 130, 32, 126, 72);
    ctx.bezierCurveTo(122, 96, 104, 108, 80, 124);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(55, 88, 28, Math.PI, 0);
    ctx.arc(82, 72, 35, Math.PI, 0);
    ctx.arc(116, 90, 24, Math.PI, 0);
    ctx.lineTo(140, 108);
    ctx.lineTo(30, 108);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export const createRichCardTexture = (
  index: number,
  config: Project,
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#fffaf0');
  gradient.addColorStop(0.45, config.accentSoft);
  gradient.addColorStop(1, '#ddecf6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  for (let i = 0; i < 18; i++) {
    const x = (i * 67 + index * 31) % canvas.width;
    const y = 36 + ((i * 43) % 420);
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(134, 99, 105, 0.25)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 16]);
  ctx.beginPath();
  ctx.moveTo(396, 82);
  ctx.bezierCurveTo(490, 12, 558, 92, 650, 54);
  ctx.bezierCurveTo(700, 36, 728, 78, 708, 124);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
  ctx.strokeStyle = 'rgba(128, 93, 100, 0.18)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 28, 28, canvas.width - 56, canvas.height - 56, 36);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = config.accentSoft;
  ctx.strokeStyle = config.accent;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 48, 48, 142, 32, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#665260';
  ctx.font = '800 15px "Nunito", sans-serif';
  ctx.fillText(config.tag.toUpperCase(), 64, 69);

  ctx.fillStyle = '#4f465b';
  ctx.font = '900 35px "Nunito", sans-serif';
  const titleWords = config.title.split(' ');
  const firstLine = titleWords.slice(0, 2).join(' ');
  const secondLine = titleWords.slice(2).join(' ');
  ctx.fillText(firstLine, 50, 126);
  if (secondLine) ctx.fillText(secondLine, 50, 166);

  ctx.fillStyle = '#7a7184';
  ctx.font = '700 18px "Nunito", sans-serif';
  ctx.fillText(config.subtitle, 52, 204);

  ctx.font = '700 17px "Nunito", sans-serif';
  config.details.forEach((detail, i) => {
    const y = 252 + i * 34;
    ctx.fillStyle = ['#ffd1da', '#d8f0dd', '#fff0be', '#e5e7ff'][i];
    ctx.strokeStyle = 'rgba(128, 93, 100, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(62, y - 5, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#62596d';
    ctx.fillText(detail, 84, y);
  });

  config.drawArt(ctx);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = config.accent;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 50, 402, 212, 48, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#51475c';
  ctx.font = '900 16px "Nunito", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.chip, 156, 426);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = config.accent;
  ctx.beginPath();
  ctx.arc(688, 410, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 18 : 8;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = 688 + Math.cos(angle) * radius;
    const y = 410 + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};
