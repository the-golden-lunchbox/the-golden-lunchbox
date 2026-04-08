import React, { useState, useEffect } from 'react';

// --- PREMIUM GOLDEN ICONS ---
const IconLunchbox = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="4" />
    <path d="M7 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" />
    <line x1="3" y1="14" x2="21" y2="14" />
  </svg>
);

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const IconBook = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('fridge');
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', days: 3 });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- YOUR LIVE GOOGLE SHEET CSV LINK ---
  const RECIPES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4iXHyFAKYN3GNrZofAkI_GZOX2K20b5JKK3zb_EPO_PKIk1E1fw_5Wu894LP9qup1Bt-6Rq56oMAv/pub?gid=0&single=true&output=csv";

  // --- ROBUST CSV PARSER ---
  const parseCSV = (text) => {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (char === '"' && inQuotes && nextChar === '"') { currentField += '"'; i++; }
      else if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { currentRow.push(currentField.trim()); currentField = ''; }
      else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); }
        currentRow = []; currentField = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { currentField += char; }
    }
    if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); }
    const headers = rows[0] || [];
    return rows.slice(1).map(row => headers.reduce((obj, header, i) => { obj[header] = row[i]; return obj; }, {}));
  };

  useEffect(() => {
    const saved = localStorage.getItem('golden-lunchbox-data');
    if (saved) setInventory(JSON.parse(saved));

    const fetchData = async () => {
      if (!RECIPES_CSV_URL) return;
      setLoading(true);
      try {
        const response = await fetch(RECIPES_CSV_URL);
        const text = await response.text();
        const data = parseCSV(text);
        
        const formatted = data.map(r => ({
          id: r.ID || Math.random(),
          title: r.Title || "Recipe",
          tags: r.Tags ? r.Tags.split('|').map(t => t.trim()) : ["Golden"],
          instructions: r.Recipes || r.Instructions || "No instructions provided.",
          time: r.Efforts || r.Time || "15m",
          isPremium: String(r.IsPremium).toUpperCase() === 'TRUE'
        }));
        setRecipes(formatted);
      } catch (e) {
        console.error("Sync Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('golden-lunchbox-data', JSON.stringify(inventory));
  }, [inventory]);

  const addItem = () => {
    if (!newItem.name.trim()) return;
    setInventory([{ ...newItem, id: Date.now() }, ...inventory]);
    setNewItem({ name: '', days: 3 });
  };

  return (
    <div className="min-h-screen bg-[#FCF9F1] text-amber-950 font-sans pb-32">
      <header className="bg-white/90 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50 px-6 py-6 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-tighter flex items-center gap-2 uppercase leading-none">
              <IconLunchbox /> THE GOLDEN LUNCHBOX
            </h1>
            <p className="text-[9px] font-black text-amber-300 uppercase tracking-[0.2em] mt-2 leading-none italic">
              {recipes.length > 0 ? "✨ Syncing Live Library" : "Rescue • Healthy Kids"}
            </p>
          </div>
          <div className="bg-amber-400 text-white p-2.5 rounded-2xl shadow-lg ring-2 ring-white">
            <IconCheck />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-5 space-y-8">
        {activeTab === 'fridge' && (
          <section className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border border-amber-50">
              <label className="block text-[10px] font-black text-amber-400 uppercase mb-4 tracking-widest px-1">Inventory Rescue</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="e.g. 500ml Pumpkin"
                  className="flex-1 bg-amber-50/50 rounded-2xl px-6 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-amber-200 transition-all placeholder:text-amber-200"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  onKeyPress={e => e.key === 'Enter' && addItem()}
                />
                <button onClick={addItem} className="bg-amber-500 text-white font-black py-4 px-8 rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest active:scale-95 transition-transform">
                  <IconCheck /> Log Item
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {inventory.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-[2.2rem] flex items-center justify-between border border-amber-50 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-amber-300 to-amber-500"></div>
                    <p className="font-black text-amber-900">{item.name}</p>
                  </div>
                  <button onClick={() => setInventory(inventory.filter(i => i.id !== item.id))} className="p-2.5 text-amber-100 hover:text-red-400"><IconTrash /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'recipes' && (
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="py-20 text-center font-black text-amber-200 animate-pulse uppercase tracking-widest italic">Syncing with Google...</div>
            ) : (
              <div className="grid gap-5">
                {recipes.length > 0 ? recipes.map(recipe => (
                  <div key={recipe.id} className="bg-white p-8 rounded-[3rem] border border-amber-50 shadow-sm relative overflow-hidden group">
                    {recipe.isPremium && <div className="absolute top-4 right-4 bg-amber-500 text-white text-[8px] font-black px-3 py-1 rounded-full">PREMIUM</div>}
                    <div className="flex gap-2 mb-4">
                      {recipe.tags.map(tag => <span key={tag} className="text-[9px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter">{tag}</span>)}
                    </div>
                    <h3 className="font-black text-xl text-amber-900">{recipe.title}</h3>
                    <p className="text-amber-800/60 text-sm mt-4 leading-relaxed font-medium">{recipe.instructions}</p>
                    <div className="mt-6 pt-6 border-t border-amber-50 flex items-center justify-between text-amber-300">
                      <span className="text-[10px] font-black uppercase tracking-widest italic font-bold">Prep: {recipe.time}</span>
                      <button className="text-amber-500 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-full hover:bg-amber-100 transition-colors">View Guide</button>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center border-2 border-dashed border-amber-100 rounded-[3rem] opacity-30">
                    <p className="text-amber-800 font-black text-sm uppercase tracking-widest">Update your Google Sheet to see recipes here!</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'sales' && (
          <section className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="bg-amber-500 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
               <h2 className="text-3xl font-black mb-3 italic tracking-tighter uppercase leading-none">Sale Radar</h2>
               <p className="text-amber-100 text-sm font-medium opacity-90">Deals for your next golden batch prep.</p>
               <div className="bg-white/10 backdrop-blur-xl p-7 rounded-[2rem] border border-white/20 mt-8 flex justify-between items-center">
                  <p className="text-2xl font-black uppercase tracking-tighter">Yams & Squash</p>
                  <div className="bg-white text-amber-500 px-6 py-2.5 rounded-2xl font-black text-[11px]">ON SALE</div>
               </div>
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xl border border-amber-100 p-3 flex gap-2 rounded-[2.8rem] shadow-2xl z-[100] ring-8 ring-amber-500/5">
        <button onClick={() => setActiveTab('fridge')} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] transition-all duration-500 ${activeTab === 'fridge' ? 'bg-amber-500 text-white shadow-xl scale-105' : 'text-amber-200'}`}>
          <IconCheck />{activeTab === 'fridge' && <span className="font-black text-[10px] tracking-widest uppercase font-black">Rescue</span>}
        </button>
        <button onClick={() => setActiveTab('recipes')} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] transition-all duration-500 ${activeTab === 'recipes' ? 'bg-amber-500 text-white shadow-xl scale-105' : 'text-amber-200'}`}>
          <IconBook />{activeTab === 'recipes' && <span className="font-black text-[10px] tracking-widest uppercase font-black">Library</span>}
        </button>
        <button onClick={() => setActiveTab('sales')} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] transition-all duration-500 ${activeTab === 'sales' ? 'bg-amber-500 text-white shadow-xl scale-105' : 'text-amber-200'}`}>
          <IconLunchbox />{activeTab === 'sales' && <span className="font-black text-[10px] tracking-widest uppercase font-black">Sales</span>}
        </button>
      </nav>
    </div>
  );
};

export default App;
