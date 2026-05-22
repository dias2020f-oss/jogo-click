import React, { useState } from 'react';
import { GameProvider, useGame } from '@/game/context';
import { CombatPanel } from '@/components/CombatPanel';
import {
  itemsDB, classesDB, classTree, skillsDB, petsDB, questsDB,
  achievementsDB, monstersDB, mapsDB, setsDB, gemsDB,
} from '@/game/data';
import { getCalculatedStats, getAttributeCost } from '@/game/engine';
import type { InventoryItem, StatKey } from '@/game/types';

function getRarityColor(r: number): string {
  return ['', '#888', '#3498db', '#9b59b6', '#f1c40f', '#27ae60'][r] || '#888';
}

function Btn({ children, onClick, className = '', disabled = false, 'data-testid': testId, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; 'data-testid'?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`px-3 py-1.5 border-2 border-black rounded text-xs font-bold uppercase cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-heading text-secondary mb-3 tracking-wide border-b border-black pb-1">{children}</h2>;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY TAB
// ─────────────────────────────────────────────────────────────────────────────
function InventoryTab() {
  const { state, dispatch } = useGame();
  const [invFilter, setInvFilter] = useState<string>('all');
  const filters = ['all', 'weapon', 'armor', 'accessory', 'consumable'];

  const eqSlots: Array<{ key: 'weapon' | 'armor' | 'acc1' | 'acc2'; label: string }> = [
    { key: 'weapon', label: '⚔️ Arma' },
    { key: 'armor', label: '🛡️ Armadura' },
    { key: 'acc1', label: '💍 Acessório 1' },
    { key: 'acc2', label: '💍 Acessório 2' },
  ];

  const eqItemName = (item: InventoryItem | null) => {
    if (!item) return '— Vazio —';
    return item.name || itemsDB[item.templateId || item.id]?.name || item.id;
  };
  const eqRarity = (item: InventoryItem | null) => {
    if (!item) return 0;
    if (item.rarity) return item.rarity;
    return itemsDB[item.templateId || item.id]?.rarity || 1;
  };

  const invItems = state.inventory.filter(i => {
    if (invFilter === 'all') return true;
    return (itemsDB[i.templateId || i.id]?.type || '') === invFilter;
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionTitle>EQUIPAMENTO</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {eqSlots.map(slot => {
            const item = state.equipment[slot.key];
            const r = eqRarity(item);
            const name = eqItemName(item);
            return (
              <div key={slot.key} className={`bg-card p-2 rounded border-2 ${item ? `border-rarity-${r}` : 'border-black'}`} data-testid={`equipment-slot-${slot.key}`}>
                <div className="text-[10px] text-muted-foreground mb-1">{slot.label}</div>
                <div className="text-xs font-bold truncate" style={{ color: item ? getRarityColor(r) : '#555' }}>{name}</div>
                {item && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {item.atk ? `+${item.atk} ATK ` : ''}{item.def ? `+${item.def} DEF ` : ''}
                    {item.hp ? `+${item.hp} HP ` : ''}{item.mp ? `+${item.mp} MP` : ''}
                    {item.element ? <span style={{ color: '#e74c3c' }}> ({item.element})</span> : null}
                  </div>
                )}
                {item && (
                  <Btn onClick={() => dispatch({ type: 'UNEQUIP_SLOT', slot: slot.key })} className="mt-1 bg-popover text-muted-foreground w-full text-[10px]">
                    Desequipar
                  </Btn>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <SectionTitle>INVENTÁRIO ({state.inventory.reduce((s, i) => s + i.qty, 0)}/{state.inventoryCapacity})</SectionTitle>
        <div className="flex flex-wrap gap-1 mb-2">
          {filters.map(f => (
            <button key={f} onClick={() => setInvFilter(f)}
              className={`px-2 py-0.5 border border-black rounded text-xs cursor-pointer ${invFilter === f ? 'bg-primary text-white' : 'bg-popover text-muted-foreground'}`}>
              {f === 'all' ? 'Tudo' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {invItems.length === 0
          ? <p className="text-xs text-muted-foreground">Inventário vazio.</p>
          : (
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              {invItems.map(invItem => {
                const tmpl = itemsDB[invItem.templateId || invItem.id];
                const rarity = invItem.rarity || tmpl?.rarity || 1;
                const name = invItem.name || tmpl?.name || invItem.id;
                const isConsumable = tmpl?.type === 'consumable';
                const isEquippable = tmpl && ['weapon', 'armor', 'accessory'].includes(tmpl.type);
                return (
                  <div key={invItem.id} className={`bg-card p-2 rounded border-l-4 border-rarity-${rarity} flex justify-between items-start gap-2`} data-testid={`inv-item-${invItem.id}`}>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold" style={{ color: getRarityColor(rarity) }}>{name}</div>
                      <div className="text-[10px] text-muted-foreground">{tmpl?.desc || ''}{invItem.qty > 1 ? ` ×${invItem.qty}` : ''}</div>
                      {invItem.element && <div className="text-[10px]" style={{ color: '#e74c3c' }}>🔥 {invItem.element}</div>}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {isEquippable && <Btn onClick={() => dispatch({ type: 'EQUIP_ITEM', invId: invItem.id })} className="bg-primary text-white text-[10px]" data-testid={`button-equip-${invItem.id}`}>Equipar</Btn>}
                      {isConsumable && <Btn onClick={() => dispatch({ type: 'USE_ITEM', invId: invItem.id })} className="bg-green-700 text-white text-[10px]">Usar</Btn>}
                      <Btn onClick={() => dispatch({ type: 'SELL_ITEM', invId: invItem.id })} className="bg-popover text-yellow-400 text-[10px]">Vender</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTRIBUTES TAB
// ─────────────────────────────────────────────────────────────────────────────
function AttributesTab() {
  const { state, dispatch } = useGame();
  const stats = getCalculatedStats(state);
  const attrs: Array<{ key: StatKey; name: string; desc: string }> = [
    { key: 'str', name: 'FOR (STR)', desc: 'Aumenta Ataque Físico' },
    { key: 'agi', name: 'AGI (AGI)', desc: 'Aumenta Esquiva' },
    { key: 'vit', name: 'VIT (VIT)', desc: 'Aumenta HP Máx e Defesa' },
    { key: 'int', name: 'INT (INT)', desc: 'Aumenta Ataque Mágico e MP' },
    { key: 'dex', name: 'DES (DEX)', desc: 'Aumenta Acerto e ATK à Distância' },
    { key: 'luk', name: 'SOR (LUK)', desc: 'Aumenta Taxa Crítica' },
  ];
  return (
    <div>
      <SectionTitle>ATRIBUTOS — Pontos: <span className="text-foreground">{state.hero.points}</span></SectionTitle>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {[
          { label: 'ATK', val: stats.atk }, { label: 'MATK', val: stats.matk }, { label: 'DEF', val: stats.def },
          { label: 'HP', val: `${Math.floor(state.hero.hp)}/${stats.maxHp}` }, { label: 'MP', val: `${Math.floor(state.hero.mp)}/${stats.maxMp}` },
          { label: 'FLEE', val: stats.flee }, { label: 'HIT', val: stats.hit }, { label: 'CRIT', val: stats.cri.toFixed(1) },
        ].map(s => (
          <div key={s.label} className="bg-card rounded p-1.5 border border-black text-xs flex justify-between">
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-bold text-secondary">{s.val}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {attrs.map(a => {
          const val = state.hero[a.key];
          const cost = getAttributeCost(val);
          return (
            <div key={a.key} className="bg-card rounded p-2 border border-black flex items-center gap-2" data-testid={`attr-row-${a.key}`}>
              <div className="flex-1">
                <div className="text-xs font-bold text-secondary">{a.name}: <span className="text-foreground">{val}</span></div>
                <div className="text-[10px] text-muted-foreground">{a.desc} · Custo: {cost} pt(s)</div>
              </div>
              <button
                className="w-8 h-8 border-2 border-black rounded text-sm font-bold cursor-pointer disabled:opacity-30 bg-primary text-white"
                disabled={state.hero.points < cost}
                onClick={() => dispatch({ type: 'ADD_STAT', stat: a.key })}
                data-testid={`button-add-stat-${a.key}`}
              >+</button>
            </div>
          );
        })}
      </div>
      {state.hero.lv >= 99 && (
        <div className="mt-4 p-3 border-2 border-yellow-500 rounded text-center">
          <div className="text-xs font-bold text-yellow-400 mb-1">🌟 REBORN DISPONÍVEL</div>
          <div className="text-[10px] text-muted-foreground mb-2">Volte ao nível 1 com +10% de bônus permanente.</div>
          <Btn onClick={() => { if (confirm('Realizar Reborn? Você voltará ao nível 1.')) dispatch({ type: 'DO_REBORN' }); }} className="bg-yellow-600 text-black w-full">Renascer 🌟</Btn>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOP TAB
// ─────────────────────────────────────────────────────────────────────────────
function ShopTab() {
  const { state, dispatch } = useGame();
  const [shopFilter, setShopFilter] = useState<string>('all');
  const shopFilters = ['all', 'weapon', 'armor', 'accessory', 'consumable', 'upgrade'];
  const shopItems = Object.values(itemsDB).filter(i => shopFilter === 'all' || i.type === shopFilter);
  return (
    <div>
      <SectionTitle>LOJA — 💰 {state.hero.zeny.toLocaleString()} Zeny</SectionTitle>
      <div className="flex flex-wrap gap-1 mb-3">
        {shopFilters.map(f => (
          <button key={f} onClick={() => setShopFilter(f)}
            className={`px-2 py-0.5 border border-black rounded text-xs cursor-pointer ${shopFilter === f ? 'bg-primary text-white' : 'bg-popover text-muted-foreground'}`}>
            {f === 'all' ? 'Tudo' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto pr-1">
        {shopItems.map(item => (
          <div key={item.id} className={`bg-card p-2 rounded border-l-4 border-rarity-${item.rarity} flex justify-between items-center gap-2`} data-testid={`shop-item-${item.id}`}>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: getRarityColor(item.rarity) }}>{item.name}</div>
              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
              {item.setId && <div className="text-[10px] text-yellow-400">Set: {setsDB[item.setId]?.name}</div>}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-yellow-400 font-bold">{item.price.toLocaleString()}Z</div>
              <Btn onClick={() => dispatch({ type: 'BUY_ITEM', itemId: item.id })} disabled={state.hero.zeny < item.price} className="bg-primary text-white text-[10px] mt-0.5" data-testid={`button-buy-${item.id}`}>Comprar</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORGE TAB
// ─────────────────────────────────────────────────────────────────────────────
function ForgeTab() {
  const { state } = useGame();
  const forgeable = state.inventory.filter(i => { const t = itemsDB[i.templateId || i.id]; return t && ['weapon', 'armor', 'accessory'].includes(t.type); });
  return (
    <div>
      <SectionTitle>FERRARIA & ENCANTAMENTOS</SectionTitle>
      <p className="text-xs text-muted-foreground mb-3">Encaixe Gemas em equipamentos para amplificar atributos. Cada soquete aceita uma Gema diferente.</p>
      <div className="mb-4">
        <div className="text-xs font-bold text-secondary mb-2">Gemas</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(gemsDB).map(gem => (
            <div key={gem.id} className="bg-card p-2 rounded border border-black text-xs">
              <div className="font-bold text-secondary">{gem.name}</div>
              <div className="text-muted-foreground text-[10px]">{gem.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="text-xs font-bold text-secondary mb-2">Sets Disponíveis</div>
        {Object.values(setsDB).map(set => (
          <div key={set.name} className="bg-card p-2 rounded border border-black mb-2">
            <div className="text-xs font-bold text-yellow-400 mb-1">{set.name}</div>
            {Object.entries(set.bonuses).map(([pieces, bonus]) => (
              <div key={pieces} className="text-[10px] text-muted-foreground">{pieces} peças: {bonus.desc}</div>
            ))}
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs font-bold text-secondary mb-2">Itens Forjáveis</div>
        {forgeable.length === 0
          ? <p className="text-xs text-muted-foreground">Nenhum equipamento no inventário.</p>
          : (
            <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1">
              {forgeable.map(i => {
                const t = itemsDB[i.templateId || i.id];
                return <div key={i.id} className="bg-card p-2 rounded border border-black text-xs flex justify-between"><span>{i.name || t?.name || i.id}</span><span className="text-muted-foreground">{(i.sockets?.length || 0)} soquetes</span></div>;
              })}
            </div>
          )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSES TAB
// ─────────────────────────────────────────────────────────────────────────────
function ClassesTab() {
  const { state, dispatch } = useGame();
  const currentCls = classesDB[state.hero.job] || classesDB['novato'];

  function buildTree(jobId: string, depth = 0): React.ReactNode {
    const cls = classesDB[jobId];
    if (!cls) return null;
    const isUnlocked = state.hero.lv >= cls.reqLv;
    const isCurrent = state.hero.job === jobId;
    return (
      <div key={jobId} style={{ marginLeft: depth * 14 }}>
        <div
          className={`flex items-center gap-2 p-1.5 rounded border mb-1 cursor-pointer ${isCurrent ? 'border-secondary bg-primary/20' : isUnlocked ? 'border-black bg-card hover:bg-popover' : 'border-black/40 bg-card opacity-40'}`}
          onClick={() => { if (!isCurrent && isUnlocked) dispatch({ type: 'CHANGE_CLASS', classId: jobId }); }}
          data-testid={`class-${jobId}`}
        >
          <span className="text-lg">{cls.avatar}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: isCurrent ? '#d4a574' : '#e8e8e8' }}>{cls.name}</div>
            <div className="text-[10px] text-muted-foreground">Req Lv {cls.reqLv}</div>
          </div>
          {isCurrent && <span className="text-[10px] text-secondary shrink-0">✓</span>}
          {!isCurrent && !isUnlocked && <span className="text-[10px] text-red-400 shrink-0">🔒</span>}
        </div>
        {(classTree[jobId] || []).map((child: string) => buildTree(child, depth + 1))}
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>CLASSES — {currentCls.name}</SectionTitle>
      <div className="bg-card p-3 rounded border border-black mb-4 flex items-center gap-2">
        <span className="text-3xl">{currentCls.avatar}</span>
        <div>
          <div className="text-sm font-bold text-secondary">{currentCls.name}</div>
          <div className="text-xs text-muted-foreground">{currentCls.desc}</div>
        </div>
      </div>
      <div className="text-xs font-bold text-secondary mb-2">Árvore de Classes</div>
      <div className="max-h-[380px] overflow-y-auto pr-1">{buildTree('novato')}</div>
      {state.hero.lv >= 99 && (
        <div className="mt-3 p-2 border border-yellow-500 rounded text-center">
          <Btn onClick={() => { if (confirm('Realizar Reborn?')) dispatch({ type: 'DO_REBORN' }); }} className="bg-yellow-600 text-black w-full">🌟 Renascer (Lv 99)</Btn>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS TAB
// ─────────────────────────────────────────────────────────────────────────────
function SkillsTab() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <SectionTitle>HABILIDADES</SectionTitle>
      <div className="text-xs text-muted-foreground mb-3">Equipe habilidades nos 4 slots da barra de combate.</div>
      <div className="mb-4">
        <div className="text-xs font-bold text-secondary mb-2">Desbloqueadas</div>
        {state.skills.unlocked.length === 0
          ? <p className="text-xs text-muted-foreground">Nenhuma habilidade desbloqueada.</p>
          : (
            <div className="flex flex-col gap-2">
              {state.skills.unlocked.map(sid => {
                const skill = skillsDB[sid];
                if (!skill) return null;
                const isEquipped = state.skills.equipped.includes(sid);
                return (
                  <div key={sid} className={`bg-card p-2 rounded border-2 ${isEquipped ? 'border-secondary' : 'border-black'} flex gap-2 items-center`} data-testid={`skill-${sid}`}>
                    <span className="text-2xl">{skill.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-secondary">{skill.name}</div>
                      <div className="text-[10px] text-muted-foreground">{skill.desc}</div>
                      <div className="text-[10px] text-muted-foreground">{skill.mpCost} MP · CD: {skill.cooldown}s · {classesDB[skill.reqClass]?.name || skill.reqClass}</div>
                    </div>
                    {isEquipped
                      ? <Btn onClick={() => { const idx = state.skills.equipped.indexOf(sid); dispatch({ type: 'UNEQUIP_SKILL', index: idx }); }} className="bg-red-700 text-white text-[10px]">Remover</Btn>
                      : <Btn onClick={() => dispatch({ type: 'EQUIP_SKILL', skillId: sid })} className="bg-primary text-white text-[10px]">Equipar</Btn>}
                  </div>
                );
              })}
            </div>
          )}
      </div>
      <div>
        <div className="text-xs font-bold text-secondary mb-2">Bloqueadas</div>
        <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
          {Object.values(skillsDB).filter(s => !state.skills.unlocked.includes(s.id)).map(skill => (
            <div key={skill.id} className="bg-card p-2 rounded border border-black opacity-40 flex gap-2 items-center">
              <span className="text-xl">{skill.icon}</span>
              <div className="flex-1"><div className="text-xs font-bold">{skill.name}</div><div className="text-[10px] text-muted-foreground">Req: {classesDB[skill.reqClass]?.name || skill.reqClass}</div></div>
              <span className="text-[10px] text-red-400">🔒</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PETS TAB
// ─────────────────────────────────────────────────────────────────────────────
function PetsTab() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <SectionTitle>MASCOTES</SectionTitle>
      <p className="text-xs text-muted-foreground mb-3">Pets atacam inimigos e concedem bônus de ATK. Drops aparecem a partir do nível 25.</p>
      {state.pet.collection.length === 0
        ? <div className="bg-card p-4 rounded border border-black text-center"><div className="text-3xl mb-2">🐾</div><p className="text-xs text-muted-foreground">Nenhum mascote ainda. Derrote monstros!</p></div>
        : (
          <div className="flex flex-col gap-2 mb-4">
            {state.pet.collection.map(petInst => {
              const pd = petsDB.find(p => p.id === petInst.id);
              if (!pd) return null;
              const isActive = state.pet.active === petInst.id;
              const expPct = Math.min(100, (petInst.exp / petInst.nextExp) * 100);
              return (
                <div key={petInst.id} className={`bg-card p-3 rounded border-2 ${isActive ? 'border-secondary' : 'border-black'}`} data-testid={`pet-${petInst.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{pd.icon}</span>
                    <div className="flex-1"><div className="text-xs font-bold text-secondary">{pd.name}</div><div className="text-[10px] text-muted-foreground">Lv {petInst.lv}</div></div>
                    {isActive ? <span className="text-[10px] text-secondary font-bold">✓ Ativo</span> : <Btn onClick={() => dispatch({ type: 'EQUIP_PET', petId: petInst.id })} className="bg-primary text-white text-[10px]">Ativar</Btn>}
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1">{pd.desc}</div>
                  <div className="text-[10px] text-muted-foreground mb-0.5">XP: {petInst.exp}/{petInst.nextExp}</div>
                  <div className="h-1.5 bg-black rounded overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${expPct}%` }} /></div>
                  {pd.evolutionId && <div className="text-[10px] text-yellow-400 mt-1">→ {petsDB.find(p => p.id === pd.evolutionId)?.name}</div>}
                </div>
              );
            })}
          </div>
        )}
      <div>
        <div className="text-xs font-bold text-secondary mb-2">Todos os Pets</div>
        <div className="grid grid-cols-2 gap-2">
          {petsDB.filter(p => !p.isEvo).map(pet => {
            const has = state.pet.collection.find(c => c.id === pet.id);
            return (
              <div key={pet.id} className={`bg-card p-2 rounded border border-black text-xs ${!has ? 'opacity-40' : ''}`}>
                <div className="text-xl">{pet.icon}</div>
                <div className="font-bold text-xs mt-0.5">{pet.name}</div>
                <div className="text-[10px] text-muted-foreground">{pet.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DUNGEONS TAB
// ─────────────────────────────────────────────────────────────────────────────
function DungeonsTab() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <SectionTitle>DUNGEONS</SectionTitle>
      <div className="bg-card p-3 rounded border-2 border-yellow-600 mb-4">
        <div className="text-sm font-bold text-yellow-400 mb-1">🏛️ Templo de Ouro</div>
        <div className="text-xs text-muted-foreground mb-2">3 fases de combate intenso. Recompensas de Zeny imensas, quase sem XP.</div>
        <div className="text-xs mb-2">Entradas hoje: <span className="font-bold text-secondary">{state.progress.dungeonEntries}/3</span></div>
        {state.isDungeon
          ? <Btn onClick={() => dispatch({ type: 'EXIT_DUNGEON' })} className="bg-red-700 text-white w-full">Sair do Templo</Btn>
          : <Btn onClick={() => dispatch({ type: 'ENTER_DUNGEON' })} disabled={state.progress.dungeonEntries <= 0} className="bg-yellow-600 text-black font-bold w-full" data-testid="button-enter-dungeon">Entrar no Templo de Ouro</Btn>}
      </div>
      <div className="text-xs font-bold text-secondary mb-2">Mapas</div>
      {mapsDB.map((map, i) => {
        const unlocked = i <= state.progress.highestMapIdx;
        return (
          <div key={i} className={`bg-card p-2 rounded border border-black mb-1 flex justify-between text-xs ${!unlocked ? 'opacity-40' : ''}`}>
            <div><div className="font-bold">{map.name}</div><div className="text-muted-foreground">Req: {map.req}</div></div>
            {unlocked ? <span className="text-green-400">✓</span> : <span className="text-red-400">🔒</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIFTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function RiftsTab() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <SectionTitle>FENDAS ABISSAIS</SectionTitle>
      <div className="bg-card p-3 rounded border-2 border-purple-600 mb-4">
        <div className="text-sm font-bold text-purple-400 mb-1">🌀 Fenda Abissal</div>
        <div className="text-xs text-muted-foreground mb-2">Andares infinitos de monstros cada vez mais fortes.</div>
        <div className="text-xs mb-2">Recorde: <span className="font-bold text-secondary">Andar {state.riftRecord}</span>{state.isRift && <span className="text-purple-400 ml-2">· Atual: {state.riftFloor}</span>}</div>
        {state.isRift
          ? <Btn onClick={() => dispatch({ type: 'EXIT_RIFT' })} className="bg-red-700 text-white w-full">Abandonar Fenda</Btn>
          : <Btn onClick={() => dispatch({ type: 'ENTER_RIFT' })} className="bg-purple-700 text-white w-full" data-testid="button-enter-rift">Entrar na Fenda Abissal</Btn>}
      </div>
      <div className="bg-card p-2 rounded border border-black text-xs">
        <div className="font-bold text-secondary mb-1">Mecânicas</div>
        <div className="text-muted-foreground">• Cada andar os monstros ficam mais fortes<br />• Recompensas crescentes<br />• Ao morrer, recorde é salvo</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAVERN TAB
// ─────────────────────────────────────────────────────────────────────────────
function TavernTab() {
  const { state, dispatch } = useGame();
  const available = questsDB.filter(q => !state.tavern.completedQuests.includes(q.id) && !state.tavern.activeQuests.find(a => a.id === q.id));
  return (
    <div>
      <SectionTitle>TAVERNA — QUESTS</SectionTitle>
      {available.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-secondary mb-2">Disponíveis</div>
          {available.map(q => (
            <div key={q.id} className="bg-card p-2 rounded border border-black mb-2 text-xs" data-testid={`quest-${q.id}`}>
              <div className="font-bold text-secondary mb-0.5">{q.name}</div>
              <div className="text-muted-foreground mb-1">{q.desc}</div>
              <div className="text-yellow-400 mb-1">+{q.rewardZeny}Z +{q.rewardExp}XP</div>
              <Btn onClick={() => dispatch({ type: 'ACCEPT_QUEST', questId: q.id })} className="bg-primary text-white text-[10px]">Aceitar</Btn>
            </div>
          ))}
        </div>
      )}
      {state.tavern.activeQuests.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-secondary mb-2">Ativas</div>
          {state.tavern.activeQuests.map(aq => {
            const qDef = questsDB.find(q => q.id === aq.id);
            if (!qDef) return null;
            const done = aq.progress >= qDef.req;
            return (
              <div key={aq.id} className={`bg-card p-2 rounded border-2 ${done ? 'border-green-600' : 'border-black'} mb-2 text-xs`}>
                <div className="font-bold text-secondary mb-0.5">{qDef.name}</div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex-1 h-1.5 bg-black rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (aq.progress / qDef.req) * 100)}%` }} /></div>
                  <span className="text-[10px]">{aq.progress}/{qDef.req}</span>
                </div>
                {done && <Btn onClick={() => dispatch({ type: 'COMPLETE_QUEST', questId: aq.id })} className="bg-green-700 text-white text-[10px]">Completar (+{qDef.rewardZeny}Z)</Btn>}
              </div>
            );
          })}
        </div>
      )}
      {state.tavern.completedQuests.length > 0 && (
        <div>
          <div className="text-xs font-bold text-secondary mb-2">Concluídas ({state.tavern.completedQuests.length})</div>
          {state.tavern.completedQuests.map(qid => {
            const qDef = questsDB.find(q => q.id === qid);
            return qDef ? <div key={qid} className="bg-card p-1.5 rounded border border-black mb-1 text-xs flex justify-between opacity-60"><span>{qDef.name}</span><span className="text-green-400">✓</span></div> : null;
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BESTIARY TAB
// ─────────────────────────────────────────────────────────────────────────────
function BestiaryTab() {
  const { state } = useGame();
  const totalKills = Object.values(state.progress.bestiary).reduce((s, b) => s + b.killed, 0);
  return (
    <div>
      <SectionTitle>BESTIÁRIO — {totalKills} abatidos</SectionTitle>
      <div className="flex flex-col gap-1.5 max-h-[520px] overflow-y-auto pr-1">
        {monstersDB.map(m => {
          const entry = state.progress.bestiary[m.id];
          const discovered = entry?.discovered;
          return (
            <div key={m.id} className={`bg-card p-2 rounded border border-black flex gap-2 items-center ${!discovered ? 'opacity-25' : ''}`} data-testid={`bestiary-${m.id}`}>
              <img src={m.img} alt={m.name} className="w-10 h-10 object-contain rounded border border-black bg-black/30 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{discovered ? m.name : '???'}</div>
                {discovered && <div className="text-[10px] text-muted-foreground">Lv {m.lv} · ATK {m.atk} · DEF {m.def}</div>}
              </div>
              {discovered && <span className="text-[10px] text-yellow-400 shrink-0 font-bold">×{entry.killed}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function AchievementsTab() {
  const { state, dispatch } = useGame();
  const getProgress = (ach: typeof achievementsDB[0]) => {
    if (ach.type === 'monsters') return state.stats.monstersDefeated;
    if (ach.type === 'zeny') return state.hero.zeny;
    if (ach.type === 'potions') return state.stats.potionsUsed;
    if (ach.type === 'bonus') return state.stats.bonusReceived;
    if (ach.type === 'bosses') return state.stats.bossesDefeated;
    return 0;
  };
  return (
    <div>
      <SectionTitle>CONQUISTAS</SectionTitle>
      <div className="flex flex-col gap-2">
        {achievementsDB.map(ach => {
          const progress = getProgress(ach);
          const done = progress >= ach.req;
          const claimed = state.progress.achievements[ach.id]?.claimed;
          return (
            <div key={ach.id} className={`bg-card p-2 rounded border-2 ${claimed ? 'border-yellow-500' : done ? 'border-green-600' : 'border-black'} text-xs`} data-testid={`achievement-${ach.id}`}>
              <div className="flex justify-between items-start mb-1">
                <div><span className="font-bold text-secondary">{claimed ? '🏆 ' : ''}{ach.name}</span><div className="text-[10px] text-muted-foreground">{ach.desc}</div></div>
                {done && !claimed && <Btn onClick={() => dispatch({ type: 'CLAIM_ACHIEVEMENT', achId: ach.id })} className="bg-yellow-600 text-black text-[10px] ml-2 shrink-0">Resgatar</Btn>}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-black rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (progress / ach.req) * 100)}%` }} /></div>
                <span className="text-[10px] text-muted-foreground">{progress}/{ach.req}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY TAB
// ─────────────────────────────────────────────────────────────────────────────
function HistoryTab() {
  const { state } = useGame();
  return (
    <div>
      <SectionTitle>HISTÓRICO DE BÔNUS</SectionTitle>
      {state.progress.bonusHistory.length === 0
        ? <p className="text-xs text-muted-foreground">Nenhum bônus monstruoso recebido.<br /><span className="text-[10px]">5% de chance ao derrotar monstros!</span></p>
        : (
          <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
            {state.progress.bonusHistory.map((entry, i) => (
              <div key={i} className="bg-card p-2 rounded border border-black text-xs">
                <div className="flex justify-between items-center"><span className="font-bold text-teal-400">✨ Bônus Monstruoso</span><span className="text-[10px] text-muted-foreground">{entry.time}</span></div>
                <div className="text-muted-foreground mt-0.5">{entry.monsterName}: <span className="text-yellow-400">+{entry.zeny.toLocaleString()}Z</span> · <span className="text-blue-400">+{entry.xp.toLocaleString()}XP</span></div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RANKING TAB
// ─────────────────────────────────────────────────────────────────────────────
function RankingTab() {
  const { state } = useGame();
  return (
    <div>
      <SectionTitle>RANKING DE CICLOS</SectionTitle>
      <div className="bg-card p-2 rounded border border-black mb-3 text-xs grid grid-cols-2 gap-1">
        {[
          ['Ciclos', state.progress.completedCycles], ['Reborns', state.stats.reborns],
          ['Monstros', state.stats.monstersDefeated], ['Bosses', state.stats.bossesDefeated],
          ['Bônus', state.stats.bonusReceived], ['Zeny Total', state.stats.totalZenyEarned.toLocaleString()],
        ].map(([k, v]) => (
          <div key={String(k)}><span className="text-muted-foreground">{k}: </span><span className="font-bold text-secondary">{v}</span></div>
        ))}
      </div>
      {state.ranking.length === 0
        ? <p className="text-xs text-muted-foreground">Derrote um chefe para registrar seu ciclo!</p>
        : (
          <div className="flex flex-col gap-1.5">
            {state.ranking.slice().reverse().map((entry, i) => (
              <div key={i} className="bg-card p-2 rounded border border-black text-xs flex justify-between">
                <div><span className="text-yellow-400 font-bold mr-2">#{state.ranking.length - i}</span>Ciclo {entry.cycle} · Lv {entry.lv}</div>
                <div className="text-right text-muted-foreground"><div>{entry.zeny.toLocaleString()}Z</div><div className="text-[9px]">{entry.time}</div></div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────────────────────────────────────
function SettingsTab() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <SectionTitle>CONFIGURAÇÕES</SectionTitle>
      <div className="flex flex-col gap-3">
        <div className="bg-card p-3 rounded border border-black flex justify-between items-center">
          <div><div className="text-xs font-bold">Som</div><div className="text-[10px] text-muted-foreground">Efeitos sonoros de combate</div></div>
          <button onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} className={`px-4 py-1.5 border-2 border-black rounded text-xs font-bold ${state.settings.soundOn ? 'bg-green-700 text-white' : 'bg-popover text-muted-foreground'}`} data-testid="toggle-sound">
            {state.settings.soundOn ? '🔊 ON' : '🔇 OFF'}
          </button>
        </div>
        <div className="bg-card p-3 rounded border border-black">
          <div className="text-xs font-bold mb-1">Salvar Jogo</div>
          <div className="text-[10px] text-muted-foreground mb-2">O jogo salva automaticamente a cada 30 segundos.</div>
          <Btn onClick={() => { localStorage.setItem('ragnarok_ultimate_save', JSON.stringify(state)); alert('Progresso salvo!'); }} className="bg-primary text-white w-full" data-testid="button-save">💾 Salvar Agora</Btn>
        </div>
        <div className="bg-card p-3 rounded border border-red-900">
          <div className="text-xs font-bold text-red-400 mb-1">Resetar Jogo</div>
          <div className="text-[10px] text-muted-foreground mb-2">ATENÇÃO: Apaga todo o progresso permanentemente.</div>
          <Btn onClick={() => { if (confirm('Resetar TUDO? Irreversível!')) { localStorage.removeItem('ragnarok_ultimate_save'); window.location.reload(); } }} className="bg-red-900 text-white w-full" data-testid="button-reset">⚠️ Resetar Tudo</Btn>
        </div>
        <div className="bg-card p-3 rounded border border-black text-xs">
          <div className="font-bold text-secondary mb-1">Info</div>
          <div className="text-muted-foreground">Versão 1.0 React · Ciclos: {state.progress.completedCycles} · Reborns: {state.stats.reborns}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB ROUTER
// ─────────────────────────────────────────────────────────────────────────────
function TabContent() {
  const { activeTab } = useGame();
  switch (activeTab) {
    case 'inventory': return <InventoryTab />;
    case 'attributes': return <AttributesTab />;
    case 'shop': return <ShopTab />;
    case 'forge': return <ForgeTab />;
    case 'classes': return <ClassesTab />;
    case 'skills': return <SkillsTab />;
    case 'pets': return <PetsTab />;
    case 'dungeons': return <DungeonsTab />;
    case 'rifts': return <RiftsTab />;
    case 'tavern': return <TavernTab />;
    case 'bestiary': return <BestiaryTab />;
    case 'achievements': return <AchievementsTab />;
    case 'history': return <HistoryTab />;
    case 'ranking': return <RankingTab />;
    case 'settings': return <SettingsTab />;
    default: return <div className="text-xs text-muted-foreground">Selecione uma aba.</div>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'inventory', icon: '🎒', title: 'Inventário' },
  { id: 'attributes', icon: '📈', title: 'Atributos' },
  { id: 'shop', icon: '🏪', title: 'Loja' },
  { id: 'forge', icon: '🔨', title: 'Ferraria' },
  { id: 'classes', icon: '🎓', title: 'Classes' },
  { id: 'skills', icon: '✨', title: 'Habilidades' },
  { id: 'pets', icon: '🐾', title: 'Mascotes' },
  { id: 'dungeons', icon: '⚔️', title: 'Dungeons' },
  { id: 'rifts', icon: '🌀', title: 'Fendas' },
  { id: 'tavern', icon: '🍻', title: 'Taverna' },
  { id: 'bestiary', icon: '📚', title: 'Bestiário' },
  { id: 'achievements', icon: '🏆', title: 'Conquistas' },
  { id: 'history', icon: '📜', title: 'Histórico' },
  { id: 'ranking', icon: '🏅', title: 'Ranking' },
  { id: 'settings', icon: '⚙️', title: 'Config' },
];

function GameLayout() {
  const { activeTab, setActiveTab } = useGame();
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <div className="bg-card border-r-2 border-black flex flex-col items-center py-2 gap-1.5 shrink-0 overflow-y-auto" style={{ width: 58, scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            title={tab.title}
            onClick={() => setActiveTab(tab.id)}
            className={`w-10 h-10 rounded border-2 border-black text-xl flex items-center justify-center cursor-pointer shrink-0 transition-all
              ${activeTab === tab.id ? 'bg-primary border-secondary' : 'bg-popover hover:bg-primary/20'}`}
            data-testid={`tab-${tab.id}`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto min-w-0 p-4" style={{ scrollbarWidth: 'thin' }}>
        <div className="max-w-lg mx-auto">
          <TabContent />
        </div>
      </main>

      {/* Combat Panel */}
      <CombatPanel />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
