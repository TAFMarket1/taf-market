import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const sections = {
  Accueil: {
    title: "Tout le commerce, au même endroit.",
    description: "Achetez, vendez et développez vos revenus grâce à l’affiliation sur TAF Market.",
  },
  Acheter: {
    title: "Trouvez ce qu’il vous faut.",
    description: "Découvrez bientôt les produits proposés par les vendeurs de TAF Market.",
  },
  Vendre: {
    title: "Votre boutique commence ici.",
    description: "Préparez votre espace vendeur et présentez vos produits à de nouveaux clients.",
  },
  Affiliation: {
    title: "Recommandez. Partagez. Gagnez.",
    description: "L’espace affiliation permettra de partager des produits et de suivre ses commissions.",
  },
  Connexion: {
    title: "Bienvenue sur TAF Market.",
    description: "La création de compte et la connexion seront activées après la vérification de la configuration Supabase.",
  },
};

function App() {
  const [active, setActive] = useState("Accueil");
  const current = sections[active];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setActive("Accueil"); }}>
          <span className="brand-mark">T</span>
          <span>TAF <strong>MARKET</strong></span>
        </a>
        <nav aria-label="Navigation principale">
          {Object.keys(sections).map((name) => (
            <button key={name} className={active === name ? "nav-link active" : "nav-link"} onClick={() => setActive(name)}>
              {name}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">LA MARKETPLACE QUI VOUS CONNECTE</span>
            <h1>{current.title}</h1>
            <p>{current.description}</p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => setActive("Acheter")}>Découvrir les produits</button>
              <button className="secondary-btn" onClick={() => setActive("Vendre")}>Devenir vendeur</button>
            </div>
          </div>
          <div className="hero-art" aria-label="Illustration du commerce en ligne">
            <div className="art-circle"></div>
            <div className="art-card card-one"><span>🛍️</span><b>Acheter</b><small>Simplement</small></div>
            <div className="art-card card-two"><span>📦</span><b>Vendre</b><small>Facilement</small></div>
            <div className="art-card card-three"><span>🤝</span><b>Affilier</b><small>Intelligemment</small></div>
          </div>
        </section>

        <section className="intro">
          <span className="eyebrow">UN SEUL ESPACE, TROIS POSSIBILITÉS</span>
          <h2>Développez vos activités avec TAF Market</h2>
          <p>Que vous souhaitiez acheter, vendre ou recommander des produits, votre place est ici.</p>
        </section>

        <section className="feature-grid">
          <article className="feature">
            <div className="feature-icon">🛒</div>
            <h3>Espace Acheteur</h3>
            <p>Parcourez les offres et trouvez les produits qui vous intéressent.</p>
            <button onClick={() => setActive("Acheter")}>Explorer <span>→</span></button>
          </article>
          <article className="feature">
            <div className="feature-icon">🏪</div>
            <h3>Espace Vendeur</h3>
            <p>Préparez votre boutique et développez votre activité en ligne.</p>
            <button onClick={() => setActive("Vendre")}>Ouvrir mon espace <span>→</span></button>
          </article>
          <article className="feature">
            <div className="feature-icon">💸</div>
            <h3>Espace Affilié</h3>
            <p>Partagez des produits et gagnez des commissions sur les ventes éligibles.</p>
            <button onClick={() => setActive("Affiliation")}>En savoir plus <span>→</span></button>
          </article>
        </section>

        <section className="trust-strip">
          <div><strong>Multi-vendeurs</strong><span>Une plateforme ouverte</span></div>
          <div><strong>Afrique & international</strong><span>Une ambition sans frontières</span></div>
          <div><strong>Paiements adaptés</strong><span>Mobile Money et cartes prévus</span></div>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} TAF Market</span>
        <span>Achetez · Vendez · Affiliez</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
