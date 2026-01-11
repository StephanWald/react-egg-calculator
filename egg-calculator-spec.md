# Egg Cooking Time Calculator - Specification

## Overview

A calculator that computes the optimal cooking time for boiled eggs based on thermodynamic principles. The application considers egg properties, water volume, pressure-based boiling point (via weather API), stove characteristics, and calculates energy requirements.

---

## 1. Input Parameters

### 1.1 Working Inputs (Per Cooking Session)

These parameters change with each use.

| Parameter | Type | Unit | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `eggWeight` | Integer | g | 40–90 | 60 | Weight of a single egg |
| `eggCount` | Integer | - | 1–8 | 1 | Number of eggs |
| `eggStartTemp` | Integer | °C | 0–25 | 4 | Initial temperature of eggs |
| `targetTemp` | Integer | °C | 63–77 | 67 | Desired core temperature |
| `waterVolume` | Double | L | 0.5–3.0 | 1.5 | Volume of water in pot |

#### Preset: Egg Sizes
| Label | Weight (g) |
|-------|------------|
| S | 53 |
| M | 58 |
| L | 68 |
| XL | 78 |

#### Preset: Start Temperatures
| Label | Temperature (°C) |
|-------|------------------|
| Refrigerator | 4 |
| Cool | 7 |
| Room temperature | 20 |

#### Preset: Consistency (Target Temperature)
| Label | Target Temp (°C) | Description |
|-------|------------------|-------------|
| Soft | 63 | Runny yolk |
| Medium-soft | 67 | Creamy yolk |
| Medium | 72 | Slightly soft yolk |
| Hard | 77 | Firm yolk |

---

### 1.2 Household Settings (Persistent)

These parameters are typically constant for a household and can be saved/restored.

#### Stove Configuration

| Parameter | Type | Unit | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `stoveType` | Enum | - | see presets | induction | Type of stove |
| `stovePower` | Integer | W | 500–3500 | 2000 | Heating power |
| `stoveEfficiency` | Double | - | 0.2–0.95 | 0.87 | Heat transfer efficiency |

#### Stove Type Presets

| ID | Name | Efficiency | Default Power (W) | Notes |
|----|------|------------|-------------------|-------|
| `induction` | Induktion | 0.87 | 2200 | Heat generated directly in pot |
| `ceramic` | Ceran | 0.70 | 1800 | Glass-ceramic cooktop |
| `electric` | Gusseisen | 0.65 | 1500 | Traditional electric plate |
| `gas` | Gas | 0.50 | 2500 | Heat escapes around pot |
| `camping` | Camping | 0.30 | 1000 | Portable stove, wind exposure |

When `stoveType` changes, `stoveEfficiency` and `stovePower` should be set to the preset values. User can then override `stovePower` manually.

#### Pot Configuration

| Parameter | Type | Unit | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `potWeight` | Double | kg | 0.3–3.0 | 0.8 | Weight of empty pot |
| `potMaterial` | Enum | - | see presets | steel | Pot material |

#### Pot Material Presets

| ID | Name | Heat Capacity c_pot (kJ/(kg·K)) |
|----|------|----------------------------------|
| `steel` | Edelstahl | 0.50 |
| `aluminum` | Aluminium | 0.90 |
| `cast_iron` | Gusseisen | 0.46 |
| `copper` | Kupfer | 0.39 |
| `ceramic` | Keramik | 0.85 |

#### Environment

| Parameter | Type | Unit | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `waterStartTemp` | Integer | °C | 2–40 | 15 | Temperature of tap/source water before heating |
| `ambientTemp` | Integer | °C | -10–35 | 22 | Air temperature at cooking location |

**waterStartTemp Examples:**
- Cold tap water (winter): 10–12°C
- Warm tap water (summer): 16–20°C
- Stream/well water: 2–10°C
- Pre-heated water: 30–40°C

**ambientTemp Examples:**
- Indoor kitchen: 18–24°C
- Outdoor summer: 20–35°C  
- Outdoor winter: -10–10°C
- Camping in mountains: 5–15°C

**Note:** These are separate physical parameters:
- `waterStartTemp` affects energy calculation (heating water from tap to boiling)
- `ambientTemp` affects heat loss during cooking and recovery time after egg insertion

---

### 1.3 Location & Pressure

| Parameter | Type | Unit | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `pressure` | Double | hPa | 900–1080 | 1013.25 | Atmospheric pressure |
| `boilingPoint` | Double | °C | 85–102 | 100 | Calculated from pressure |
| `altitude` | Integer | m | -500–9000 | 0 | Informational only |
| `locationName` | String | - | - | null | City name (informational) |
| `pressureSource` | Enum | - | default/gps/manual | default | How pressure was obtained |

---

## 2. Calculated Outputs

| Output | Type | Unit | Description |
|--------|------|------|-------------|
| `cookingTime` | Double | min | Recommended cooking time (thermodynamically corrected) |
| `idealTime` | Double | min | Theoretical cooking time (constant water temperature) |
| `tempDrop` | Double | °C | Temperature drop when eggs are inserted |
| `effectiveTemp` | Double | °C | Effective average water temperature during cooking |
| `totalEnergy` | Integer | kJ | Total energy required (heating + cooking) |
| `heatingTime` | Double | min | Time to heat water from 20°C to boiling point (at 2000W) |

---

## 3. Physical Constants

### 3.1 Fixed Constants

| Constant | Symbol | Value | Unit | Description |
|----------|--------|-------|------|-------------|
| Specific heat capacity (water) | c_water | 4.18 | kJ/(kg·K) | |
| Specific heat capacity (egg) | c_egg | 3.5 | kJ/(kg·K) | Average of egg white (~3.7) and yolk (~2.8) |
| Williams constant | K | 0.451 | - | Derived from thermal properties of eggs |
| Standard pressure | P_std | 1013.25 | hPa | Sea level standard atmosphere |
| Clausius-Clapeyron coefficient | - | 0.037 | °C/hPa | Boiling point change per pressure unit |

### 3.2 Configurable Constants (Household Settings)

| Constant | Symbol | Default | Unit | Description |
|----------|--------|---------|------|-------------|
| Specific heat capacity (pot) | c_pot | 0.50 | kJ/(kg·K) | Depends on potMaterial |
| Pot mass | m_pot | 0.8 | kg | User configurable |
| Stove power | P_stove | 2000 | W | User configurable |
| Stove efficiency | η | 0.87 | - | Depends on stoveType |
| Water start temperature | T_water_start | 15 | °C | Tap/source water temperature |
| Ambient temperature | T_ambient | 22 | °C | Air temperature at cooking location |

---

## 4. Formulas

### 4.1 Boiling Point from Pressure (Clausius-Clapeyron Approximation)

```
T_boiling = 100 + 0.037 × (P - 1013.25)
```

- Input: `pressure` (hPa)
- Output: `boilingPoint` (°C)

Example: At 990 hPa (low pressure weather): T = 100 + 0.037 × (990 - 1013.25) = 99.14°C

### 4.2 Pressure from Boiling Point (Inverse)

```
P = (T_boiling - 100) / 0.037 + 1013.25
```

- Input: `boilingPoint` (°C)
- Output: `pressure` (hPa)

### 4.3 Altitude from Pressure (Barometric Formula, Informational)

```
altitude = 44330 × (1 - (P / 1013.25)^0.1903)
```

- Input: `pressure` (hPa)
- Output: `altitude` (m)

Note: This is only for display purposes. The actual boiling point is calculated from pressure, not altitude.

### 4.4 Temperature Drop When Inserting Eggs

Heat equilibrium equation:

```
T_drop = (m_water × c_water × T_water + m_eggs × c_egg × T_egg) / (m_water × c_water + m_eggs × c_egg)
```

Where:
- `m_water` = waterVolume (in kg, 1L = 1kg)
- `m_eggs` = (eggCount × eggWeight) / 1000 (in kg)
- `T_water` = boilingPoint
- `T_egg` = eggStartTemp

Output: `tempDrop` = T_water - T_drop

### 4.5 Effective Temperature

The effective temperature accounts for the temperature drop, recovery based on stove power, and heat loss to ambient air.

```
// Heat loss factor based on ambient temperature
tempDiffReference = 80  // K (reference: 100°C pot, 20°C ambient)
tempDiffActual = T_boiling - ambientTemp
heatLossFactor = tempDiffActual / tempDiffReference  // >1 if colder outside

// Power and recovery factors
powerFactor = min(1, stovePower / 2000) × stoveEfficiency
baseRecoveryFactor = min(0.85, 0.5 + (waterVolume / m_eggs) × 0.1)

// Heat loss reduces effective heating power
effectivePowerRatio = powerFactor / heatLossFactor
recoveryFactor = baseRecoveryFactor × min(1, 0.5 + 0.5 × effectivePowerRatio)

T_effective = T_drop + recoveryFactor × (T_boiling - T_drop)
```

**Example impact of ambient temperature:**
- At 22°C ambient (kitchen): heatLossFactor ≈ 0.98 (minimal impact)
- At 0°C ambient (outdoor winter): heatLossFactor ≈ 1.25 (25% more heat loss)
- With gas stove (50% efficiency) at 0°C: recovery is dramatically slower

### 4.6 Cooking Time (Williams Formula)

```
t = K × M^(2/3) × ln(0.76 × (T_egg - T_eff) / (T_target - T_eff))
```

Where:
- `K` = 0.451 (Williams constant)
- `M` = eggWeight (g)
- `T_egg` = eggStartTemp (°C)
- `T_eff` = effectiveTemp (°C)
- `T_target` = targetTemp (°C)
- `ln` = natural logarithm

Output: `cookingTime` (minutes)

### 4.7 Ideal Cooking Time (Reference)

Same formula but using boiling point instead of effective temperature:

```
t_ideal = K × M^(2/3) × ln(0.76 × (T_egg - T_water) / (T_target - T_water))
```

Output: `idealTime` (minutes)

### 4.8 Energy Calculation

#### Water heating energy (uses waterStartTemp):
```
Q_water = m_water × c_water × (T_boiling - waterStartTemp)
```

#### Pot heating energy:
```
Q_pot = m_pot × c_pot × (T_boiling - waterStartTemp)
```

Note: `c_pot` is looked up from `potMaterial` preset.

#### Egg heating energy:
```
Q_eggs = m_eggs × c_egg × (T_target - T_egg)
```

#### Ambient heat loss during cooking:
```
heatLossPerMinute = 0.5 × heatLossFactor  // kJ/min (rough estimate)
Q_ambient_loss = cookingTime × heatLossPerMinute
```

#### Total energy (with efficiency):
```
Q_total = (Q_water + Q_pot + Q_eggs + Q_ambient_loss) / stoveEfficiency
```

Output: `totalEnergy` (kJ)

### 4.9 Heating Time

Time to heat water from `waterStartTemp` to `boilingPoint`:

```
effectivePower = (stovePower / 1000) × stoveEfficiency  [kW]
heatingTime = Q_water / effectivePower / 60
```

Where Q_water = m_water × c_water × (T_boiling - waterStartTemp)

Output: `heatingTime` (minutes)

---

## 5. Synchronization Logic

### 5.1 Pressure ↔ Boiling Point

The following fields are bidirectionally synchronized:

```
pressure ←→ boilingPoint
```

When any of these fields changes:
1. If `pressure` changes → recalculate `boilingPoint` using formula 4.1, recalculate `altitude` using formula 4.3
2. If `boilingPoint` changes → recalculate `pressure` using formula 4.2, recalculate `altitude` using formula 4.3
3. If changed via GPS/API → set `pressureSource` to 'gps'
4. If changed manually → set `pressureSource` to 'manual', clear `locationName`

### 5.2 Stove Type → Efficiency & Power

When `stoveType` changes:
1. Set `stoveEfficiency` to preset value
2. Set `stovePower` to preset default value
3. User can then override `stovePower` manually

### 5.3 Pot Material → Heat Capacity

When `potMaterial` changes:
- Look up `c_pot` from preset table for energy calculations

---

## 6. External API Integration

### 6.1 Geolocation (Coordinates & GPS Altitude)

**Purpose:** Obtain user coordinates and optionally GPS altitude

**Method:** Browser Geolocation API or platform equivalent

**Parameters:**
- High accuracy: enabled
- Timeout: 10,000 ms

**Response Fields:**
- `coords.latitude` (Double) – Latitude in degrees
- `coords.longitude` (Double) – Longitude in degrees
- `coords.altitude` (Double | null) – Altitude in meters (optional, for display only)

### 6.2 Weather Data - Current Pressure (Primary)

**Purpose:** Get current atmospheric pressure at location

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Method:** GET

**Query Parameters:**
- `latitude`: latitude from geolocation
- `longitude`: longitude from geolocation
- `current`: `surface_pressure`

**Response Structure:**
```json
{
  "current": {
    "time": "2025-01-11T10:00",
    "surface_pressure": 1008.5
  }
}
```

**Extract:** `current.surface_pressure` → `pressure` (hPa)

**Note:** This is the actual current atmospheric pressure including weather effects, not a standard atmosphere calculation. This provides accurate boiling point prediction.

### 6.3 Elevation Lookup (Fallback, Informational)

**Purpose:** Get terrain elevation if GPS altitude unavailable (for display only)

**Endpoint:** `https://api.open-elevation.com/api/v1/lookup`

**Method:** GET

**Query Parameters:**
- `locations`: `{latitude},{longitude}`

**Response Structure:**
```json
{
  "results": [
    {
      "elevation": 230
    }
  ]
}
```

**Note:** Only used for informational display if GPS altitude is unavailable. Pressure (not altitude) is used for boiling point calculation.

### 6.4 Reverse Geocoding (Informational Only)

**Purpose:** Display location name to user (not used in calculations)

**Endpoint:** `https://nominatim.openstreetmap.org/reverse`

**Method:** GET

**Query Parameters:**
- `lat`: latitude
- `lon`: longitude
- `format`: `json`
- `zoom`: `10`

**Response Structure:**
```json
{
  "address": {
    "city": "Saarbrücken",
    "town": null,
    "village": null
  }
}
```

**Extract:** `address.city` OR `address.town` OR `address.village` → `locationName`

---

## 7. Validation Rules

| Condition | Required |
|-----------|----------|
| `eggWeight > 0` | Yes |
| `boilingPoint > targetTemp` | Yes |
| `targetTemp > eggStartTemp` | Yes |

If validation fails, all outputs should be set to `null` / undefined.

---

## 8. Recalculation Triggers

The cooking time and energy calculations must be re-executed when any of the following inputs change:

### Working Inputs:
- `eggWeight`
- `eggStartTemp`
- `targetTemp`
- `eggCount`
- `waterVolume`

### Location/Pressure:
- `boilingPoint` (derived from `pressure`)

### Household Settings:
- `stovePower`
- `stoveEfficiency`
- `potWeight`
- `potMaterial`
- `waterStartTemp`
- `ambientTemp`

## 9. Assumptions and Limitations

### 9.1 Pot Properties

| Assumption | Value | Notes |
|------------|-------|-------|
| Pot mass | Configurable (default 0.8 kg) | User can adjust |
| Pot material | Configurable | Affects heat capacity |
| Lid | Used | Model assumes lid is on during cooking |

### 9.2 Stove Properties

| Assumption | Value | Notes |
|------------|-------|-------|
| Heating power | Configurable (500–3500 W) | User can adjust |
| Heat transfer efficiency | Depends on stove type | Induction ~87%, Gas ~50% |
| Heating type | Continuous | Assumes constant power during cooking |

### 9.3 Environmental Conditions

| Assumption | Value | Notes |
|------------|-------|-------|
| Water start temperature | Configurable (default 15°C) | Temperature of tap/source water |
| Ambient temperature | Configurable (default 22°C) | Air temperature at cooking location |
| Air pressure | From weather API | Actual current pressure, not standard atmosphere |

**Temperature separation rationale:**
- `waterStartTemp` determines energy needed to heat water from tap to boiling
- `ambientTemp` affects heat loss during cooking and recovery speed after egg insertion
- These are often different (e.g., 12°C tap water in a 22°C kitchen)
- Critical for outdoor/camping scenarios (2°C stream water, 5°C air temperature)

**Improvement over single temperature model:** Separating these allows accurate calculations for scenarios like:
- Winter kitchen (cold tap water, warm room)
- Summer outdoor cooking (warm tap water, hot ambient)
- Camping (cold stream water, variable ambient)

### 9.4 Egg Properties

| Assumption | Value | Notes |
|------------|-------|-------|
| Geometry | Spherical approximation | Eggs are ellipsoids, but sphere model is sufficient |
| Thermal properties | Homogeneous | Uses average c_egg = 3.5 kJ/(kg·K) |
| Shell thermal resistance | Ignored | Shell is thin, effect is negligible |
| Air pocket | Ignored | Small effect on thermal mass |
| Internal temperature | Uniform at start | Egg is same temperature throughout |
| Freshness | Not considered | Older eggs may have different properties |

### 9.5 Water Properties

| Assumption | Value | Notes |
|------------|-------|-------|
| Composition | Pure water | No salt or additives |
| Starting temperature | waterStartTemp (configurable) | For energy calculation |
| Coverage | Full | All eggs must be submerged ≥2 cm |
| Convection | Natural | No forced stirring |

**Note:** Adding salt raises the boiling point by ~0.5°C per 30g/L salt. This is not modeled.

### 9.6 Cooking Process

| Assumption | Value | Notes |
|------------|-------|-------|
| Lid usage | Yes | Required for accurate results |
| Heat source | Continuous | No intermittent heating |
| Egg insertion | Simultaneous | All eggs inserted at once |
| Post-cooking | Immediate removal | No carry-over cooking modeled |

### 9.7 Model Limitations

1. **Williams Formula Accuracy:** The formula is empirically derived and accurate to approximately ±30 seconds under ideal conditions.

2. **Recovery Factor:** The temperature recovery model (how fast water reheats after egg insertion) is a simplified approximation incorporating stove power and efficiency.

3. **Pressure API Availability:** If Open-Meteo is unavailable, the model falls back to standard pressure (1013.25 hPa).

4. **Egg Variability:** Egg composition varies by breed, feed, and freshness. The model uses average thermal properties.

5. **No Carry-Over Cooking:** The model does not account for continued cooking after removal from water. For precise results, eggs should be immediately cooled in ice water.

### 9.8 Potential Future Parameters

The following could be added for even more precise calculations:

| Parameter | Current State | Potential Addition | Use Case |
|-----------|---------------|-------------------|----------|
| Salt concentration | Not modeled | 0–60 g/L | Salted cooking water (+0.5°C/30g) |
| Egg freshness | Not modeled | Days since laid | Older eggs have larger air pocket |
| Starting from cold water | Not modeled | Boolean | Energy calculation for cold-start method |
| Target altitude display | From pressure | Manual override | For display at specific elevation |

---

## 10. References

- Williams, Charles D.H. - University of Exeter - Egg cooking formula
- Thermodynamic principles for heat transfer in spherical objects
