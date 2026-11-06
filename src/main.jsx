import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

function App() {
  return (
    <>
      <header>
        <h1>TAF MARKET</h1>
        <p>Achetez, vendez et gagnez avec l'affiliation.</p>
      </header>

      <nav>
        <button>Accueil</button>
        <button>Acheter</button>
        <button>Vendre</button>
        <button>Affiliation</button>
        <button>Connexion</button>
      </nav>

      <main>
        <h2>Bienvenue sur TAF Market</h2>
        <p>La marketplace qui rapproche vendeurs et acheteurs.</p>

        <div className="products">
          <div className="product">
            <h3>Espace Acheteur</h3>
            <p>Découvrez des produits.</p>
            <button>Explorer</button>
          </div>

          <div className="product">
            <h3>Espace Vendeur</h3>
            <p>Vendez vos produits.</p>
            <button>Commencer</button>
          </div>

          <div className="product">
            <h3>Espace Affilié</h3>
            <p>Gagnez des commissions.</p>
            <button>Participer</button>
          </div>
        </div>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
