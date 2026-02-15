import { Canvas, useFrame } from '@react-three/fiber';
import * as React from 'react';
import { useRef } from 'react';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Turbine() {
    const group = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (group.current) {
            group.current.rotation.z -= delta * 0.5; // Rotate continuously
        }
    });

    const petals = Array.from({ length: 12 });

    return (
        <group ref={group} rotation={[0, 0, 0]} scale={2.2}>
            {petals.map((_, i) => {
                const angle = (i / petals.length) * Math.PI * 2;
                return (
                    <group key={i} rotation={[0, 0, angle]}>
                        <mesh
                            position={[0.8, 0, 0]}
                            rotation={[0, -0.2, -0.6]}
                            scale={[2.8, 0.8, 1.4]}
                        >
                            <sphereGeometry args={[0.2, 64, 64]} />
                            <meshPhysicalMaterial
                                color="#14b8a6" // Changed from dark to Teal for visibility
                                emissive="#0d9488"
                                emissiveIntensity={0.8}
                                metalness={0.4}
                                roughness={0.1}
                                clearcoat={1}
                                clearcoatRoughness={0.1}
                                reflectivity={1}
                            />
                        </mesh>

                        {/* Inner Glass/Glow Layer */}
                        <mesh
                            position={[0.8, 0, 0.05]}
                            rotation={[0, -0.2, -0.6]}
                            scale={[2.7, 0.7, 1.3]}
                        >
                            <sphereGeometry args={[0.2, 64, 64]} />
                            <meshPhysicalMaterial
                                color="#14b8a6"
                                metalness={0}
                                roughness={0}
                                transmission={0.6} // Glass effect
                                thickness={2}
                                envMapIntensity={2}
                                transparent
                                opacity={1}
                            />
                        </mesh>
                    </group>
                );
            })}
            <pointLight position={[0, 0, 0]} distance={5} intensity={8} color="#00ADB5" />
        </group>
    );
}

const ErrorFallback = ({ error }: { error: any }) => (
    <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-surface-950 p-4 text-center">
        <div>
            <p className="font-bold mb-2">3D Error</p>
            <pre className="text-xs bg-black/50 p-2 rounded max-w-md overflow-auto">{error.message}</pre>
        </div>
    </div>
);

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    public state: { hasError: boolean, error: any };
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}



const AnimatedHero = () => {
    return (
        <div className="absolute inset-0 bg-surface-950/0 pointer-events-none">
            {/* Reduced opacity overlay */}
            <div className="absolute inset-0 bg-dark-gradient opacity-20 mix-blend-overlay" />
            <ErrorBoundary>
                <Canvas className="w-full h-full" camera={{ position: [0, 0, 6], fov: 45 }}>
                    <ambientLight intensity={1} />
                    <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={5} color="#ccfbf1" />
                    <pointLight position={[-10, 0, -10]} intensity={5} color="#14b8a6" />

                    <Environment preset="city" />

                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={[2.1, 0, 0]} scale={0.9}>
                        <Turbine />
                    </Float>

                    <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={20} blur={2} color="#14b8a6" />
                </Canvas>
            </ErrorBoundary>
        </div>
    );
};

export default AnimatedHero;
