'use client';

import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import { Hash, Calendar } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';


function sanitizeWinAnsi(s: string) {
  return (s ?? '')
    .replaceAll('≥', '>=')
    .replaceAll('≤', '<=')
    .replaceAll('–', '-')
    .replaceAll('—', '-')
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll('‘', "'")
    .replaceAll('’', "'")
    .replaceAll('…', '...')
    .replaceAll('º', 'o')
    .replaceAll('ª', 'a');
}

type ChecklistItem = {
  code: string;
  label: string;
  si: boolean;
  no: boolean;
  cantidad: string;
  caducidad: string; // YYYY-MM-DD
};

const DEFAULT_ITEMS: ChecklistItem[] = [
  // A.1 / A.1.1
  { code: 'A.1.1.1', label: 'Cinturones de seguridad en todos los asientos;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.1.1.2', label: 'Equipo básico de herramientas de mano;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.1.1.3', label: 'Equipo básico de señalización que incluya traficonos y triángulos reflejantes;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.1.1.4', label: 'Juego de cables pasa-corriente;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.1.1.5', label: 'Lámpara portátil de emergencia;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.1.1.6', label: 'Neumático de refacción con accesorios (gato y llave de cruz);', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.1.1.7', label: 'Un extintor contra fuego tipo ABC, como mínimo.', si: false, no: false, cantidad: '', caducidad: '' },

  // A.2
  { code: 'A.2.1', label: 'Reanimadores tipo bolsa con válvula de no reinhalación, con vías de entrada de oxígeno, dispositivo de concentración y válvulas de liberación (neonato 250 ml, lactante 500 ml, pediátrico 750 ml, adulto 1000 ml) + mascarillas 0,1,2,3,4,5;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.2', label: 'Camilla rígida con sistema de sujeción;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.3', label: 'Carro camilla;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.4', label: 'Esfigmomanómetro aneroide con brazaletes para adulto y pediátrico;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.5', label: 'Estetoscopio biauricular;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.6', label: 'Equipo de aspiración de secreciones fijo o portátil;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.7', label: 'Equipo de cánulas orofaríngeas en tamaños: prematuro, neonatal, infantil, pediátrica y adulto;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.8', label: 'Gancho portasuero doble;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.9', label: 'Glucómetro o sustituto tecnológico;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.10', label: 'Mascarillas con filtro HEPA o N95;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.11', label: 'Tanque de oxígeno fijo (≥ 3 m³) con manómetro de alta presión, flujómetro 2–15 L/min y salida para humidificador;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.12', label: 'Tanque de oxígeno portátil tamaño “D” con manómetro, regulador y flujómetro 2–15 L/min o mayor;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.2.13', label: 'Termómetro digital o sustituto tecnológico.', si: false, no: false, cantidad: '', caducidad: '' },

  // A.3
  { code: 'A.3.1', label: 'Apósitos, gasas estériles y no estériles;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.2', label: 'Cobertores;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.3', label: 'Catéteres venosos cortos estériles (calibres 12 a 24) para terapia IV periférica;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.4', label: 'Cómodo;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.5', label: 'Contenedor rígido rojo para punzocortante, bolsa roja y bolsa amarilla para RPBI;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.6', label: 'Desinfectante para manos;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.7', label: 'Desinfectante para equipos y superficies;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.8', label: 'Equipo desechable para venoclisis con normogotero y microgotero;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.9', label: 'Guantes estériles, no estériles y cubre bocas;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.10', label: 'Jabón quirúrgico;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.11', label: 'Jeringas desechables 3, 5, 10 y 20 ml y agujas 20×32 o 22×32;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.12', label: 'Jeringas con aguja para insulina;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.13', label: 'Ligaduras;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.14', label: 'Pato orinal;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.15', label: 'Puntas nasales para oxígeno, mascarilla con bolsa reservorio y mascarilla simple (adulto y pediátrico);', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.16', label: 'Riñón;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.17', label: 'Sábanas;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.18', label: 'Sondas de aspiración suaves;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.19', label: 'Tela adhesiva;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.20', label: 'Torundas secas y torundas con alcohol;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.3.21', label: 'Vendas elásticas de 5, 10, 20 y 30 cm de ancho.', si: false, no: false, cantidad: '', caducidad: '' },

  // A.4
  { code: 'A.4.1', label: 'Cloruro de sodio (solución al 0.9%);', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.4.2', label: 'Electrolitos orales;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.4.3', label: 'Glucosa (solución al 5%);', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'A.4.4', label: 'Solución Hartman.', si: false, no: false, cantidad: '', caducidad: '' },

  // B.1
  { code: 'B.1.1', label: 'Equipo para comunicación funcionando.', si: false, no: false, cantidad: '', caducidad: '' },

  // B.2
  { code: 'B.2.1', label: 'Collarines rígidos: chico, mediano y grande;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.2', label: 'Cánulas nasofaríngeas;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.3', label: 'Dispositivo para inmovilizar la cabeza;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.4', label: 'Desfibrilador automatizado externo;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.5', label: 'Dispositivo de estabilización pélvica o elemento sustituto;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.6', label: 'Estetoscopio de Pinard o sustituto tecnológico;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.7.1', label: 'Dos pinzas tipo Rochester;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.7.2', label: 'Onfalotomo;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.7.3', label: 'Tijera tipo Mayo;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.7.4', label: 'Cinta umbilical o similar;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.7.5', label: 'Perilla para aspiración;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.7.6', label: 'Campos quirúrgicos y bata quirúrgica, desechables;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.8', label: 'Férulas para miembros torácicos y pélvicos;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.9', label: 'Oxímetro de pulso;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.10', label: 'Sistema de inmovilización pediátrica;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.2.11', label: 'Tabla corta con sistema de sujeción o chaleco de extracción.', si: false, no: false, cantidad: '', caducidad: '' },

  // B.3
  { code: 'B.3.1', label: 'Bolsa amarilla para RPBI;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.3.2', label: 'Cánula de Yankauer;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.3.3', label: 'Guía para identificación de materiales peligrosos;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.3.4', label: 'Rastrillo desechable para afeitar;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.3.5', label: 'Sábana térmica;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.3.6', label: 'Sábana para quemados;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.3.7', label: 'Elementos materiales para clasificación de lesionados (triage).', si: false, no: false, cantidad: '', caducidad: '' },

  // B.4 (Medicamentos y soluciones)
  { code: 'B.4.1.1', label: 'Ácido acetilsalicílico, tabletas;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.4.1.2', label: 'Isosorbida, tabletas;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.4.1.3', label: 'Trinitrato de glicerilo, perlas sublinguales;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.4.1.4', label: 'Antihipertensivos;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'B.4.2.1', label: 'Adrenalina, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.4.2.2', label: 'Atropina, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'B.4.2.3', label: 'Epinefrina, solución inyectable o sustituto tecnológico;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'B.4.3.1', label: 'Dextrosa al 50 %;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'B.4.4.1', label: 'Salbutamol, aerosol;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'B.4.5', label: 'Hidrocortisona;', si: false, no: false, cantidad: '', caducidad: '' },

  // C.1
  { code: 'C.1.1', label: 'Desfibrilador-monitor (registro de signos vitales) y marcapaso externo;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.1.2', label: 'Estilete para tubo endotraqueal: neonatal, infantil, pediátrico y adulto;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.1.3', label: 'Estuche de diagnóstico básico (mango, oftalmoscopio con luz, selector de aperturas y lentes, otoscopio con luz y conos reutilizables);', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.1.4', label: 'Equipo para infusión intraósea;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.1.5', label: 'Laringoscopios adulto y pediátrico con hojas rectas 0,1,2,3,4 y hojas curvas 1,2,3,4;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.1.6', label: 'Micro-nebulizador o sustituto tecnológico;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.1.7', label: 'Pinzas de Magill adulto y pediátrica;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.1.8', label: 'Ventilador de traslado pediátrico-adulto.', si: false, no: false, cantidad: '', caducidad: '' },

  // C.2
  { code: 'C.2.1', label: 'Electrodos de parche autoadheribles (adulto y pediátrico) + electrodos para marcapaso transcutáneo compatibles;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.2.2', label: 'Equipo invasivo para la vía aérea: mascarilla laríngea u otros;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.2.3', label: 'Jalea lubricante hidrosoluble y pasta conductiva para monitoreo electrocardiográfico;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.2.4', label: 'Sondas de Nelaton, Levin y Foley con bolsas para recolección;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.2.5', label: 'Tubos endotraqueales adulto con globo (alto volumen / baja presión) con válvula conector y escala (6.0–9.0);', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.2.6', label: 'Tubos endotraqueales pediátricos sin globo con válvula conector y escala (2.0–5.5).', si: false, no: false, cantidad: '', caducidad: '' },

  // C.3

  { code: 'C.3.1.1', label: 'Ketorolaco, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.3.1.2', label: 'Metamizol, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.3.1.3', label: 'Clorhidrato de Nalbufina, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'C.3.2.1', label: 'Midazolam, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'C.3.3.1', label: 'Captopril o Enalapril, tabletas;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'C.3.4.1', label: 'Hidrocortisona, solución inyectable o genérico alterno;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'C.3.5.1', label: 'Butilhioscina, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.3.5.2', label: 'Difenidol, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },
  { code: 'C.3.5.3', label: 'Ranitidina, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'C.3.6.1', label: 'Hidralazina, solución inyectable;', si: false, no: false, cantidad: '', caducidad: '' },

  { code: 'C.3.7.1', label: 'Diazepam, solución inyectable.', si: false, no: false, cantidad: '', caducidad: '' },

  // D.1
  { code: 'D.1.1.1', label: 'Haloperidol, solución inyectable.', si: false, no: false, cantidad: '', caducidad: '' },
];



function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatESLong(iso: string) {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatESShort(iso: string) {
  if (!iso) return '';
  // ejemplo: 03-julio-2029
  const d = new Date(iso + 'T00:00:00');
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('es-MX', { month: 'long' });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// ✅ Dibuja un check “bonito” (sin depender de emojis)
function drawCheckMark(page: any, x: number, y: number, size = 10) {
  // una “palomita” con 2 líneas
  page.drawLine({ start: { x, y }, end: { x: x + size * 0.35, y: y - size * 0.35 }, thickness: 2, color: rgb(0, 0, 0) });
  page.drawLine({
    start: { x: x + size * 0.35, y: y - size * 0.35 },
    end: { x: x + size, y: y + size * 0.55 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
}

export default function CheckListFormPDF() {
  const [unit, setUnit] = useState('01');
  const [fecha] = useState(() => todayISO());
  const [items, setItems] = useState<ChecklistItem[]>(() => DEFAULT_ITEMS);

  const sigRespRef = useRef<SignatureCanvas>(null);
  const sigCoordRef = useRef<SignatureCanvas>(null);

  const fechaLabel = useMemo(() => formatESLong(fecha), [fecha]);

  const updateItem = (idx: number, patch: Partial<ChecklistItem>) => {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const resetAll = () => {
    setUnit('01');
    setItems(DEFAULT_ITEMS);
    sigRespRef.current?.clear();
    sigCoordRef.current?.clear();
  };

  /**
   * ⚠️ IMPORTANTE:
   * - Pon tu plantilla en /public como: /plantilla-checklist.pdf
   * - Ajusta coordenadas X/Y abajo para que caiga EXACTO en tu diseño.
   */
  const handleGeneratePDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0, 0, 0);

  // Helpers
  const drawText = (page: any, text: string, x: number, y: number, size = 10, bold = false) => {
    page.drawText(sanitizeWinAnsi(text ?? ''), {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color: black,
    });
  };

  const textWidth = (text: string, size: number, bold = false) => {
    const f = bold ? fontBold : font;
    return f.widthOfTextAtSize(sanitizeWinAnsi(text ?? ''), size);
  };

  // Wrap simple por palabras (para la columna EQUIPO)
  const wrapText = (text: string, maxWidth: number, size: number) => {
    const words = (sanitizeWinAnsi(text ?? '')).split(/\s+/);
    const lines: string[] = [];
    let current = '';

    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w;
      if (textWidth(candidate, size, false) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const drawCheck = (page: any, x: number, y: number, size = 10) => {
    // y aquí es el “centro” del check
    page.drawLine({ start: { x, y }, end: { x: x + size * 0.35, y: y - size * 0.35 }, thickness: 2, color: black });
    page.drawLine({
      start: { x: x + size * 0.35, y: y - size * 0.35 },
      end: { x: x + size, y: y + size * 0.55 },
      thickness: 2,
      color: black,
    });
  };

  // Layout A4
  const PAGE_W = PageSizes.A4[0];
  const PAGE_H = PageSizes.A4[1];

  const M = 36; // margen
  const headerTopY = PAGE_H - M;

  // Tabla
  const tableX = M;
  const tableW = PAGE_W - M * 2;

  // Anchos columna (ajusta si quieres)
  const wEquipo = Math.floor(tableW * 0.58);
  const wSi = Math.floor(tableW * 0.07);
  const wNo = Math.floor(tableW * 0.07);
  const wCant = Math.floor(tableW * 0.12);
  const wCad = tableW - (wEquipo + wSi + wNo + wCant);

  const colX = {
    equipo: tableX,
    si: tableX + wEquipo,
    no: tableX + wEquipo + wSi,
    cant: tableX + wEquipo + wSi + wNo,
    cad: tableX + wEquipo + wSi + wNo + wCant,
    right: tableX + tableW,
  };

  const rowH = 34;          // altura base de fila
  const headerRowH = 34;    // altura header tabla
  const padding = 8;

  // Título/encabezado superior
  const buildPage = () => {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

    drawText(page, 'AmbulanciasTVR CHECK LIST', M, headerTopY - 18, 16, true);
    drawText(page, `Ambulancia: ${unit}`, M, headerTopY - 40, 11, true);
    drawText(page, `Fecha: ${formatESShort(fecha)}`, M + 170, headerTopY - 40, 11, false);

    return page;
  };

  let page = buildPage();

  // Punto de inicio de tabla (debajo del header)
  let cursorY = headerTopY - 70;

  const drawTableHeader = () => {
    const yTop = cursorY;
    const yBottom = cursorY - headerRowH;

    // Caja header
    page.drawRectangle({ x: tableX, y: yBottom, width: tableW, height: headerRowH, borderColor: black, borderWidth: 1 });

    // Líneas verticales
    page.drawLine({ start: { x: colX.si, y: yBottom }, end: { x: colX.si, y: yTop }, thickness: 1, color: black });
    page.drawLine({ start: { x: colX.no, y: yBottom }, end: { x: colX.no, y: yTop }, thickness: 1, color: black });
    page.drawLine({ start: { x: colX.cant, y: yBottom }, end: { x: colX.cant, y: yTop }, thickness: 1, color: black });
    page.drawLine({ start: { x: colX.cad, y: yBottom }, end: { x: colX.cad, y: yTop }, thickness: 1, color: black });

    // Textos header centrados
    drawText(page, '', colX.equipo + padding, yBottom + 10, 12, true);

    const centerText = (label: string, xLeft: number, w: number) => {
      const size = 12;
      const tw = textWidth(label, size, true);
      const x = xLeft + (w - tw) / 2;
      drawText(page, label, x, yBottom + 10, size, true);
    };

    centerText('Si', colX.si, wSi);
    centerText('No', colX.no, wNo);
    centerText('Cantidad', colX.cant, wCant);
    centerText('Caducidad', colX.cad, wCad);

    cursorY = yBottom; // baja después del header
  };

  const ensureSpace = (neededH: number) => {
  // Solo margen normal (sin reservar firmas)
  const bottomLimit = M + 20;

  if (cursorY - neededH < bottomLimit) {
    page = buildPage();
    cursorY = headerTopY - 70;
    drawTableHeader();
  }
};


  drawTableHeader();

  // Dibujar filas
  for (const it of items) {
    // Wrap en EQUIPO (code+label)
    const labelLines = wrapText(it.label, wEquipo - (padding * 2 + 52), 9);
    const linesCount = Math.max(1, labelLines.length);
    const rowHeight = Math.max(rowH, 14 + linesCount * 11);

    ensureSpace(rowHeight);

    const yTop = cursorY;
    const yBottom = cursorY - rowHeight;

    // Caja fila
    page.drawRectangle({ x: tableX, y: yBottom, width: tableW, height: rowHeight, borderColor: black, borderWidth: 1 });

    // Verticales
    page.drawLine({ start: { x: colX.si, y: yBottom }, end: { x: colX.si, y: yTop }, thickness: 1, color: black });
    page.drawLine({ start: { x: colX.no, y: yBottom }, end: { x: colX.no, y: yTop }, thickness: 1, color: black });
    page.drawLine({ start: { x: colX.cant, y: yBottom }, end: { x: colX.cant, y: yTop }, thickness: 1, color: black });
    page.drawLine({ start: { x: colX.cad, y: yBottom }, end: { x: colX.cad, y: yTop }, thickness: 1, color: black });

    // EQUIPO: code bold + label multi-línea
    const baseTextY = yTop - 14;
    drawText(page, it.code, colX.equipo + padding, baseTextY, 10, true);

    const labelX = colX.equipo + padding + 52;
    let ly = baseTextY;
    for (const ln of labelLines) {
      drawText(page, ln, labelX, ly, 9, false);
      ly -= 11;
    }

    // SI/NO checks centrados
    const midY = yBottom + rowHeight / 2;
    if (it.si) drawCheck(page, colX.si + wSi / 2 - 6, midY - 1, 12);
    if (it.no) drawCheck(page, colX.no + wNo / 2 - 6, midY - 1, 12);

    // Cantidad
    if (it.cantidad) {
      drawText(page, it.cantidad, colX.cant + padding, baseTextY, 9, false);
    }

    // Caducidad
    if (it.caducidad) {
      drawText(page, formatESShort(it.caducidad), colX.cad + padding, baseTextY, 9, false);
    }

    cursorY = yBottom; // siguiente fila
  }

  // Firmas (en la última página). Si no hay espacio, crea página nueva.
  const drawSignatures = async () => {
  const blockH = 140;
  const bottomLimit = M + 20;

  // Si NO cabe el bloque de firmas en esta página, crea una página nueva SOLO para firmas
  if (cursorY - blockH < bottomLimit) {
    page = buildPage();
    cursorY = headerTopY - 70;

    // (opcional) NO dibujamos tabla header aquí
    // Si quieres un mini título de "Firmas":
    drawText(page, 'Firmas', M, cursorY - 10, 12, true);
  }

  const sigTopY = M + 130;

  drawText(page, 'Responsable de turno', M, sigTopY + 20  , 10, true);
  drawText(page, 'Coordinador operativo / Director General', M + 280, sigTopY + 20 , 10, true);

  page.drawLine({ start: { x: M, y: sigTopY + 40 }, end: { x: M + 240, y: sigTopY + 40 }, thickness: 1, color: rgb(0,0,0) });
  page.drawLine({ start: { x: M + 280, y: sigTopY + 40 }, end: { x: M + 520, y: sigTopY + 40 }, thickness: 1, color: rgb(0,0,0) });

  const resp = sigRespRef.current;
  if (resp && !resp.isEmpty()) {
    const dataUrl = resp.getCanvas().toDataURL('image/png');
    const bytes = await fetch(dataUrl).then(r => r.arrayBuffer());
    const img = await pdfDoc.embedPng(bytes);
    const dims = img.scale(0.45);
    page.drawImage(img, { x: M, y: sigTopY + 45, width: dims.width, height: dims.height });
  }

  const coord = sigCoordRef.current;
  if (coord && !coord.isEmpty()) {
    const dataUrl = coord.getCanvas().toDataURL('image/png');
    const bytes = await fetch(dataUrl).then(r => r.arrayBuffer());
    const img = await pdfDoc.embedPng(bytes);
    const dims = img.scale(0.45);
    page.drawImage(img, { x: M + 280, y: sigTopY + 45, width: dims.width, height: dims.height });
  }
};


  await drawSignatures();

  // Descargar
 const pdfBytes = await pdfDoc.save(); // Uint8Array
const arrayBuffer = pdfBytes.slice().buffer; // <- fuerza ArrayBuffer (copia)
const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `checklist_unidad_${unit}_${fecha}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};


  return (
    <motion.div
      className="p-4 max-w-6xl mx-auto bg-white shadow-md rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className="text-2xl font-bold mb-2">AmbulanciasTVR Check List</h1>
      <p className="text-sm text-gray-600 mb-6">Para llenar</p>

      {/* Header fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <label className="flex flex-col">
          <span className="flex items-center gap-2 mb-1">
            <Hash size={16} /> Unidad
          </span>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="p-2 border rounded">
            {Array.from({ length: 11 }, (_, i) => String(i + 1).padStart(2, '0')).map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="flex items-center gap-2 mb-1">
            <Calendar size={16} /> Fecha (automática)
          </span>
          <input value={fechaLabel} disabled className="p-2 border rounded bg-gray-50" />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b">EQUIPO</th>
              <th className="text-center p-3 border-b w-[90px]">SI</th>
              <th className="text-center p-3 border-b w-[90px]">NO</th>
              <th className="text-center p-3 border-b w-[180px]">Cantidad</th>
              <th className="text-center p-3 border-b w-[220px]">Caducidad</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.code} className="align-top">
                <td className="p-3 border-b">
                  <span className="font-semibold mr-2">{it.code}</span>
                  <span>{it.label}</span>
                </td>

                <td className="p-3 border-b text-center">
                  <input
                    type="checkbox"
                    checked={it.si}
                    onChange={(e) => updateItem(idx, { si: e.target.checked, no: e.target.checked ? false : it.no })}
                    className="h-5 w-5"
                  />
                </td>

                <td className="p-3 border-b text-center">
                  <input
                    type="checkbox"
                    checked={it.no}
                    onChange={(e) => updateItem(idx, { no: e.target.checked, si: e.target.checked ? false : it.si })}
                    className="h-5 w-5"
                  />
                </td>

                <td className="p-3 border-b">
                  <input
                    value={it.cantidad}
                    onChange={(e) => updateItem(idx, { cantidad: e.target.value })}
                    placeholder="Ej: 9 piezas"
                    className="w-full p-2 border rounded"
                  />
                </td>

                <td className="p-3 border-b">
                  <input
                    type="date"
                    value={it.caducidad}
                    onChange={(e) => updateItem(idx, { caducidad: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                  {it.caducidad && (
                    <div className="text-xs text-gray-500 mt-1">{formatESShort(it.caducidad)}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <p className="font-semibold mb-2">Responsable de turno</p>
          <SignatureCanvas
            ref={sigRespRef}
            penColor="black"
            canvasProps={{
              width: 520,
              height: 200,
              className: 'border rounded bg-white w-full',
            }}
          />
          <button type="button" onClick={() => sigRespRef.current?.clear()} className="mt-2 px-4 py-2 border rounded hover:bg-gray-50">
            Borrar firma
          </button>
        </div>

        <div>
          <p className="font-semibold mb-2">Coordinador operativo / Director General</p>
          <SignatureCanvas
            ref={sigCoordRef}
            penColor="black"
            canvasProps={{
              width: 520,
              height: 200,
              className: 'border rounded bg-white w-full',
            }}
          />
          <button type="button" onClick={() => sigCoordRef.current?.clear()} className="mt-2 px-4 py-2 border rounded hover:bg-gray-50">
            Borrar firma
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <button type="button" onClick={resetAll} className="px-4 py-2 border rounded-2xl hover:bg-gray-50">
          Resetear
        </button>
        <button
          type="button"
          onClick={handleGeneratePDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700"
        >
          Generar PDF
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Nota: Si el texto/checkbox no cae EXACTO en tu plantilla, ajusta las coordenadas dentro de <code>POS</code>.
      </p>
    </motion.div>
  );
}
