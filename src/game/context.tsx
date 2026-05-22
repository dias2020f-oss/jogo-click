import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import type { GameState, Monster, InventoryItem, StatKey } from './types';
import {
  INITIAL_STATE, monstersDB, bossesDB, mapsDB, classesDB, classTree,
  skillsDB, petsDB, questsDB, itemsDB, prefixesDB, suffixesDB, setsDB, getRandomElement,
} from './data';
import { getCalculatedStats } from './engine';
import { toast } from 'sonner';

const SAVE_KEY = 'ragnarok_ultimate_save';

export interface DamagePop {
  id: number;
  text: string;
  type: 'hit' | 'auto' | 'heal' | 'info' | 'crit';
  x: number;
  y: number;
}

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  activeTab: string;
  setActiveTab: (t: string) => void;
  damagePops: DamagePop[];
  avatarAnim: string;
  monsterAnim: string;
  bonusBanner: { visible: boolean; zeny: number; xp: number };
  bossModalVisible: boolean;
  setBossModalVisible: (v: boolean) => void;
};

export type Action =
  | { type: 'MANUAL_ATTACK' }
  | { type: 'AUTO_ATTACK_TICK' }
  | { type: 'MONSTER_ATTACK_TICK' }
  | { type: 'MP_REGEN_TICK' }
  | { type: 'PET_ATTACK_TICK' }
  | { type: 'CLEAN_BUFFS' }
  | { type: 'TOGGLE_AUTO' }
  | { type: 'USE_SKILL'; index: number }
  | { type: 'EQUIP_SKILL'; skillId: string }
  | { type: 'UNEQUIP_SKILL'; index: number }
  | { type: 'CHANGE_MAP'; dir: number }
  | { type: 'SELECT_MONSTER'; monsterId: string }
  | { type: 'SPAWN_MONSTER' }
  | { type: 'START_BOSS_FIGHT' }
  | { type: 'SKIP_BOSS' }
  | { type: 'EQUIP_ITEM'; invId: string }
  | { type: 'UNEQUIP_SLOT'; slot: 'weapon' | 'armor' | 'acc1' | 'acc2' }
  | { type: 'USE_ITEM'; invId: string }
  | { type: 'SELL_ITEM'; invId: string }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'ADD_STAT'; stat: StatKey }
  | { type: 'CHANGE_CLASS'; classId: string }
  | { type: 'EQUIP_PET'; petId: string }
  | { type: 'ACCEPT_QUEST'; questId: string }
  | { type: 'COMPLETE_QUEST'; questId: string }
  | { type: 'CLAIM_ACHIEVEMENT'; achId: string }
  | { type: 'ENTER_DUNGEON' }
  | { type: 'EXIT_DUNGEON' }
  | { type: 'ENTER_RIFT' }
  | { type: 'EXIT_RIFT' }
  | { type: 'DO_REBORN' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SAVE_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_SAVE'; saved: Partial<GameState> };

let popId = 0;

type EffectQueue = Array<{ kind: 'pop'; pop: DamagePop } | { kind: 'avatarAnim'; anim: string } | { kind: 'monsterAnim' } | { kind: 'bonusBanner'; zeny: number; xp: number } | { kind: 'bossModal' }>;

function spawnMonsterFromState(state: GameState): Monster {
  const { isDungeon, dungeonPhase, progress } = state;
  const mapMonsters = monstersDB.filter(m => m.mapIdx === progress.currentMapIdx);
  let template: Monster;

  if (isDungeon) {
    const idx = Math.floor(progress.monstersInCurrentMap / 3) % monstersDB.length;
    template = monstersDB[idx];
  } else {
    const totalMonsters = mapMonsters.length || 1;
    const idx = Math.floor(progress.monstersInCurrentMap / 3) % totalMonsters;
    template = mapMonsters[idx] || mapMonsters[0] || monstersDB[0];
  }

  const monster: Monster = JSON.parse(JSON.stringify(template));
  if (!monster.element) monster.element = getRandomElement();

  let diffMult = 1 + progress.completedCycles * 0.5;
  if (isDungeon) {
    diffMult = 2 + dungeonPhase * 2.5;
    monster.exp = 1;
    monster.zeny = Math.floor(monster.zeny * 10 * dungeonPhase);
  } else {
    monster.exp = Math.floor(monster.exp * (1 + progress.completedCycles * 0.2));
    monster.zeny = Math.floor(monster.zeny * (1 + progress.completedCycles * 0.2));
  }

  monster.hp = Math.floor(monster.hp * diffMult);
  monster.maxHp = monster.hp;
  monster.atk = Math.floor(monster.atk * diffMult);
  monster.def = Math.floor(monster.def * diffMult);

  return monster;
}

function checkDrop(state: GameState, isBoss: boolean): { newItem: InventoryItem | null; petDrop: string | null } {
  if (state.hero.lv >= 25 && Math.random() < (isBoss ? 0.3 : 0.05)) {
    const petTemplate = petsDB[Math.floor(Math.random() * petsDB.length)];
    const existing = state.pet.collection.find(p => p.id === petTemplate.id);
    if (!existing) return { newItem: null, petDrop: petTemplate.name };
  }

  const dropChance = isBoss ? 0.3 : 0.05;
  if (Math.random() >= dropChance) return { newItem: null, petDrop: null };

  let rarity: 1 | 2 | 3 | 4 = 1;
  const r = Math.random();
  if (r < 0.05) rarity = 4;
  else if (r < 0.20) rarity = 3;
  else if (r < 0.50) rarity = 2;

  const possibleTemplates = Object.values(itemsDB).filter(
    i => (i.type === 'weapon' || i.type === 'armor' || i.type === 'consumable') && (i.rarity as number) <= rarity
  );
  if (!possibleTemplates.length) return { newItem: null, petDrop: null };

  const template = possibleTemplates[Math.floor(Math.random() * possibleTemplates.length)];
  const dropObj: InventoryItem = { id: template.id, qty: 1 };

  if (template.type === 'weapon' || template.type === 'armor') {
    dropObj.id = `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    dropObj.templateId = template.id;
    let modAtk = 0, modDef = 0, modHp = 0, modMp = 0;
    let finalName = template.name;
    let element: string | undefined;

    if (rarity >= 2 && Math.random() < 0.5) {
      const prefix = prefixesDB[Math.floor(Math.random() * prefixesDB.length)];
      finalName = prefix.name + ' ' + finalName;
      if (prefix.stat === 'atk') modAtk += prefix.val;
      if (prefix.stat === 'def') modDef += prefix.val;
      if (prefix.element) element = prefix.element;
    }
    if (rarity >= 3 && Math.random() < 0.5) {
      const suffix = suffixesDB[Math.floor(Math.random() * suffixesDB.length)];
      finalName = finalName + ' ' + suffix.name;
      if (suffix.stat === 'atk') modAtk += suffix.val;
      if (suffix.stat === 'def') modDef += suffix.val;
      if (suffix.stat === 'hp') modHp += suffix.val;
      if (suffix.stat === 'mp') modMp += suffix.val;
    }

    dropObj.name = finalName;
    if (template.atk) dropObj.atk = template.atk + modAtk;
    if (template.def) dropObj.def = template.def + modDef;
    if (modHp > 0) dropObj.hp = (template.hp || 0) + modHp;
    if (modMp > 0) dropObj.mp = (template.mp || 0) + modMp;
    if (element) dropObj.element = element;
    dropObj.rarity = rarity;
  }

  return { newItem: dropObj, petDrop: null };
}

function gameReducer(state: GameState, action: Action): [GameState, EffectQueue] {
  const effects: EffectQueue = [];

  const addPop = (text: string, type: DamagePop['type'] = 'hit') => {
    effects.push({
      kind: 'pop',
      pop: {
        id: ++popId,
        text,
        type,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 30,
      },
    });
  };

  switch (action.type) {
    case 'LOAD_SAVE': {
      return [{ ...state, ...action.saved }, effects];
    }

    case 'SPAWN_MONSTER': {
      if (state.isBossFight) return [state, effects];
      const monster = spawnMonsterFromState(state);
      const kills = state.progress.monstersInCurrentMap % 3;
      const bestiary = { ...state.progress.bestiary };
      if (!bestiary[monster.id]) bestiary[monster.id] = { discovered: true, killed: 0 };
      return [
        {
          ...state,
          currentMonster: monster,
          currentMonsterKills: kills,
          progress: { ...state.progress, bestiary },
        },
        effects,
      ];
    }

    case 'MANUAL_ATTACK':
    case 'AUTO_ATTACK_TICK': {
      if (!state.currentMonster || state.hero.hp <= 0) return [state, effects];
      const isAuto = action.type === 'AUTO_ATTACK_TICK';
      const stats = getCalculatedStats(state);
      let baseDmg = stats.atk;
      if (isAuto) baseDmg = Math.floor(baseDmg * 0.8);
      let dmg = Math.floor(baseDmg) - state.currentMonster.def;
      if (dmg < 1) dmg = 1;

      addPop(`-${dmg}`, isAuto ? 'auto' : 'hit');
      effects.push({ kind: 'avatarAnim', anim: 'attack' });
      effects.push({ kind: 'monsterAnim' });

      const newMonsterHp = state.currentMonster.hp - dmg;
      if (newMonsterHp <= 0) {
        return handleDefeatMonster({ ...state, currentMonster: { ...state.currentMonster, hp: 0 } }, effects);
      }

      return [
        { ...state, currentMonster: { ...state.currentMonster, hp: newMonsterHp } },
        effects,
      ];
    }

    case 'USE_SKILL': {
      const skillId = state.skills.equipped[action.index];
      if (!skillId || !state.currentMonster) return [state, effects];
      const skill = skillsDB[skillId];
      if (!skill) return [state, effects];
      const now = Date.now();
      if (state.skillCooldowns[skillId] && state.skillCooldowns[skillId] > now) return [state, effects];
      if (state.hero.mp < skill.mpCost) {
        addPop('MP insuficiente!', 'info');
        return [state, effects];
      }

      let newState = { ...state, hero: { ...state.hero, mp: state.hero.mp - skill.mpCost } };
      const newCooldowns = { ...state.skillCooldowns, [skillId]: now + skill.cooldown * 1000 };
      newState = { ...newState, skillCooldowns: newCooldowns };

      if (skill.type === 'attack') {
        const stats = getCalculatedStats(newState);
        let dmg = Math.floor(stats.atk * skill.power) - state.currentMonster.def;
        if (dmg < 1) dmg = 1;
        addPop(`${skill.icon} -${dmg}`, 'crit');
        effects.push({ kind: 'avatarAnim', anim: 'attack' });
        effects.push({ kind: 'monsterAnim' });
        const newHp = state.currentMonster.hp - dmg;
        if (newHp <= 0) {
          return handleDefeatMonster({ ...newState, currentMonster: { ...state.currentMonster, hp: 0 } }, effects);
        }
        return [{ ...newState, currentMonster: { ...state.currentMonster, hp: newHp } }, effects];
      }

      if (skill.type === 'heal') {
        const stats = getCalculatedStats(newState);
        const healed = Math.min(stats.maxHp, newState.hero.hp + skill.power);
        addPop(`+${Math.floor(skill.power)} HP`, 'heal');
        effects.push({ kind: 'avatarAnim', anim: 'victory' });
        return [{ ...newState, hero: { ...newState.hero, hp: healed } }, effects];
      }

      if (skill.type === 'buff') {
        const newBuffs = [...newState.activeBuffs, { type: 'atk', mult: skill.power, expireTime: now + (skill.duration || 5) * 1000 }];
        addPop('BUFF!', 'info');
        effects.push({ kind: 'avatarAnim', anim: 'victory' });
        return [{ ...newState, activeBuffs: newBuffs }, effects];
      }

      return [newState, effects];
    }

    case 'EQUIP_SKILL': {
      if (state.skills.equipped.includes(action.skillId)) return [state, effects];
      const equipped = [...state.skills.equipped];
      let slot = equipped.indexOf(null);
      if (slot === -1) slot = 3;
      equipped[slot] = action.skillId;
      return [{ ...state, skills: { ...state.skills, equipped } }, effects];
    }

    case 'UNEQUIP_SKILL': {
      const equipped = [...state.skills.equipped];
      equipped[action.index] = null;
      return [{ ...state, skills: { ...state.skills, equipped } }, effects];
    }

    case 'MONSTER_ATTACK_TICK': {
      if (!state.currentMonster || state.hero.hp <= 0) return [state, effects];
      const stats = getCalculatedStats(state);
      let dmg = state.currentMonster.atk - stats.def;
      if (dmg < 1) dmg = 1;

      let isCrit = false;
      if (state.isBossFight && Math.random() < 0.1) {
        dmg = Math.floor(dmg * 2);
        isCrit = true;
      }
      addPop(isCrit ? `CRÍTICO! -${dmg}` : `-${dmg}`, 'auto');

      const newHp = Math.max(0, state.hero.hp - dmg);
      if (newHp <= 0) {
        effects.push({ kind: 'avatarAnim', anim: 'defeat' });
        const penalty = Math.floor(state.hero.zeny * 0.1);
        const stats2 = getCalculatedStats(state);
        let baseState: GameState = {
          ...state,
          hero: { ...state.hero, hp: stats2.maxHp, mp: stats2.maxMp, zeny: Math.max(0, state.hero.zeny - penalty) },
        };
        if (state.isDungeon) {
          baseState = { ...baseState, isDungeon: false, dungeonPhase: 1 };
          baseState = { ...baseState, ...spawnMonsterWrapper(baseState) };
        } else if (state.isRift) {
          baseState = { ...baseState, isRift: false };
          baseState = { ...baseState, ...spawnMonsterWrapper(baseState) };
        } else {
          baseState = { ...baseState, isBossFight: false };
          baseState = { ...baseState, ...spawnMonsterWrapper(baseState) };
        }
        if (penalty > 0) addPop(`-${penalty} Zeny`, 'auto');
        return [baseState, effects];
      }

      return [{ ...state, hero: { ...state.hero, hp: newHp } }, effects];
    }

    case 'PET_ATTACK_TICK': {
      if (!state.currentMonster || state.hero.hp <= 0 || !state.pet.active) return [state, effects];
      const petTemplate = petsDB.find(p => p.id === state.pet.active);
      if (!petTemplate) return [state, effects];
      const petInst = state.pet.collection.find(p => p.id === state.pet.active);
      if (!petInst) return [state, effects];
      const dmg = Math.floor(petTemplate.baseAtk * (1 + petInst.lv * 0.2));
      addPop(`Pet -${dmg}`, 'auto');
      const newHp = state.currentMonster.hp - dmg;
      if (newHp <= 0) {
        return handleDefeatMonster({ ...state, currentMonster: { ...state.currentMonster, hp: 0 } }, effects);
      }
      return [{ ...state, currentMonster: { ...state.currentMonster, hp: newHp } }, effects];
    }

    case 'MP_REGEN_TICK': {
      const stats = getCalculatedStats(state);
      if (state.hero.mp >= stats.maxMp) return [state, effects];
      const regen = Math.max(1, Math.floor(stats.maxMp * 0.05));
      return [{ ...state, hero: { ...state.hero, mp: Math.min(stats.maxMp, state.hero.mp + regen) } }, effects];
    }

    case 'CLEAN_BUFFS': {
      const now = Date.now();
      const active = state.activeBuffs.filter(b => b.expireTime > now);
      if (active.length === state.activeBuffs.length) return [state, effects];
      return [{ ...state, activeBuffs: active }, effects];
    }

    case 'TOGGLE_AUTO': {
      return [{ ...state, settings: { ...state.settings, autoAttackOn: !state.settings.autoAttackOn } }, effects];
    }

    case 'CHANGE_MAP': {
      const newIdx = state.progress.currentMapIdx + action.dir;
      if (newIdx < 0 || newIdx > state.progress.highestMapIdx) return [state, effects];
      const newState = { ...state, progress: { ...state.progress, currentMapIdx: newIdx } };
      const monster = spawnMonsterFromState(newState);
      const kills = newState.progress.monstersInCurrentMap % 3;
      return [{ ...newState, currentMonster: monster, currentMonsterKills: kills }, effects];
    }

    case 'SELECT_MONSTER': {
      const template = monstersDB.find(m => m.id === action.monsterId);
      if (!template) return [state, effects];
      const monster: Monster = JSON.parse(JSON.stringify(template));
      if (!monster.element) monster.element = getRandomElement();
      const diffMult = 1 + state.progress.completedCycles * 0.5;
      monster.hp = Math.floor(monster.hp * diffMult);
      monster.maxHp = monster.hp;
      monster.atk = Math.floor(monster.atk * diffMult);
      monster.def = Math.floor(monster.def * diffMult);
      return [{ ...state, currentMonster: monster, currentMonsterKills: 0 }, effects];
    }

    case 'START_BOSS_FIGHT': {
      const bossIndex = state.progress.completedCycles % bossesDB.length;
      const template = bossesDB[bossIndex];
      const boss: Monster = JSON.parse(JSON.stringify(template));
      const diff = 1 + state.progress.completedCycles * 0.4;
      boss.hp = Math.floor(boss.hp * diff);
      boss.maxHp = boss.hp;
      boss.atk = Math.floor(boss.atk * diff);
      boss.def = Math.floor(boss.def * diff);
      boss.exp = Math.floor(boss.exp * diff);
      boss.zeny = Math.floor(boss.zeny * diff);
      return [
        { ...state, isBossFight: true, currentMonster: boss, currentMonsterKills: 0, progress: { ...state.progress, bossAvailable: false } },
        effects,
      ];
    }

    case 'SKIP_BOSS': {
      return [{ ...state, progress: { ...state.progress, bossAvailable: false } }, effects];
    }

    case 'EQUIP_ITEM': {
      const invItem = state.inventory.find(i => i.id === action.invId);
      if (!invItem) return [state, effects];
      const template = itemsDB[invItem.templateId || invItem.id];
      if (!template) return [state, effects];

      let slot: 'weapon' | 'armor' | 'acc1' | 'acc2' | null = null;
      if (template.type === 'weapon') slot = 'weapon';
      else if (template.type === 'armor') slot = 'armor';
      else if (template.type === 'accessory') {
        if (!state.equipment.acc1) slot = 'acc1';
        else if (!state.equipment.acc2) slot = 'acc2';
        else slot = 'acc1';
      }
      if (!slot) return [state, effects];

      let newInv = state.inventory.map(i => ({ ...i }));
      const existing = state.equipment[slot];
      if (existing) {
        const exInv = newInv.find(i => i.id === existing.id);
        if (exInv) exInv.qty++;
        else newInv.push({ ...existing, qty: 1 });
      }

      const equipped = JSON.parse(JSON.stringify(invItem));
      equipped.qty = 1;

      const invIndex = newInv.findIndex(i => i.id === action.invId);
      newInv[invIndex] = { ...newInv[invIndex], qty: newInv[invIndex].qty - 1 };
      newInv = newInv.filter(i => i.qty > 0);

      const newEquipment = { ...state.equipment, [slot]: equipped };
      const newState = { ...state, inventory: newInv, equipment: newEquipment };
      const stats = getCalculatedStats(newState);
      return [{
        ...newState,
        hero: {
          ...newState.hero,
          hp: Math.min(newState.hero.hp, stats.maxHp),
          mp: Math.min(newState.hero.mp, stats.maxMp),
        },
      }, effects];
    }

    case 'UNEQUIP_SLOT': {
      const equipped = state.equipment[action.slot];
      if (!equipped) return [state, effects];
      const total = state.inventory.reduce((s, i) => s + i.qty, 0);
      if (total >= state.inventoryCapacity) {
        addPop('Inventário cheio!', 'info');
        return [state, effects];
      }
      let newInv = state.inventory.map(i => ({ ...i }));
      const existing = newInv.find(i => i.id === equipped.id);
      if (existing) existing.qty++;
      else newInv.push({ ...equipped, qty: 1 });

      const newEquipment = { ...state.equipment, [action.slot]: null };
      const newState = { ...state, inventory: newInv, equipment: newEquipment };
      const stats = getCalculatedStats(newState);
      return [{
        ...newState,
        hero: {
          ...newState.hero,
          hp: Math.min(newState.hero.hp, stats.maxHp),
          mp: Math.min(newState.hero.mp, stats.maxMp),
        },
      }, effects];
    }

    case 'USE_ITEM': {
      const invItem = state.inventory.find(i => i.id === action.invId);
      if (!invItem) return [state, effects];
      const template = itemsDB[invItem.templateId || invItem.id];
      if (!template || template.type !== 'consumable') return [state, effects];

      const stats = getCalculatedStats(state);
      let newHp = state.hero.hp;
      let newMp = state.hero.mp;
      if (template.healHp) newHp = Math.min(stats.maxHp, newHp + template.healHp);
      if (template.healMp) newMp = Math.min(stats.maxMp, newMp + template.healMp);
      addPop(`+${template.healHp || template.healMp} ${template.healHp ? 'HP' : 'MP'}`, 'heal');

      let newInv = state.inventory.map(i => ({ ...i }));
      const idx = newInv.findIndex(i => i.id === action.invId);
      newInv[idx] = { ...newInv[idx], qty: newInv[idx].qty - 1 };
      newInv = newInv.filter(i => i.qty > 0);

      return [{
        ...state,
        hero: { ...state.hero, hp: newHp, mp: newMp },
        inventory: newInv,
        stats: { ...state.stats, potionsUsed: state.stats.potionsUsed + 1 },
      }, effects];
    }

    case 'SELL_ITEM': {
      const invItem = state.inventory.find(i => i.id === action.invId);
      if (!invItem) return [state, effects];
      const template = itemsDB[invItem.templateId || invItem.id];
      const sellValue = template?.price ? Math.floor(template.price * 0.5) : 10;
      addPop(`+${sellValue} Zeny`, 'info');

      let newInv = state.inventory.map(i => ({ ...i }));
      const idx = newInv.findIndex(i => i.id === action.invId);
      newInv[idx] = { ...newInv[idx], qty: newInv[idx].qty - 1 };
      newInv = newInv.filter(i => i.qty > 0);

      return [{
        ...state,
        inventory: newInv,
        hero: { ...state.hero, zeny: state.hero.zeny + sellValue },
      }, effects];
    }

    case 'BUY_ITEM': {
      const item = itemsDB[action.itemId];
      if (!item || state.hero.zeny < item.price) return [state, effects];
      const total = state.inventory.reduce((s, i) => s + i.qty, 0);
      if (item.type !== 'upgrade' && total >= state.inventoryCapacity) {
        addPop('Inventário cheio!', 'info');
        return [state, effects];
      }

      let newHero = { ...state.hero, zeny: state.hero.zeny - item.price };
      if (item.type === 'upgrade') {
        if (item.addAtk) newHero = { ...newHero, baseAtk: newHero.baseAtk + item.addAtk };
        if (item.addDef) newHero = { ...newHero, baseDef: newHero.baseDef + item.addDef };
        if (item.addHp) newHero = { ...newHero, baseMaxHp: newHero.baseMaxHp + item.addHp, hp: newHero.hp + item.addHp };
        if (item.addMp) newHero = { ...newHero, baseMaxMp: newHero.baseMaxMp + item.addMp, mp: newHero.mp + item.addMp };
        addPop(`${item.name} aplicado!`, 'info');
        return [{ ...state, hero: newHero }, effects];
      }

      let newInv = state.inventory.map(i => ({ ...i }));
      const existing = newInv.find(i => i.id === action.itemId);
      if (existing) existing.qty++;
      else newInv.push({ id: action.itemId, qty: 1 });
      addPop(`Comprado: ${item.name}`, 'info');
      return [{ ...state, hero: newHero, inventory: newInv }, effects];
    }

    case 'ADD_STAT': {
      const val = state.hero[action.stat] || 1;
      const cost = Math.floor(val / 10) + 1;
      if (state.hero.points < cost) return [state, effects];
      return [{
        ...state,
        hero: { ...state.hero, [action.stat]: val + 1, points: state.hero.points - cost },
      }, effects];
    }

    case 'CHANGE_CLASS': {
      const cls = classesDB[action.classId];
      if (!cls || state.hero.lv < cls.reqLv) return [state, effects];

      let newHero = { ...state.hero, job: action.classId };
      if (action.classId === 'jovem' && state.hero.job !== 'jovem') {
        newHero = {
          ...newHero,
          str: newHero.str + 5, agi: newHero.agi + 5, vit: newHero.vit + 5,
          int: newHero.int + 5, dex: newHero.dex + 5, luk: newHero.luk + 5,
        };
        addPop('+5 em todos os atributos!', 'info');
      }

      const newSkills = { ...state.skills, unlocked: [...state.skills.unlocked] };
      Object.keys(skillsDB).forEach(sId => {
        if (skillsDB[sId].reqClass === action.classId && !newSkills.unlocked.includes(sId)) {
          newSkills.unlocked.push(sId);
        }
      });

      const tempState = { ...state, hero: newHero, skills: newSkills };
      const stats = getCalculatedStats(tempState);
      return [{
        ...tempState,
        hero: { ...newHero, hp: stats.maxHp, mp: stats.maxMp },
      }, effects];
    }

    case 'EQUIP_PET': {
      const exists = state.pet.collection.find(p => p.id === action.petId);
      if (!exists) return [state, effects];
      return [{ ...state, pet: { ...state.pet, active: action.petId } }, effects];
    }

    case 'ACCEPT_QUEST': {
      if (state.tavern.activeQuests.find(q => q.id === action.questId)) return [state, effects];
      if (state.tavern.completedQuests.includes(action.questId)) return [state, effects];
      return [{
        ...state,
        tavern: { ...state.tavern, activeQuests: [...state.tavern.activeQuests, { id: action.questId, progress: 0 }] },
      }, effects];
    }

    case 'COMPLETE_QUEST': {
      const quest = questsDB.find(q => q.id === action.questId);
      const active = state.tavern.activeQuests.find(q => q.id === action.questId);
      if (!quest || !active || active.progress < quest.req) return [state, effects];
      addPop(`+${quest.rewardZeny} Zeny`, 'info');
      return [{
        ...state,
        hero: { ...state.hero, zeny: state.hero.zeny + quest.rewardZeny, exp: state.hero.exp + quest.rewardExp },
        tavern: {
          activeQuests: state.tavern.activeQuests.filter(q => q.id !== action.questId),
          completedQuests: [...state.tavern.completedQuests, action.questId],
        },
      }, effects];
    }

    case 'CLAIM_ACHIEVEMENT': {
      const info = state.progress.achievements[action.achId];
      if (info?.claimed) return [state, effects];
      addPop('Conquista desbloqueada!', 'info');
      return [{
        ...state,
        progress: {
          ...state.progress,
          achievements: { ...state.progress.achievements, [action.achId]: { claimed: true } },
        },
      }, effects];
    }

    case 'ENTER_DUNGEON': {
      if (state.progress.dungeonEntries <= 0) return [state, effects];
      const newState: GameState = {
        ...state,
        isDungeon: true,
        dungeonPhase: 1,
        isBossFight: false,
        progress: {
          ...state.progress,
          dungeonEntries: state.progress.dungeonEntries - 1,
          monstersInCurrentMap: 0,
        },
      };
      const monster = spawnMonsterFromState(newState);
      return [{ ...newState, currentMonster: monster, currentMonsterKills: 0 }, effects];
    }

    case 'EXIT_DUNGEON': {
      const newState: GameState = { ...state, isDungeon: false, dungeonPhase: 1 };
      const monster = spawnMonsterFromState(newState);
      return [{ ...newState, currentMonster: monster, currentMonsterKills: 0 }, effects];
    }

    case 'ENTER_RIFT': {
      const newState: GameState = { ...state, isRift: true, riftFloor: 1 };
      const monster = spawnMonsterFromState(newState);
      return [{ ...newState, currentMonster: monster, currentMonsterKills: 0 }, effects];
    }

    case 'EXIT_RIFT': {
      const newState: GameState = { ...state, isRift: false, riftFloor: 0 };
      const monster = spawnMonsterFromState(newState);
      return [{ ...newState, currentMonster: monster, currentMonsterKills: 0 }, effects];
    }

    case 'DO_REBORN': {
      if (state.hero.lv < 99) return [state, effects];
      const newReborns = state.stats.reborns + 1;
      const bonusMult = 1 + newReborns * 0.1;
      const newState: GameState = {
        ...INITIAL_STATE,
        stats: { ...INITIAL_STATE.stats, reborns: newReborns },
        hero: {
          ...INITIAL_STATE.hero,
          baseAtk: Math.floor(INITIAL_STATE.hero.baseAtk * bonusMult),
          baseDef: Math.floor(INITIAL_STATE.hero.baseDef * bonusMult),
          baseMaxHp: Math.floor(INITIAL_STATE.hero.baseMaxHp * bonusMult),
          baseMaxMp: Math.floor(INITIAL_STATE.hero.baseMaxMp * bonusMult),
        },
        progress: { ...INITIAL_STATE.progress, bestiary: state.progress.bestiary },
        ranking: [...state.ranking, { cycle: state.progress.completedCycles, lv: state.hero.lv, zeny: state.hero.zeny, time: new Date().toLocaleString() }],
        riftRecord: state.riftRecord,
      };
      const monster = spawnMonsterFromState(newState);
      return [{ ...newState, currentMonster: monster }, effects];
    }

    case 'TOGGLE_SOUND': {
      return [{ ...state, settings: { ...state.settings, soundOn: !state.settings.soundOn } }, effects];
    }

    case 'SAVE_GAME':
    case 'RESET_GAME': {
      return [state, effects];
    }

    default:
      return [state, effects];
  }
}

function spawnMonsterWrapper(state: GameState): Partial<GameState> {
  const monster = spawnMonsterFromState(state);
  const kills = state.progress.monstersInCurrentMap % 3;
  return { currentMonster: monster, currentMonsterKills: kills };
}

function handleDefeatMonster(state: GameState, effects: EffectQueue): [GameState, EffectQueue] {
  const addPop = (text: string, type: DamagePop['type'] = 'info') => {
    effects.push({
      kind: 'pop',
      pop: { id: ++popId, text, type, x: 30 + Math.random() * 40, y: 30 + Math.random() * 30 },
    });
  };

  effects.push({ kind: 'avatarAnim', anim: 'victory' });

  const m = state.currentMonster!;
  let newHero = { ...state.hero };
  newHero.zeny += m.zeny;
  newHero.exp += m.exp;

  const newStats = { ...state.stats, monstersDefeated: state.stats.monstersDefeated + 1 };
  let newProgress = { ...state.progress };
  let isBoss = state.isBossFight;

  if (!isBoss && !state.isDungeon && !state.isRift) {
    newProgress.monstersInCurrentMap++;
    if (newProgress.bestiary[m.id]) {
      newProgress.bestiary = { ...newProgress.bestiary, [m.id]: { ...newProgress.bestiary[m.id], killed: newProgress.bestiary[m.id].killed + 1 } };
    }
  }

  if (isBoss) {
    newStats.bossesDefeated++;
  }

  newStats.totalZenyEarned += m.zeny;

  // Monstrous bonus
  if (Math.random() < 0.05) {
    const bonusZeny = Math.floor(m.zeny * 2);
    const bonusXp = Math.floor(m.exp * 2);
    newHero.zeny += bonusZeny;
    newHero.exp += bonusXp;
    newStats.totalZenyEarned += bonusZeny;
    newStats.bonusReceived++;
    addPop(`BONUS! +${bonusZeny}Z +${bonusXp}XP`, 'crit');
    effects.push({ kind: 'bonusBanner', zeny: bonusZeny, xp: bonusXp });
    const entry = { time: new Date().toLocaleString(), monsterName: m.name, zeny: bonusZeny, xp: bonusXp };
    newProgress.bonusHistory = [entry, ...newProgress.bonusHistory.slice(0, 99)];
  }

  // Drops
  const { newItem, petDrop } = checkDrop(state, isBoss);
  let newInv = [...state.inventory];
  if (petDrop) {
    const petTemplate = petsDB.find(p => p.name === petDrop);
    if (petTemplate) {
      const petCollection = [...state.pet.collection, { id: petTemplate.id, lv: 1, exp: 0, nextExp: 100 }];
      addPop(`Pet: ${petDrop}!`, 'crit');
      state = { ...state, pet: { ...state.pet, collection: petCollection } };
    }
  } else if (newItem) {
    const total = newInv.reduce((s, i) => s + i.qty, 0);
    if (total < state.inventoryCapacity) {
      if (newItem.templateId) {
        newInv.push(newItem);
      } else {
        const ex = newInv.find(i => i.id === newItem.id);
        if (ex) ex.qty++;
        else newInv.push(newItem);
      }
      const dropName = newItem.name || itemsDB[newItem.id]?.name || newItem.id;
      addPop(`Drop: ${dropName}!`, 'crit');
    }
  }

  // Pet XP
  let newPet = { ...state.pet, collection: state.pet.collection.map(p => ({ ...p })) };
  if (newPet.active) {
    const petInst = newPet.collection.find(p => p.id === newPet.active);
    if (petInst) {
      petInst.exp += Math.floor(m.exp * 0.5);
      if (petInst.exp >= petInst.nextExp) {
        petInst.lv++;
        petInst.exp -= petInst.nextExp;
        petInst.nextExp = Math.floor(petInst.nextExp * 1.5);
        addPop('Pet Level Up!', 'info');
      }
    }
  }

  // Quest progress
  let newTavern = { ...state.tavern, activeQuests: state.tavern.activeQuests.map(q => ({ ...q })) };
  newTavern.activeQuests.forEach(q => {
    const questDef = questsDB.find(db => db.id === q.id);
    if (!questDef) return;
    if (questDef.type === 'kill' && questDef.target === m.id && !isBoss) q.progress++;
    else if (questDef.type === 'kill_boss' && questDef.target === m.id && isBoss) q.progress++;
  });

  // Level up
  while (newHero.exp >= newHero.nextExp) {
    newHero.exp -= newHero.nextExp;
    newHero.nextExp = Math.floor(newHero.nextExp * 1.5);
    newHero.lv++;
    newHero.points += 3;
    newHero.baseMaxHp += 20;
    newHero.baseMaxMp += 10;
    addPop('LEVEL UP!', 'crit');
  }

  const tempState = { ...state, hero: newHero, inventory: newInv, pet: newPet };
  const stats = getCalculatedStats(tempState);
  // Heal fully on level up only if we just leveled
  newHero.hp = Math.min(newHero.hp, stats.maxHp);
  newHero.mp = Math.min(newHero.mp, stats.maxMp);

  // Boss check
  const nextBossLv = (newProgress.completedCycles + 1) * 5;
  if (newHero.lv >= nextBossLv && !newProgress.bossAvailable && !isBoss) {
    newProgress.bossAvailable = true;
    effects.push({ kind: 'bossModal' });
  }

  let newIsBoss = isBoss;
  let newIsDungeon = state.isDungeon;
  let newDungeonPhase = state.dungeonPhase;
  let newIsRift = state.isRift;
  let newRiftFloor = state.riftFloor;
  let newRiftRecord = state.riftRecord;
  let newRanking = state.ranking;

  if (isBoss) {
    newIsBoss = false;
    newProgress.completedCycles++;
    newProgress.currentMapIdx = 0;
    newProgress.monstersInCurrentMap = 0;
    newProgress.highestMapIdx = Math.max(newProgress.highestMapIdx, 0);
    newProgress.bossAvailable = false;
    const bossReward = 5000 * newProgress.completedCycles;
    newHero.zeny += bossReward;
    addPop(`+${bossReward} Zeny (Boss)!`, 'crit');
    newRanking = [
      ...state.ranking,
      { cycle: newProgress.completedCycles, lv: newHero.lv, zeny: newHero.zeny, time: new Date().toLocaleString() },
    ];
  } else if (newIsDungeon) {
    if (newDungeonPhase >= 3) {
      newIsDungeon = false;
      newDungeonPhase = 1;
      addPop('Dungeon Completa!', 'crit');
    } else {
      newDungeonPhase++;
    }
  } else if (newIsRift) {
    newRiftFloor++;
    if (newRiftFloor > newRiftRecord) newRiftRecord = newRiftFloor;
  } else {
    // Check map unlock
    const nextMapData = mapsDB[newProgress.currentMapIdx + 1];
    if (nextMapData && newProgress.monstersInCurrentMap >= nextMapData.req) {
      if (newProgress.highestMapIdx === newProgress.currentMapIdx) {
        newProgress.highestMapIdx++;
        addPop('NOVO MAPA!', 'crit');
      }
    }
  }

  const nextState: GameState = {
    ...state,
    hero: newHero,
    stats: newStats,
    progress: newProgress,
    inventory: newInv,
    pet: newPet,
    tavern: newTavern,
    isBossFight: newIsBoss,
    isDungeon: newIsDungeon,
    dungeonPhase: newDungeonPhase,
    isRift: newIsRift,
    riftFloor: newRiftFloor,
    riftRecord: newRiftRecord,
    ranking: newRanking,
  };

  const nextMonster = spawnMonsterFromState(nextState);
  const nextKills = nextState.progress.monstersInCurrentMap % 3;
  const newBestiary = { ...nextState.progress.bestiary };
  if (!newBestiary[nextMonster.id]) newBestiary[nextMonster.id] = { discovered: true, killed: 0 };

  return [
    {
      ...nextState,
      currentMonster: nextState.isBossFight ? nextState.currentMonster : nextMonster,
      currentMonsterKills: nextState.isBossFight ? 0 : nextKills,
      progress: { ...nextState.progress, bestiary: newBestiary },
    },
    effects,
  ];
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(
    (s: GameState, a: Action): GameState => { const [ns] = gameReducer(s, a); return ns; },
    INITIAL_STATE
  );

  const [damagePops, setDamagePops] = useState<DamagePop[]>([]);
  const [avatarAnim, setAvatarAnim] = useState('idle');
  const [monsterAnim, setMonsterAnim] = useState('');
  const [bonusBanner, setBonusBanner] = useState({ visible: false, zeny: 0, xp: 0 });
  const [bossModalVisible, setBossModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');

  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = (action: Action) => {
    const [, effects] = gameReducer(stateRef.current, action);
    rawDispatch(action);

    effects.forEach(e => {
      if (e.kind === 'pop') {
        const pop = e.pop;
        setDamagePops(prev => [...prev, pop]);
        setTimeout(() => setDamagePops(prev => prev.filter(p => p.id !== pop.id)), 900);
      } else if (e.kind === 'avatarAnim') {
        setAvatarAnim(e.anim);
        if (e.anim !== 'idle' && e.anim !== 'defeat') {
          const delay = e.anim === 'attack' ? 350 : 1100;
          setTimeout(() => setAvatarAnim('idle'), delay);
        }
      } else if (e.kind === 'monsterAnim') {
        setMonsterAnim('hit');
        setTimeout(() => setMonsterAnim(''), 200);
      } else if (e.kind === 'bonusBanner') {
        setBonusBanner({ visible: true, zeny: e.zeny, xp: e.xp });
        setTimeout(() => setBonusBanner(b => ({ ...b, visible: false })), 3000);
      } else if (e.kind === 'bossModal') {
        setBossModalVisible(true);
      }
    });
  };

  // Load save on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_SAVE', saved: parsed });
      } catch {
        // ignore corrupt saves
      }
    }
  }, []);

  // Spawn initial monster
  useEffect(() => {
    if (!stateRef.current.currentMonster) {
      dispatch({ type: 'SPAWN_MONSTER' });
    }
  }, []);

  // Autosave every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto attack
  useEffect(() => {
    if (!state.settings.autoAttackOn) return;
    const id = setInterval(() => dispatch({ type: 'AUTO_ATTACK_TICK' }), 2000);
    return () => clearInterval(id);
  }, [state.settings.autoAttackOn]);

  // Monster attack
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'MONSTER_ATTACK_TICK' }), 2500);
    return () => clearInterval(id);
  }, []);

  // MP regen
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'MP_REGEN_TICK' }), 3000);
    return () => clearInterval(id);
  }, []);

  // Pet attack
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'PET_ATTACK_TICK' }), 2000);
    return () => clearInterval(id);
  }, []);

  // Clean buffs
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'CLEAN_BUFFS' }), 1000);
    return () => clearInterval(id);
  }, []);

  // Daily dungeon reset
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.progress.lastDungeonDate !== today) {
      dispatch({ type: 'LOAD_SAVE', saved: { progress: { ...state.progress, dungeonEntries: 3, lastDungeonDate: today } } });
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, activeTab, setActiveTab, damagePops, avatarAnim, monsterAnim, bonusBanner, bossModalVisible, setBossModalVisible }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
