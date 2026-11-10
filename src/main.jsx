import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase, isSupabaseConfigured } from "./supabase";
import "./style.css";

const demoProducts = [
  { id: "demo-1", name: "Sac artisanal africain", description: "Un accessoire élégant fabriqué avec soin.", price: 12500, currency: "XOF", category: "Mode", image_url: "", profiles: { full_name: "Boutique partenaire" } },
  { id: "demo-2", name: "Formation marketing digital", description: "Apprenez les bases pour développer votre activité.", price: 15000, currency: "XOF", category: "Formation", image_url: "", profiles: { full_name: "TAF Academy" } },
  { id: "demo-3", name: "Écouteurs sans fil", description: "Écouteurs pratiques pour le quotidien.", price: 9500, currency: "XOF", category: "Électronique", image_url: "", profiles: { full_name: "Tech Store" } },
];

const money = (value, currency = "XOF") => new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value || 0));
const navItems = ["Accueil", "Acheter", "Vendre", "Affiliation"];

function App() {
  const [page, setPage] = useState("Accueil");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(demoProducts);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState("signup");
  const [auth, setAuth] = useState({ email: "", password: "", full_name: "" });
  const [product, setProduct] = useState({ name: "", description: "", price: "", currency: "XOF", category: "Autre", image_url: "" });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProducts() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from("products").select("id,name,description,price,currency,category,image_url").eq("is_active", true).order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    if (error) setNotice("Chargement des produits impossible : " + error.message);
  }
  useEffect(() => { loadProducts(); }, []);

  const categories = useMemo(() => ["Toutes", ...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const visibleProducts = products.filter(p => (category === "Toutes" || p.category === category) && (p.name + " " + (p.description || "")).toLowerCase().includes(search.toLowerCase()));

  async function submitAuth(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    if (!isSupabaseConfigured) { setNotice("La connexion sera activée après ajout des clés publiques Supabase dans l’hébergement."); setBusy(false); return; }
    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email: auth.email, password: auth.password, options: { data: { full_name: auth.full_name } } })
      : await supabase.auth.signInWithPassword({ email: auth.email, password: auth.password });
    setNotice(result.error ? result.error.message : (authMode === "signup" ? "Compte créé. Vérifiez votre e-mail si la confirmation est activée." : "Connexion réussie."));
    setBusy(false);
  }

  async function submitProduct(e) {
    e.preventDefault();
    if (!user) { setPage("Connexion"); setNotice("Connectez-vous pour publier un produit."); return; }
    setBusy(true); setNotice("");
    const { error } = await supabase.from("products").insert({ ...product, price: Number(product.price), owner_id: user.id });
    setNotice(error ? "Publication impossible : " + error.message : "Votre produit est publié.");
    if (!error) { setProduct({ name: "", description: "", price: "", currency: "XOF", category: "Autre", image_url: "" }); await loadProducts(); setPage("Acheter"); }
    setBusy(false);
  }

  async function signOut() { await supabase.auth.signOut(); setNotice("Vous êtes déconnecté."); setPage("Accueil"); }
  function addToCart(item) { setCart(items => [...items, item]); setNotice(item.name + " ajouté au panier."); }
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#accueil" onClick={e => { e.preventDefault(); setPage("Accueil"); }}><span className="brand-mark">T</span><span>TAF <strong>MARKET</strong></span></a>
      <nav aria-label="Navigation principale">{navItems.map(item => <button key={item} className={page === item ? "nav-link active" : "nav-link"} onClick={() => setPage(item)}>{item}</button>)}<button className={page === "Connexion" ? "nav-link active" : "nav-link"} onClick={() => setPage("Connexion")}>{user ? "Mon compte" : "Connexion"}</button><button className="cart-link" onClick={() => setPage("Panier")}>Panier ({cart.length})</button></nav>
    </header>
    <main>
      {!isSupabaseConfigured && <div className="setup-alert"><strong>Mode aperçu</strong> — le catalogue de démonstration est visible. Les comptes et publications seront activés après configuration sécurisée de Supabase.</div>}
      {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Fermer">×</button></div>}

      {page === "Accueil" && <>
        <section className="hero"><div className="hero-copy"><span className="eyebrow">LA MARKETPLACE QUI VOUS CONNECTE</span><h1>Tout le commerce, au même endroit.</h1><p>Achetez, vendez et développez vos revenus grâce à l’affiliation sur TAF Market.</p><div className="hero-actions"><button className="primary-btn" onClick={() => setPage("Acheter")}>Découvrir les produits</button><button className="secondary-btn" onClick={() => setPage("Vendre")}>Devenir vendeur</button></div><div className="hero-proof"><span>✓ Multi-vendeurs</span><span>✓ Afrique & international</span><span>✓ Mobile-first</span></div></div><div className="hero-art"><div className="art-circle"></div><div className="art-card card-one"><span>🛍️</span><b>Acheter</b><small>Simplement</small></div><div className="art-card card-two"><span>📦</span><b>Vendre</b><small>Facilement</small></div><div className="art-card card-three"><span>🤝</span><b>Affilier</b><small>Intelligemment</small></div></div></section>
        <section className="intro"><span className="eyebrow">UN SEUL ESPACE, TROIS POSSIBILITÉS</span><h2>Développez vos activités avec TAF Market</h2><p>Une plateforme conçue pour rapprocher vendeurs, acheteurs et partenaires.</p></section>
        <section className="feature-grid"><article className="feature"><div className="feature-icon">🛒</div><h3>Espace Acheteur</h3><p>Découvrez des produits et contactez les vendeurs.</p><button onClick={() => setPage("Acheter")}>Explorer →</button></article><article className="feature"><div className="feature-icon">🏪</div><h3>Espace Vendeur</h3><p>Créez votre catalogue et présentez vos produits.</p><button onClick={() => setPage("Vendre")}>Publier un produit →</button></article><article className="feature"><div className="feature-icon">💸</div><h3>Espace Affilié</h3><p>Préparez le partage de produits et le suivi des commissions.</p><button onClick={() => setPage("Affiliation")}>En savoir plus →</button></article></section>
      </>}

      {page === "Acheter" && <section className="page-section"><div className="section-heading"><span className="eyebrow">LE CATALOGUE</span><h1>Découvrez les produits</h1><p>Recherchez une offre parmi les produits disponibles.</p></div><div className="catalog-tools"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit…" /><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div><div className="product-grid">{visibleProducts.map(item => <article className="product-card" key={item.id}><div className="product-image">{item.image_url ? <img src={item.image_url} alt={item.name} /> : <span>📦</span>}</div><div className="product-info"><small>{item.category || "Produit"}</small><h3>{item.name}</h3><p>{item.description}</p><strong>{money(item.price, item.currency)}</strong><span className="seller-name">Vendeur : {item.profiles?.full_name || "Partenaire TAF Market"}</span><button className="primary-btn" onClick={() => addToCart(item)}>Ajouter au panier</button></div></article>)}</div>{visibleProducts.length === 0 && <p className="empty-state">Aucun produit ne correspond à votre recherche.</p>}</section>}

      {page === "Vendre" && <section className="page-section narrow"><div className="section-heading"><span className="eyebrow">ESPACE VENDEUR</span><h1>Publier un produit</h1><p>Connectez-vous puis renseignez les informations de votre offre.</p></div>{!user ? <div className="panel"><p>La publication est réservée aux membres connectés.</p><button className="primary-btn" onClick={() => setPage("Connexion")}>Créer un compte / Se connecter</button></div> : <form className="panel form-grid" onSubmit={submitProduct}><label>Nom du produit<input required maxLength="100" value={product.name} onChange={e => setProduct({...product,name:e.target.value})} /></label><label>Catégorie<select value={product.category} onChange={e => setProduct({...product,category:e.target.value})}>{["Mode","Électronique","Maison","Beauté","Formation","Services","Autre"].map(c=><option key={c}>{c}</option>)}</select></label><label>Prix<input required type="number" min="1" step="1" value={product.price} onChange={e => setProduct({...product,price:e.target.value})} /></label><label>Devise<select value={product.currency} onChange={e => setProduct({...product,currency:e.target.value})}><option value="XOF">FCFA (XOF)</option><option value="EUR">Euro (EUR)</option><option value="USD">Dollar (USD)</option></select></label><label className="full">Description<textarea required rows="4" maxLength="1000" value={product.description} onChange={e => setProduct({...product,description:e.target.value})}/></label><label className="full">Lien de l’image (facultatif)<input type="url" placeholder="https://…" value={product.image_url} onChange={e => setProduct({...product,image_url:e.target.value})}/></label><button className="primary-btn full" disabled={busy}>{busy ? "Publication…" : "Publier le produit"}</button></form>}</section>}

      {page === "Affiliation" && <section className="page-section narrow"><div className="section-heading"><span className="eyebrow">PROGRAMME PARTENAIRE</span><h1>Gagnez en recommandant</h1><p>Le programme d’affiliation est préparé pour permettre aux partenaires de promouvoir les offres des vendeurs.</p></div><div className="panel"><h2>Comment ça fonctionnera</h2><ol className="steps"><li>Créez votre compte TAF Market.</li><li>Choisissez les produits que vous souhaitez recommander.</li><li>Partagez votre lien partenaire avec votre audience.</li><li>Suivez les ventes validées et vos commissions dans votre espace.</li></ol><p className="muted">Les liens de suivi, calculs de commissions et retraits seront activés après mise en place des règles serveur et du système de paiement. Aucune commission n’est calculée dans cette version.</p><button className="primary-btn" onClick={() => setPage("Connexion")}>Rejoindre TAF Market</button></div></section>}

      {page === "Connexion" && <section className="page-section narrow"><div className="section-heading"><span className="eyebrow">VOTRE ESPACE</span><h1>{user ? "Votre compte" : authMode === "signup" ? "Créer un compte" : "Se connecter"}</h1><p>Un compte pour acheter, vendre et participer au programme partenaire.</p></div>{user ? <div className="panel"><p>Connecté avec <strong>{user.email}</strong></p><button className="secondary-btn" onClick={signOut}>Se déconnecter</button></div> : <form className="panel form-grid" onSubmit={submitAuth}>{authMode === "signup" && <label className="full">Nom complet<input required value={auth.full_name} onChange={e => setAuth({...auth,full_name:e.target.value})}/></label>}<label className="full">Adresse e-mail<input required type="email" autoComplete="email" value={auth.email} onChange={e => setAuth({...auth,email:e.target.value})}/></label><label className="full">Mot de passe<input required minLength="8" type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} value={auth.password} onChange={e => setAuth({...auth,password:e.target.value})}/></label><button className="primary-btn full" disabled={busy}>{busy ? "Patientez…" : authMode === "signup" ? "Créer mon compte" : "Me connecter"}</button><button type="button" className="text-btn full" onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}>{authMode === "signup" ? "J’ai déjà un compte" : "Créer un nouveau compte"}</button></form>}</section>}

      {page === "Panier" && <section className="page-section narrow"><div className="section-heading"><span className="eyebrow">VOTRE SÉLECTION</span><h1>Mon panier</h1></div><div className="panel">{cart.length ? <>{cart.map((item,index)=><div className="cart-row" key={index}><span>{item.name}</span><strong>{money(item.price,item.currency)}</strong><button className="text-btn" onClick={() => setCart(items => items.filter((_,i)=>i!==index))}>Retirer</button></div>)}<div className="cart-total"><strong>Total indicatif</strong><strong>{money(cartTotal, cart[0]?.currency || "XOF")}</strong></div><p className="muted">Le paiement en ligne n’est pas encore activé. Ne procédez à aucun transfert d’argent sur la base de cet aperçu.</p></> : <p>Votre panier est vide. <button className="text-btn" onClick={() => setPage("Acheter")}>Découvrir les produits</button></p>}</div></section>}
    </main>
    <footer><span>© {new Date().getFullYear()} TAF Market</span><span>Achetez · Vendez · Affiliez</span><span>Mobile Money et cartes : intégration à venir</span></footer>
  </div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
