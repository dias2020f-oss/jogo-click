import type { GameState, InventoryItem } from './types';
import { itemsDB, classesDB, setsDB, gemsDB, petsDB } from './data';

export interface CalcStats {
  atk: number;
  matk: number;
  def: number;
  maxHp: number;
  maxMp: number;
  flee: number;
  hit: number;
  cri: number;
  element: string | null;
}

export function getCalculatedStats(state: GameState): CalcStats {
  const { hero, equipment, activeBuffs } = state;

  const hStr = hero.str || 1;
  const hAgi = hero.agi || 1;
  const hVit = hero.vit || 1;
  const hInt = hero.int || 1;
  const hDex = hero.dex || 1;
  const hLuk = hero.luk || 1;

  let atk = hero.baseAtk + hStr * 2;
  let matk = hInt * 2;
  let def = hero.baseDef + Math.floor(hVit * 1.5);
  let maxHp = hero.baseMaxHp + hVit * 15;
  let maxMp = hero.baseMaxMp + hInt * 10;
  let flee = hAgi * 2;
  let hit = hDex * 2;
  let cri = hLuk * 0.5;
  let element: string | null = null;

  // Class bonuses
  const cls = classesDB[hero.job];
  if (cls) {
    atk += cls.b_atk || 0;
    def += cls.b_def || 0;
    maxHp += cls.b_hp || 0;
    maxMp += cls.b_mp || 0;
    if (['arqueiro', 'cacador', 'atirador'].includes(hero.job)) {
      atk += hDex * 2;
    }
  }

  // Equipment bonuses
  const eqItems: (InventoryItem | null)[] = [equipment.weapon, equipment.armor, equipment.acc1, equipment.acc2];

  eqItems.forEach(equippedItem => {
    if (!equippedItem) return;
    const template = itemsDB[equippedItem.templateId || equippedItem.id] || {};
    const item = { ...template, ...equippedItem };

    if (item.atk) { atk += item.atk; matk += Math.floor(item.atk * 0.5); }
    if (item.def) def += item.def;
    if (item.hp) maxHp += item.hp;
    if (item.mp) maxMp += item.mp;
    if (item.flee) flee += item.flee;
    if (item.cri) cri += item.cri;
    if (item.type === 'weapon' && item.element) element = item.element;

    if (item.sockets) {
      item.sockets.forEach((gem: { id: string; level: number } | null) => {
        if (!gem) return;
        const gData = gemsDB[gem.id];
        if (!gData) return;
        const val = gem.level <= 3 ? gem.level * 5 : 15 + (gem.level - 3) * 5;
        if (gData.stat === 'str') atk += val * 2;
        if (gData.stat === 'int') { matk += val * 2; maxMp += val * 10; }
        if (gData.stat === 'vit') { def += Math.floor(val * 1.5); maxHp += val * 15; }
        if (gData.stat === 'agi') flee += val * 2;
        if (gData.stat === 'dex') {
          hit += val * 2;
          if (['arqueiro', 'cacador', 'atirador'].includes(hero.job)) atk += val * 2;
        }
        if (gData.stat === 'luk') cri += val * 0.5;
      });
    }
  });

  // Set bonuses
  const equippedSets: Record<string, number> = {};
  eqItems.forEach(equippedItem => {
    if (!equippedItem) return;
    const template = itemsDB[equippedItem.templateId || equippedItem.id];
    if (template?.setId) {
      equippedSets[template.setId] = (equippedSets[template.setId] || 0) + 1;
    }
  });

  let setAtkMult = 1;
  let setDefMult = 1;

  Object.keys(equippedSets).forEach(setId => {
    const count = equippedSets[setId];
    const setDef = setsDB[setId];
    if (!setDef) return;
    if (count >= 2 && setDef.bonuses[2]) {
      const b = setDef.bonuses[2];
      if (b.type === 'atk') atk += b.val;
      if (b.type === 'matk') matk += b.val;
      if (b.type === 'def') def += b.val;
      if (b.type === 'hp') maxHp += b.val;
    }
    if (count >= 3 && setDef.bonuses[3]) {
      const b = setDef.bonuses[3];
      if (b.type === 'atk') atk += b.val;
      if (b.type === 'matk') matk += b.val;
      if (b.type === 'def') def += b.val;
      if (b.type === 'hp') maxHp += b.val;
    }
    if (count >= 4 && setDef.bonuses[4]) {
      const b = setDef.bonuses[4];
      if (b.type === 'atkMult') setAtkMult *= b.val;
      if (b.type === 'defMult') setDefMult *= b.val;
    }
  });

  // Pet bonuses
  if (state.pet.active) {
    const p = petsDB.find(x => x.id === state.pet.active);
    if (p) {
      atk = Math.floor(atk * (p.baseBuffAtk || 1));
      matk = Math.floor(matk * (p.baseBuffAtk || 1));
    }
  }

  // Active buffs (clean expired ones first)
  const now = Date.now();
  let atkMult = 1;
  let defMult = 1;
  activeBuffs.forEach(b => {
    if (b.expireTime > now) {
      if (b.type === 'atk') atkMult *= b.mult;
      if (b.type === 'def') defMult *= b.mult;
    }
  });

  atk = Math.floor(atk * atkMult * setAtkMult);
  matk = Math.floor(matk * atkMult * setAtkMult);
  def = Math.floor(def * defMult * setDefMult);

  return { atk, matk, def, maxHp, maxMp, flee, hit, cri, element };
}

export function getAttributeCost(val: number): number {
  return Math.floor(val / 10) + 1;
}
