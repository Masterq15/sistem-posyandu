import { BBU_DATA, TBU_DATA, BBTB_DATA, SDArray } from './antropometriData';

function getBBUsds(usiaBulan: number, jenisKelamin: 'L' | 'P'): SDArray {
  const ageKey = Math.min(60, Math.max(0, Math.round(usiaBulan)));
  const data = BBU_DATA[jenisKelamin] || BBU_DATA['L'];
  return data[ageKey] || data[0];
}

function getTBUsds(usiaBulan: number, jenisKelamin: 'L' | 'P'): SDArray {
  const ageKey = Math.min(60, Math.max(0, Math.round(usiaBulan)));
  const data = TBU_DATA[jenisKelamin] || TBU_DATA['L'];
  return data[ageKey] || data[0];
}

function getBBTBSDs(tinggiBadan: number, jenisKelamin: 'L' | 'P'): SDArray {
  const list = BBTB_DATA[jenisKelamin] || BBTB_DATA['L'];
  if (tinggiBadan <= list[0].tb) return list[0].sds;
  if (tinggiBadan >= list[list.length - 1].tb) return list[list.length - 1].sds;

  for (let i = 0; i < list.length - 1; i++) {
    const item1 = list[i];
    const item2 = list[i + 1];
    if (tinggiBadan >= item1.tb && tinggiBadan <= item2.tb) {
      const ratio = (tinggiBadan - item1.tb) / (item2.tb - item1.tb);
      const interpolatedSds: SDArray = [0, 0, 0, 0, 0, 0, 0];
      for (let j = 0; j < 7; j++) {
        interpolatedSds[j] = item1.sds[j] + ratio * (item2.sds[j] - item1.sds[j]);
      }
      return interpolatedSds;
    }
  }
  return list[0].sds;
}

export function hitungZScoreFromSD(val: number, sds: SDArray): number {
  const [sdM3, sdM2, sdM1, median, sdP1, sdP2, sdP3] = sds;
  if (val === median) return 0;

  if (val > median) {
    const sdUnit = sdP1 - median;
    if (sdUnit === 0) return 0;
    return (val - median) / sdUnit;
  } else {
    const sdUnit = median - sdM1;
    if (sdUnit === 0) return 0;
    return (val - median) / sdUnit;
  }
}

export function hitungZScoreBBU(beratBadan: number, usiaBulan: number, jenisKelamin: 'L' | 'P'): number {
  const sds = getBBUsds(usiaBulan, jenisKelamin);
  return Number(hitungZScoreFromSD(beratBadan, sds).toFixed(2));
}

export function hitungZScoreTBU(tinggiBadan: number, usiaBulan: number, jenisKelamin: 'L' | 'P'): number {
  const sds = getTBUsds(usiaBulan, jenisKelamin);
  return Number(hitungZScoreFromSD(tinggiBadan, sds).toFixed(2));
}

export function hitungZScoreBBTB(beratBadan: number, tinggiBadan: number, jenisKelamin: 'L' | 'P'): number {
  const sds = getBBTBSDs(tinggiBadan, jenisKelamin);
  return Number(hitungZScoreFromSD(beratBadan, sds).toFixed(2));
}

export function hitungStatusBbU(
  beratBadan: number,
  usiaBulan: number,
  jenisKelamin: 'L' | 'P'
): 'Sangat Kurang' | 'Kurang' | 'Normal' | 'Lebih' {
  const zScore = hitungZScoreBBU(beratBadan, usiaBulan, jenisKelamin);

  if (zScore < -3) return 'Sangat Kurang';
  if (zScore < -2) return 'Kurang';
  if (zScore <= 1) return 'Normal';
  return 'Lebih';
}

export function hitungStatusTbU(
  tinggiBadan: number,
  usiaBulan: number,
  jenisKelamin: 'L' | 'P'
): 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi' {
  const zScore = hitungZScoreTBU(tinggiBadan, usiaBulan, jenisKelamin);

  if (zScore < -3) return 'Sangat Pendek';
  if (zScore < -2) return 'Pendek';
  if (zScore <= 2) return 'Normal'; // Sesuai Permenkes No. 2 Th 2020: Normal (-2 SD s.d. +2 SD)
  return 'Tinggi';
}

export function hitungStatusBbTb(
  beratBadan: number,
  tinggiBadan: number,
  jenisKelamin: 'L' | 'P'
): 'Sangat Kurus' | 'Kurus' | 'Normal' | 'Gemuk' {
  const zScore = hitungZScoreBBTB(beratBadan, tinggiBadan, jenisKelamin);

  if (zScore < -3) return 'Sangat Kurus';
  if (zScore < -2) return 'Kurus';
  if (zScore <= 1) return 'Normal';
  return 'Gemuk';
}

export function hitungIMT(beratBadan: number, tinggiBadan: number): number {
  const bb = Number(beratBadan);
  const tb = Number(tinggiBadan);
  if (isNaN(bb) || isNaN(tb) || tb <= 0 || bb <= 0) return 0;
  const tbMeter = tb / 100;
  const imt = bb / (tbMeter * tbMeter);
  return isNaN(imt) ? 0 : Number(imt.toFixed(1));
}

// Helper functions untuk convert label ke enum code
export function convertStatusBbUToCode(label: 'Sangat Kurang' | 'Kurang' | 'Normal' | 'Lebih'): 'SK' | 'K' | 'N' | 'L' {
  switch (label) {
    case 'Sangat Kurang': return 'SK';
    case 'Kurang': return 'K';
    case 'Normal': return 'N';
    case 'Lebih': return 'L';
  }
}

export function convertStatusTbUToCode(label: 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi'): 'SP' | 'P' | 'N' | 'T' {
  switch (label) {
    case 'Sangat Pendek': return 'SP';
    case 'Pendek': return 'P';
    case 'Normal': return 'N';
    case 'Tinggi': return 'T';
  }
}

export function convertStatusBbTbToCode(label: 'Sangat Kurus' | 'Kurus' | 'Normal' | 'Gemuk'): 'SK' | 'K' | 'N' | 'G' {
  switch (label) {
    case 'Sangat Kurus': return 'SK';
    case 'Kurus': return 'K';
    case 'Normal': return 'N';
    case 'Gemuk': return 'G';
  }
}
