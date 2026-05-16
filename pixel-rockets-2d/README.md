# 🚀 Pixel Rockets 2D

A 2D spaceflight simulator game where you design and launch rockets with realistic physics!

## Features

### Rocket Building
- **5 Rocket Parts:**
  - 🛸 **Capsule** (500kg) - Main payload, required for launch
  - 🪣 **Fuel Tank** (300kg) - Propellant storage
  - ⚙️ **Engine** (200kg, 1000N thrust) - Provides propulsion
  - 🪂 **Parachute** (50kg) - Auto-deploys for safe landing
  - ⬆️ **Fins** (30kg) - Structural stability

- **Building Interface:**
  - Click parts to add (max 6 parts)
  - Right-click to remove parts
  - Real-time stats: weight, thrust, T/W ratio

### Flight Physics
- **Realistic 2D Physics:**
  - Gravity (9.81 m/s²)
  - Thrust vector control
  - Air resistance/drag
  - Parachute deployment mechanics

- **Flight Dynamics:**
  - Engine burns for 5 seconds
  - Automatic parachute deployment
  - Real-time telemetry display
  - Max altitude tracking

## Launch Requirements

To launch a rocket, you must have:
1. ✅ At least one **Capsule**
2. ✅ At least one **Engine**
3. ✅ **Thrust-to-Weight ratio > 1.0**

## How to Play

### Building Phase
1. Click part buttons to add them to your rocket
2. Watch the stats update in real-time
3. Right-click on the canvas to remove the last part
4. Maximum 6 parts allowed

### Launch Phase
1. When your rocket is ready, click **LAUNCH ROCKET**
2. Watch your rocket take off with realistic physics
3. Engine provides thrust for 5 seconds
4. Parachute auto-deploys if equipped and altitude is low
5. Try different combinations to reach the highest altitude!

## Game Statistics

- **Total Weight:** Sum of all part masses
- **Total Thrust:** Sum of all engine thrusts
- **Thrust/Weight Ratio:** Determines launch capability
- **Altitude:** Current height above ground
- **Max Altitude:** Highest altitude achieved

## Tips for Better Flights

1. **Balance matters:** Heavy rockets need more thrust
2. **Parachute helps:** Adds drag to slow descent
3. **Multiple engines:** Stack engines for more thrust
4. **Fuel optimization:** Engine burns for fixed 5 seconds
5. **Fins not essential:** Just for show, don't affect physics

## Technical Details

### Physics Engine
- Custom Vector2 class for 2D math
- Force calculation: gravity, thrust, drag
- Integration-based physics simulation
- Real-time collision detection with ground

### Game Loop
- 60 FPS using `requestAnimationFrame`
- Delta time calculation for frame-independent physics
- Canvas 2D rendering

### File Structure
```
index.html      - Main HTML interface
styles.css      - Game styling (cyberpunk theme)
engine.js       - Physics engine and rocket class
parts.js        - Rocket part definitions
game.js         - Main game loop and rendering
README.md       - This file
```

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Any modern browser with HTML5 Canvas support

## Future Enhancements

- [ ] Multiple engines stacking
- [ ] Fuel tank variants
- [ ] Stage separation
- [ ] Orbit mechanics
- [ ] Save/load rocket designs
- [ ] Leaderboard system
- [ ] Mobile touch controls
- [ ] Sound effects
- [ ] Advanced aerodynamics

## License

Open source - Feel free to modify and share!

## Credits

Built with vanilla JavaScript, HTML5 Canvas, and CSS.
