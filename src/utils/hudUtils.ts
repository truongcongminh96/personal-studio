export const getCardinalLabel = (angle: number) => {
  let norm = angle % 360;
  if (norm < 0) norm += 360;

  switch (norm) {
    case 0: return "N";
    case 45: return "NE";
    case 90: return "E";
    case 135: return "SE";
    case 180: return "S";
    case 225: return "SW";
    case 270: return "W";
    case 315: return "NW";
    default: return norm.toString();
  }
};

export const isCardinal = (angle: number) => {
  let norm = angle % 360;
  if (norm < 0) norm += 360;
  return [0, 45, 90, 135, 180, 225, 270, 315].includes(norm);
};
