import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ fontFamily: "Arial", padding: "30px", textAlign: "center" }}>
      <h1>Bienvenue sur TAF Market</h1>
      <p>Achetez, vendez et gagnez grâce à l'affiliation.</p>
      <button>Acheter</button>
      <button>Vendre</button>
      <button>Devenir affilié</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
