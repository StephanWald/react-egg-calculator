# React Egg Calculator

A physics-based egg cooking calculator that uses thermodynamic calculations and atmospheric pressure data to determine precise cooking times.

**[Live Demo](https://stephanwald.github.io/react-egg-calculator/)**

## Features

- **Thermodynamic Calculations**: Uses the Williams formula with temperature drop compensation for accurate cooking times
- **Atmospheric Pressure**: Adjusts boiling point based on altitude or real-time GPS pressure data via Open-Meteo API
- **Customizable Parameters**:
  - Egg weight and size (S/M/L/XL)
  - Starting temperature (fridge/room temp)
  - Desired consistency (soft/medium/hard)
  - Number of eggs
  - Water volume
- **Household Settings**:
  - Stove type and power (induction, ceramic, gas, etc.)
  - Pot material and weight
  - Ambient temperature
- **Energy Consumption**: Calculates total energy needed including water heating, pot heating, and heat losses

## Tech Stack

- React 18
- Vite
- Tailwind CSS

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is automatically deployed to GitHub Pages via GitHub Actions on every push to `main`.

To deploy your own fork:
1. Fork this repository
2. Go to Settings > Pages
3. Under "Build and deployment", set Source to "GitHub Actions"
4. Push to `main` branch - the workflow will build and deploy automatically

## Physics Model

The calculator accounts for:
1. **Temperature drop** when cold eggs are added to boiling water
2. **Heat loss factors** based on ambient temperature and stove efficiency
3. **Effective cooking temperature** after recovery
4. **Altitude-adjusted boiling point** using the Clausius-Clapeyron equation
5. **Energy consumption** for water heating, pot heating, egg heating, and ambient losses

## License

MIT
