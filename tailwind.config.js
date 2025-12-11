/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    // Adicione esta linha para limpar o cache de temas do DaisyUI
    darkTheme: "champion-theme", 
    
    themes: [
      {
        "champion-theme": {
          "primary": "#0F1E3D",          // Azul Escuro (Botões)
          "primary-content": "#ffffff",
          "secondary": "#C9252B",        // Vermelho (Títulos)
          "secondary-content": "#ffffff",
          "base-100": "#ffffff",         // Fundo Branco
          "base-200": "#f3f4f6",
          "base-300": "#e5e7eb",
          "base-content": "#0F1E3D",     // Texto Escuro
          "info": "#3ABFF8",
          "success": "#22c55e",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
}