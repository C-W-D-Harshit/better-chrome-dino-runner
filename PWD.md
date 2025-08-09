# Better Chrome Dino Runner - Project Walkthrough Document (PWD)

## Project Overview

**Better Chrome Dino Runner** is an enhanced React-based implementation of the classic Chrome offline dinosaur game. This version includes modern game mechanics, power-ups, visual effects, and a comprehensive achievement system.

## Core Architecture

### Game Engine Components
- **Game Loop**: 60fps game loop using `requestAnimationFrame`
- **Physics System**: Custom gravity, collision detection, and movement calculations
- **State Management**: React hooks-based game state with proper cleanup
- **Rendering Pipeline**: Canvas-based rendering with optimized draw calls

### Key Game Systems

#### 1. Player Character System
- **Animation States**: Running, jumping, ducking with sprite-based animations
- **Physics**: Variable jump heights, gravity simulation, ground collision
- **Controls**: Keyboard (Space/Up/Down) and touch input support
- **Hitboxes**: Dynamic collision boundaries based on player state

#### 2. Obstacle Management
- **Types**: Cacti (small/large), birds (high/low flying), rocks (various sizes)
- **Generation**: Procedural obstacle spawning with difficulty scaling
- **Object Pooling**: Efficient memory management for obstacle instances
- **Collision Detection**: Pixel-perfect collision using bounding boxes

#### 3. Power-up & Collectibles
- **Collectibles**: Coins with magnetic collection radius
- **Power-ups**: Shield (invincibility), Speed Boost, Slow-Mo, Magnet
- **Combo System**: Score multipliers for consecutive collections
- **Visual Effects**: Particle systems for collection and activation

#### 4. Visual Systems
- **Parallax Scrolling**: Multi-layer background with depth perception
- **Day/Night Cycle**: Dynamic lighting based on score milestones
- **Particle Effects**: Jump trails, collection sparkles, collision impacts
- **Sprite Management**: Efficient texture loading and animation timing

#### 5. Audio Engine
- **Web Audio API**: High-quality sound effects and background music
- **Sound Categories**: Jump, collect, power-up, collision, ambient
- **Audio Management**: Volume controls, muting, and audio context handling

## File Structure

```
src/
├── components/
│   ├── Game/
│   │   ├── Game.tsx                 # Main game container
│   │   ├── GameCanvas.tsx           # Canvas rendering component
│   │   └── GameUI.tsx               # HUD and overlay UI
│   ├── Player/
│   │   ├── Player.tsx               # Player character logic
│   │   └── PlayerSprites.tsx        # Animation sprite management
│   ├── Obstacles/
│   │   ├── ObstacleManager.tsx      # Obstacle spawning and management
│   │   ├── Cactus.tsx              # Cactus obstacle component
│   │   ├── Bird.tsx                # Bird obstacle component
│   │   └── Rock.tsx                # Rock obstacle component
│   ├── Collectibles/
│   │   ├── Coin.tsx                # Coin collectible logic
│   │   └── PowerUp.tsx             # Power-up items
│   ├── UI/
│   │   ├── HUD.tsx                 # Real-time game statistics
│   │   ├── GameOver.tsx            # End game screen
│   │   ├── Settings.tsx            # Game settings menu
│   │   ├── Achievements.tsx        # Achievement system UI
│   │   └── MainMenu.tsx            # Start screen
│   └── Effects/
│       ├── ParticleSystem.tsx      # Particle effect manager
│       ├── Background.tsx          # Parallax background
│       └── DayNightCycle.tsx       # Lighting system
├── hooks/
│   ├── useGameLoop.tsx             # Main game loop hook
│   ├── useInput.tsx                # Input handling (keyboard/touch)
│   ├── useCollision.tsx            # Collision detection system
│   ├── useAudio.tsx                # Audio management
│   ├── useLocalStorage.tsx         # Persistent data storage
│   └── useVisibility.tsx           # Tab visibility handling
├── utils/
│   ├── physics.ts                  # Physics calculations
│   ├── collision.ts                # Collision detection algorithms
│   ├── gameConstants.ts            # Game configuration constants
│   ├── audioUtils.ts               # Audio utility functions
│   └── storageUtils.ts             # Local storage helpers
├── types/
│   ├── game.ts                     # Game state type definitions
│   ├── player.ts                   # Player-related types
│   ├── obstacles.ts                # Obstacle type definitions
│   └── audio.ts                    # Audio system types
└── assets/
    ├── sprites/                    # Game sprite images
    ├── sounds/                     # Audio files
    └── backgrounds/                # Background images
```

## Key Features Implementation

### 1. Game Loop Architecture
- **Frame Rate**: Consistent 60fps using `requestAnimationFrame`
- **Delta Time**: Frame-independent movement calculations
- **State Updates**: Physics → Collision → Rendering pipeline
- **Performance**: Optimized with object pooling and efficient rendering

### 2. Physics System
- **Gravity**: Realistic falling acceleration
- **Jump Mechanics**: Variable height based on input duration
- **Ground Collision**: Proper landing and running state transitions
- **Speed Progression**: Dynamic game speed increase over time

### 3. Collision Detection
- **Bounding Boxes**: Efficient rectangular collision detection
- **Hitbox Scaling**: Different sizes for running/ducking states
- **Pixel Accuracy**: Fine-tuned collision boundaries
- **Performance**: Spatial partitioning for large obstacle counts

### 4. Visual Effects
- **Parallax Layers**: Background, midground, foreground scrolling
- **Particle Systems**: Configurable particle emitters
- **Animation Timing**: Smooth sprite transitions
- **Day/Night Transitions**: Gradual color/lighting changes

### 5. Audio Implementation
- **Web Audio Context**: Modern audio API usage
- **Sound Pooling**: Efficient audio buffer management
- **3D Audio**: Positional sound effects
- **Music System**: Background soundtrack with seamless looping

## Game Mechanics

### Scoring System
- **Base Score**: Distance traveled
- **Coin Collection**: Bonus points with combo multipliers
- **Achievement Bonuses**: Extra points for milestone completion
- **Power-up Usage**: Strategic scoring opportunities

### Difficulty Progression
- **Speed Increase**: Gradual acceleration over time
- **Obstacle Density**: More frequent spawning
- **New Obstacles**: Introduction of different types
- **Combo Requirements**: Higher thresholds for bonuses

### Power-up System
- **Shield**: Temporary invincibility with visual effect
- **Speed Boost**: Increased movement speed
- **Slow-Mo**: Bullet-time effect for precision
- **Magnet**: Automatic coin collection

### Achievement System
- **Categories**: Distance, collection, survival, skill-based
- **Progression**: Tiered achievement levels
- **Rewards**: Unlockable content and bonuses
- **Notifications**: Real-time achievement popups

## Performance Optimizations

### Rendering Optimizations
- **Object Pooling**: Reuse obstacle/particle instances
- **Frustum Culling**: Only render visible objects
- **Batch Rendering**: Minimize canvas draw calls
- **Texture Atlasing**: Combined sprite sheets

### Memory Management
- **Cleanup**: Proper component unmounting
- **Event Listeners**: Removal on component destruction
- **Audio Buffers**: Efficient loading and unloading
- **Animation Frames**: Proper cancellation

### Mobile Optimizations
- **Touch Controls**: Gesture-based input
- **Responsive Design**: Adaptive UI scaling
- **Performance Scaling**: Quality settings for different devices
- **Battery Optimization**: Reduced effects on low battery

## Development Workflow

### Setup & Installation
```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm lint             # Run code quality checks
```

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Game system interactions
- **Performance Tests**: Frame rate and memory usage
- **Device Testing**: Cross-platform compatibility

### Build Configuration
- **Asset Optimization**: Image compression and sprite generation
- **Code Splitting**: Lazy loading for better performance
- **PWA Features**: Offline capability and installability
- **SEO Optimization**: Meta tags and social sharing

## Future Enhancements

### Planned Features
- **Multiplayer Mode**: Real-time competitive gameplay
- **Level Editor**: User-generated content creation
- **Seasonal Events**: Limited-time game modes
- **Advanced Analytics**: Detailed gameplay statistics

### Technical Improvements
- **WebGL Rendering**: Hardware-accelerated graphics
- **Web Workers**: Physics calculations in background threads
- **IndexedDB**: Enhanced local storage capabilities
- **WebRTC**: Peer-to-peer multiplayer connections

## Contributing Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks

### Performance Requirements
- **60fps Target**: Maintain smooth gameplay
- **Memory Efficiency**: No memory leaks or excessive allocation
- **Load Times**: Fast initial game startup
- **Battery Usage**: Optimized for mobile devices

This PWD serves as a comprehensive guide for understanding, developing, and extending the Better Chrome Dino Runner game project.