/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 7. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Orta nokta nerede?', en: 'Where is the midpoint?',
      note: 'A köşesinden BC kenarına kenarortay çizmek istiyoruz. Kenarortay BC’nin orta noktasına gider. Orta noktayı ölçmeden bulabilir miyiz?' },
    { scene: 2, start: 10.8, end: 18.0, tr: 'Orta dikmeyi hatırla', en: 'Recall the perpendicular bisector',
      note: 'Orta dikme inşasını hatırlayalım: P ve Q merkezli, aynı açıklıkta iki yay çizelim. Yaylar iki noktada kesişir; bu noktaları birleştirelim.' },
    { scene: 2, start: 18.2, end: 27.8, tr: 'PM = MQ', en: 'PM = MQ',
      note: 'Orta dikme PQ’yu M noktasında ikiye böler: PM eşittir MQ. Orta noktayı ölçmeden bulduk.' },
    { scene: 3, start: 28.8, end: 37.2, tr: 'BC’nin orta dikmesi', en: 'The perpendicular bisector of BC',
      note: 'Şimdi aynı adımları üçgenin BC kenarına uygulayalım. Orta dikme BC’yi K noktasında keser: BK eşittir KC.' },
    { scene: 3, start: 37.4, end: 45.8, tr: 'AK kenarortay', en: 'AK is the median',
      note: 'A ile K’yi birleştirelim: AK, A köşesinden çizilen kenarortaydır.' },
    { scene: 4, start: 46.8, end: 58.8, tr: 'Diğer kenarlar', en: 'The other sides',
      note: 'Aynı yöntemi AC ve AB kenarlarına uygulayalım: orta noktalar L ve N. BL ve CN de kenarortay.' },
    { scene: 4, start: 59.0, end: 63.8, tr: 'Üçü bir noktada', en: 'All three at one point',
      note: 'Üç kenarortay aynı noktada kesişti: G. Yöntem her kenarda işliyor.' },
    { scene: 5, start: 64.8, end: 73.8, tr: 'Geniş açılı üçgen', en: 'An obtuse triangle',
      note: 'Başka bir üçgende deneyelim: B açısı geniş. Yine BC’nin orta dikmesini çizip K’yi bulalım.' },
    { scene: 5, start: 74.0, end: 79.8, tr: 'Kontrol: BK = KC', en: 'Check: BK = KC',
      note: 'BK eşittir KC; AK yine kenarortay. Yöntem her üçgende işliyor.' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'Orta dikme + köşe', en: 'Bisector plus vertex',
      note: 'Aklında kalsın: kenarın orta dikmesini çiz, kestiği noktayı karşı köşeyle birleştir.' },
    { scene: 6, start: 86.8, end: 91.0, tr: 'Kenarortay hazır!', en: 'The median is ready!',
      note: 'İşte kenarortay!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
