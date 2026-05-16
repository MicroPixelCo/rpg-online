// ============================================
// Rocket Parts Definition
// ============================================

const PARTS = {
    capsule: {
        type: 'capsule',
        name: 'Capsule',
        icon: '🛸',
        mass: 500, // kg
        thrust: 0,
        description: 'Main payload - required for launch',
        color: '#FF6B6B'
    },
    tank: {
        type: 'tank',
        name: 'Fuel Tank',
        icon: '🪣',
        mass: 300, // kg
        thrust: 0,
        description: 'Stores propellant for engine',
        color: '#4ECDC4'
    },
    engine: {
        type: 'engine',
        name: 'Engine',
        icon: '⚙️',
        mass: 200, // kg
        thrust: 1000, // Newtons
        description: 'Provides thrust for launch',
        color: '#FFE66D'
    },
    parachute: {
        type: 'parachute',
        name: 'Parachute',
        icon: '🪂',
        mass: 50, // kg
        thrust: 0,
        description: 'Auto-deploys for safe landing',
        color: '#95E1D3'
    },
    fins: {
        type: 'fins',
        name: 'Fins',
        icon: '⬆️',
        mass: 30, // kg
        thrust: 0,
        description: 'Provides stability during flight',
        color: '#A8E6CF'
    }
};

// Helper function to create a part instance
function createPart(type) {
    if (PARTS[type]) {
        return { ...PARTS[type] };
    }
    return null;
}
